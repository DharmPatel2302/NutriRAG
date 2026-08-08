import React, { useState } from "react";
import SourceCard from "./SourceCard";
import { ChevronDownIcon, ChevronRightIcon } from "./Icons";

export default function SourceList({ sources = [] }) {
  const [open, setOpen] = useState(false);

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="sources-accordion">
      <button
        className="sources-toggle-btn"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {open ? <ChevronDownIcon size={14} /> : <ChevronRightIcon size={14} />}
        <span>Sources ({sources.length})</span>
      </button>

      {open && (
        <div className="sources-grid">
          {sources.map((src, idx) => (
            <SourceCard key={src.id || idx} source={src} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}
