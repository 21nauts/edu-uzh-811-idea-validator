"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { Key, Check } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [perplexityKey, setPerplexityKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const authenticated = localStorage.getItem("authenticated");
    if (!authenticated) {
      router.push("/login");
      return;
    }

    // Load existing keys
    const savedPerplexity = localStorage.getItem("perplexity_api_key") || "";
    const savedAnthropic = localStorage.getItem("anthropic_api_key") || "";
    setPerplexityKey(savedPerplexity);
    setAnthropicKey(savedAnthropic);
  }, [router]);

  const handleSavePerplexity = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("perplexity_api_key", perplexityKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveAnthropic = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("anthropic_api_key", anthropicKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-light text-white mb-2">Settings</h1>
            <p className="text-white/70">Configure your API keys for AI-powered validation</p>
          </div>

          {saved && (
            <div className="mb-6 glass-card p-4 border-mint-primary/50 flex items-center gap-3">
              <Check className="text-mint-primary" size={20} />
              <span className="text-white">API keys saved successfully!</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Perplexity API Key */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Key className="text-mint-primary" size={24} />
                <div>
                  <h2 className="text-xl font-medium text-white">Perplexity API Key</h2>
                  <p className="text-sm text-white/60">For market research and trend analysis</p>
                </div>
              </div>

              <form onSubmit={handleSavePerplexity} className="space-y-4">
                <div>
                  <label htmlFor="perplexity-key" className="block text-sm font-medium text-white/80 mb-2">
                    API Key
                  </label>
                  <input
                    id="perplexity-key"
                    name="perplexity-key"
                    type="password"
                    autoComplete="off"
                    value={perplexityKey}
                    onChange={(e) => setPerplexityKey(e.target.value)}
                    placeholder="pplx-..."
                    className="w-full"
                  />
                  <p className="mt-2 text-xs text-white/50">
                    Get your API key from{" "}
                    <a
                      href="https://www.perplexity.ai/settings/api"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-mint-primary hover:underline"
                    >
                      perplexity.ai/settings/api
                    </a>
                  </p>
                </div>

                <button type="submit" className="btn-primary">
                  Save Perplexity Key
                </button>
              </form>
            </div>

            {/* Anthropic API Key */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Key className="text-mint-primary" size={24} />
                <div>
                  <h2 className="text-xl font-medium text-white">Anthropic API Key</h2>
                  <p className="text-sm text-white/60">For idea validation and scoring</p>
                </div>
              </div>

              <form onSubmit={handleSaveAnthropic} className="space-y-4">
                <div>
                  <label htmlFor="anthropic-key" className="block text-sm font-medium text-white/80 mb-2">
                    API Key
                  </label>
                  <input
                    id="anthropic-key"
                    name="anthropic-key"
                    type="password"
                    autoComplete="off"
                    value={anthropicKey}
                    onChange={(e) => setAnthropicKey(e.target.value)}
                    placeholder="sk-ant-..."
                    className="w-full"
                  />
                  <p className="mt-2 text-xs text-white/50">
                    Get your API key from{" "}
                    <a
                      href="https://console.anthropic.com/settings/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-mint-primary hover:underline"
                    >
                      console.anthropic.com
                    </a>
                  </p>
                </div>

                <button type="submit" className="btn-primary">
                  Save Anthropic Key
                </button>
              </form>
            </div>

            {/* Info Box */}
            <div className="glass-card p-6 border-accent-blue/30">
              <h3 className="text-lg font-medium text-white mb-3">About API Keys</h3>
              <div className="space-y-2 text-sm text-white/70">
                <p>• Your API keys are stored locally in your browser</p>
                <p>• Keys are never sent to our servers - only directly to AI providers</p>
                <p>• You can update your keys anytime</p>
                <p>• Both keys are required for full platform functionality</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
