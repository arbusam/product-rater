import { getProsAndCons } from "@/app/server";
import { NextResponse, NextRequest } from "next/server";
import { rateLimit } from '../../lib/rateLimit'

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const rateLimitResult = await rateLimit(req);
  if (rateLimitResult) return rateLimitResult

  try {
    const { articles, searchQuery } = await req.json();
    const prosAndCons = await getProsAndCons(articles, searchQuery);
    return NextResponse.json(prosAndCons);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to analyze pros and cons: ${error}` },
      { status: 500 },
    );
  }
}
