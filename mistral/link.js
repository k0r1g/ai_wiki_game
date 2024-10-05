// // create_link.js
// // import { processContent } from './extract.js';
// import { suggestLink } from './model.js';

// export async function getNewLink(links, target) {
//     // 1. Process the content
//     const processedData = await processContent(JSON.stringify({ content }));
//     const { processed_content, links } = processedData;

//     // 2. Prepare the message for the model
//     const formattedMessage = [
//         {
//             role: "user",
//             content: `
//                 You are playing WikiGame in which you have to click on wikipedia links to get to ${target}.
//                 From the links and context around, suggest a single link to click on that will most likely 
//                 lead to further links that will lead to the target eventually.
//                 Return the link in short JSON format with the key "link".

//                 This is the wikipedia page content:
//                 ${processed_content} 
//                 and here are all the links: 
//                 ${JSON.stringify(links)}
//             `
//         }
//     ];

//     // 3. Get the suggested link from the model
//     const suggestedLink = await suggestLink(formattedMessage);

//     // 4. Find the full link information
//     const fullLink = links.find(link => link.title === suggestedLink);

//     return fullLink || null;
// }
