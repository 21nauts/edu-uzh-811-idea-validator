"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calculator, TrendingUp, DollarSign, Users, ExternalLink } from "lucide-react";
import MarkdownContent from "@/components/MarkdownContent";
import CopyButton from "@/components/CopyButton";
import Sidebar from "@/components/Sidebar";

interface TAMResult {
  analysis: string;
  sources: string[];
  timestamp: string;
  inputs: {
    industry: string;
    geographicMarket: string;
    customerSegments: string[];
  };
}

const INDUSTRIES = [
  "SaaS / Software",
  "E-commerce / Retail",
  "FinTech / Financial Services",
  "HealthTech / Healthcare",
  "EdTech / Education",
  "FoodTech / Food & Beverage",
  "PropTech / Real Estate",
  "CleanTech / Sustainability",
  "Gaming / Entertainment",
  "AI / Machine Learning",
  "IoT / Hardware",
  "Other",
];

const GEOGRAPHIC_MARKETS = [
  "Global",
  "North America",
  "United States",
  "Europe",
  "Asia-Pacific",
  "Latin America",
  "Middle East & Africa",
  "Specific Country",
];

const CUSTOMER_SEGMENTS = [
  "Small Businesses (1-50 employees)",
  "Mid-Market (51-1000 employees)",
  "Enterprise (1000+ employees)",
  "Individual Consumers (B2C)",
  "Millennials / Gen Z",
  "Baby Boomers / Gen X",
  "High Net Worth Individuals",
  "Government / Public Sector",
];

