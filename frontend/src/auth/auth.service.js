import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const authApi = axios.create({
  baseURL: `${API_URL}/auth`,
  withCredentials: true,
});

export async function register({
  name,
  email,
  password,
}) {
  const response =
    await authApi.post(
      "/register",
      {
        name,
        email,
        password,
      }
    );

  return response.data;
}

export async function login({
  email,
  password,
}) {
  const response =
    await authApi.post(
      "/login",
      {
        email,
        password,
      }
    );

  return response.data;
}

export async function getCurrentUser() {
  const response =
    await authApi.get("/me");

  return response.data;
}

export async function logout() {
  const response =
    await authApi.post("/logout");

  return response.data;
}