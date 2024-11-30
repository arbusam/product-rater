"use server";

import { SearchResult } from "@/types/searchResult";
const puppeteer = require("puppeteer");
const Sentiment = require("sentiment");
const sentiment = new Sentiment();

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

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

let searchResults: SearchResult[] = [];

export async function getSearchResults(searchQuery: string) {
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

  // TODO: Do sentiment analysis and summary and send that to the client later
  return searchResults;
}

export async function getSentimentAnalysis() {
  for (const result of searchResults) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    console.log("Visiting:", result.link);
    try {
      await page.goto(result.link);
      const text = await page.$$eval("p", (elements: any) =>
        elements.map((el: any) => el.innerText).join(" "),
      );
      const resultSentiment = sentiment.analyze(text);
      console.log("Sentiment:", resultSentiment);
    } catch (error) {
      console.error("Error visiting page:", error);
    } finally {
      await browser.close();
    }
  }
}
