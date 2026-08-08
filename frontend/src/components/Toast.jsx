import React from "react";
import { CheckIcon } from "./Icons";

export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="toast-notification" role="status" aria-live="polite">
      <CheckIcon size={14} /> <span>{message}</span>
    </div>
  );
}
