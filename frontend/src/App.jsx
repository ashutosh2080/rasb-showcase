import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import Dashboard from "./sections/dashboard/Dashboard";
import Notes from "./sections/notes/Notes";
import Reminders from "./sections/reminders/Reminders";
import DigitalLife from "./sections/digitalLife/DigitalLife";
import ActivityLog from "./sections/activityLog/ActivityLog";
import Storage from "./sections/storage/Storage";
import SecurityVault from "./sections/securityVault/SecurityVault";

import NewNote from "./sections/notes/notesform";
import EditNote from "./sections/notes/editnotes";

import NewReminder from "./sections/reminders/NewReminder";
import EditReminder from "./sections/reminders/EditReminder";

import Landing from "./pages/LandingPage";
import Login from "./auth/pages/Login";
import Signup from "./auth/pages/Signup";
import ProtectedRoute from "./auth/ProtectedRoute";

import Cycles from "./sections/cycles/Cycles";
import Executor from "./sections/executor/Executor";

import { useTheme } from "./useTheme";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";


// ==============================
// DASHBOARD / APP LAYOUT
// ==============================

function AppLayout() {
  const [theme, setTheme] = useTheme();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.classList.add("mobile-nav-open");
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("mobile-nav-open");
    };
  }, [mobileNavOpen]);

  return (
    <div className={`app${mobileNavOpen ? " mobile-nav-is-open" : ""}`}>
      {mobileNavOpen && (
        <button
          type="button"
          className="mobile-nav-backdrop"
          aria-label="Close navigation menu"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <Sidebar
        theme={theme}
        setTheme={setTheme}
        mobileNavOpen={mobileNavOpen}
        closeMobileNav={() => setMobileNavOpen(false)}
      />

      <main className="main">

        <Topbar mobileNavOpen={mobileNavOpen} onMenuClick={() => setMobileNavOpen((open) => !open)} />

        <Outlet />

        <div className="foot-note">
          RASB · self-hosted · behind Cloudflare Zero Trust
        </div>

      </main>

    </div>
  );
}


// ==============================
// MAIN APP
// ==============================

export default function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* ================================= */}
        {/* PUBLIC ROUTES                      */}
        {/* ================================= */}

        <Route
          path="/"
          element={<Landing />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />


        {/* ================================= */}
        {/* RASB APPLICATION ROUTES            */}
        {/* ================================= */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>

            {/* Dashboard */}
            <Route
              path="/overview"
              element={<Dashboard />}
            />


            {/* Notes */}
            <Route
              path="/notes"
              element={<Notes />}
            />

            <Route
              path="/notes/new"
              element={<NewNote />}
            />

            <Route
              path="/notes/:id/edit"
              element={<EditNote />}
            />


            {/* Reminders */}
            <Route
              path="/reminders"
              element={<Reminders />}
            />

            <Route
              path="/reminders/new"
              element={<NewReminder />}
            />

            <Route
              path="/reminders/:id/edit"
              element={<EditReminder />}
            />


            {/* Digital Life */}
            <Route
              path="/digital-life"
              element={<DigitalLife />}
            />


            {/* Activity Log */}
            <Route
              path="/activity-log"
              element={<ActivityLog />}
            />


            {/* Storage */}
            <Route
              path="/storage"
              element={<Storage />}
            />


            {/* Security Vault */}
            <Route
              path="/vault"
              element={<SecurityVault />}
            />
            <Route
              path="/cycles"
              element={<Cycles />}
            />
            <Route
              path="/executor"
              element={<Executor />}
            />

          </Route>
        </Route>



        {/* ================================= */}
        {/* UNKNOWN ROUTE                      */}
        {/* ================================= */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>

    </BrowserRouter>
  );
}