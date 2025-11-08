"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { Calendar, TrendingUp, Lightbulb } from "lucide-react";

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

export default function HomePage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<SavedIdea[]>([]);

  useEffect(() => {
    const authenticated = localStorage.getItem("authenticated");
    if (!authenticated) {
      router.push("/login");
      return;
    }

    // Load validated ideas
    const saved = localStorage.getItem("validated_ideas");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setIdeas(parsed);
      } catch (err) {
        console.error("Failed to parse ideas:", err);
      }
    }
  }, [router]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
              <Calendar size={16} />
              <span>{today}</span>
            </div>
            <h1 className="text-4xl font-light text-white mb-2">Dashboard</h1>
            <p className="text-white/70">
              {ideas.length} {ideas.length === 1 ? "idea" : "ideas"} validated
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-2">
                <Lightbulb className="text-mint-primary" size={24} />
                <span className="text-sm text-white/60">Total Ideas</span>
              </div>
              <div className="text-3xl font-light text-white">{ideas.length}</div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="text-accent-emerald" size={24} />
                <span className="text-sm text-white/60">Avg Score</span>
              </div>
              <div className="text-3xl font-light text-white">
                {ideas.length > 0
                  ? Math.round(ideas.reduce((sum, idea) => sum + idea.score, 0) / ideas.length)
                  : 0}
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🦄</span>
                <span className="text-sm text-white/60">Unicorns</span>
              </div>
              <div className="text-3xl font-light text-white">
                {ideas.filter((idea) => idea.score >= 90).length}
              </div>
            </div>
          </div>

          {/* Ideas Grid */}
          {ideas.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="text-6xl mb-4">💡</div>
              <h2 className="text-2xl font-light text-white mb-2">No ideas validated yet</h2>
              <p className="text-white/70 mb-6">
                Start validating your startup ideas with AI-powered analysis
              </p>
              <Link href="/ideas" className="btn-primary inline-block">
                Validate Your First Idea
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ideas.map((idea, index) => (
                <Link
                  key={idea.id}
                  href={`/ideas/${idea.id}`}
                  className="glass-card glass-card-hover p-6 block fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`
                        px-3 py-1 rounded-full text-sm font-medium border
                        ${getScoreBadgeColor(idea.score)}
                      `}
                    >
                      {idea.score}/100 {idea.score >= 90 && "🦄"}
                    </div>
                    <span className="text-xs text-white/50">
                      {new Date(idea.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-lg font-medium text-white mb-2 line-clamp-2">
                    {idea.summary}
                  </h3>

                  <p className="text-sm text-white/60 line-clamp-3 mb-4">
                    {idea.idea}
                  </p>

                  <div className="text-sm text-mint-primary hover:underline">
                    View Details →
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
