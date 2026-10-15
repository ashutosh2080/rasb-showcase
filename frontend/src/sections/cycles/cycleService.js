// src/sections/cycles/cycleService.js

const API_BASE = "/cycles";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";
const DEMO_CYCLES_KEY = "rasb-demo-cycles";
const DEMO_OCCURRENCES_KEY = "rasb-demo-cycle-occurrences";

function readStored(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    if (Array.isArray(value)) return value;
  } catch { /* restore the demo seed */ }
  localStorage.setItem(key, JSON.stringify(fallback));
  return fallback;
}

function readDemoCycles() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const date = (day) => `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const seed = [
    { id: "demo-cycle-1", name: "Review subscriptions", description: "Check recurring subscriptions and cancel anything unused.", category: "Subscriptions", priority: "medium", status: "active", start_date: date(Math.min(today.getDate(), 28)), time: "09:00", recurrence_rule: { type: "monthly", mode: "date", date: Math.min(today.getDate(), 28) } },
    { id: "demo-cycle-2", name: "Daily planning", description: "Review priorities and plan the day.", category: "Personal", priority: "high", status: "active", start_date: date(today.getDate()), time: "08:30", recurrence_rule: { type: "daily", interval: 1 } },
    { id: "demo-cycle-3", name: "Weekly review", description: "Review progress and prepare for the week ahead.", category: "Work", priority: "low", status: "active", start_date: date(today.getDate()), time: "17:00", recurrence_rule: { type: "weekly", interval: 1 } },
  ];
  return readStored(DEMO_CYCLES_KEY, seed);
}

function readDemoOccurrences() {
  return readStored(DEMO_OCCURRENCES_KEY, []);
}

function saveDemoCycles(cycles) { localStorage.setItem(DEMO_CYCLES_KEY, JSON.stringify(cycles)); }
function saveDemoOccurrences(items) { localStorage.setItem(DEMO_OCCURRENCES_KEY, JSON.stringify(items)); }

function buildDemoOccurrences(params = {}) {
  const start = params.start ? new Date(params.start) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const end = params.end ? new Date(params.end) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999);
  const cycles = readDemoCycles();
  const saved = readDemoOccurrences();
  const result = [];
  for (const cycle of cycles) {
    if (cycle.status === "paused") continue;
    const rule = cycle.recurrence_rule || { type: cycle.recurrence_type || "monthly", mode: "date", date: new Date(cycle.start_date || Date.now()).getDate() };
    const first = cycle.start_date ? new Date(`${cycle.start_date}T00:00:00`) : new Date(start);
    const cursor = new Date(Math.max(start.getTime(), first.getTime()));
    cursor.setHours(0, 0, 0, 0);
    const last = new Date(end); last.setHours(23, 59, 59, 999);
    for (let d = new Date(cursor); d <= last; d.setDate(d.getDate() + 1)) {
      const elapsedDays = Math.floor((d - first) / 86400000);
      let matches = false;
      if (rule.type === "daily") matches = elapsedDays % Math.max(1, Number(rule.interval || 1)) === 0;
      else if (rule.type === "weekly") matches = Math.floor(elapsedDays / 7) % Math.max(1, Number(rule.interval || 1)) === 0 && d.getDay() === first.getDay();
      else if (rule.type === "custom") {
        const unit = String(rule.unit || "days").toLowerCase();
        const interval = Math.max(1, Number(rule.interval || 1));
        matches = unit.startsWith("week") ? elapsedDays % (7 * interval) === 0 : unit.startsWith("month") ? d.getDate() === first.getDate() && ((d.getFullYear()-first.getFullYear())*12+d.getMonth()-first.getMonth()) % interval === 0 : elapsedDays % interval === 0;
      } else {
        const dayOfMonth = Number(rule.date || rule.day_of_month || first.getDate());
        matches = d.getDate() === Math.min(dayOfMonth, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate());
      }
      if (!matches) continue;
      const scheduled = new Date(d);
      const time = cycle.time || cycle.scheduled_time || "09:00";
      const [hours, minutes] = String(time).split(":").map(Number);
      scheduled.setHours(hours || 0, minutes || 0, 0, 0);
      const id = `${cycle.id}-${scheduled.toISOString().slice(0, 10)}`;
      const override = saved.find((item) => String(item.id) === id);
      result.push({ id, cycle_id: cycle.id, cycle, name: cycle.name, description: cycle.description || "", category: cycle.category || "Other", priority: cycle.priority || "medium", status: "pending", scheduled_at: scheduled.toISOString(), ...override });
    }
  }
  if (params.priority) return result.filter((item) => item.priority === params.priority);
  if (params.category) return result.filter((item) => item.category === params.category);
  return result;
}

async function demoRequest(endpoint, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};
  const [path, queryString = ""] = endpoint.split("?");
  const query = Object.fromEntries(new URLSearchParams(queryString));
  if (path === API_BASE && method === "GET") return { data: readDemoCycles() };
  if (path === `${API_BASE}/occurrences` && method === "GET") return { data: buildDemoOccurrences(query) };
  if (path === API_BASE && method === "POST") {
    const cycle = { ...body, id: `demo-cycle-${Date.now()}`, status: body.status || "active", start_date: body.start_date || new Date().toISOString().slice(0, 10) };
    saveDemoCycles([cycle, ...readDemoCycles()]); return { data: cycle, cycle };
  }
  const occurrenceMatch = path.match(/^\/cycles\/occurrences\/([^/]+)(?:\/(complete|snooze|skip))?$/);
  if (occurrenceMatch) {
    const id = decodeURIComponent(occurrenceMatch[1]);
    const action = occurrenceMatch[2];
    const existing = readDemoOccurrences().filter((item) => String(item.id) !== id);
    const status = action === "complete" ? "completed" : action === "skip" ? "skipped" : action === "snooze" ? "snoozed" : (body.status || "pending");
    const updated = { id, status, ...body };
    saveDemoOccurrences([...existing, updated]); return { data: updated, occurrence: updated };
  }
  const cycleMatch = path.match(/^\/cycles\/([^/]+)(?:\/(pause|resume|occurrences|notifications))?$/);
  if (cycleMatch) {
    const id = decodeURIComponent(cycleMatch[1]); const action = cycleMatch[2];
    if (action === "occurrences" && method === "GET") return { data: buildDemoOccurrences({ ...query, cycle_id: id }).filter((item) => String(item.cycle_id) === id) };
    if (action === "notifications") return { data: [] };
    const cycles = readDemoCycles();
    if (method === "GET") { const cycle = cycles.find((item) => String(item.id) === id); if (!cycle) throw new Error("Cycle not found."); return { data: cycle, cycle }; }
    if (method === "PUT") { const updated = { ...cycles.find((item) => String(item.id) === id), ...body, id }; saveDemoCycles(cycles.map((item) => String(item.id) === id ? updated : item)); return { data: updated, cycle: updated }; }
    if (method === "DELETE") { saveDemoCycles(cycles.filter((item) => String(item.id) !== id)); return { success: true }; }
    if (action === "pause" || action === "resume") { const updated = cycles.map((item) => String(item.id) === id ? { ...item, status: action === "pause" ? "paused" : "active" } : item); saveDemoCycles(updated); return { success: true }; }
  }
  throw new Error("This action is not available in the RASB demo.");
}

async function request(endpoint, options = {}) {
  if (DEMO_MODE) return demoRequest(endpoint, options);
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 12000);

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: "include",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong.");
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Cycle request timed out. Please try again.");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export const cycleService = {
  async getCycles(params = {}) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value);
      }
    });

    const query = searchParams.toString();

    return request(`${API_BASE}${query ? `?${query}` : ""}`);
  },

  async getCycle(id) {
    return request(`${API_BASE}/${id}`);
  },

  async createCycle(payload) {
    return request(API_BASE, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateCycle(id, payload) {
    return request(`${API_BASE}/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async deleteCycle(id) {
    return request(`${API_BASE}/${id}`, {
      method: "DELETE",
    });
  },

  async getOccurrences(params = {}) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value);
      }
    });

    const query = searchParams.toString();

    return request(`${API_BASE}/occurrences${query ? `?${query}` : ""}`);
  },

  async getCycleOccurrences(id, params = {}) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value);
      }
    });

    const query = searchParams.toString();

    return request(`${API_BASE}/${id}/occurrences${query ? `?${query}` : ""}`);
  },

  async updateOccurrence(id, payload) {
    return request(`${API_BASE}/occurrences/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  async completeOccurrence(id) {
    return request(`${API_BASE}/occurrences/${id}/complete`, {
      method: "POST",
    });
  },

  async snoozeOccurrence(id, payload) {
    return request(`${API_BASE}/occurrences/${id}/snooze`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async skipOccurrence(id) {
    return request(`${API_BASE}/occurrences/${id}/skip`, {
      method: "POST",
    });
  },

  async pauseCycle(id) {
    return request(`${API_BASE}/${id}/pause`, {
      method: "POST",
    });
  },

  async resumeCycle(id) {
    return request(`${API_BASE}/${id}/resume`, {
      method: "POST",
    });
  },

  async getNotifications(id) {
    return request(`${API_BASE}/${id}/notifications`);
  },

  async sendTestNotification(id) {
    return request(`${API_BASE}/${id}/notifications/test`, {
      method: "POST",
    });
  },
};
