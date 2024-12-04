
import { getArticleText } from "@/app/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const article = await req.json();
    const text = await getArticleText(article);
    return NextResponse.json({ text });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch article text" }, { status: 500 });
  }
}