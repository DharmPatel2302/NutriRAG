import React, { useState, useRef, useEffect } from "react";
import { DocumentIcon } from "./Icons";

export default function CitationTag({ num, source }) {
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const containerRef = useRef(null);

  if (!source) {
    return <span className="citation-badge fallback">[{num}]</span>;
  }

  const similarityScore =
    source.similarity !== undefined && source.similarity !== null
      ? `${(source.similarity * 100).toFixed(1)}% match`
      : null;

  // Handle clicking outside to close pinned tooltip
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setPinned(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isVisible = hovered || pinned;

  const handleBadgeClick = (e) => {
    e.stopPropagation();
    setPinned((prev) => !prev);
  };

  return (
    <span
      ref={containerRef}
      className="citation-container"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        className={`citation-badge highlighted ${pinned ? "pinned" : ""}`}
        onClick={handleBadgeClick}
        title="Click to lock open & read text"
      >
        {num}
        <span className="citation-sub">p.{source.page_number}</span>
      </span>

      {isVisible && (
        <div
          className="citation-tooltip"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="citation-tooltip-header">
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <DocumentIcon size={14} /> Source [{num}] — Page {source.page_number}
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {similarityScore && (
                <span className="citation-score-badge">{similarityScore}</span>
              )}
              {pinned && (
                <button
                  onClick={() => setPinned(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    padding: "0 2px",
                  }}
                  title="Close popup"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="citation-tooltip-body">
            "{source.chunk_text}"
          </div>
        </div>
      )}
    </span>
  );
}
