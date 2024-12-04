import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function rateLimit(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";
  const cleanIp = ip.split(",")[0];

  const windowMs = 60 * 1000;
  const limit = 100;

  const key = `ratelimit:${cleanIp}`;

  try {
    const result = await redis
      .pipeline()
      .incr(key)
      .pexpire(key, windowMs)
      .exec();

    const requests = result[0] as number;

    if (requests > limit) {
      return new NextResponse(
        JSON.stringify({
          error: "Rate limit exceeded. Please try again in a minute.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    return null;
  } catch (error) {
    console.error("Rate limiting error:", error);
    return null;
  }
}
