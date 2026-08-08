import React from "react";
import ReactMarkdown from "react-markdown";
import CitationTag from "./CitationTag";

export default function AnswerRenderer({ answerText, sources = [] }) {
  if (!answerText) return null;

  // Split text by citation pattern like [1], [2], [1, 2], [1], [2], [3]
  // Regex matches [1], [2], etc.
  const citationRegex = /\[(\d+)\]/g;

  // Render markdown text and replace citation markers with interactive CitationTag
  const renderFormattedContent = (content) => {
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = citationRegex.exec(content)) !== null) {
      const matchIndex = match.index;
      const num = parseInt(match[1], 10);

      // Push text prior to match
      if (matchIndex > lastIndex) {
        parts.push(content.substring(lastIndex, matchIndex));
      }

      // Find source item (1-indexed)
      const sourceObj = sources[num - 1] || null;

      // Push citation badge
      parts.push(
        <CitationTag key={`cite-${matchIndex}-${num}`} num={num} source={sourceObj} />
      );

      lastIndex = matchIndex + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts;
  };

  return (
    <div className="markdown-answer">
      <ReactMarkdown
        components={{
          p: ({ children }) => (
            <p>
              {React.Children.map(children, (child) => {
                if (typeof child === "string") {
                  return renderFormattedContent(child);
                }
                return child;
              })}
            </p>
          ),
          li: ({ children }) => (
            <li>
              {React.Children.map(children, (child) => {
                if (typeof child === "string") {
                  return renderFormattedContent(child);
                }
                return child;
              })}
            </li>
          ),
        }}
      >
        {answerText}
      </ReactMarkdown>
    </div>
  );
}
