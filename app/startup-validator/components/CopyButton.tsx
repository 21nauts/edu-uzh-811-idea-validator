"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  text: string;
  className?: string;
}

export default function CopyButton({ text, className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`
        p-2 rounded-lg transition-all
        bg-white/5 hover:bg-white/10
        border border-white/10 hover:border-mint-primary/50
        text-white/70 hover:text-mint-primary
        ${className}
      `}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
    </button>
  );
}
