// model.js
import { Mistral } from 'mistralai';

const apiKey = process.env.MISTRAL_API_KEY;
const model = "pixtral-12b-2409";
const client = new Mistral(apiKey);

export async function suggestLink(message) {
    const chatResponse = await client.chat.complete({
        model: model,
        messages: message,
        response_format: {
            type: "json_object",
        }
    });

    return JSON.parse(chatResponse.choices[0].message.content).link;
}