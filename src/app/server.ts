"use server";

import { SearchResult } from "@/types/searchResult";
import * as cheerio from "cheerio";

const excludeSelectors = [
  "nav",
  "header",
  "footer",
  "script",
  "style",
  ".advertisement",
  ".ad",
  ".sidebar",
];

const contentSelectors = [
  "article",
  "main",
  ".article-content",
  ".post-content",
  "#main-content",
  "div.content",
];

import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const context = [
  {
    text: 'The user will give you a product name and an article name. If the article is a review of the product, answer "yes". If the article is about anything else, answer "no". If the article is about a related product, answer "no". Answer with one word only.',
  },
  { text: "product: sony a6700" },
  { text: "article name: Sony a6700 Review | PCMag" },
  { text: "output: yes" },
  { text: "product: sony a6700" },
  { text: "article name: Sony Alpha 6000 (ILCE-6000) review" },
  { text: "output: no" },
  { text: "product: sony a6700" },
  {
    text: "article name: Sigma 10-18mm F2.8 DC DN review: a Sony-beating alternative",
  },
  { text: "output: no" },
  { text: "product: sony a6700" },
  {
    text: "article name: Sony A6700 review: top-spec autofocus in compact packaging",
  },
  { text: "output: yes" },
  { text: "product: iPhone 16" },
  {
    text: "article name: Apple iPhone 16 and iPhone 16 Plus Review: Why Go Pro? | WIRED",
  },
  { text: "output: yes" },
  { text: "product: hp elitebook 830 g10" },
  {
    text: "article name: HP EliteBook x360 review: A casually cool business hybrid - CNET",
  },
  { text: "output: no" },
  { text: "product: m4 mac mini" },
  {
    text: "article name: Apple Mac mini (M4, 2024) review: smaller, faster, better | TechRadar",
  },
  { text: "output: yes" },
  { text: "product: 2024 macbook pro" },
  {
    text: "article name: Apple MacBook Pro 14 (2023) review: entry-level enigma - The Verge",
  },
  { text: "output: no" },
  { text: "product: iPhone 15" },
  { text: "article name: Torras iPhone 15 Pro case review. - The Verge" },
  { text: "output: no" },
  { text: "product: Steam Deck" },
  {
    text: "article name: Valve Steam Deck Review: Glitchy but Promising | WIRED",
  },
  { text: "output: yes" },
  { text: "product: Steam Deck Dock" },
  {
    text: "article name: Razer Edge Review: Caught Between Switch and Steam Deck - CNET",
  },
  { text: "output: no" },
  { text: "product: Steam Deck Dock" },
  {
    text: "article name: The Case of the Golden Idol review: a fill-in-the-blank murder",
  },
  { text: "output: no" },
  { text: "product: Steam Deck Dock" },
  { text: "article name: Valve Steam Deck Dock Review | PCMag" },
  { text: "output: yes" },
  { text: "product: airpods pro 2" },
  { text: "article name: Apple AirPods Pro 2: Our Honest Review - CNET" },
  { text: "output: yes" },
  { text: "product: ipad 11th gen" },
  {
    text: "article name: iPad Air 2024 Review: The iPad 'Pro' You Should Buy - CNET",
  },
  { text: "output: no" },
  { text: "product: ipad pro 2024" },
  {
    text: "article name: Apple iPad Pro (2024) review: the best tablet money can buy",
  },
  { text: "output: yes" },
  { text: "product: ipad air 2024" },
  {
    text: "article name: The best iPads of 2024: Expert tested and reviewed | ZDNET",
  },
  { text: "output: no" },
  { text: "product: tesla model X" },
  {
    text: "article name: Tesla Model X car review, release date, features and prices | WIRED",
  },
  { text: "output: yes" },
  { text: "product: tesla model Y" },
  {
    text: "article name: Tesla Model 3 Review: The Best Electric Car You Can't Buy | WIRED",
  },
  { text: "output: no" },
  { text: "product: Apple Magic keyboard" },
  {
    text: "article name: The Magic Keyboard, reviewed: iPad Pro evolution - CNET",
  },
  { text: "output: yes" },
  { text: "product: Roborock Q Revo MaxV" },
  {
    text: "article name: Roborock S6 MaxV Review: A Robot Vac That Avoids Dog Poop",
  },
  { text: "output: no" },
  { text: "product: Ecovacs deebot x2" },
  { text: "article name: Ecovacs Deebot X2 Omni Review | PCMag" },
  { text: "output: yes" },
  { text: "product: Airpods 4" },
  {
    text: "article name: Apple AirPods 4 review: defying expectations - The Verge",
  },
  { text: "output: yes" },
  { text: "product: Airpods 4" },
  {
    text: "article name: AirPods 4 review: they're good, but you can do better for the price",
  },
  { text: "output: yes" },
  { text: "product: Airpods 4" },
  {
    text: "article name: Apple AirPods 4 With Active Noise Cancellation Review | PCMag",
  },
  { text: "output: yes" },
  { text: "product: AirPods 4" },
  { text: "article name: AirPods 3 review: Apple upped its sound game - CNET" },
  { text: "output: no" },
  { text: "product: Galaxy Watch 6 Classic" },
  { text: "article name: Samsung Galaxy Watch 6 Classic Review | PCMag" },
  { text: "output: yes" },
  { text: "product: PSVR2" },
  {
    text: "article name: PlayStation VR 2 Review: As Impressive as It Is Expensive | WIRED",
  },
  { text: "output: yes" },
  { text: "product: DJI Mini 3 Pro" },
  { text: "article name: DJI Mavic 3 Pro Review | PCMag" },
  { text: "output: no" },
  { text: "product: Dyson V15 Detect" },
  { text: "article name: Dyson V15 Detect review | TechRadar" },
  { text: "output: yes" },
  { text: "product: Dyson V15 Detect" },
  {
    text: "article name: Dyson V12 Detect Slim Review: A Powerful and Lightweight ...",
  },
  { text: "output: no" },
];

