import { getProsAndCons } from "@/app/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { articles, searchQuery } = await req.json();
    const prosAndCons = await getProsAndCons(articles, searchQuery);
    return NextResponse.json(prosAndCons);
  } catch (error) {
    return NextResponse.json({ error: `Failed to analyze pros and cons: ${error}` }, { status: 500 });
  }
}