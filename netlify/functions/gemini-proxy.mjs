// netlify/functions/gemini-proxy.mjs

// Using dynamic import for node-fetch as it's an ES module
// and Netlify functions run in a CommonJS-like environment by default
// or may have specific ways they handle ES modules.
// For broader compatibility, let's use a helper.
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY_NETLIFY; // Will come from Netlify environment variables

export async function handler(event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_PLACEHOLDER") {
        console.error("Gemini API Key not configured in Netlify environment variables.");
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'API Key not configured on the server.' }),
        };
    }

    try {
        const { currentTurnHistory, systemInstructionPayload } = JSON.parse(event.body);

        if (!currentTurnHistory || !systemInstructionPayload) {
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

        const apiResponse = await fetch(API_URL_GEMINI, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

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
        console.error('Error in Netlify function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error in Netlify function.', details: error.message }),
        };
    }
}