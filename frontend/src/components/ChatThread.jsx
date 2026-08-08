import React, { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

export default function ChatThread({ messages, onRetry, onCopy }) {
  const threadEndRef = useRef(null);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-thread">
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          onRetry={() => onRetry(msg.id)}
          onCopy={onCopy}
        />
      ))}
      <div ref={threadEndRef} />
    </div>
  );
}
