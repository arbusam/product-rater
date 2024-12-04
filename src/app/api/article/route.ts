import { getArticleText } from "@/app/server";
import { NextResponse, NextRequest } from "next/server";
import { rateLimit } from '../../lib/rateLimit'

export async function POST(req: NextRequest) {
  const rateLimitResult = await rateLimit(req);
  if (rateLimitResult) return rateLimitResult

  try {
    const article = await req.json();
    const text = await getArticleText(article);
    return NextResponse.json({ text });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch article text: ${error}` },
      { status: 500 },
    );
  }
}
