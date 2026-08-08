import React from "react";

const SUGGESTED_CHIPS = [
  "What are macronutrients vs micronutrients?",
  "How much protein do I need daily?",
  "What vitamins support immune function?",
  "What are the main functions of saliva in digestion?",
  "What are essential amino acids?",
  "How does water balance affect health?"
];

export default function EmptyState({ onSelectChip }) {
  return (
    <div className="empty-state">
      <h1 className="empty-title">NutriRAG Assistant</h1>
      <p className="empty-tagline">
        Ask anything about human nutrition science, digestion, vitamins, and metabolic health
      </p>

      <div className="chips-grid">
        {SUGGESTED_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            className="chip-card"
            onClick={() => onSelectChip(chip)}
          >
            <span>{chip}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
