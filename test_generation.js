const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyBZs0ZIfxAsTDLZZ2d2syC6EwiaNwuNdBE');

async function testModel(modelName) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Hello');
    const response = await result.response;
    console.log(`${modelName} Success:`, response.text().substring(0, 20));
  } catch (error) {
    console.error(`${modelName} Error:`, error.message);
  }
}

async function run() {
  await testModel('gemini-2.0-flash');
  await testModel('gemini-3.1-flash-lite-preview');
  await testModel('gemini-3-flash-preview');
}

run();
