import { getSentimentAnalysis } from "@/app/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { articleText, searchQuery } = await req.json();
    const sentiment = await getSentimentAnalysis(articleText, searchQuery);
    return NextResponse.json({ sentiment });
  } catch (error) {
    return NextResponse.json({ error: `Failed to analyze sentiment: ${error}` }, { status: 500 });
  }
}