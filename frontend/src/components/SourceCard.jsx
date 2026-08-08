import React, { useState } from "react";
import { DocumentIcon, ChevronDownIcon, ChevronRightIcon } from "./Icons";

export default function SourceCard({ source, index }) {
  const [expanded, setExpanded] = useState(false);

  if (!source) return null;

  const similarityScore =
    source.similarity !== undefined && source.similarity !== null
      ? `${(source.similarity * 100).toFixed(1)}% match`
      : null;

  const fullText = source.chunk_text || "";
  const isLong = fullText.length > 180;
  const displayText = expanded || !isLong ? fullText : `${fullText.substring(0, 180)}...`;

  return (
    <div className="source-card-item" onClick={() => setExpanded(!expanded)}>
      <div className="source-card-header">
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <DocumentIcon size={14} /> Source [{index + 1}] — Page {source.page_number}
        </span>
        {similarityScore && (
          <span className="source-match-badge">{similarityScore}</span>
        )}
      </div>

      <p style={{ color: "var(--text-secondary)", lineHeight: "1.5" }}>
        "{displayText}"
      </p>

      {isLong && (
        <span
          style={{
            fontSize: "0.78rem",
            color: "var(--accent-purple)",
            marginTop: 6,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontWeight: 600,
          }}
        >
          {expanded ? (
            <>
              Show less <ChevronDownIcon size={12} />
            </>
          ) : (
            <>
              Expand full text <ChevronRightIcon size={12} />
            </>
          )}
        </span>
      )}
    </div>
  );
}
