// api/handle-openai.js
export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }
  const { prompt } = request.body;
  if (!prompt) {
    return response.status(400).json({ message: 'Error: No prompt was provided.' });
  }
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return response.status(500).json({ message: 'Server configuration error: OpenAI key is not set.' });
  }
  try {
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const openAIResult = await openAIResponse.json();
    if (!openAIResponse.ok) {
       throw new Error(openAIResult.error?.message || 'Failed to get a valid response from OpenAI.');
    }
    response.status(200).json(openAIResult);
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    response.status(500).json({ message: error.message });
  }
}