const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('AIzaSyBZs0ZIfxAsTDLZZ2d2syC6EwiaNwuNdBE');

async function run() {
  try {
    const m = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash', 
      generationConfig: { responseMimeType: 'application/json' } 
    });
    const r = await m.generateContent('Return JSON { "test": 1 }');
    const response = await r.response;
    console.log('success:', response.text().substring(0, 50));
  } catch(e) {
    console.error('error:', e.message);
  }
}

run();
