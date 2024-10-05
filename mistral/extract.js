// extract.js
import { JSDOM } from 'jsdom';

export function processContent(rawContent) {
    const dom = new JSDOM(rawContent);
    const document = dom.window.document;

    // Extract links
    const links = Array.from(document.querySelectorAll('a[href^="/wiki/"]')).map(a => ({
        title: a.getAttribute('href').split('/wiki/')[1],
        text: a.textContent
    }));

    // Process content
    document.querySelectorAll("div.mw-editsection, sup.reference, table.infobox").forEach(el => el.remove());

    // Get the processed content
    let processedContent = document.body.innerHTML;

    // Remove any remaining square brackets
    processedContent = processedContent.replace(/\[.*?\]/g, '');

    return {
        processed_content: processedContent,
        links: links
    };
}