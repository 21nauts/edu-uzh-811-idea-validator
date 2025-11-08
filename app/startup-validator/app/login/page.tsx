"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("authenticated", "true");
    router.push("/home");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form (60%) */}
      <div className="w-full lg:w-3/5 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-4xl">🚀</span>
              <h1 className="text-3xl font-bold text-white">IdeaValidator</h1>
            </div>
            <p className="text-white/70">Sign in to validate your startup ideas</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full btn-primary"
            >
              Sign In
            </button>

            <p className="text-center text-sm text-white/50">
              Demo: Any email/password will work
            </p>
          </form>
        </div>
      </div>

      {/* Right Side - Branding (40%) */}
      <div className="hidden lg:flex lg:w-2/5 glass-card m-4 rounded-2xl items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-mint-primary/10 to-transparent"></div>
        <div className="relative z-10 text-center">
          <div className="text-6xl mb-6">🏔️</div>
          <h2 className="text-4xl font-light text-white mb-4 leading-tight">
            From Basecamp<br />to Summit
          </h2>
          <p className="text-xl text-white/70 mb-8">
            In 1 hour
          </p>
          <div className="space-y-4 text-left max-w-sm mx-auto">
            <div className="flex items-start gap-3">
              <span className="text-mint-primary">✓</span>
              <span className="text-white/80">AI-powered market analysis</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-mint-primary">✓</span>
              <span className="text-white/80">Competitor research</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-mint-primary">✓</span>
              <span className="text-white/80">Opportunity assessment</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-mint-primary">✓</span>
              <span className="text-white/80">48-hour action plans</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
