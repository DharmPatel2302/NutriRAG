import React, { useState, useEffect } from "react";

const STAGES = [
  "Searching nutrition database...",
  "Retrieving relevant passages...",
  "Generating answer..."
];

export default function ThinkingIndicator() {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStageIndex((prev) => {
        // Cap at the last stage ("Generating answer...") after reaching index 2
        if (prev < STAGES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1200);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="thinking-box">
      <div className="progress-bar-track">
        <div className="progress-bar-fill" />
      </div>
      <span>{STAGES[stageIndex]}</span>
    </div>
  );
}
