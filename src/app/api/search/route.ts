import { getSearchResults } from "@/app/server";
import { NextResponse, NextRequest } from "next/server";
import { rateLimit } from '../../lib/rateLimit'

export const maxDuration = 15;

export async function GET(req: NextRequest) {
  const rateLimitResult = await rateLimit(req);
  if (rateLimitResult) return rateLimitResult

  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter required" },
        { status: 400 },
      );
    }

    const results = await getSearchResults(query);
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch search results: ${error}` },
      { status: 500 },
    );
  }
}
