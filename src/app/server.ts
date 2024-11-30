'use server'

import { SearchResult } from "@/types/searchResult";
const { getJson } = require("serpapi");

let searchResults: SearchResult[] = [];

export async function getSearchResults(searchQuery:string) {
    searchResults = [];
    console.log('Searching for:', searchQuery);
    const response = await fetch(`https://www.googleapis.com/customsearch/v1?q=${searchQuery + " \"review\""}&cx=${process.env.PSE_CX}&key=${process.env.PSE_API_KEY}`)
    const results = await response.json();
    for (const item of results.items) {
        if (!item.title.toLowerCase().includes("review")) {
            continue;
        }
        // Ask Gemini if each result is about the product

        // Limit to 5 valid results
        let publication;
        if (item.displayLink.includes("wired")) {
            publication = "Wired";
        } else if (item.displayLink.includes("theverge")) {
            publication = "The Verge";
        } else if (item.displayLink.includes("engadget")) {
            publication = "Engadget";
        } else if (item.displayLink.includes("techradar")) {
            publication = "TechRadar";
        } else if (item.displayLink.includes("gizmodo")) {
            publication = "Gizmodo";
        } else if (item.displayLink.includes("zdnet")) {
            publication = "ZDNet";
        } else if (item.displayLink.includes("cnet")) {
            publication = "CNET";
        } else if (item.displayLink.includes("digitaltrends")) {
            publication = "Digital Trends";
        } else if (item.displayLink.includes("techcrunch")) {
            publication = "TechCrunch";
        } else if (item.displayLink.includes("pcmag")) {
            publication = "PCMag";
        } else {
            publication = item.displayLink;
        }
        searchResults.push({
            publication: publication,
            title: item.title,
            link: item.link
        });
    }
    console.log('Results:', results);

    // TODO: Do sentiment analysis and summary and send that to the client later
    return searchResults;
}