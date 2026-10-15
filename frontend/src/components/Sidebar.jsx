import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const NAV_ITEMS = [
  {
    id: "overview",
    label: "Overview",
    path: "/overview",
  },
  {
    id: "notes",
    label: "Notes",
    path: "/notes",
  },
  {
    id: "reminders",
    label: "Reminders",
    path: "/reminders",
  },
  {
    id: "cycles",
    label: "Cycles",
    path: "/cycles",
  },
  {
    id: "digital-life",
    label: "Digital Life",
    path: "/digital-life",
  },
  {
    label: "Executor",
    path: "/executor",
  },
  /*{
    id: "activity-log",
    label: "Activity Log",
    path: "/activity-log",
  },
  {
    id: "storage",
    label: "Storage",
    path: "/storage",
  },
  {
    id: "vault",
    label: "Security Vault",
    path: "/vault",
  },*/
];


const THEME_LABEL = { light: "Light", dark: "Dark" };


export default function Sidebar({ theme, setTheme, mobileNavOpen = false, closeMobileNav = () => {} }) {
  const { user, logout } = useAuth();

  return (

    <aside id="rasb-sidebar" className={`sidebar${mobileNavOpen ? " sidebar-mobile-open" : ""}`} aria-label="Main navigation">

      <div className="brand">
        <Link to="/" onClick={closeMobileNav}><b>RASB</b></Link>
        <span>COMMAND CENTER</span>
      </div>


      <nav className="nav">

        {NAV_ITEMS.map((item) => (

          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              "nav-item" + (isActive ? " active" : "")
            }
            onClick={closeMobileNav}
          >
            <span className="nav-dot" />
            {item.label}
          </NavLink>

        ))}

      </nav>


      <div className="sidebar-foot">
        <button
          type="button"
          className="logout-button"
          onClick={() => { closeMobileNav(); logout(); }}
        >
          <span className="logout-icon">↪</span>

          <span className="logout-content">
            <span className="logout-label">
              Log out
            </span>

            {user?.name && (
              <span className="logout-user">
                {user.name}
              </span>
            )}
          </span>
        </button>

        <button
          className="theme-toggle"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <span>Theme</span>

          <span style={{ fontFamily: "var(--font-mono)" }}>
            {THEME_LABEL[theme] || "Light"}
          </span>

        </button>

      </div>

    </aside>
  );
}