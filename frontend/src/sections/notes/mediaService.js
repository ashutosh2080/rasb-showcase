const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

async function parseResponse(response, fallbackMessage) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || fallbackMessage);
  }

  return data;
}

export async function uploadNoteMedia(noteId, file) {
  if (DEMO_MODE) throw new Error("File uploads are disabled in the RASB showcase. Note text is saved locally.");
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${API_URL}/notes/${noteId}/media`,
    {
      method: "POST",
      credentials: "include",
      body: formData,
    }
  );

  return parseResponse(response, "Failed to upload media");
}

export async function getNoteMedia(noteId) {
  if (DEMO_MODE) return [];
  const response = await fetch(
    `${API_URL}/notes/${noteId}/media`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  const data = await parseResponse(
    response,
    "Failed to fetch media"
  );

  return data.media;
}

export async function deleteNoteMedia(noteId, mediaId) {
  if (DEMO_MODE) return { success: true };
  const response = await fetch(
    `${API_URL}/notes/${noteId}/media/${mediaId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  return parseResponse(response, "Failed to delete media");
}

export function getMediaOpenUrl(noteId, mediaId) {
  return `${API_URL}/notes/${noteId}/media/${mediaId}/open`;
}

export function getMediaDownloadUrl(noteId, mediaId) {
  return `${API_URL}/notes/${noteId}/media/${mediaId}/download`;
}
