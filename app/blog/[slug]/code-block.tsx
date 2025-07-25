"use client";

import { isValidElement, type ReactNode } from "react";
import CopyButton from "./copy-button";

interface CodeBlockProps {
  children: ReactNode;
  className?: string;
}

export default function CodeBlock({ children, className }: CodeBlockProps) {
  // Extract text content from children for copying
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
    <div className="relative group">
      <pre className={className}>
        <code>{children}</code>
      </pre>
      <CopyButton text={textContent} />
    </div>
  );
}
