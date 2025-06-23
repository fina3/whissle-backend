// server.js (Final Corrected Version)

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express(); // <-- This is the line that was missing
const PORT = process.env.PORT || 10000;

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- API ENDPOINT FOR OPENAI ---
app.post('/openai', async (request, response) => {
  console.log('[SERVER] Received request at /openai');

  const authHeader = request.headers['authorization'];
  const userApiKey = authHeader && authHeader.split(' ')[1];

  if (!userApiKey) {
    return response.status(401).json({ error: 'Authorization header with API key is missing.' });
  }

  const { prompt } = request.body;
  if (!prompt) {
    return response.status(400).json({ error: 'No prompt was provided.'This });
  }

  try {
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userApiKey}`,
        'Content-Type': 'application/json',