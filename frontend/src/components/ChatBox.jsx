import React from "react";

export default function ChatBox({ query, setQuery, onAsk, loading }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !loading) {
      onAsk();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="input-group">
      <input
        type="text"
        className="input-field"
        placeholder="Ask a question about human nutrition..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={loading}
      />
      <button type="submit" className="btn-primary" disabled={loading || !query.trim()}>
        {loading ? (
          <>
            <span className="spinner" />
            Generating...
          </>
        ) : (
          "Ask"
        )}
      </button>
    </form>
  );
}
