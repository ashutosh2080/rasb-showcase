import { useEffect, useState } from "react";

const STORAGE_KEY = "rasb-theme";
const TRANSITION_MS = 20;

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  });

  const setTheme = (nextTheme) => {
    setThemeState(nextTheme === "dark" ? "dark" : "light");
  };

  useEffect(() => {
    const root = document.documentElement;

    root.classList.add("theme-transitioning");

    if (theme === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", theme);
    }

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Theme still works for this session.
    }

    const timer = window.setTimeout(() => {
      root.classList.remove("theme-transitioning");
    }, TRANSITION_MS);

    return () => window.clearTimeout(timer);
  }, [theme]);

  return [theme, setTheme];
}