"use client";

import Image from "next/image";
import { isValidElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import CopyButton from "./copy-button";

interface MarkdownRendererProps {
  content: string;
}

interface CodeBlockProps {
  children?: ReactNode;
  className?: string;
}

// Custom code block component with copy button
function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  // Extract text content for copying
  const getTextContent = (node: ReactNode): string => {
    if (typeof node === "string") return node;
    if (typeof node === "number") return node.toString();
    if (Array.isArray(node)) return node.map(getTextContent).join("");
    if (isValidElement(node)) {
      const props = node.props as { children?: ReactNode };
      return getTextContent(props.children);
    }
    return "";
  };

  const textContent = getTextContent(children);

  return (
    <div className="code-block-wrapper relative group my-6">
      <pre className={className} {...props}>
        <code>{children}</code>
      </pre>
      <CopyButton text={textContent} />
    </div>
  );
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight, rehypeRaw]}
      components={{
        // Custom code block with copy button
        pre: CodeBlock,
        // Custom heading components with proper styling
        h1: ({ children, ...props }) => (
          <h1
            className="text-3xl font-medium text-foreground tracking-tight mb-6 mt-8 scroll-mt-20"
            {...props}
          >
            {children}
          </h1>
        ),
        h2: ({ children, ...props }) => (
          <h2
            className="text-2xl font-medium text-foreground tracking-tight mb-4 mt-8 border-b border-border pb-2 scroll-mt-20"
            {...props}
          >
            {children}
          </h2>
        ),
        h3: ({ children, ...props }) => (
          <h3
            className="text-xl font-medium text-foreground tracking-tight mb-3 mt-6 scroll-mt-20"
            {...props}
          >
            {children}
          </h3>
        ),
        h4: ({ children, ...props }) => (
          <h4
            className="text-lg font-medium text-foreground tracking-tight mb-2 mt-4 scroll-mt-20"
            {...props}
          >
            {children}
          </h4>
        ),
        h5: ({ children, ...props }) => (
          <h5
            className="text-base font-semibold text-foreground mb-2 mt-4 scroll-mt-20"
            {...props}
          >
            {children}
          </h5>
        ),
        h6: ({ children, ...props }) => (
          <h6
            className="text-sm font-semibold text-muted-foreground mb-2 mt-4 scroll-mt-20"
            {...props}
          >
            {children}
          </h6>
        ),
        // Paragraph styling
        p: ({ children, ...props }) => (
          <p className="text-muted-foreground leading-[25px] mb-4" {...props}>
            {children}
          </p>
        ),
        // Link styling
        a: ({ children, href, ...props }) => (
          <a
            href={href}
            className="text-foreground font-medium no-underline hover:underline transition-colors"
            {...props}
          >
            {children}
          </a>
        ),
        // Strong/bold styling
        strong: ({ children, ...props }) => (
          <strong className="text-foreground font-semibold" {...props}>
            {children}
          </strong>
        ),
        // Emphasis/italic styling
        em: ({ children, ...props }) => (
          <em className="text-foreground italic" {...props}>
            {children}
          </em>
        ),
        // Inline code styling
        code: ({ children, className, ...props }) => {
          // Don't style code inside pre blocks (they're handled by CodeBlock)
          if (className?.includes("language-")) {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
          return (
            <code
              className="text-foreground bg-muted px-1.5 py-0.5 rounded text-sm font-mono border border-border"
              {...props}
            >
              {children}
            </code>
          );
        },
        // List styling
        ul: ({ children, ...props }) => (
          <ul className="list-disc pl-6 my-4 space-y-1" {...props}>
            {children}
          </ul>
        ),
        ol: ({ children, ...props }) => (
          <ol className="list-decimal pl-6 my-4 space-y-1" {...props}>
            {children}
          </ol>
        ),
        li: ({ children, ...props }) => (
          <li
            className="text-muted-foreground leading-[25px] my-1 marker:text-foreground"
            {...props}
          >
            {children}
          </li>
        ),
        // Blockquote styling
        blockquote: ({ children, ...props }) => (
          <blockquote
            className="border-l-4 border-border pl-4 py-2 italic text-muted-foreground bg-muted/30 rounded-r-lg my-6"
            {...props}
          >
            {children}
          </blockquote>
        ),
        // Table styling
        table: ({ children, ...props }) => (
          <div className="overflow-x-auto my-6">
            <table
              className="w-full border-collapse border border-border rounded-lg overflow-hidden shadow-sm"
              {...props}
            >
              {children}
            </table>
          </div>
        ),
        thead: ({ children, ...props }) => (
          <thead className="bg-muted/50" {...props}>
            {children}
          </thead>
        ),
        th: ({ children, ...props }) => (
          <th
            className="border border-border px-4 py-3 text-left font-semibold text-foreground text-sm"
            {...props}
          >
            {children}
          </th>
        ),
        td: ({ children, ...props }) => (
          <td
            className="border border-border px-4 py-3 text-muted-foreground text-sm"
            {...props}
          >
            {children}
          </td>
        ),
        // Horizontal rule
        hr: ({ ...props }) => (
          <hr className="border-border my-8 border-t" {...props} />
        ),
        // Image styling
        img: ({ src, alt, width, height, ...props }) => (
          <Image
            src={typeof src === "string" ? src : ""}
            alt={alt || ""}
            width={typeof width === "number" ? width : 800}
            height={typeof height === "number" ? height : 400}
            className="rounded-lg border border-border shadow-sm my-6 max-w-full h-auto"
            {...props}
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
