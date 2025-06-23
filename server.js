// server.js (Corrected Version)

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

app.post('/openai', async (request, response) => {
  console.log('[SERVER] Received request at /openai');

  const authHeader = request.headers['authorization'];
  const userApiKey = authHeader && authHeader.split(' ')[1];

  if (!userApiKey) {
    return response.status(401).json({ error: 'Authorization header with API key is missing.' });
  }

  const { prompt } = request.body;
  if (!prompt) {
    return response.status(400).json({ error: 'No prompt was provided.' });
  }

  try {
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userApiKey}`, // Comma is here
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

app.listen(PORT, () => {
  console.log(`✅ Server is running and listening on port ${PORT}`);
});