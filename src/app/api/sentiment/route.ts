import { getSentimentAnalysis } from "@/app/server";
import { NextResponse, NextRequest } from "next/server";
import { rateLimit } from '../../lib/rateLimit'

export const maxDuration = 15;

export async function POST(req: NextRequest) {
  const rateLimitResult = await rateLimit(req);
  if (rateLimitResult) return rateLimitResult

  try {
    const { articleText, searchQuery } = await req.json();
    const sentiment = await getSentimentAnalysis(articleText, searchQuery);
    return NextResponse.json({ sentiment });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to analyze sentiment: ${error}` },
      { status: 500 },
    );
  }
}
