"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, TrendingUp, Target, Award, ExternalLink } from "lucide-react";
import MarkdownContent from "@/components/MarkdownContent";
import CopyButton from "@/components/CopyButton";

interface ValidationResult {
  summary: string;
  marketAnalysis: string;
  actionPlan: string;
  score: number;
  scoreExplanation: string;
  sources: string[];
  timestamp: string;
  ideaInput: string;
}

export default function IdeasPage() {
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState("");

  // Load saved validation from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("validated_ideas");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If it's an array, get the most recent one
        const latestResult = Array.isArray(parsed) ? parsed[0] : parsed;
        if (latestResult) {
          setResult(latestResult);
          setIdea(latestResult.ideaInput || "");
        }
      } catch (err) {
        console.error("Failed to load saved validation:", err);
      }
    }
  }, []);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (idea.length < 50) {
      setError("Please provide more details about your idea (minimum 50 characters)");
      return;
    }

    // Get API keys from localStorage
    const perplexityKey = localStorage.getItem("perplexity_api_key");
    const anthropicKey = localStorage.getItem("anthropic_api_key");

    if (!perplexityKey || !anthropicKey) {
      setError("Please configure your API keys in Settings first");
      setTimeout(() => router.push("/settings"), 2000);
      return;
    }

    setIsValidating(true);
    setResult(null);

    try {
      const response = await fetch("/api/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idea,
          perplexityKey,
          anthropicKey,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to validate idea");
      }

      const data = await response.json();

      // Create validation result with timestamp
      const validationResult: ValidationResult = {
        ...data,
        timestamp: new Date().toISOString(),
        ideaInput: idea,
      };

      setResult(validationResult);

      // Save to localStorage as array (for history)
      const existingValidations = localStorage.getItem("validated_ideas");
      let validations: ValidationResult[] = [];

      if (existingValidations) {
        try {
          const parsed = JSON.parse(existingValidations);
          validations = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          validations = [];
        }
      }

      // Add new validation at the beginning
      validations.unshift(validationResult);

      // Keep only last 10 validations
      if (validations.length > 10) {
        validations = validations.slice(0, 10);
      }

      localStorage.setItem("validated_ideas", JSON.stringify(validations));
    } catch (err: any) {
      console.error("Validation error:", err);
      setError(err.message || "Failed to validate idea. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-accent-emerald";
    if (score >= 60) return "text-mint-primary";
    if (score >= 40) return "text-accent-amber";
    return "text-accent-rose";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-accent-emerald/10 border-accent-emerald/30";
    if (score >= 60) return "bg-mint-primary/10 border-mint-primary/30";
    if (score >= 40) return "bg-accent-amber/10 border-accent-amber/30";
    return "bg-accent-rose/10 border-accent-rose/30";
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 fade-in">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="text-mint-primary" size={32} />
            <h1 className="text-4xl font-light text-white">Ideas Validation</h1>
          </div>
          <p className="text-white/60 text-lg">
            Get AI-powered market analysis, action plans, and scoring for your startup idea
          </p>
        </div>

        {/* Input Form */}
        <div className="glass-card p-6 mb-6 fade-in" style={{ animationDelay: "0.1s" }}>
          <form onSubmit={handleValidate}>
            <label htmlFor="idea" className="block text-white/80 mb-3 font-medium">
              Describe Your Startup Idea
            </label>
            <textarea
              id="idea"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Example: A mobile app that connects local organic farmers directly with urban consumers, eliminating middlemen and providing fresh produce delivery within 24 hours..."
              className="w-full h-32 resize-none"
              disabled={isValidating}
              minLength={50}
            />
            <div className="flex items-center justify-between mt-4">
              <span className="text-white/40 text-sm">
                {idea.length} / 50 characters minimum
              </span>
              <button
                type="submit"
                disabled={isValidating || idea.length < 50}
                className="btn-primary flex items-center gap-2"
              >
                {isValidating ? (
                  <>
                    <div className="shimmer w-4 h-4 rounded-full"></div>
                    Validating...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Validate Idea
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
        {isValidating && (
          <div className="glass-card p-8 text-center fade-in">
            <div className="shimmer w-16 h-16 rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-medium text-white mb-2">Analyzing Your Idea...</h3>
            <p className="text-white/60">
              This may take 30-60 seconds as we generate comprehensive analysis
            </p>
            <div className="mt-6 space-y-2">
              <div className="shimmer h-4 rounded-lg max-w-md mx-auto"></div>
              <div className="shimmer h-4 rounded-lg max-w-sm mx-auto"></div>
              <div className="shimmer h-4 rounded-lg max-w-lg mx-auto"></div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && !isValidating && (
          <div className="space-y-6">
            {/* Summary & Score */}
            <div className="glass-card p-6 fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="text-mint-primary" size={24} />
                    <h2 className="text-2xl font-light text-white">Summary</h2>
                  </div>
                  <p className="text-white/90 text-lg leading-relaxed">{result.summary}</p>
                </div>
                <div
                  className={`flex flex-col items-center justify-center p-6 rounded-xl border ${getScoreBgColor(
                    result.score
                  )} min-w-[140px]`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Award className={getScoreColor(result.score)} size={24} />
                    {result.score >= 90 && <span className="text-2xl">🦄</span>}
                  </div>
                  <div className={`text-5xl font-bold ${getScoreColor(result.score)} mb-1`}>
                    {result.score}
                  </div>
                  <div className="text-white/60 text-sm">out of 100</div>
                </div>
              </div>

              {/* Score Explanation */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <h3 className="text-white/80 font-medium mb-2">Score Breakdown</h3>
                <MarkdownContent content={result.scoreExplanation} className="text-sm" />
              </div>
            </div>

            {/* Market Analysis */}
            <div className="glass-card p-6 fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="text-mint-primary" size={24} />
                  <h2 className="text-2xl font-light text-white">Market Analysis</h2>
                </div>
                <CopyButton text={result.marketAnalysis} />
              </div>
              <MarkdownContent content={result.marketAnalysis} />
            </div>

            {/* Sources/Citations */}
            {result.sources && result.sources.length > 0 && (
              <div className="glass-card p-6 fade-in" style={{ animationDelay: "0.35s" }}>
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

            {/* 48-Hour Action Plan */}
            <div className="glass-card p-6 fade-in" style={{ animationDelay: "0.4s" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="text-mint-primary" size={24} />
                  <h2 className="text-2xl font-light text-white">48-Hour Action Plan</h2>
                </div>
                <CopyButton text={result.actionPlan} />
              </div>
              <MarkdownContent content={result.actionPlan} />
            </div>

            {/* Timestamp */}
            <div className="text-center text-white/40 text-sm fade-in" style={{ animationDelay: "0.5s" }}>
              Validated on {new Date(result.timestamp).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
