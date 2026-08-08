import { useState, useEffect, useRef } from "react";
import { askQuestion } from "../api";

const STORAGE_KEY = "nutrirag_chat_messages";

export function useChat() {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [toastMessage, setToastMessage] = useState(null);

  // Sync to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error("Failed to save messages to localStorage:", e);
    }
  }, [messages]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    showToast("Chat history cleared");
  };

  const typeWriterEffect = (fullText, messageId) => {
    let index = 0;
    const chunkSize = 3; // Type 3 chars at a time for smooth ~20ms feel
    
    const timer = setInterval(() => {
      index += chunkSize;
      if (index >= fullText.length) {
        index = fullText.length;
        clearInterval(timer);
      }

      const currentContent = fullText.substring(0, index);
      const isDone = index >= fullText.length;

      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId) {
            return {
              ...msg,
              displayedContent: currentContent,
              status: isDone ? "complete" : "streaming",
            };
          }
          return msg;
        })
      );
    }, 20);
  };

  const sendMessage = async (queryText) => {
    if (!queryText || !queryText.trim()) return;
    const cleanQuery = queryText.trim();

    const userMsgId = `user-${Date.now()}`;
    const assistantMsgId = `asst-${Date.now()}`;

    const userMessage = {
      id: userMsgId,
      role: "user",
      content: cleanQuery,
      displayedContent: cleanQuery,
      status: "complete",
    };

    const assistantPlaceholder = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      displayedContent: "",
      sources: [],
      status: "thinking",
    };

    setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);

    try {
      // TODO: pass conversation history once backend supports it
      const response = await askQuestion(cleanQuery, 5);

      const answerText = response.answer || "No response text generated.";
      const sourcesList = response.sources || [];

      // Update assistant message with response data and start streaming
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === assistantMsgId) {
            return {
              ...msg,
              content: answerText,
              sources: sourcesList,
              status: "streaming",
            };
          }
          return msg;
        })
      );

      typeWriterEffect(answerText, assistantMsgId);
    } catch (err) {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === assistantMsgId) {
            return {
              ...msg,
              status: "error",
              error: err.message || "Couldn't reach NutriRAG — the server might be waking up.",
            };
          }
          return msg;
        })
      );
    }
  };

  const retryMessage = (assistantMsgId) => {
    // Find preceding user message
    const msgIndex = messages.findIndex((m) => m.id === assistantMsgId);
    if (msgIndex <= 0) return;

    const userMsg = messages[msgIndex - 1];
    if (!userMsg || userMsg.role !== "user") return;

    // Remove failed assistant message and resubmit
    setMessages((prev) => prev.filter((m) => m.id !== assistantMsgId));
    sendMessage(userMsg.content);
  };

  return {
    messages,
    sendMessage,
    retryMessage,
    clearChat,
    toastMessage,
    showToast,
  };
}
