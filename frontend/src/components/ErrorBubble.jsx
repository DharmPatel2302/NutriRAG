import React from "react";
import { AlertIcon, RefreshIcon } from "./Icons";

export default function ErrorBubble({ errorMessage, onRetry }) {
  const displayMsg =
    errorMessage || "Couldn't reach NutriRAG — the server might be waking up.";

  return (
    <div
      className="bubble-content"
      style={{
        background: "rgba(239, 68, 68, 0.12)",
        border: "1px solid rgba(239, 68, 68, 0.3)",
        color: "#fca5a5",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontWeight: 600 }}>
        <AlertIcon size={18} />
        <span>{displayMsg}</span>
      </div>

      {onRetry && (
        <button
          className="text-btn"
          onClick={onRetry}
          aria-label="Retry question"
          style={{
            background: "rgba(239, 68, 68, 0.2)",
            borderColor: "rgba(239, 68, 68, 0.4)",
            color: "#ffffff",
            fontSize: "0.82rem",
            padding: "6px 12px",
          }}
        >
          <RefreshIcon size={13} /> Retry
        </button>
      )}
    </div>
  );
}
