import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import * as authService
  from "./auth.service.js";



const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

const DEMO_USER = {
  id: "rasb-demo-user",
  name: "RASB Demo",
  email: "demo@rasb.local",
  demo: true,
};


const AuthContext =
  createContext(null);

export function AuthProvider({
  children,
}) {

  const [user, setUser] = useState(
    DEMO_MODE ? DEMO_USER : null
  );

  const [loading, setLoading] = useState(!DEMO_MODE);


  const [error, setError] =
    useState("");

  useEffect(() => {
    if (DEMO_MODE) return;
    async function restoreSession() {
      try {
        const data =
          await authService
            .getCurrentUser();

        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);


  async function login(
    email,
    password
  ) {
    if (DEMO_MODE) {
      setUser(DEMO_USER);
      return DEMO_USER;
    }

    setError("");

    try {
      const data =
        await authService.login({
          email,
          password,
        });

      setUser(data.user);

      return data.user;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Unable to login.";

      setError(message);

      throw error;
    }
  }

  async function register(
    name,
    email,
    password
  ) {
    if (DEMO_MODE) {
      setUser(DEMO_USER);
      return DEMO_USER;
    }

    setError("");

    try {
      const data =
        await authService.register({
          name,
          email,
          password,
        });

      setUser(data.user);

      return data.user;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Unable to create account.";

      setError(message);

      throw error;
    }
  }

  async function logout() {
    if (DEMO_MODE) {
      setUser(null);
      setError("");
      return;
    }
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setError("");
    }
  }

  const value = {
    user,
    loading,
    error,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    clearError: () => setError(""),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}