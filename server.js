// server.js (Final Version for Express on Render)

require('dotenv').config();
const express = require('express');
const cors =require('cors');

const app = express();
const PORT = process.env.PORT || 10000; // Render provides the PORT variable

// --- MIDDLEWARE ---
// This allows your Chrome extension to talk to this server
app.use(cors()); 
// This allows the server to understand incoming JSON data (like our prompt)
app.use(express.json()); 

// --- API ENDPOINT FOR OPENAI ---
// This is the "door" that your extension will knock on.
// We are using '/openai' as the path.
app.post('/openai', async (request, response) => {
  console.log('[SERVER] Received request at /openai');

  // Get the prompt from the request that the extension sent
  const { prompt } = request.body;

  if (!prompt) {
    return response.status(400).json({ error: 'No prompt was provided.' });
  }

  // Get the secret API key from Render's environment variables
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    console.error('[SERVER] FATAL: OPENAI_API_KEY is not set on the server.');
    return response.status(500).json({ error: 'Server is not configured.' });
  }

  // --- Securely call the OpenAI API ---
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
      // If OpenAI returns an error, send it back to the extension
      throw new Error(openAIResult.error?.message || 'An error occurred with the OpenAI API.');
    }

    // Send the successful result from OpenAI back to the extension
    console.log('[SERVER] Sending successful OpenAI response to client.');
    response.status(200).json(openAIResult);

  } catch (error) {
    console.error('[SERVER] Error calling OpenAI:', error.message);
    response.status(500).json({ error: error.message });
  }
});

// --- START THE SERVER ---
app.listen(PORT, () => {
  console.log(`✅ Server is running and listening on port ${PORT}`);
});