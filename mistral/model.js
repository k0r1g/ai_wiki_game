// model.js
import { Mistral } from '@mistralai/mistralai';
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.NEXT_PUBLIC_MISTRAL_API_KEY;
if (!apiKey) {
    console.error('NEXT_PUBLIC_MISTRAL_API_KEY is not set');
  }
console.log(apiKey)
const client = new Mistral({apiKey: apiKey});

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
            messages: [{role: 'user', content: prompt}],
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