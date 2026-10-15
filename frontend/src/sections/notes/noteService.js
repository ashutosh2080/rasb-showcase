
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";
const DEMO_NOTES_KEY = "rasb-demo-notes";

function readDemoNotes() {
  try {
    const saved = JSON.parse(localStorage.getItem(DEMO_NOTES_KEY) || "null");
    if (Array.isArray(saved)) return saved;
  } catch { /* use seeded demo notes */ }
  const now = new Date().toISOString();
  const seeded = [
    { id: "demo-note-1", name: "RASB project vision", description: "A personal operating system for notes, routines, and digital life.", priority: "high", encrypted: true, created_at: now, updated_at: now },
    { id: "demo-note-2", name: "Ideas to explore", description: "Capture ideas and turn them into actionable plans.", priority: "medium", encrypted: true, created_at: now, updated_at: now },
    { id: "demo-note-3", name: "Weekly review", description: "Review progress, open loops, and upcoming priorities.", priority: "low", encrypted: false, created_at: now, updated_at: now },
  ];
  localStorage.setItem(DEMO_NOTES_KEY, JSON.stringify(seeded));
  return seeded;
}

function saveDemoNotes(notes) {
  localStorage.setItem(DEMO_NOTES_KEY, JSON.stringify(notes));
}

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

// GET /api/notes
export async function getNotes() {
  if (DEMO_MODE) return { notes: readDemoNotes() };
  return request("/notes");
}

// GET /api/notes/:id
export async function getNote(id) {
  if (DEMO_MODE) {
    const note = readDemoNotes().find((item) => String(item.id) === String(id));
    if (!note) throw new Error("Note not found.");
    return { note };
  }
  return request(`/notes/${id}`);
}

// POST /api/notes
export async function createNote(note) {
  if (DEMO_MODE) {
    const notes = readDemoNotes();
    const created = { ...note, id: `demo-note-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    saveDemoNotes([created, ...notes]);
    return { note: created };
  }
  return request("/notes", {
    method: "POST",
    body: JSON.stringify(note),
  });
}

// PUT /api/notes/:id
export async function updateNote(id, note) {
  if (DEMO_MODE) {
    const notes = readDemoNotes();
    const updated = { ...notes.find((item) => String(item.id) === String(id)), ...note, id, updated_at: new Date().toISOString() };
    saveDemoNotes(notes.map((item) => String(item.id) === String(id) ? updated : item));
    return { note: updated };
  }
  return request(`/notes/${id}`, {
    method: "PUT",
    body: JSON.stringify(note),
  });
}

// DELETE /api/notes/:id
export async function deleteNote(id) {
  if (DEMO_MODE) {
    saveDemoNotes(readDemoNotes().filter((item) => String(item.id) !== String(id)));
    return { success: true };
  }
  return request(`/notes/${id}`, {
    method: "DELETE",
  });
}
