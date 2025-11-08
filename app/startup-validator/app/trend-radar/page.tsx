"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Radar, TrendingUp, ExternalLink } from "lucide-react";
import MarkdownContent from "@/components/MarkdownContent";
import CopyButton from "@/components/CopyButton";
import Sidebar from "@/components/Sidebar";

interface TrendResult {
  analysis: string;
  sources: string[];
  timestamp: string;
  inputs: {
    industry: string;
  };
}

export default function TrendRadarPage() {
  const router = useRouter();
  const [industry, setIndustry] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<TrendResult | null>(null);
  const [error, setError] = useState("");

  // Check authentication
  useEffect(() => {
    const authenticated = localStorage.getItem("authenticated");
    if (authenticated !== "true") {
      router.push("/login");
    }
  }, [router]);

  // Load saved data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("trend_radar_data");
    if (saved) {
      try {
        const parsed: TrendResult = JSON.parse(saved);
        setResult(parsed);
        setIndustry(parsed.inputs.industry);
      } catch (err) {
        console.error("Failed to load saved trend data:", err);
      }
    }
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (industry.length < 3) {
      setError("Please enter a valid industry name (minimum 3 characters)");
      return;
    }

    const perplexityKey = localStorage.getItem("perplexity_api_key");

    if (!perplexityKey) {
      setError("Please configure your Perplexity API key in Settings first");
      setTimeout(() => router.push("/settings"), 2000);
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const response = await fetch("/api/trend-radar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          industry,
          perplexityKey,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze trends");
      }

      const data = await response.json();

      const trendResult: TrendResult = {
        analysis: data.analysis,
        sources: data.sources || [],
        timestamp: new Date().toISOString(),
        inputs: {
          industry,
        },
      };

      setResult(trendResult);

      // Save to localStorage
      localStorage.setItem("trend_radar_data", JSON.stringify(trendResult));
    } catch (err: any) {
      console.error("Trend analysis error:", err);
      setError(err.message || "Failed to analyze trends. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 md:ml-64 p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 fade-in">
          <div className="flex items-center gap-3 mb-2">
            <Radar className="text-mint-primary" size={32} />
            <h1 className="text-4xl font-light text-white">Trend Radar</h1>
          </div>
          <p className="text-white/60 text-lg">
            Analyze the latest trends across technology, consumer behavior, regulatory, funding, and market sentiment
          </p>
        </div>

        {/* Input Form */}
        <div className="glass-card p-6 mb-6 fade-in" style={{ animationDelay: "0.1s" }}>
          <form onSubmit={handleAnalyze}>
            <label htmlFor="industry" className="block text-white/80 mb-3 font-medium">
              Industry
            </label>
            <input
              id="industry"
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g., Artificial Intelligence, E-commerce, HealthTech, FinTech"
              disabled={isAnalyzing}
              minLength={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-mint-primary focus:outline-none focus:ring-2 focus:ring-mint-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="flex items-center justify-between mt-4">
              <span className="text-white/40 text-sm">
                {industry.length} / 3 characters minimum
              </span>
              <button
                type="submit"
                disabled={isAnalyzing || industry.length < 3}
                className="btn-primary flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="shimmer w-4 h-4 rounded-full"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <TrendingUp size={18} />
                    Analyze Trends
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-accent-rose/10 border border-accent-rose/30 rounded-lg">
              <p className="text-accent-rose text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isAnalyzing && (
          <div className="glass-card p-8 text-center fade-in">
            <div className="shimmer w-16 h-16 rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-medium text-white mb-2">Analyzing Industry Trends...</h3>
            <p className="text-white/60">
              Gathering latest data on technology, consumer behavior, regulatory, funding, and market sentiment
            </p>
            <div className="mt-6 space-y-2">
              <div className="shimmer h-4 rounded-lg max-w-md mx-auto"></div>
              <div className="shimmer h-4 rounded-lg max-w-sm mx-auto"></div>
              <div className="shimmer h-4 rounded-lg max-w-lg mx-auto"></div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && !isAnalyzing && (
          <div className="space-y-6">
            {/* Trend Analysis */}
            <div className="glass-card p-6 fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="text-mint-primary" size={24} />
                  <h2 className="text-2xl font-light text-white">
                    {result.inputs.industry} Trends
                  </h2>
                </div>
                <CopyButton text={result.analysis} />
              </div>

              {/* Industry Badge */}
              <div className="mb-6">
                <span className="inline-block px-4 py-2 bg-mint-primary/20 border border-mint-primary/30 rounded-lg text-mint-primary font-medium">
                  {result.inputs.industry}
                </span>
              </div>

              <MarkdownContent content={result.analysis} />
            </div>

            {/* Sources */}
            {result.sources && result.sources.length > 0 && (
              <div className="glass-card p-6 fade-in" style={{ animationDelay: "0.3s" }}>
                <div className="flex items-center gap-2 mb-4">
                  <ExternalLink className="text-mint-primary" size={20} />
                  <h3 className="text-xl font-light text-white">Sources & Citations</h3>
                </div>
                <div className="space-y-2">
                  {result.sources.map((source, index) => (
                    <a
                      key={index}
                      href={source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-mint-primary/50 transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <ExternalLink
                          size={14}
                          className="text-white/40 group-hover:text-mint-primary"
                        />
                        <span className="text-white/70 group-hover:text-mint-primary text-sm truncate">
                          {source}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamp */}
            <div className="text-center text-white/40 text-sm fade-in" style={{ animationDelay: "0.4s" }}>
              Analyzed on {new Date(result.timestamp).toLocaleString()}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
