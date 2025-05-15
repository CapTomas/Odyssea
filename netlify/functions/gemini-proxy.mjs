// netlify/functions/gemini-proxy.mjs

// Using dynamic import for node-fetch as it's an ES module
// and Netlify functions run in a CommonJS-like environment by default
// or may have specific ways they handle ES modules.
// For broader compatibility, let's use a helper.
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY_NETLIFY; // Will come from Netlify environment variables

export async function handler(event, context) {
    console.log(`[gemini-proxy] Function invoked. RequestId: ${context.awsRequestId}`); // Log invocation

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_PLACEHOLDER") {
        console.error("[gemini-proxy] Gemini API Key not configured.");
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'API Key not configured on the server.' }),
        };
    }

    try {
        console.log("[gemini-proxy] Parsing event body...");
        const { currentTurnHistory, systemInstructionPayload } = JSON.parse(event.body);
        console.log("[gemini-proxy] Event body parsed.");

        if (!currentTurnHistory || !systemInstructionPayload) {
            console.error("[gemini-proxy] Missing currentTurnHistory or systemInstructionPayload.");
             return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing currentTurnHistory or systemInstructionPayload in request body' }),
            };
        }

        const API_URL_GEMINI = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${GEMINI_API_KEY}`;

        const payload = {
            contents: currentTurnHistory,
            generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                maxOutputTokens: 8000,
                responseMimeType: "application/json",
            },
            safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            ],
            systemInstruction: systemInstructionPayload // Use the systemInstruction from the client
        };
        console.log("[gemini-proxy] Making fetch call to Gemini API:", API_URL_GEMINI);
        const startTime = Date.now(); // For timing

        const apiResponse = await fetch(API_URL_GEMINI, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const duration = Date.now() - startTime;
        console.log(`[gemini-proxy] Gemini API call completed in ${duration}ms. Status: ${apiResponse.status}`);

        const responseData = await apiResponse.json();

        if (!apiResponse.ok) {
            console.error("Gemini API Error Response:", responseData);
            const errDetail = responseData.error?.message || `Gemini API Error ${apiResponse.status}`;
            return {
                statusCode: apiResponse.status,
                body: JSON.stringify({ error: `Gemini API Error: ${errDetail}`, details: responseData.error?.details }),
            };
        }

        // Return the successful response from Gemini
        return {
            statusCode: 200,
            body: JSON.stringify(responseData), // Send the whole Gemini response back
        };

    } catch (error) {
        console.error('[gemini-proxy] Error in Netlify function:', error);

        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error in Netlify function.', details: error.message }),
        };
    }
}