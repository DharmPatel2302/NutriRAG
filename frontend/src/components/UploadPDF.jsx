import React, { useState } from "react";
import { uploadPDF } from "../api";

export default function UploadPDF({ onIngested }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePath, setFilePath] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile && !filePath.trim()) return;

    setUploading(true);
    setMessage(null);
    setError(null);

    try {
      const payload = selectedFile ? selectedFile : filePath.trim();
      const res = await uploadPDF(payload);
      setMessage(res.message || `Successfully ingested document chunks.`);
      setSelectedFile(null);
      setFilePath("");
      if (onIngested) onIngested();
    } catch (err) {
      setError(err.message || "Ingestion failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <h3 style={{ marginBottom: 12, color: "#a5b4fc" }}>Ingest New Document</h3>
      <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label style={{ display: "block", fontSize: "0.88rem", color: "#94a3b8", marginBottom: 4 }}>
            Upload PDF File:
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => {
              setSelectedFile(e.target.files[0] || null);
              setFilePath("");
            }}
            disabled={uploading}
            style={{ color: "#cbd5e1", fontSize: "0.9rem" }}
          />
        </div>

        <div style={{ textAlign: "center", color: "#64748b", fontSize: "0.85rem" }}>OR</div>

        <div>
          <label style={{ display: "block", fontSize: "0.88rem", color: "#94a3b8", marginBottom: 4 }}>
            Server PDF Path:
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. /data/Human-Nutrition-2020.pdf"
            value={filePath}
            onChange={(e) => {
              setFilePath(e.target.value);
              setSelectedFile(null);
            }}
            disabled={uploading}
          />
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={uploading || (!selectedFile && !filePath.trim())}
          style={{ alignSelf: "flex-start", marginTop: 4 }}
        >
          {uploading ? (
            <>
              <span className="spinner" />
              Processing & Ingesting...
            </>
          ) : (
            "Ingest Document"
          )}
        </button>
      </form>

      {message && <div style={{ marginTop: 12, color: "#10b981", fontSize: "0.9rem" }}>{message}</div>}
      {error && <div style={{ marginTop: 12, color: "#fca5a5", fontSize: "0.9rem" }}>{error}</div>}
    </div>
  );
}
