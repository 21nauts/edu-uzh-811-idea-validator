"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Target, Search, ExternalLink } from "lucide-react";
import MarkdownContent from "@/components/MarkdownContent";
import CopyButton from "@/components/CopyButton";
import Sidebar from "@/components/Sidebar";

interface GapResult {
  opportunities: string;
  sources: string[];
  timestamp: string;
  inputs: {
    industryProduct: string;
  };
}

export default function GapFinderPage() {
  const router = useRouter();
  const [industryProduct, setIndustryProduct] = useState("");
  const [isFinding, setIsFinding] = useState(false);
  const [result, setResult] = useState<GapResult | null>(null);
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
    const saved = localStorage.getItem("gap_finder_data");
    if (saved) {
      try {
        const parsed: GapResult = JSON.parse(saved);
        setResult(parsed);
        setIndustryProduct(parsed.inputs.industryProduct);
      } catch (err) {
        console.error("Failed to load saved gap finder data:", err);
      }
    }
  }, []);

  const handleFindGaps = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (industryProduct.length < 5) {
      setError("Please provide a valid industry or product name (minimum 5 characters)");
      return;
    }

    const perplexityKey = localStorage.getItem("perplexity_api_key");
    const anthropicKey = localStorage.getItem("anthropic_api_key");

    if (!perplexityKey || !anthropicKey) {
      setError("Please configure your API keys in Settings first");
      setTimeout(() => router.push("/settings"), 2000);
      return;
    }

    setIsFinding(true);
    setResult(null);

    try {
      const response = await fetch("/api/gap-finder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          industryProduct,
          perplexityKey,
          anthropicKey,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to find market gaps");
      }

      const data = await response.json();

      const gapResult: GapResult = {
        opportunities: data.opportunities,
        sources: data.sources || [],
        timestamp: new Date().toISOString(),
        inputs: {
          industryProduct,
        },
      };

      setResult(gapResult);

      // Save to localStorage
      localStorage.setItem("gap_finder_data", JSON.stringify(gapResult));
    } catch (err: any) {
      console.error("Gap finder error:", err);
      setError(err.message || "Failed to find market gaps. Please try again.");
    } finally {
      setIsFinding(false);
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
            <Target className="text-mint-primary" size={32} />
            <h1 className="text-4xl font-light text-white">Market Gap Finder</h1>
          </div>
          <p className="text-white/60 text-lg">
            Identify and score underserved opportunities with detailed market analysis and actionable recommendations
          </p>
        </div>

        {/* Input Form */}
        <div className="glass-card p-6 mb-6 fade-in" style={{ animationDelay: "0.1s" }}>
          <form onSubmit={handleFindGaps}>
            <label htmlFor="industryProduct" className="block text-white/80 mb-3 font-medium">
              Industry or Product Category
            </label>
            <input
              id="industryProduct"
              type="text"
              value={industryProduct}
              onChange={(e) => setIndustryProduct(e.target.value)}
              placeholder="e.g., AI-powered productivity tools, Sustainable fashion, HealthTech for seniors"
              disabled={isFinding}
              minLength={5}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-mint-primary focus:outline-none focus:ring-2 focus:ring-mint-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="flex items-center justify-between mt-4">
              <span className="text-white/40 text-sm">
                {industryProduct.length} / 5 characters minimum
              </span>
              <button
                type="submit"
                disabled={isFinding || industryProduct.length < 5}
                className="btn-primary flex items-center gap-2"
              >
                {isFinding ? (
                  <>
                    <div className="shimmer w-4 h-4 rounded-full"></div>
                    Finding Gaps...
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    Find Market Gaps
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
        {isFinding && (
          <div className="glass-card p-8 text-center fade-in">
            <div className="shimmer w-16 h-16 rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-medium text-white mb-2">Finding Market Gaps...</h3>
            <p className="text-white/60">
              This may take 45-90 seconds as we analyze market data and score opportunities
            </p>
            <div className="mt-6 space-y-2">
              <div className="shimmer h-4 rounded-lg max-w-md mx-auto"></div>
              <div className="shimmer h-4 rounded-lg max-w-sm mx-auto"></div>
              <div className="shimmer h-4 rounded-lg max-w-lg mx-auto"></div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && !isFinding && (
          <div className="space-y-6">
            {/* Opportunities Header */}
            <div className="glass-card p-6 fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Target className="text-mint-primary" size={28} />
                  <div>
                    <h2 className="text-2xl font-light text-white">Market Opportunities</h2>
                    <p className="text-white/60 text-sm mt-1">
                      Top 5 gaps in {result.inputs.industryProduct}
                    </p>
                  </div>
                </div>
                <CopyButton text={result.opportunities} />
              </div>

              {/* Category Badge */}
              <div className="mt-4">
                <span className="inline-block px-4 py-2 bg-mint-primary/20 border border-mint-primary/30 rounded-lg text-mint-primary font-medium">
                  {result.inputs.industryProduct}
                </span>
              </div>
            </div>

            {/* Opportunities Content */}
            <div className="glass-card p-6 fade-in" style={{ animationDelay: "0.3s" }}>
              <MarkdownContent content={result.opportunities} />
            </div>

            {/* Sources */}
            {result.sources && result.sources.length > 0 && (
              <div className="glass-card p-6 fade-in" style={{ animationDelay: "0.4s" }}>
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
            <div className="text-center text-white/40 text-sm fade-in" style={{ animationDelay: "0.5s" }}>
              Analyzed on {new Date(result.timestamp).toLocaleString()}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
