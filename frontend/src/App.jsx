import React from "react";
import { useTheme } from "./hooks/useTheme";
import { useChat } from "./hooks/useChat";
import Header from "./components/Header";
import EmptyState from "./components/EmptyState";
import ChatThread from "./components/ChatThread";
import ChatInput from "./components/ChatInput";
import Toast from "./components/Toast";

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const {
    messages,
    sendMessage,
    retryMessage,
    clearChat,
    toastMessage,
    showToast,
  } = useChat();

  const isThinkingOrStreaming = messages.some(
    (m) => m.status === "thinking" || m.status === "streaming"
  );

  const handleCopyText = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      showToast("Copied to clipboard!");
    }
  };

  return (
    <div className="app-layout">
      <Header theme={theme} toggleTheme={toggleTheme} onNewChat={clearChat} />

      {messages.length === 0 ? (
        <EmptyState onSelectChip={(chipText) => sendMessage(chipText)} />
      ) : (
        <ChatThread
          messages={messages}
          onRetry={retryMessage}
          onCopy={handleCopyText}
        />
      )}

      <ChatInput onSend={sendMessage} disabled={isThinkingOrStreaming} />

      <Toast message={toastMessage} />
    </div>
  );
}