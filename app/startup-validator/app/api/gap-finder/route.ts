import { NextRequest, NextResponse } from "next/server";

// Verified 2025-11-08
const PERPLEXITY_MODEL = "sonar";
const CLAUDE_MODEL = "claude-sonnet-4-20250514";

export async function POST(request: NextRequest) {
  try {
    const { industryProduct, perplexityKey, anthropicKey } = await request.json();

    if (!industryProduct || !perplexityKey || !anthropicKey) {
      return NextResponse.json(
        { error: "Missing required fields: industryProduct, perplexityKey, anthropicKey" },
        { status: 400 }
      );
    }

    // Step 1: Gather market data using Perplexity
    console.log("Step 1: Gathering market data with Perplexity...");
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
            content: "You are an expert market analyst specializing in identifying market gaps and opportunities. Provide detailed, data-driven insights with specific examples, statistics, and credible sources from 2024-2025.",
          },
          {
            role: "user",
            content: `Analyze the market for "${industryProduct}" and identify:

1. **Underserved Customer Segments**: Groups with unmet needs
2. **Emerging Trends**: New technologies, behaviors, or regulations creating opportunities
3. **Competitive Weaknesses**: Where existing players are falling short
4. **Geographic Gaps**: Regions with high demand but limited supply
5. **Pricing/Business Model Gaps**: Alternative monetization strategies not being explored

For each gap identified, provide:
- Specific examples and evidence
- Market size estimates where possible
- Current competitive landscape
- Why this gap exists

Be specific with data, company names, statistics, and recent examples from 2024-2025. Format as detailed markdown.`,
          },
        ],
      }),
    });

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text();
      console.error("Perplexity market data error:", perplexityResponse.status, errorText);
      throw new Error(`Perplexity API error (${perplexityResponse.status}): ${errorText}`);
    }

    const perplexityData = await perplexityResponse.json();
    const marketData = perplexityData.choices[0].message.content;
    const sources = perplexityData.citations || [];
    console.log("Market data gathered. Sources:", sources.length);

    // Step 2: Score and prioritize opportunities using Claude
    console.log("Step 2: Scoring opportunities with Claude...");
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: `Based on the following market gap analysis for "${industryProduct}", identify the TOP 5 OPPORTUNITIES and score each from 0-100.

Market Gap Analysis:
${marketData}

For each of the 5 opportunities, provide:

## Opportunity [#]: [Concise Title]

**Total Score: [70-90]/100**

### Scoring Breakdown
- **Market Size** (25 points): [score/25] - [explanation]
- **Competition Level** (20 points): [score/20] - [explanation - lower competition = higher score]
- **Entry Barriers** (15 points): [score/15] - [explanation - lower barriers = higher score]
- **Growth Potential** (20 points): [score/20] - [explanation]
- **Strategic Fit** (20 points): [score/20] - [explanation]

### Opportunity Details
- **Description**: [2-3 sentences describing the opportunity]
- **Target Customer Profile**: [Who would buy this?]
- **Revenue Potential**: [Estimated annual revenue if captured]
- **Timeline to Market**: [How long to launch?]

### Action Items
1. [Specific first step]
2. [Specific second step]
3. [Specific third step]

### Success Metrics
- [Key metric 1]
- [Key metric 2]
- [Key metric 3]

---

After all 5 opportunities, create a summary table comparing them side-by-side.

Format as well-structured markdown. Be specific and actionable. Scores should realistically range from 70-90 (not all 95+).`,
          },
        ],
      }),
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error("Claude scoring error:", claudeResponse.status, errorText);
      throw new Error(`Claude API error (${claudeResponse.status}): ${errorText}`);
    }

    const claudeData = await claudeResponse.json();
    const opportunities = claudeData.content[0].text;
    console.log("Opportunity scoring completed");

    return NextResponse.json({
      opportunities,
      sources,
    });
  } catch (error: any) {
    console.error("Gap finder error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to find market gaps" },
      { status: 500 }
    );
  }
}
