const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

const source = readFileSync(path.join(__dirname, '../src/app/api/gemini.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

function loadHelper(responses, env = { GEMINI_API_KEY: 'test-key' }) {
  const calls = [];
  let now = 0;
  const context = {
    exports: {},
    process: { env },
    console: { warn() {} },
    Date: { now: () => now },
    setTimeout(callback, delay) { now += delay; callback(); },
    require() {
      return { GoogleGenAI: class {
        models = { generateContent: async (request) => {
          calls.push(request);
          const response = responses.shift();
          if (response?.error) throw response.error;
          now += response?.elapsedMs ?? 0;
          return { text: response?.text };
        } };
      } };
    },
  };
  vm.runInNewContext(compiled, context);
  return { ...context.exports, calls };
}

test('uses the available default model and prevents nested SDK retries', async () => {
  const helper = loadHelper([{ text: ' result ' }]);
  assert.equal(await helper.generateGeminiContent('prompt'), 'result');
  assert.equal(helper.calls[0].model, 'gemini-3.5-flash-lite');
  assert.equal(helper.calls[0].config.httpOptions.retryOptions.attempts, 1);
});

test('allows selecting an enabled model through environment configuration', async () => {
  const helper = loadHelper([{ text: 'OK' }], { GEMINI_API_KEY: 'test-key', GEMINI_MODEL: ' custom-model ' });
  await helper.generateGeminiContent('prompt');
  assert.equal(helper.calls[0].model, 'custom-model');
});

test('does not retry unavailable models or a zero quota', async () => {
  for (const error of [{ status: 404, message: 'model unavailable' }, { status: 429, message: 'quota exceeded, limit: 0' }]) {
    const helper = loadHelper([{ error }]);
    await assert.rejects(helper.generateGeminiContent('prompt'), (caught) => caught === error);
    assert.equal(helper.calls.length, 1);
  }
});

test('retries temporary overload and reduces the remaining request budget', async () => {
  const helper = loadHelper([{ error: { status: 503 } }, { text: 'OK' }]);
  assert.equal(await helper.generateGeminiContent('prompt'), 'OK');
  assert.equal(helper.calls.length, 2);
  assert.equal(helper.calls[1].config.httpOptions.timeout, 49_000);
});

test('stops after three temporary failures', async () => {
  const error = { status: 503 };
  const helper = loadHelper([{ error }, { error }, { error }]);
  await assert.rejects(helper.generateGeminiContent('prompt'), (caught) => caught === error);
  assert.equal(helper.calls.length, 3);
});

test('returns actionable errors without exposing provider details', () => {
  const helper = loadHelper([]);
  for (const [status, code] of [[404, 'AI_MODEL_UNAVAILABLE'], [429, 'AI_QUOTA_EXCEEDED'], [403, 'AI_CONFIGURATION_ERROR'], [503, 'AI_BUSY']]) {
    const failure = helper.getGeminiFailure({ status, message: 'secret-provider-details' });
    assert.equal(failure.code, code);
    assert.ok(!failure.error.includes('secret-provider-details'));
  }
  assert.equal(helper.getGeminiFailure({ message: 'request timed out' }).status, 504);
});
