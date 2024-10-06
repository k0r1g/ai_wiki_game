// model.js
import { Mistral } from '@mistralai/mistralai';
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.NEXT_PUBLIC_MISTRAL_API_KEY;
if (!apiKey) {
    console.error('NEXT_PUBLIC_MISTRAL_API_KEY is not set');
}
console.log(apiKey)
const client = new Mistral({ apiKey: apiKey });

export async function suggestLink(message) {
    const { current_link, target, links } = message;

    const prompt = `You are playing WikiGame in which you have to click on Wikipedia links to get from "${current_link}" to "${target}".
        From the following list of links available on the current page, suggest a single link to click on that will most likely 
        lead to further links that will eventually lead to the target.

        Return the answer in short JSON format with the key "link" for the suggested link to click,
        and add some relevance as to how the next link is related to the current link "${current_link}" with the key "relevance".

        Available links:
        ${JSON.stringify(links)}

        Remember, your goal is to find a path that will eventually lead to "${target}". Think strategically about which link
        might bring you closer to that goal.

        IMPORTANT: Respond ONLY with the JSON object, no additional text or formatting.`;

    try {
        const chatResponse = await client.chat.complete({
            model: 'pixtral-12b-2409',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: "json_object" }
        });

        const content = chatResponse.choices[0].message.content;

        // Remove any potential Markdown formatting
        const jsonString = content.replace(/```json\n?|\n?```/g, '').trim();

        try {
            return JSON.parse(jsonString);
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            console.log('Received content:', content);
            throw new Error('Invalid JSON response from AI');
        }
    } catch (error) {
        console.error('Error in suggestLink:', error);
        throw error;
    }
}

export async function getSimilarityScore(newTitle, targetTitle) {
    const prompt = `From 0 to 100 in increments of 5, where 0 is totally disconnected and 100 is a perfect match, how similar is "${newTitle}" to "${targetTitle}"? Only output the similarity score as a number.`;

    try {
        const chatResponse = await client.chat.complete({
            model: 'pixtral-12b-2409',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: "json_object" }
        });

        const content = chatResponse.choices[0].message.content;
        console.log("Raw AI response:", content); // Log the raw response

        let score;

        // Try parsing as JSON first
        try {
            const jsonResponse = JSON.parse(content);
            score = jsonResponse.score || jsonResponse.similarity_score || Object.values(jsonResponse)[0];
        } catch (jsonError) {
            console.log("Failed to parse JSON, attempting to extract number from string");
        }

        // If JSON parsing failed or didn't yield a number, try to extract number from string
        if (typeof score !== 'number' || isNaN(score)) {
            const numberMatch = content.match(/\d+/);
            if (numberMatch) {
                score = parseInt(numberMatch[0]);
            }
        }

        if (typeof score === 'number' && !isNaN(score)) {
            return score;
        } else {
            console.error("Couldn't extract a valid score from the response:", content);
            throw new Error(`Invalid response format. Raw response: ${content}`);
        }
    } catch (error) {
        console.error('Error in getSimilarityScore:', error);
        throw error;
    }
}