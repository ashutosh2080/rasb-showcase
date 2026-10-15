
import axios from "axios";

const API_URL =
  `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/reminders`;

const reminderApi = axios.create({
  withCredentials: true,
});

// GET all reminders
export async function getReminders() {
  const response = await reminderApi.get(API_URL);
  return response.data.data;
}

// GET one reminder
export async function getReminder(id) {
  const response = await reminderApi.get(`${API_URL}/${id}`);
  return response.data.data;
}

// CREATE reminder
export async function createReminder(reminder) {
  const response = await reminderApi.post(API_URL, reminder);
  return response.data.data;
}

// UPDATE reminder
export async function updateReminder(id, reminder) {
  const response = await reminderApi.put(
    `${API_URL}/${id}`,
    reminder
  );
  return response.data.data;
}

// DELETE reminder
export async function deleteReminder(id) {
  const response = await reminderApi.delete(`${API_URL}/${id}`);
  return response.data;
}
