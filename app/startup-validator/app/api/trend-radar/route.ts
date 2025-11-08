import { NextRequest, NextResponse } from "next/server";

// Verified 2025-11-08
const PERPLEXITY_MODEL = "sonar";

export async function POST(request: NextRequest) {
  try {
    const { industry, perplexityKey } = await request.json();

    if (!industry || !perplexityKey) {
      return NextResponse.json(
        { error: "Missing required fields: industry, perplexityKey" },
        { status: 400 }
      );
    }

    // Call Perplexity API for trend analysis
    console.log("Analyzing trends with Perplexity...");
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
            content: "You are an expert trend analyst. Provide detailed, current trend analysis with specific data, statistics, and actionable insights. Always include sources and recent developments.",
          },
          {
            role: "user",
            content: `Analyze the latest trends for the ${industry} industry. Organize your analysis into these 5 categories:

1. **🚀 Technology Trends**
   - Impact Level: High/Medium/Low
   - Timeline: Short-term (0-12 months) / Medium-term (1-3 years) / Long-term (3+ years)
   - Description: What technologies are emerging or maturing?

2. **👥 Consumer Behavior Trends**
   - Impact Level: High/Medium/Low
   - Timeline: Short-term / Medium-term / Long-term
   - Description: How are customer preferences and behaviors changing?

3. **📋 Regulatory & Policy Trends**
   - Impact Level: High/Medium/Low
   - Timeline: Short-term / Medium-term / Long-term
   - Description: What new regulations or policies are affecting the industry?

4. **💰 Funding & Investment Trends**
   - Impact Level: High/Medium/Low
   - Timeline: Short-term / Medium-term / Long-term
   - Description: Where is capital flowing? What are investors prioritizing?

5. **📊 Market Sentiment & Competitive Trends**
   - Impact Level: High/Medium/Low
   - Timeline: Short-term / Medium-term / Long-term
   - Description: How is the competitive landscape shifting?

After the 5 categories, provide:
- **Strategic Implications**: 3-5 actionable recommendations for businesses in this industry

Use current, real-world data from 2024-2025. Be specific with examples, company names, statistics, and recent events. Format as well-structured markdown with clear sections, bullet points, and emphasis on actionable insights.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Perplexity trend analysis error:", response.status, errorText);
      throw new Error(`Perplexity API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;
    const sources = data.citations || [];

    console.log("Trend analysis completed. Sources:", sources.length);

    return NextResponse.json({
      analysis,
      sources,
    });
  } catch (error: any) {
    console.error("Trend analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze trends" },
      { status: 500 }
    );
  }
}
