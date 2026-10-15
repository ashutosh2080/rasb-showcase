// src/sections/executor/executor.api.js

const API_BASE = "/executor";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

function getLocalTimezone() {
  return (
    Intl.DateTimeFormat().resolvedOptions()
      .timeZone || "Asia/Kolkata"
  );
}

async function request(endpoint, options = {}) {
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
      throw new Error("Executor request timed out. Please try again.");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
export const executorService = {
  // ==============================
  // EXECUTOR DAY
  // ==============================

  async getDay(date) {
    const timezone = encodeURIComponent(
      getLocalTimezone()
    );

    return request(
      `${API_BASE}/day/${date}?timezone=${timezone}`
    );
  },

  async createDay(payload) {
    return request(`${API_BASE}/day`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateDayStatus(id, status) {
    return request(`${API_BASE}/day/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  // ==============================
  // EXECUTOR ITEMS
  // ==============================

  async createItem(payload) {
    return request(`${API_BASE}/items`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateItem(id, payload) {
    return request(`${API_BASE}/items/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  async deleteItem(id) {
    return request(`${API_BASE}/items/${id}`, {
      method: "DELETE",
    });
  },

  // ==============================
  // MATERIALIZATION
  // ==============================

  async materializeDay(date) {
    return request(`${API_BASE}/materialize/${date}`, {
      method: "POST",
      body: JSON.stringify({
        timezone: getLocalTimezone(),
      }),
    });
  },
};
