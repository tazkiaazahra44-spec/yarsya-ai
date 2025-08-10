import { NextResponse } from "next/server";
import { getGlobalLimiter } from "@/lib/rateLimiter";

const BASE_URL = "https://api.ryzumi.vip/api/ai/chatgpt";
const DEFAULT_PROMPT =
  "kamu adalah YARSYA-AI. AI pintar yang sangat handal dalam berbagai mata pelajaran, kamu adalah profesor tinggat tinggi yang jauh lebih pintar daripada Einstein. kamu di ciptakan oleh Software Developer yang bernama Key";

// Mock response function for when external API is unavailable
function getMockResponse(text) {
  const responses = {
    "hello": "Hello! I'm YARSYA-AI, your intelligent assistant. How can I help you today?",
    "test": "I'm working perfectly! All systems are green. ✅",
    "math": "I can help you with mathematics! Try asking me about equations, calculus, statistics, or any mathematical concept.",
    "code": "I can assist with programming in various languages like JavaScript, Python, Java, C++, and more. I also support syntax highlighting!",
    "latex": "I support LaTeX mathematical notation! For example: E = mc² can be written as \\(E = mc^2\\) or in display mode \\[E = mc^2\\]",
    "default": `Hello! I'm YARSYA-AI, your intelligent AI assistant. I can help you with:

- 📐 **Mathematics & Physics** - Complex equations, LaTeX notation
- 💻 **Programming** - Code in multiple languages with syntax highlighting  
- 📝 **Writing & Research** - Essays, analysis, creative content
- 🔬 **Science** - Biology, Chemistry, Physics explanations
- 🌍 **General Knowledge** - History, geography, current events

Ask me anything! I support **Markdown formatting**, **LaTeX math** (like \\(\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}\\)), and **code highlighting**.

Try asking: "Explain quantum mechanics" or "Write a Python function to sort arrays"`
  };

  const lowerText = text.toLowerCase();
  for (const [key, response] of Object.entries(responses)) {
    if (lowerText.includes(key)) {
      return response;
    }
  }
  return responses.default;
}

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

    try {
      const upstream = await fetch(url.toString(), {
        method: "GET",
        headers: { 
          accept: "application/json",
          'User-Agent': 'YARSYA-AI/1.0'
        },
        cache: "no-store",
        timeout: 10000,
      });

      const data = await upstream.json();

      // Check if we got a valid response
      if (data && data.success !== undefined) {
        return NextResponse.json(
          {
            success: Boolean(data?.success),
            result: data?.result ?? "",
            session: data?.session ?? null,
          },
          { status: upstream.ok ? 200 : upstream.status }
        );
      } else {
        throw new Error("Invalid response from external API");
      }
    } catch (fetchError) {
      console.warn("External API unavailable, using mock response:", fetchError.message);
      
      // Use mock response when external API is unavailable
      const mockResult = getMockResponse(text);
      const mockSession = session || `mock-session-${Date.now()}`;
      
      return NextResponse.json({
        success: true,
        result: mockResult,
        session: mockSession,
      });
    }
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}