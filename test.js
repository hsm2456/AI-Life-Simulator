const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyBZs0ZIfxAsTDLZZ2d2syC6EwiaNwuNdBE');

async function run() {
  const models = await genAI.getModels();
  console.log(models);
}
run();
