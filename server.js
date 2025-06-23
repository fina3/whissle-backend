// In server.js, replace the existing app.post('/openai',...) with this

app.post('/openai', async (request, response) => {
  console.log('[SERVER] Received request at /openai');

  // 1. Get the API key from the request's Authorization header
  const authHeader = request.headers['authorization'];
  const userApiKey = authHeader && authHeader.split(' ')[1];

  if (!userApiKey) {
    return response.status(401).json({ error: 'Authorization header with API key is missing.' });
  }

  // 2. Get the prompt from the request body
  const { prompt } = request.body;
  if (!prompt) {
    return response.status(400).json({ error: 'No prompt was provided.' });
  }

  // 3. Securely call OpenAI using the USER'S key
  try {
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userApiKey}`, // Use the key from the user
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const openAIResult = await openAIResponse.json();

    if (!openAIResponse.ok) {
      throw new Error(openAIResult.error?.message || 'An error occurred with the OpenAI API.');
    }

    response.status(200).json(openAIResult);

  } catch (error) {
    console.error('[SERVER] Error calling OpenAI:', error.message);
    response.status(500).json({ error: error.message });
  }
});