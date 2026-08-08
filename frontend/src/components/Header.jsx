import React from "react";
import { SunIcon, MoonIcon, PlusIcon } from "./Icons";

export default function Header({ theme, toggleTheme, onNewChat }) {
  return (
    <header className="app-header">
      <div className="brand-container">
        <img
          src="/icon.png"
          alt="NutriRAG Icon"
          style={{ width: 28, height: 28, borderRadius: 6, objectFit: "contain" }}
        />
        <div>
          <span className="brand-title">NutriRAG</span>
          <span className="brand-tag">AI Science</span>
        </div>
      </div>

      <div className="header-actions">
        <button
          className="text-btn"
          onClick={onNewChat}
          aria-label="New Chat"
          title="Start a new chat session"
        >
          <PlusIcon size={14} /> New Chat
        </button>

        <button
          className="icon-btn"
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? <SunIcon size={18} /> : <MoonIcon size={18} />}
        </button>
      </div>
    </header>
  );
}
