"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import MarkdownContent from "@/components/MarkdownContent";
import CopyButton from "@/components/CopyButton";
import { ArrowLeft, Calendar, TrendingUp, Target } from "lucide-react";

interface SavedIdea {
  id: string;
  idea: string;
  summary: string;
  score: number;
  marketAnalysis: string;
  actionPlan: string;
  scoreExplanation: string;
  sources?: string[];
  createdAt: string;
}

export default function IdeaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [idea, setIdea] = useState<SavedIdea | null>(null);

  useEffect(() => {
    const authenticated = localStorage.getItem("authenticated");
    if (!authenticated) {
      router.push("/login");
      return;
    }

    // Load idea from localStorage
    const saved = localStorage.getItem("validated_ideas");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as SavedIdea[];
        const foundIdea = parsed.find((i) => i.id === params.id);
        if (foundIdea) {
          setIdea(foundIdea);
        } else {
          router.push("/home");
        }
      } catch (err) {
        console.error("Failed to parse ideas:", err);
        router.push("/home");
      }
    } else {
      router.push("/home");
    }
  }, [router, params.id]);

  if (!idea) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 md:ml-64 p-8 flex items-center justify-center">
          <div className="shimmer w-16 h-16 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return "text-mint-primary border-mint-primary bg-mint-primary/10";
    if (score >= 70) return "text-accent-emerald border-accent-emerald bg-accent-emerald/10";
    if (score >= 50) return "text-accent-amber border-accent-amber bg-accent-amber/10";
    return "text-accent-rose border-accent-rose bg-accent-rose/10";
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 md:ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            href="/home"
            className="inline-flex items-center gap-2 text-white/70 hover:text-mint-primary transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
              <Calendar size={16} />
              <span>{new Date(idea.createdAt).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}</span>
            </div>
            <h1 className="text-4xl font-light text-white mb-4">{idea.summary}</h1>
            <div
              className={`
                inline-flex px-4 py-2 rounded-full text-lg font-medium border
                ${getScoreBadgeColor(idea.score)}
              `}
            >
              {idea.score}/100 {idea.score >= 90 && "🦄"}
            </div>
          </div>

          {/* Original Idea */}
          <div className="glass-card p-6 mb-6 fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-mint-primary" size={24} />
                <h2 className="text-2xl font-light text-white">Original Idea</h2>
              </div>
              <CopyButton text={idea.idea} />
            </div>
            <p className="text-white/80 leading-relaxed">{idea.idea}</p>
          </div>

          {/* Score Explanation */}
          <div className="glass-card p-6 mb-6 fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="text-mint-primary" size={24} />
                <h2 className="text-2xl font-light text-white">Score Breakdown</h2>
              </div>
              <CopyButton text={idea.scoreExplanation} />
            </div>
            <MarkdownContent content={idea.scoreExplanation} />
          </div>

          {/* Market Analysis */}
          <div className="glass-card p-6 mb-6 fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-light text-white">📊 Market Analysis</h2>
              <CopyButton text={idea.marketAnalysis} />
            </div>
            <MarkdownContent content={idea.marketAnalysis} />
          </div>

          {/* Sources */}
          {idea.sources && idea.sources.length > 0 && (
            <div className="glass-card p-6 mb-6 fade-in" style={{ animationDelay: "0.4s" }}>
              <h2 className="text-2xl font-light text-white mb-4">🔗 Sources & Citations</h2>
              <div className="space-y-2">
                {idea.sources.map((source, index) => (
                  <div key={index} className="text-sm text-white/70">
                    <span className="text-mint-primary font-medium">[{index + 1}]</span>{" "}
                    {source.startsWith("http") ? (
                      <a
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-mint-primary hover:underline"
                      >
                        {source}
                      </a>
                    ) : (
                      source
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Plan */}
          <div className="glass-card p-6 mb-6 fade-in" style={{ animationDelay: "0.5s" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-light text-white">⚡ 48-Hour Action Plan</h2>
              <CopyButton text={idea.actionPlan} />
            </div>
            <MarkdownContent content={idea.actionPlan} />
          </div>
        </div>
      </div>
    </div>
  );
}
