import React from "react";
import AnswerRenderer from "./AnswerRenderer";
import ThinkingIndicator from "./ThinkingIndicator";
import ErrorBubble from "./ErrorBubble";
import SourceList from "./SourceList";
import { CopyIcon } from "./Icons";

export default function MessageBubble({ message, onRetry, onCopy }) {
  const { role, content, displayedContent, sources, status, error } = message;

  if (role === "user") {
    return (
      <div className="message-bubble user">
        <div className="bubble-content">{content}</div>
      </div>
    );
  }

  // Assistant Bubble
  return (
    <div className="message-bubble assistant">
      {status === "thinking" && (
        <div className="bubble-content">
          <ThinkingIndicator />
        </div>
      )}

      {status === "error" && (
        <ErrorBubble errorMessage={error} onRetry={onRetry} />
      )}

      {(status === "streaming" || status === "complete") && (
        <div className="bubble-content">
          <AnswerRenderer answerText={displayedContent || content} sources={sources} />

          {status === "complete" && (
            <>
              <div className="message-actions">
                <button
                  className="copy-btn"
                  onClick={() => onCopy(content)}
                  aria-label="Copy to clipboard"
                  title="Copy answer text"
                >
                  <CopyIcon size={13} /> Copy
                </button>
              </div>

              <SourceList sources={sources} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
