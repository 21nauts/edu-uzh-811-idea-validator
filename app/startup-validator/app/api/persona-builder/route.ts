import { NextRequest, NextResponse } from "next/server";

// Verified 2025-11-08
const CLAUDE_MODEL = "claude-sonnet-4-20250514";

export async function POST(request: NextRequest) {
  try {
    const { productDescription, targetIndustry, anthropicKey } = await request.json();

    if (!productDescription || !targetIndustry || !anthropicKey) {
      return NextResponse.json(
        { error: "Missing required fields: productDescription, targetIndustry, anthropicKey" },
        { status: 400 }
      );
    }

    // Call Claude API for persona generation
    console.log("Generating customer personas with Claude...");
    const response = await fetch("https://api.anthropic.com/v1/messages", {
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
            content: `Create 3-4 detailed customer personas for this product/service in the ${targetIndustry} industry:

Product/Service: ${productDescription}

For each persona, provide:

## Persona [Number]: [Name] - [Job Title/Role]

**Quote**: "[A realistic quote that captures their main pain point or need]"

### Demographics
- Age: [age range]
- Location: [geographic region]
- Income: [income range]
- Education: [education level]
- Company Size: [if B2B - employee count]

### Pain Points
- [3-5 specific pain points this persona experiences]

### Goals & Motivations
- [3-4 key goals they want to achieve]

### Budget & Spending Authority
- Budget Range: [typical budget for solutions like this]
- Decision Authority: [decision-maker, influencer, or gatekeeper]
- Purchase Timeline: [typical buying cycle]

### Preferred Media & Channels
- [Where they consume content - platforms, publications, events]
- [Preferred communication channels]

### Decision-making Process
- [How they evaluate solutions]
- [Key criteria they use]
- [Who else is involved in the decision]

---

After all personas, create:

## Persona Comparison Matrix

Create a markdown table comparing all personas across these dimensions:
- Demographics (age, income)
- Primary Pain Point
- Budget Range
- Decision Authority
- Preferred Channel
- Purchase Timeline

Format the entire response as well-structured markdown with clear sections, bullet points, tables, and blockquotes for quotes. Be specific and realistic with details.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Claude persona generation error:", response.status, errorText);
      throw new Error(`Claude API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const personas = data.content[0].text;

    console.log("Customer personas generated");

    return NextResponse.json({
      personas,
    });
  } catch (error: any) {
    console.error("Persona generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate customer personas" },
      { status: 500 }
    );
  }
}
