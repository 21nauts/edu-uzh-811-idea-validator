import { NextResponse } from "next/server";

// Verified 2025-11-08 - Current Perplexity model
const PERPLEXITY_MODEL = "sonar";

export async function POST(request: Request) {
  try {
    const { question, perplexityKey } = await request.json();

    if (!question) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    if (!perplexityKey) {
      return NextResponse.json(
        { error: "Perplexity API key is required" },
        { status: 400 }
      );
    }

    // Call Perplexity API
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${perplexityKey}`,
      },
      body: JSON.stringify({
        model: PERPLEXITY_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a professional market research analyst providing data-driven, actionable answers. Focus on current market trends, competitive landscape, customer behavior, and growth opportunities. Use real data and cite sources when possible.",
          },
          {
            role: "user",
            content: question,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Perplexity API error:", response.status, errorText);
      return NextResponse.json(
        { error: `Perplexity API error (${response.status}): ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Perplexity response:", JSON.stringify(data, null, 2));

    // Extract answer and sources
    const answer = data.choices[0]?.message?.content || "No response generated";
    const citations = data.citations || [];
    const sources = citations.map((url: string, idx: number) => ({
      id: idx + 1,
      url,
      title: `Source ${idx + 1}`,
    }));

    return NextResponse.json({ answer, sources });
  } catch (error) {
    console.error("Market research API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
