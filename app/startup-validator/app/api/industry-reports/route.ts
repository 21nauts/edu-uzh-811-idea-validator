import { NextRequest, NextResponse } from "next/server";

// Verified 2025-11-08
const PERPLEXITY_MODEL = "sonar";
const CLAUDE_MODEL = "claude-sonnet-4-20250514";

export async function POST(request: NextRequest) {
  try {
    const { industry, perplexityKey, anthropicKey } = await request.json();

    if (!industry || !perplexityKey || !anthropicKey) {
      return NextResponse.json(
        { error: "Missing required fields: industry, perplexityKey, anthropicKey" },
        { status: 400 }
      );
    }

    // Step 1: Gather industry data using Perplexity
    console.log("Step 1: Gathering industry data with Perplexity...");
    const perplexityResponse = await fetch("https://api.perplexity.ai/chat/completions", {
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
            content: "You are an expert industry analyst. Provide comprehensive, data-driven industry analysis with specific statistics, company names, market data, and credible sources from 2024-2025.",
          },
          {
            role: "user",
            content: `Generate comprehensive data for a deep dive report on the ${industry} industry. Include:

1. **Market Size & Growth**: Total market size in USD, CAGR, historical growth, future projections
2. **Key Players**: Top 10-15 companies, their market share, recent developments, acquisitions
3. **Customer Demographics**: Target audiences, age groups, income levels, geographic distribution
4. **Distribution Channels**: How products/services reach customers, emerging channels
5. **Pricing Models**: Common pricing strategies, price ranges, value propositions
6. **Success Stories**: 3-5 notable case studies of successful companies or campaigns
7. **Regulatory Landscape**: Key regulations, compliance requirements, recent policy changes
8. **Challenges & Barriers**: Entry barriers, common challenges, risks

Provide current, specific data with numbers, percentages, company names, and recent examples from 2024-2025. Format as detailed markdown with sections and bullet points.`,
          },
        ],
      }),
    });

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text();
      console.error("Perplexity industry data error:", perplexityResponse.status, errorText);
      throw new Error(`Perplexity API error (${perplexityResponse.status}): ${errorText}`);
    }

    const perplexityData = await perplexityResponse.json();
    const industryData = perplexityData.choices[0].message.content;
    const sources = perplexityData.citations || [];
    console.log("Industry data gathered. Sources:", sources.length);

    // Step 2: Generate executive summary and strategic recommendations using Claude
    console.log("Step 2: Generating executive summary and recommendations with Claude...");
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 3000,
        messages: [
          {
            role: "user",
            content: `Based on the following industry data, create:

1. **Executive Summary** (3-4 paragraphs): Concise overview of the ${industry} industry's current state, key opportunities, and major challenges

2. **Strategic Recommendations** (5-7 actionable items): Specific, prioritized recommendations for businesses entering or operating in this industry

Industry Data:
${industryData}

Format as well-structured markdown with clear sections. Be specific and actionable.`,
          },
        ],
      }),
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error("Claude analysis error:", claudeResponse.status, errorText);
      throw new Error(`Claude API error (${claudeResponse.status}): ${errorText}`);
    }

    const claudeData = await claudeResponse.json();
    const strategicAnalysis = claudeData.content[0].text;
    console.log("Strategic analysis completed");

    // Combine all sections into full report
    const fullReport = `${strategicAnalysis}

---

## Industry Deep Dive

${industryData}`;

    return NextResponse.json({
      report: fullReport,
      sources,
    });
  } catch (error: any) {
    console.error("Industry report error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate industry report" },
      { status: 500 }
    );
  }
}
