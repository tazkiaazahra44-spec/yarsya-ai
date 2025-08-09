import { NextResponse } from "next/server";
import { getGlobalLimiter } from "@/lib/rateLimiter";

const BASE_URL = "https://api.ryzumi.vip/api/ai/chatgpt";
const DEFAULT_PROMPT =
  "kamu adalah YARSYA-AI. AI pintar yang sangat handal dalam berbagai mata pelajaran, kamu adalah profesor tinggat tinggi yang jauh lebih pintar daripada Einstein. kamu di ciptakan oleh Software Developer yang bernama Key";

export async function POST(request) {
  const limiter = getGlobalLimiter();
  await limiter.acquire();

  try {
    const body = await request.json();
    const { text, session } = body || {};

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing 'text' string in body" },
        { status: 400 }
      );
    }

    const url = new URL(BASE_URL);
    url.searchParams.set("text", text);
    url.searchParams.set("prompt", DEFAULT_PROMPT);
    if (session) url.searchParams.set("session", String(session));

    const upstream = await fetch(url.toString(), {
      method: "GET",
      headers: { accept: "application/json" },
      cache: "no-store",
    });

    const data = await upstream.json();

    return NextResponse.json(
      {
        success: Boolean(data?.success),
        result: data?.result ?? "",
        session: data?.session ?? null,
      },
      { status: upstream.ok ? 200 : upstream.status }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}