"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import MarkdownContent from "@/components/MarkdownContent";
import CopyButton from "@/components/CopyButton";
import {
  TrendingUp,
  Target,
  Users,
  DollarSign,
  BarChart3,
  MessageSquare,
  Send,
  Loader2,
  ExternalLink,
  Info,
  Lightbulb,
} from "lucide-react";

interface ValidatedIdea {
  id: string;
  summary: string;
  marketAnalysis: string;
  actionPlan: string;
  score: number;
  timestamp: string;
}

interface BubbleData {
  id: string;
  summary: string;
  score: number;
  marketSize: number;
  growthRate: number;
  competitionIntensity: number;
  entryDifficulty: number;
  x: number;
  y: number;
  radius: number;
  color: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ id: number; url: string; title: string }>;
  timestamp: string;
}

export default function MarketResearchPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"heatmap" | "chat">("heatmap");
  const [validatedIdeas, setValidatedIdeas] = useState<ValidatedIdea[]>([]);
  const [bubbles, setBubbles] = useState<BubbleData[]>([]);
  const [selectedBubble, setSelectedBubble] = useState<BubbleData | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Quick research prompts
  const quickPrompts = [
    "What are the top market trends in SaaS for 2025?",
    "How can I estimate market size for a new mobile app?",
    "What are the biggest pain points for small business owners?",
    "How do I identify my ideal customer profile?",
    "What are effective customer acquisition strategies for startups?",
    "How can I differentiate my product in a crowded market?",
  ];

  // Load validated ideas and chat history on mount
  useEffect(() => {
    const savedIdeas = localStorage.getItem("validated_ideas");
    if (savedIdeas) {
      const ideas: ValidatedIdea[] = JSON.parse(savedIdeas);
      setValidatedIdeas(ideas);
      calculateBubbles(ideas);
    }

    const savedChat = localStorage.getItem("market_research_chat");
    if (savedChat) {
      setChatMessages(JSON.parse(savedChat));
    }
  }, []);

  // Calculate bubble metrics from validated ideas
  const calculateBubbles = (ideas: ValidatedIdea[]) => {
    const bubblesData: BubbleData[] = ideas.map((idea) => {
      // Extract metrics from market analysis text
      const analysis = idea.marketAnalysis.toLowerCase();

      // Market Size: count mentions of "market", "industry", "billion", "million"
      const marketKeywords = ["market", "industry", "billion", "million", "large", "growing"];
      const marketSize = Math.min(
        100,
        marketKeywords.filter((keyword) => analysis.includes(keyword)).length * 15 + 20
      );

      // Growth Rate: count mentions of "growth", "increasing", "trend", "rising"
      const growthKeywords = ["growth", "increasing", "trend", "rising", "expanding", "potential"];
      const growthRate = Math.min(
        100,
        growthKeywords.filter((keyword) => analysis.includes(keyword)).length * 15 + 20
      );

      // Competition: count mentions of "competition", "competitive", "competitors"
      const compKeywords = ["competition", "competitive", "competitors", "saturated", "crowded"];
      const competitionIntensity = Math.min(
        100,
        compKeywords.filter((keyword) => analysis.includes(keyword)).length * 12 + 25
      );

      // Entry Difficulty: inverse of score (lower score = harder entry)
      const entryDifficulty = 100 - idea.score;

      // Position on chart
      const x = competitionIntensity;
      const y = growthRate;

      // Bubble radius based on market size (30-100px)
      const radius = 30 + (marketSize / 100) * 70;

      // Color based on entry difficulty
      let color;
      if (entryDifficulty < 35) {
        color = "#7FE0C3"; // Green - easy
      } else if (entryDifficulty < 65) {
        color = "#6BA4FF"; // Blue - medium
      } else {
        color = "#FF6B8A"; // Pink - hard
      }

      return {
        id: idea.id,
        summary: idea.summary,
        score: idea.score,
        marketSize,
        growthRate,
        competitionIntensity,
        entryDifficulty,
        x,
        y,
        radius,
        color,
      };
    });

    setBubbles(bubblesData);
    if (bubblesData.length > 0 && !selectedBubble) {
      setSelectedBubble(bubblesData[0]);
    }
  };

  // Handle chat submission
  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    const perplexityKey = localStorage.getItem("perplexity_api_key");
    if (!perplexityKey) {
      alert("Please configure your Perplexity API key in Settings");
      router.push("/settings");
      return;
    }

    // Add user message
    const userMessage: ChatMessage = {
      role: "user",
      content: question,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setQuestion("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/market-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, perplexityKey }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      const data = await response.json();

      // Add assistant message
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.answer,
        sources: data.sources,
        timestamp: new Date().toISOString(),
      };

      const newMessages = [...updatedMessages, assistantMessage];
      setChatMessages(newMessages);

      // Save to localStorage
      localStorage.setItem("market_research_chat", JSON.stringify(newMessages));
    } catch (error) {
      console.error("Chat error:", error);
      alert(error instanceof Error ? error.message : "Failed to get response");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle quick prompt click
  const handleQuickPrompt = (prompt: string) => {
    setQuestion(prompt);
  };

  // Handle Enter key (Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitQuestion(e);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#1a1d23] to-[#2d3139]">
      <Sidebar />

      <main className="flex-1 p-8 ml-64">
        {/* Header */}
        <div className="mb-8 fade-in">
          <h1 className="text-4xl font-bold mb-2 text-white">Market Research Hub</h1>
          <p className="text-gray-400">
            Visualize opportunities and explore market insights with AI
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 fade-in" style={{ animationDelay: "0.1s" }}>
          <Button
            onClick={() => setActiveTab("heatmap")}
            variant={activeTab === "heatmap" ? "default" : "outline"}
            className={
              activeTab === "heatmap"
                ? "bg-gradient-to-r from-[#7FE0C3] to-[#6BA4FF] text-black hover:opacity-90"
                : "glass-card glass-card-hover text-white border-white/10"
            }
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Opportunity Heatmap
          </Button>
          <Button
            onClick={() => setActiveTab("chat")}
            variant={activeTab === "chat" ? "default" : "outline"}
            className={
              activeTab === "chat"
                ? "bg-gradient-to-r from-[#7FE0C3] to-[#6BA4FF] text-black hover:opacity-90"
                : "glass-card glass-card-hover text-white border-white/10"
            }
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            AI Research Chat
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === "heatmap" ? (
          <div className="space-y-6">
            {validatedIdeas.length === 0 ? (
              <Card className="glass-card fade-in" style={{ animationDelay: "0.2s" }}>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <BarChart3 className="h-16 w-16 text-[#7FE0C3] mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-white">No Validated Ideas Yet</h3>
                  <p className="text-gray-400 mb-6 text-center max-w-md">
                    Validate your first startup idea to see it visualized on the opportunity heatmap
                  </p>
                  <Button
                    onClick={() => router.push("/ideas")}
                    className="bg-gradient-to-r from-[#7FE0C3] to-[#6BA4FF] text-black hover:opacity-90"
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Validate First Idea
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Heatmap Visualization */}
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <Card className="glass-card fade-in" style={{ animationDelay: "0.2s" }}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-[#7FE0C3]" />
                          Market Opportunity Heatmap
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <svg
                          width="100%"
                          height="500"
                          viewBox="0 0 800 500"
                          className="border border-white/10 rounded-lg bg-black/20"
                        >
                          {/* Grid lines */}
                          <g opacity="0.2">
                            {[0, 25, 50, 75, 100].map((val) => (
                              <g key={`grid-${val}`}>
                                <line
                                  x1={(val / 100) * 700 + 50}
                                  y1="50"
                                  x2={(val / 100) * 700 + 50}
                                  y2="450"
                                  stroke="white"
                                  strokeWidth="1"
                                />
                                <line
                                  x1="50"
                                  y1={450 - (val / 100) * 400}
                                  x2="750"
                                  y2={450 - (val / 100) * 400}
                                  stroke="white"
                                  strokeWidth="1"
                                />
                              </g>
                            ))}
                          </g>

                          {/* Axes */}
                          <line x1="50" y1="450" x2="750" y2="450" stroke="white" strokeWidth="2" />
                          <line x1="50" y1="50" x2="50" y2="450" stroke="white" strokeWidth="2" />

                          {/* Axis labels */}
                          <text x="400" y="485" fill="white" textAnchor="middle" fontSize="14">
                            Competition Intensity →
                          </text>
                          <text
                            x="20"
                            y="250"
                            fill="white"
                            textAnchor="middle"
                            fontSize="14"
                            transform="rotate(-90, 20, 250)"
                          >
                            Growth Rate →
                          </text>

                          {/* Bubbles */}
                          {bubbles.map((bubble, idx) => {
                            const cx = 50 + (bubble.x / 100) * 700;
                            const cy = 450 - (bubble.y / 100) * 400;
                            const isSelected = selectedBubble?.id === bubble.id;

                            return (
                              <g
                                key={bubble.id}
                                onClick={() => setSelectedBubble(bubble)}
                                style={{ cursor: "pointer" }}
                                opacity={isSelected ? 1 : 0.7}
                              >
                                <circle
                                  cx={cx}
                                  cy={cy}
                                  r={bubble.radius}
                                  fill={bubble.color}
                                  stroke={isSelected ? "white" : "transparent"}
                                  strokeWidth="3"
                                  opacity={0.6}
                                  className="transition-all duration-300 hover:opacity-80"
                                />
                                <text
                                  x={cx}
                                  y={cy}
                                  fill="white"
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                  fontSize="16"
                                  fontWeight="bold"
                                >
                                  {bubble.score}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </CardContent>
                    </Card>

                    {/* Legend */}
                    <Card
                      className="glass-card fade-in mt-4"
                      style={{ animationDelay: "0.3s" }}
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Info className="h-5 w-5 text-[#7FE0C3]" />
                          Legend
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400 mb-2">Bubble Size:</p>
                            <p className="text-white">Market Size (larger = bigger market)</p>
                          </div>
                          <div>
                            <p className="text-gray-400 mb-2">Number Inside:</p>
                            <p className="text-white">Validation Score (0-100)</p>
                          </div>
                          <div>
                            <p className="text-gray-400 mb-2">Bubble Color:</p>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-[#7FE0C3]" />
                                <span className="text-white">Green - Easy Entry</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-[#6BA4FF]" />
                                <span className="text-white">Blue - Medium Entry</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-[#FF6B8A]" />
                                <span className="text-white">Pink - Hard Entry</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-400 mb-2">Position:</p>
                            <p className="text-white">
                              Top-right = High growth, high competition
                            </p>
                            <p className="text-white">
                              Top-left = High growth, low competition
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Selected Bubble Details */}
                  {selectedBubble && (
                    <div className="lg:col-span-1">
                      <Card
                        className="glass-card fade-in sticky top-8"
                        style={{ animationDelay: "0.4s" }}
                      >
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span className="text-lg">Opportunity Details</span>
                            <Badge
                              style={{ backgroundColor: selectedBubble.color }}
                              className="text-white"
                            >
                              Score: {selectedBubble.score}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div>
                            <p className="text-sm text-gray-400 mb-2">Idea Summary</p>
                            <p className="text-white">{selectedBubble.summary}</p>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-400 flex items-center gap-2">
                                  <DollarSign className="h-4 w-4" />
                                  Market Size
                                </span>
                                <span className="text-white font-semibold">
                                  {selectedBubble.marketSize}/100
                                </span>
                              </div>
                              <Progress value={selectedBubble.marketSize} className="h-2" />
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-400 flex items-center gap-2">
                                  <TrendingUp className="h-4 w-4" />
                                  Growth Rate
                                </span>
                                <span className="text-white font-semibold">
                                  {selectedBubble.growthRate}/100
                                </span>
                              </div>
                              <Progress value={selectedBubble.growthRate} className="h-2" />
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-400 flex items-center gap-2">
                                  <Users className="h-4 w-4" />
                                  Competition
                                </span>
                                <span className="text-white font-semibold">
                                  {selectedBubble.competitionIntensity}/100
                                </span>
                              </div>
                              <Progress
                                value={selectedBubble.competitionIntensity}
                                className="h-2"
                              />
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-400 flex items-center gap-2">
                                  <Target className="h-4 w-4" />
                                  Entry Difficulty
                                </span>
                                <span className="text-white font-semibold">
                                  {selectedBubble.entryDifficulty}/100
                                </span>
                              </div>
                              <Progress value={selectedBubble.entryDifficulty} className="h-2" />
                            </div>
                          </div>

                          <Button
                            onClick={() => router.push(`/ideas/${selectedBubble.id}`)}
                            className="w-full bg-gradient-to-r from-[#7FE0C3] to-[#6BA4FF] text-black hover:opacity-90"
                          >
                            View Full Analysis
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>

                {/* Ideas Grid */}
                <Card className="glass-card fade-in" style={{ animationDelay: "0.5s" }}>
                  <CardHeader>
                    <CardTitle>All Validated Ideas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {validatedIdeas.map((idea) => {
                        const bubble = bubbles.find((b) => b.id === idea.id);
                        return (
                          <Card
                            key={idea.id}
                            className="glass-card glass-card-hover cursor-pointer"
                            onClick={() => router.push(`/ideas/${idea.id}`)}
                          >
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <Badge style={{ backgroundColor: bubble?.color }}>
                                  Score: {idea.score}
                                </Badge>
                                <span className="text-xs text-gray-400">
                                  {new Date(idea.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-white text-sm line-clamp-3">{idea.summary}</p>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        ) : (
          // Chat Tab
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Chat Messages */}
            <div className="lg:col-span-3">
              <Card className="glass-card fade-in" style={{ animationDelay: "0.2s" }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-[#7FE0C3]" />
                    AI Market Research Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Chat Messages */}
                  <div className="h-[500px] overflow-y-auto mb-4 space-y-4 p-4 border border-white/10 rounded-lg bg-black/20">
                    {chatMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <MessageSquare className="h-16 w-16 text-[#7FE0C3] mb-4 opacity-50" />
                        <h3 className="text-xl font-semibold mb-2 text-white">
                          Start Your Research
                        </h3>
                        <p className="text-gray-400 mb-6 max-w-md">
                          Ask questions about market trends, customer needs, or competitive
                          landscape
                        </p>
                        <div className="text-left space-y-2">
                          <p className="text-sm text-gray-400">Try asking:</p>
                          {quickPrompts.slice(0, 3).map((prompt, idx) => (
                            <p key={idx} className="text-sm text-[#7FE0C3]">
                              &quot;{prompt}&quot;
                            </p>
                          ))}
                        </div>
                      </div>
                    ) : (
                      chatMessages.map((message, idx) => (
                        <div
                          key={idx}
                          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] ${
                              message.role === "user"
                                ? "bg-gradient-to-r from-[#7FE0C3] to-[#6BA4FF] text-black rounded-lg p-4"
                                : "glass-card p-4"
                            }`}
                          >
                            {message.role === "assistant" ? (
                              <>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm text-gray-400">
                                    {new Date(message.timestamp).toLocaleTimeString()}
                                  </span>
                                  <CopyButton text={message.content} />
                                </div>
                                <MarkdownContent content={message.content} />
                                {message.sources && message.sources.length > 0 && (
                                  <div className="mt-4 pt-4 border-t border-white/10">
                                    <p className="text-sm text-gray-400 mb-2">Sources:</p>
                                    <div className="space-y-1">
                                      {message.sources.map((source) => (
                                        <a
                                          key={source.id}
                                          href={source.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-2 text-sm text-[#7FE0C3] hover:underline"
                                        >
                                          <ExternalLink className="h-3 w-3" />
                                          {source.title}
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              <>
                                <div className="text-sm opacity-75 mb-2">
                                  {new Date(message.timestamp).toLocaleTimeString()}
                                </div>
                                <p>{message.content}</p>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    )}

                    {/* Loading State */}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="glass-card p-4 max-w-[80%]">
                          <div className="shimmer h-4 w-64 mb-2" />
                          <div className="shimmer h-4 w-48" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleSubmitQuestion} className="flex gap-2">
                    <Textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask a market research question... (Shift+Enter for new line)"
                      className="glass-card border-white/10 text-white placeholder:text-gray-500 min-h-[80px]"
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      disabled={!question.trim() || isLoading}
                      className="bg-gradient-to-r from-[#7FE0C3] to-[#6BA4FF] text-black hover:opacity-90 h-[80px] px-6"
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Quick Prompts Sidebar */}
            <div className="lg:col-span-1">
              <Card className="glass-card fade-in sticky top-8" style={{ animationDelay: "0.3s" }}>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Research Topics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {quickPrompts.map((prompt, idx) => (
                    <Button
                      key={idx}
                      onClick={() => handleQuickPrompt(prompt)}
                      variant="outline"
                      className="w-full text-left justify-start h-auto py-3 px-4 glass-card glass-card-hover text-white border-white/10 whitespace-normal"
                      disabled={isLoading}
                    >
                      <span className="text-sm">{prompt}</span>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