export default function TAMCalculatorPage() {
  const router = useRouter();
  const [industry, setIndustry] = useState("");
  const [geographicMarket, setGeographicMarket] = useState("");
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<TAMResult | null>(null);
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
    const saved = localStorage.getItem("tam_calculator_data");
    if (saved) {
      try {
        const parsed: TAMResult = JSON.parse(saved);
        setResult(parsed);
        setIndustry(parsed.inputs.industry);
        setGeographicMarket(parsed.inputs.geographicMarket);
        setSelectedSegments(parsed.inputs.customerSegments);
      } catch (err) {
        console.error("Failed to load saved TAM data:", err);
      }
    }
  }, []);

  const handleSegmentToggle = (segment: string) => {
    setSelectedSegments((prev) =>
      prev.includes(segment) ? prev.filter((s) => s !== segment) : [...prev, segment]
    );
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!industry || !geographicMarket || selectedSegments.length === 0) {
      setError("Please fill in all fields and select at least one customer segment");
      return;
    }

    const perplexityKey = localStorage.getItem("perplexity_api_key");

    if (!perplexityKey) {
      setError("Please configure your Perplexity API key in Settings first");
      setTimeout(() => router.push("/settings"), 2000);
      return;
    }

    setIsCalculating(true);
    setResult(null);

    try {
      const response = await fetch("/api/tam-calculator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          industry,
          geographicMarket,
          customerSegments: selectedSegments,
          perplexityKey,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to calculate TAM/SAM/SOM");
      }

      const data = await response.json();

      const tamResult: TAMResult = {
        analysis: data.analysis,
        sources: data.sources || [],
        timestamp: new Date().toISOString(),
        inputs: {
          industry,
          geographicMarket,
          customerSegments: selectedSegments,
        },
      };

      setResult(tamResult);

      // Save to localStorage
      localStorage.setItem("tam_calculator_data", JSON.stringify(tamResult));
    } catch (err: any) {
      console.error("TAM calculation error:", err);
      setError(err.message || "Failed to calculate TAM/SAM/SOM. Please try again.");
    } finally {
      setIsCalculating(false);
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
            <Calculator className="text-mint-primary" size={32} />
            <h1 className="text-4xl font-light text-white">TAM/SAM/SOM Calculator</h1>
          </div>
          <p className="text-white/60 text-lg">
            Calculate Total Addressable Market, Serviceable Addressable Market, and Serviceable
            Obtainable Market for your business
          </p>
        </div>

        {/* Input Form */}
        <div className="glass-card p-6 mb-6 fade-in" style={{ animationDelay: "0.1s" }}>
          <form onSubmit={handleCalculate}>
            {/* Industry Selection */}
            <div className="mb-6">
              <label htmlFor="industry" className="block text-white/80 mb-3 font-medium">
                Industry
              </label>
              <select
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                disabled={isCalculating}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-mint-primary focus:outline-none focus:ring-2 focus:ring-mint-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="" disabled>
                  Select an industry
                </option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind} className="bg-[#1a1d23] text-white">
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            {/* Geographic Market Selection */}
            <div className="mb-6">
              <label htmlFor="geographic" className="block text-white/80 mb-3 font-medium">
                Geographic Market
              </label>
              <select
                id="geographic"
                value={geographicMarket}
                onChange={(e) => setGeographicMarket(e.target.value)}
                disabled={isCalculating}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-mint-primary focus:outline-none focus:ring-2 focus:ring-mint-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="" disabled>
                  Select a geographic market
                </option>
                {GEOGRAPHIC_MARKETS.map((market) => (
                  <option key={market} value={market} className="bg-[#1a1d23] text-white">
                    {market}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Segments */}
            <div className="mb-6">
              <label className="block text-white/80 mb-3 font-medium">
                Customer Segments (Select at least one)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CUSTOMER_SEGMENTS.map((segment) => (
                  <button
                    key={segment}
                    type="button"
                    onClick={() => handleSegmentToggle(segment)}
                    disabled={isCalculating}
                    className={`px-4 py-3 rounded-lg border transition-all text-left ${
                      selectedSegments.includes(segment)
                        ? "bg-mint-primary/20 border-mint-primary text-mint-primary"
                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded border transition-all ${
                          selectedSegments.includes(segment)
                            ? "bg-mint-primary border-mint-primary"
                            : "border-white/30"
                        }`}
                      >
                        {selectedSegments.includes(segment) && (
                          <svg
                            viewBox="0 0 16 16"
                            className="w-full h-full text-[#1a1d23]"
                            fill="currentColor"
                          >
                            <path d="M13.5 3.5L6 11 2.5 7.5l1-1L6 9l6.5-6.5 1 1z" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm">{segment}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between mt-6">
              <span className="text-white/40 text-sm">
                {selectedSegments.length} segment{selectedSegments.length !== 1 ? "s" : ""} selected
              </span>
              <button
                type="submit"
                disabled={
                  isCalculating || !industry || !geographicMarket || selectedSegments.length === 0
                }
                className="btn-primary flex items-center gap-2"
              >
                {isCalculating ? (
                  <>
                    <div className="shimmer w-4 h-4 rounded-full"></div>
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator size={18} />
                    Calculate TAM/SAM/SOM
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
        {isCalculating && (
          <div className="glass-card p-8 text-center fade-in">
            <div className="shimmer w-16 h-16 rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-medium text-white mb-2">Calculating Market Size...</h3>
            <p className="text-white/60">Analyzing industry data and market trends</p>
            <div className="mt-6 space-y-2">
              <div className="shimmer h-4 rounded-lg max-w-md mx-auto"></div>
              <div className="shimmer h-4 rounded-lg max-w-sm mx-auto"></div>
              <div className="shimmer h-4 rounded-lg max-w-lg mx-auto"></div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && !isCalculating && (
          <div className="space-y-6">
            {/* Market Analysis */}
            <div className="glass-card p-6 fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="text-mint-primary" size={24} />
                  <h2 className="text-2xl font-light text-white">Market Size Analysis</h2>
                </div>
                <CopyButton text={result.analysis} />
              </div>

              {/* Input Summary */}
              <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-white/60 mb-1">Industry</div>
                    <div className="text-white font-medium">{result.inputs.industry}</div>
                  </div>
                  <div>
                    <div className="text-white/60 mb-1">Geographic Market</div>
                    <div className="text-white font-medium">{result.inputs.geographicMarket}</div>
                  </div>
                  <div>
                    <div className="text-white/60 mb-1">Customer Segments</div>
                    <div className="text-white font-medium">
                      {result.inputs.customerSegments.length} segment
                      {result.inputs.customerSegments.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
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
              Calculated on {new Date(result.timestamp).toLocaleString()}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
