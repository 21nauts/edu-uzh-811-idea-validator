import { NextRequest, NextResponse } from "next/server";

// Verified 2025-11-08
const PERPLEXITY_MODEL = "sonar";
const CLAUDE_MODEL = "claude-sonnet-4-20250514";

export async function POST(request: NextRequest) {
  try {
    const { idea, perplexityKey, anthropicKey } = await request.json();

    if (!idea || !perplexityKey || !anthropicKey) {
      return NextResponse.json(
        { error: "Missing required fields: idea, perplexityKey, anthropicKey" },
        { status: 400 }
      );
    }

    // Step 1: Generate summary using Claude
    console.log("Step 1: Generating summary with Claude...");
    const summaryResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `You are an expert startup analyst. Summarize this business idea in one clear, concise sentence that captures the core value proposition and target market:\n\n${idea}`,
          },
        ],
      }),
    });

    if (!summaryResponse.ok) {
      const errorText = await summaryResponse.text();
      console.error("Claude summary error:", summaryResponse.status, errorText);
      throw new Error(`Claude API error (${summaryResponse.status}): ${errorText}`);
    }

    const summaryData = await summaryResponse.json();
    const summary = summaryData.content[0].text;
    console.log("Summary generated:", summary);

    // Step 2: Market analysis using Perplexity
    console.log("Step 2: Analyzing market with Perplexity...");
    const marketResponse = await fetch("https://api.perplexity.ai/chat/completions", {
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
            content: "You are an expert market analyst. Provide detailed market analysis with specific data, statistics, and actionable insights. Always include sources and citations.",
          },
          {
            role: "user",
            content: `Analyze the market for this business idea: "${summary}"\n\nProvide a comprehensive analysis covering:\n- Market size and growth potential (with specific numbers and percentages)\n- Customer segments (demographics, psychographics)\n- Existing competitors (name 3-5 key players)\n- Market trends and dynamics\n\nReturn a well-structured markdown analysis with clear sections, bullet points, and actionable insights.`,
          },
        ],
      }),
    });

    if (!marketResponse.ok) {
      const errorText = await marketResponse.text();
      console.error("Perplexity market analysis error:", marketResponse.status, errorText);
      throw new Error(`Perplexity API error (${marketResponse.status}): ${errorText}`);
    }

    const marketData = await marketResponse.json();
    const marketAnalysis = marketData.choices[0].message.content;

    // Extract sources from Perplexity response
    const sources = marketData.citations || [];
    console.log("Market analysis completed. Sources:", sources.length);

    // Step 3: Generate 48-hour action plan using Claude
    console.log("Step 3: Generating action plan with Claude...");
    const actionPlanResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: `Generate a simple 3-step action plan to test this business idea in 48 hours:\n\n"${summary}"\n\nMarket Context:\n${marketAnalysis}\n\nThe action plan should:\n- Include 3 concrete, actionable steps\n- Have one validation task (customer interviews, landing page test, etc.)\n- Define one clear metric of success\n- Be realistic to execute in 48 hours\n\nFormat as clear markdown with numbered steps, specific tasks, and a success metrics section.`,
          },
        ],
      }),
    });

    if (!actionPlanResponse.ok) {
      const errorText = await actionPlanResponse.text();
      console.error("Claude action plan error:", actionPlanResponse.status, errorText);
      throw new Error(`Claude API error (${actionPlanResponse.status}): ${errorText}`);
    }

    const actionPlanData = await actionPlanResponse.json();
    const actionPlan = actionPlanData.content[0].text;
    console.log("Action plan generated");

    // Step 4: Score the idea using Claude
    console.log("Step 4: Scoring idea with Claude...");
    const scoreResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: `Score this business idea from 0-100 based on:\n1. Problem relevance (How pressing is the problem?)\n2. Execution simplicity (How easy is it to build and launch?)\n3. Potential profitability (Revenue potential and margins)\n\nBusiness Idea: "${summary}"\n\nMarket Analysis:\n${marketAnalysis}\n\nProvide:\n1. A single numerical score (0-100)\n2. Explanation in exactly 3 bullet points (one for each criteria)\n\nFormat your response as:\nSCORE: [number]\n\nEXPLANATION:\n- [Problem relevance explanation]\n- [Execution simplicity explanation]\n- [Potential profitability explanation]`,
          },
        ],
      }),
    });

    if (!scoreResponse.ok) {
      const errorText = await scoreResponse.text();
      console.error("Claude scoring error:", scoreResponse.status, errorText);
      throw new Error(`Claude API error (${scoreResponse.status}): ${errorText}`);
    }

    const scoreData = await scoreResponse.json();
    const scoreText = scoreData.content[0].text;

    // Parse score and explanation
    const scoreMatch = scoreText.match(/SCORE:\s*(\d+)/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;

    const explanationMatch = scoreText.match(/EXPLANATION:([\s\S]*)/);
    const scoreExplanation = explanationMatch ? explanationMatch[1].trim() : scoreText;

    console.log("Scoring completed. Score:", score);

    // Return complete validation result
    return NextResponse.json({
      summary,
      marketAnalysis,
      actionPlan,
      score,
      scoreExplanation,
      sources,
    });
  } catch (error: any) {
    console.error("Validation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to validate idea" },
      { status: 500 }
    );
  }
}
