"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, UserCircle } from "lucide-react";
import MarkdownContent from "@/components/MarkdownContent";
import CopyButton from "@/components/CopyButton";
import Sidebar from "@/components/Sidebar";

interface PersonaResult {
  personas: string;
  timestamp: string;
  inputs: {
    productDescription: string;
    targetIndustry: string;
  };
}

export default function PersonaBuilderPage() {
  const router = useRouter();
  const [productDescription, setProductDescription] = useState("");
  const [targetIndustry, setTargetIndustry] = useState("");
  const [isBuilding, setIsBuilding] = useState(false);
  const [result, setResult] = useState<PersonaResult | null>(null);
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
    const saved = localStorage.getItem("persona_builder_data");
    if (saved) {
      try {
        const parsed: PersonaResult = JSON.parse(saved);
        setResult(parsed);
        setProductDescription(parsed.inputs.productDescription);
        setTargetIndustry(parsed.inputs.targetIndustry);
      } catch (err) {
        console.error("Failed to load saved persona data:", err);
      }
    }
  }, []);

  const handleBuild = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (productDescription.length < 20 || targetIndustry.length < 3) {
      setError("Please provide detailed product description (min 20 chars) and industry (min 3 chars)");
      return;
    }

    const anthropicKey = localStorage.getItem("anthropic_api_key");

    if (!anthropicKey) {
      setError("Please configure your Anthropic API key in Settings first");
      setTimeout(() => router.push("/settings"), 2000);
      return;
    }

    setIsBuilding(true);
    setResult(null);

    try {
      const response = await fetch("/api/persona-builder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productDescription,
          targetIndustry,
          anthropicKey,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to build customer personas");
      }

      const data = await response.json();

      const personaResult: PersonaResult = {
        personas: data.personas,
        timestamp: new Date().toISOString(),
        inputs: {
          productDescription,
          targetIndustry,
        },
      };

      setResult(personaResult);

      // Save to localStorage
      localStorage.setItem("persona_builder_data", JSON.stringify(personaResult));
    } catch (err: any) {
      console.error("Persona building error:", err);
      setError(err.message || "Failed to build customer personas. Please try again.");
    } finally {
      setIsBuilding(false);
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
            <Users className="text-mint-primary" size={32} />
            <h1 className="text-4xl font-light text-white">Customer Persona Builder</h1>
          </div>
          <p className="text-white/60 text-lg">
            Generate detailed customer personas with demographics, pain points, budgets, and decision-making processes
          </p>
        </div>

        {/* Input Form */}
        <div className="glass-card p-6 mb-6 fade-in" style={{ animationDelay: "0.1s" }}>
          <form onSubmit={handleBuild}>
            {/* Product Description */}
            <div className="mb-6">
              <label htmlFor="product" className="block text-white/80 mb-3 font-medium">
                Product/Service Description
              </label>
              <textarea
                id="product"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="Describe your product or service in detail. What problem does it solve? Who is it for? What are the key features and benefits?"
                disabled={isBuilding}
                minLength={20}
                className="w-full h-32 resize-none px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-mint-primary focus:outline-none focus:ring-2 focus:ring-mint-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className="text-white/40 text-sm mt-1 block">
                {productDescription.length} / 20 characters minimum
              </span>
            </div>

            {/* Target Industry */}
            <div className="mb-6">
              <label htmlFor="industry" className="block text-white/80 mb-3 font-medium">
                Target Industry
              </label>
              <input
                id="industry"
                type="text"
                value={targetIndustry}
                onChange={(e) => setTargetIndustry(e.target.value)}
                placeholder="e.g., SaaS, E-commerce, Healthcare, Education, Finance"
                disabled={isBuilding}
                minLength={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-mint-primary focus:outline-none focus:ring-2 focus:ring-mint-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className="text-white/40 text-sm mt-1 block">
                {targetIndustry.length} / 3 characters minimum
              </span>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end mt-6">
              <button
                type="submit"
                disabled={isBuilding || productDescription.length < 20 || targetIndustry.length < 3}
                className="btn-primary flex items-center gap-2"
              >
                {isBuilding ? (
                  <>
                    <div className="shimmer w-4 h-4 rounded-full"></div>
                    Building Personas...
                  </>
                ) : (
                  <>
                    <UserCircle size={18} />
                    Build Personas
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
        {isBuilding && (
          <div className="glass-card p-8 text-center fade-in">
            <div className="shimmer w-16 h-16 rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-medium text-white mb-2">Building Customer Personas...</h3>
            <p className="text-white/60">
              Generating detailed personas with demographics, pain points, and decision-making processes
            </p>
            <div className="mt-6 space-y-2">
              <div className="shimmer h-4 rounded-lg max-w-md mx-auto"></div>
              <div className="shimmer h-4 rounded-lg max-w-sm mx-auto"></div>
              <div className="shimmer h-4 rounded-lg max-w-lg mx-auto"></div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && !isBuilding && (
          <div className="space-y-6">
            {/* Personas Header */}
            <div className="glass-card p-6 fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <UserCircle className="text-mint-primary" size={28} />
                  <div>
                    <h2 className="text-2xl font-light text-white">Customer Personas</h2>
                    <p className="text-white/60 text-sm mt-1">
                      {result.inputs.targetIndustry} Industry
                    </p>
                  </div>
                </div>
                <CopyButton text={result.personas} />
              </div>

              {/* Input Summary */}
              <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="text-white/60 text-sm mb-2">Product/Service</div>
                <div className="text-white text-sm leading-relaxed">
                  {result.inputs.productDescription}
                </div>
              </div>
            </div>

            {/* Personas Content */}
            <div className="glass-card p-6 fade-in" style={{ animationDelay: "0.3s" }}>
              <MarkdownContent content={result.personas} />
            </div>

            {/* Timestamp */}
            <div className="text-center text-white/40 text-sm fade-in" style={{ animationDelay: "0.4s" }}>
              Generated on {new Date(result.timestamp).toLocaleString()}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
