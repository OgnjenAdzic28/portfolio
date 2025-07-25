"use client";

import { useEffect, useRef } from "react";
import CopyButton from "./copy-button";

interface EnhancedContentProps {
  children: React.ReactNode;
}

export default function EnhancedContent({ children }: EnhancedContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    // Find all pre elements (code blocks) and add copy buttons
    const preElements = contentRef.current.querySelectorAll("pre");

    preElements.forEach((pre) => {
      // Skip if already has a copy button
      if (pre.parentElement?.classList.contains("code-block-wrapper")) return;

      // Get the text content for copying
      const textContent = pre.textContent || "";

      // Create wrapper div
      const wrapper = document.createElement("div");
      wrapper.className = "code-block-wrapper relative group";

      // Insert wrapper before pre element
      pre.parentNode?.insertBefore(wrapper, pre);

      // Move pre into wrapper
      wrapper.appendChild(pre);

      // Create copy button container
      const buttonContainer = document.createElement("div");
      buttonContainer.className = "copy-button-container";
      wrapper.appendChild(buttonContainer);

      // We'll render the React copy button into this container
      import("react-dom/client").then(({ createRoot }) => {
        const root = createRoot(buttonContainer);
        root.render(<CopyButton text={textContent} />);
      });
    });

    // Cleanup function
    return () => {
      const wrappers = contentRef.current?.querySelectorAll(
        ".code-block-wrapper"
      );
      wrappers?.forEach((wrapper) => {
        const pre = wrapper.querySelector("pre");
        if (pre && wrapper.parentNode) {
          wrapper.parentNode.insertBefore(pre, wrapper);
          wrapper.remove();
        }
      });
    };
  }, []);

  return (
    <div ref={contentRef} className="enhanced-content">
      {children}
    </div>
  );
}
