"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText, Download, ExternalLink } from "lucide-react";
import MarkdownContent from "@/components/MarkdownContent";
import CopyButton from "@/components/CopyButton";
import Sidebar from "@/components/Sidebar";

interface ReportResult {
  report: string;
  sources: string[];
  timestamp: string;
  inputs: {
    industry: string;
  };
}

export default function IndustryReportsPage() {
  const router = useRouter();
  const [industry, setIndustry] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<ReportResult | null>(null);
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
    const saved = localStorage.getItem("industry_report_data");
    if (saved) {
      try {
        const parsed: ReportResult = JSON.parse(saved);
        setResult(parsed);
        setIndustry(parsed.inputs.industry);
      } catch (err) {
        console.error("Failed to load saved industry report:", err);
      }
    }
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (industry.length < 3) {
      setError("Please enter a valid industry name (minimum 3 characters)");
      return;
    }

    const perplexityKey = localStorage.getItem("perplexity_api_key");
    const anthropicKey = localStorage.getItem("anthropic_api_key");

    if (!perplexityKey || !anthropicKey) {
      setError("Please configure your API keys in Settings first");
      setTimeout(() => router.push("/settings"), 2000);
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      const response = await fetch("/api/industry-reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          industry,
          perplexityKey,
          anthropicKey,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate industry report");
      }

      const data = await response.json();

      const reportResult: ReportResult = {
        report: data.report,
        sources: data.sources || [],
        timestamp: new Date().toISOString(),
        inputs: {
          industry,
        },
      };

      setResult(reportResult);

      // Save to localStorage
      localStorage.setItem("industry_report_data", JSON.stringify(reportResult));
    } catch (err: any) {
      console.error("Industry report generation error:", err);
      setError(err.message || "Failed to generate industry report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = () => {
    if (!result) return;

    const reportContent = `# ${result.inputs.industry} Industry Report

Generated on: ${new Date(result.timestamp).toLocaleString()}

---

${result.report}

---

## Sources

${result.sources.map((source, i) => `${i + 1}. ${source}`).join("\n")}
`;

    const blob = new Blob([reportContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.inputs.industry.toLowerCase().replace(/\s+/g, "-")}-industry-report.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 md:ml-64 p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 fade-in">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="text-mint-primary" size={32} />
            <h1 className="text-4xl font-light text-white">Industry Deep Dive Reports</h1>
          </div>
          <p className="text-white/60 text-lg">
            Generate comprehensive industry analysis covering market size, key players, demographics, and strategic recommendations
          </p>
        </div>

        {/* Input Form */}
        <div className="glass-card p-6 mb-6 fade-in" style={{ animationDelay: "0.1s" }}>
          <form onSubmit={handleGenerate}>
            <label htmlFor="industry" className="block text-white/80 mb-3 font-medium">
              Industry
            </label>
            <input
              id="industry"
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g., SaaS, E-commerce, HealthTech, FinTech, Clean Energy"
              disabled={isGenerating}
              minLength={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-mint-primary focus:outline-none focus:ring-2 focus:ring-mint-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="flex items-center justify-between mt-4">
              <span className="text-white/40 text-sm">
                {industry.length} / 3 characters minimum
              </span>
              <button
                type="submit"
                disabled={isGenerating || industry.length < 3}
                className="btn-primary flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="shimmer w-4 h-4 rounded-full"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText size={18} />
                    Generate Report
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
        {isGenerating && (
          <div className="glass-card p-8 text-center fade-in">
            <div className="shimmer w-16 h-16 rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-medium text-white mb-2">Generating Industry Report...</h3>
            <p className="text-white/60">
              This may take 45-90 seconds as we gather comprehensive data and analysis
            </p>
            <div className="mt-6 space-y-2">
              <div className="shimmer h-4 rounded-lg max-w-md mx-auto"></div>
              <div className="shimmer h-4 rounded-lg max-w-sm mx-auto"></div>
              <div className="shimmer h-4 rounded-lg max-w-lg mx-auto"></div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && !isGenerating && (
          <div className="space-y-6">
            {/* Report Header */}
            <div className="glass-card p-6 fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FileText className="text-mint-primary" size={28} />
                  <div>
                    <h2 className="text-2xl font-light text-white">
                      {result.inputs.industry} Industry Report
                    </h2>
                    <p className="text-white/60 text-sm mt-1">
                      Generated on {new Date(result.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CopyButton text={result.report} />
                  <button
                    onClick={handleDownloadReport}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Download size={18} />
                    Download
                  </button>
                </div>
              </div>
            </div>

            {/* Report Content */}
            <div className="glass-card p-6 fade-in" style={{ animationDelay: "0.3s" }}>
              <MarkdownContent content={result.report} />
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
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
