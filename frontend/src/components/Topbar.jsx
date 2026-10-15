import { useLocation } from "react-router-dom";


const PAGE_INFO = {
  "/cycles": {
    title: "Cycles",
    subtitle: "Recurring events, routines, and scheduled life tasks.",
  },

  "/executor": {
    title: "Executor",
    subtitle: "Plan and organize the next actions in your day.",
  },

  "/overview": {
    title: "Overview",
    subtitle: "Everything RASB is holding onto for you, at a glance.",
  },

  "/notes": {
    title: "Notes",
    subtitle: "Your encrypted thoughts, references, and captured information.",
  },

  "/reminders": {
    title: "Reminders",
    subtitle: "Things RASB is keeping track of for you.",
  },

  "/digital-life": {
    title: "Digital Life",
    subtitle: "A view of your digital presence and tracked identities.",
  },

  "/activity-log": {
    title: "Activity Log",
    subtitle: "A chronological record of activity across RASB.",
  },

  "/storage": {
    title: "Storage",
    subtitle: "Monitor how your RASB storage is being used.",
  },

  "/vault": {
    title: "Security Vault",
    subtitle: "Your secured credentials and sensitive information.",
  },
};


export default function Topbar({ onMenuClick = () => {}, mobileNavOpen = false }) {

  const location = useLocation();

  const page =
    PAGE_INFO[location.pathname] || PAGE_INFO["/overview"];


  return (
    <div className="topbar">

      <div className="topbar-heading">
        <button
          type="button"
          className="mobile-menu-button"
          aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-controls="rasb-sidebar"
          aria-expanded={mobileNavOpen}
          onClick={onMenuClick}
        >
          <span />
          <span />
          <span />
        </button>
        <div className="topbar-titles">
        <div className="title">
          {page.title}
        </div>

        <div className="subtitle">
          {page.subtitle}
        </div>
        </div>
      </div>

      <input
        className="search"
        placeholder="Search RASB…"
      />

    </div>
  );
}