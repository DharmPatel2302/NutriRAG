const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function askQuestion(query, k = 5) {
  const response = await fetch(`${API_URL}/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, k }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to fetch response from RAG backend");
  }

  return response.json();
}

export async function uploadPDF(fileOrPath) {
  let body;
  let headers = {};

  if (typeof fileOrPath === "string") {
    const formData = new FormData();
    formData.append("file_path", fileOrPath);
    body = formData;
  } else {
    const formData = new FormData();
    formData.append("file", fileOrPath);
    body = formData;
  }

  const response = await fetch(`${API_URL}/ingest`, {
    method: "POST",
    headers,
    body,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to ingest PDF");
  }

  return response.json();
}