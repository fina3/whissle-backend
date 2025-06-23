// server.js (Final Production-Ready Code)

// 1. INITIALIZATION
require('dotenv').config();
const express = require('express');
const cors = require('cors'); // <-- Required for CORS
const app = express();
const PORT = process.env.PORT || 3000;
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

// 2. MIDDLEWARE
app.use(cors()); // <-- Use CORS to allow requests from your extension
app.use(express.raw({ type: '*/*', limit: '50mb' })); // To handle raw audio data

// 3. DEEPGRAM API LOGIC
async function getAnalysisFromDeepgram(audioData, contentType) {
    if (!DEEPGRAM_API_KEY) {
        console.error("[FATAL] DEEPGRAM_API_KEY is not defined.");
        throw new Error("Server is not configured with a Deepgram API Key.");
    }
    console.log('[DEEPGRAM] Sending audio for transcription and intent analysis...');
    const url = new URL("https://api.deepgram.com/v1/listen");
    url.searchParams.append("model", "nova-2-general");
    url.searchParams.append("intents", "true");
    url.searchParams.append("punctuate", "true");

    const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
            "Authorization": `Token ${DEEPGRAM_API_KEY}`,
            "Content-Type": contentType // <-- Important: Pass the audio format
        },
        body: audioData
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error('[DEEPGRAM] API Error:', errorBody);
        throw new Error(`Deepgram API failed with status ${response.status}`);
    }
    console.log('[DEEPGRAM] Successfully received analysis.');
    return await response.json();
}

// 4. API ENDPOINT (The "Route" your extension will call)
app.post('/transcribe', async (req, res) => {
    console.log(`[SERVER] Received POST request on /transcribe.`);
    const contentType = req.headers['content-type'];
    
    if (!req.body || req.body.length === 0) {
        return res.status(400).json({ error: "No audio data in request body." });
    }
    if (!contentType) {
        return res.status(400).json({ error: "Content-Type header is missing." });
    }

    try {
        const deepgramResult = await getAnalysisFromDeepgram(req.body, contentType);
        console.log("[SERVER] Sending successful response back to client.");
        res.status(200).json(deepgramResult);
    } catch (error) {
        console.error("[SERVER] Error processing request:", error.message);
        res.status(500).json({ error: "An internal server error occurred." });
    }
});

// 5. START THE SERVER
app.listen(PORT, () => {
    console.log(`✅ Backend server running and listening on http://localhost:${PORT}`);
});