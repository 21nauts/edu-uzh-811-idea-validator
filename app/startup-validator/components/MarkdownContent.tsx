"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export default function MarkdownContent({
  content,
  className = "",
}: MarkdownContentProps) {
  return (
    <div
      className={`
        prose prose-invert max-w-none
        prose-headings:text-white prose-headings:font-light
        prose-h1:text-3xl prose-h1:mb-4 prose-h1:pb-2 prose-h1:border-b prose-h1:border-white/10
        prose-h2:text-2xl prose-h2:mb-3 prose-h2:mt-6
        prose-h3:text-xl prose-h3:mb-2 prose-h3:mt-4
        prose-p:text-white/80 prose-p:leading-relaxed
        prose-strong:text-white prose-strong:font-semibold
        prose-em:text-white/90
        prose-ul:text-white/80 prose-ul:space-y-1
        prose-ol:text-white/80 prose-ol:space-y-1
        prose-li:text-white/80
        prose-a:text-mint-primary prose-a:no-underline hover:prose-a:underline
        prose-blockquote:border-l-mint-primary prose-blockquote:text-white/70 prose-blockquote:italic
        prose-code:text-mint-primary prose-code:bg-mint-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0
        prose-table:border prose-table:border-white/10
        prose-th:bg-white/5 prose-th:border prose-th:border-white/10 prose-th:p-2
        prose-td:border prose-td:border-white/10 prose-td:p-2
        ${className}
      `}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                PreTag="div"
                className="rounded-lg !bg-[#282c34] !mt-2 !mb-4"
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          a({ node, children, href, ...props }: any) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
