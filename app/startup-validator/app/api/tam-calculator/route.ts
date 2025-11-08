import { NextRequest, NextResponse } from "next/server";

// Verified 2025-11-08
const PERPLEXITY_MODEL = "sonar";

export async function POST(request: NextRequest) {
  try {
    const { industry, geographicMarket, customerSegments, perplexityKey } = await request.json();

    if (!industry || !geographicMarket || !customerSegments || !perplexityKey) {
      return NextResponse.json(
        { error: "Missing required fields: industry, geographicMarket, customerSegments, perplexityKey" },
        { status: 400 }
      );
    }

    // Call Perplexity API for market size data
    console.log("Calculating TAM/SAM/SOM with Perplexity...");
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
            content: "You are an expert market analyst specializing in TAM/SAM/SOM calculations. Provide detailed, data-driven market size estimates with specific numbers, percentages, and credible sources.",
          },
          {
            role: "user",
            content: `Calculate TAM (Total Addressable Market), SAM (Serviceable Addressable Market), and SOM (Serviceable Obtainable Market) for:

Industry: ${industry}
Geographic Market: ${geographicMarket}
Customer Segments: ${customerSegments.join(", ")}

Provide a comprehensive analysis with:
1. **TAM (Total Addressable Market)**: Total market demand in USD for the entire industry globally or in specified region
2. **SAM (Serviceable Addressable Market)**: Portion of TAM your business can realistically target based on geographic and segment constraints
3. **SOM (Serviceable Obtainable Market)**: Realistic market share you can capture in first 1-3 years

For each metric provide:
- Dollar amount (USD)
- Number of potential customers
- Market growth rate (CAGR %)
- Key assumptions

Then provide:
- **Revenue Projections** for Years 1, 2, and 3 based on SOM
- **Industry Benchmarks** (average customer acquisition cost, lifetime value, churn rate)
- **Strategic Recommendations** for market entry

Format as well-structured markdown with clear sections, tables, and bullet points. Include specific numbers and cite all sources.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Perplexity TAM calculation error:", response.status, errorText);
      throw new Error(`Perplexity API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;
    const sources = data.citations || [];

    console.log("TAM/SAM/SOM calculation completed. Sources:", sources.length);

    return NextResponse.json({
      analysis,
      sources,
    });
  } catch (error: any) {
    console.error("TAM calculation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to calculate TAM/SAM/SOM" },
      { status: 500 }
    );
  }
}