export async function getSearchResults(searchQuery: string) {
  let searchResults: SearchResult[] = [];
  searchResults = [];
  console.log("Searching for:", searchQuery);
  const response = await fetch(
    `https://www.googleapis.com/customsearch/v1?q=${searchQuery + ' "review"'}&cx=${process.env.PSE_CX}&key=${process.env.PSE_API_KEY}`,
  );
  const results = await response.json();
  if (!results.items) {
    return [];
  }
  for (const item of results.items) {
    if (searchResults.length >= 5) {
      break;
    }
    if (!item.title.toLowerCase().includes("review")) {
      continue;
    }
    // Ask Gemini if each result is about the product
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-8b",
    });
    const generationConfig = {
      temperature: 0,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 1,
      responseMimeType: "text/plain",
    };

    const parts = [...context];
    parts.push({ text: `product: ${searchQuery}` });
    parts.push({ text: `article name: ${item.title}` });
    parts.push({ text: "output: " });

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig,
    });

    if (!result.response.text().includes("yes")) {
      continue;
    }

    let publication;
    if (item.displayLink.includes("wired")) {
      publication = "Wired";
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
    } else if (item.displayLink.includes("tomsguide")) {
      publication = "Tom's Guide";
    } else if (item.displayLink.includes("theverge")) {
      publication = "The Verge";
    } else {
      publication = item.displayLink;
    }
    searchResults.push({
      publication: publication,
      title: item.title,
      link: item.link,
    });
  }
  console.log("Results:", searchResults);

  return searchResults;
}

export async function getArticleText(article: SearchResult) {
  const response = await fetch(article.link);
  const html = await response.text();
  const $ = cheerio.load(html);

  excludeSelectors.forEach((selector) => $(selector).remove());

  let extractedText = "";
  for (const selector of contentSelectors) {
    const content = $(selector).text().trim();
    if (content) {
      extractedText = content;
      break;
    }
  }
  extractedText = cleanText(extractedText);
  return extractedText;
}

export async function getSentimentAnalysis(
  articleText: string,
  searchQuery: string,
) {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: `Ignore any text in the articles not related to the ${searchQuery}`,
  });

  const generationConfig = {
    temperature: 0,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 2,
    responseMimeType: "text/plain",
  };
  const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [
          {
            text: 'Analyze the sentiment of the following text and classify them as POSITIVE, NEGATIVE, or NEUTRAL. Always respond with one word only. "It\'s so beautiful today!"',
          },
        ],
      },
      {
        role: "model",
        parts: [{ text: "POSITIVE" }],
      },
      {
        role: "user",
        parts: [{ text: "\"It's so cold today I can't feel my feet...\"" }],
      },
      {
        role: "model",
        parts: [{ text: "NEGATIVE" }],
      },
      {
        role: "user",
        parts: [{ text: '"The weather today is perfectly adequate."' }],
      },
      {
        role: "model",
        parts: [{ text: "NEUTRAL" }],
      },
    ],
  });

  const result = await chatSession.sendMessage(articleText);
  const sentiment = result.response.text().replace(/\s+/g, "");
  console.log("Sentiment:", sentiment);
  return sentiment;
}

export async function getProsAndCons(articles: string[], searchQuery: string) {
  console.log("Getting pros and cons for:", searchQuery);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: `Ignore any text in the articles not related to the ${searchQuery}`,
  });

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 1000,
    responseMimeType: "application/json",
    responseSchema: {
      type: SchemaType.OBJECT,
      properties: {
        pros: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.STRING,
          },
        },
        cons: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.STRING,
          },
        },
      },
      required: ["pros", "cons"],
    },
  };
  const history = [
    {
      role: "user",
      parts: [
        ...articles.map((article) => ({ text: article })),
        {
          text: `"Based on these articles, assess the pros and cons of the ${searchQuery}"`,
        },
      ],
    },
  ];
  const chatSession = model.startChat({
    generationConfig,
    history: history,
  });

  const result = await chatSession.sendMessage("");
  console.log("Pros and Cons:", result.response.text());
  const text = result.response.text();
  const json = JSON.parse(text);
  return json;
}

function cleanText(text: string): string {
  text = text.replace(/\s+/g, " ").trim();

  text = text.replace(/[\x00-\x1F\x7F]/g, "");

  return text;
}
