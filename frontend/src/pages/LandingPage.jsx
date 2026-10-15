import "./LandingPage.css";
import { Link } from "react-router-dom";

function RasbLogo({ width = 128, markOnly = false }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={markOnly ? "0 0 92 120" : "0 0 430 120"}
      width={width}
      height={markOnly ? (width * 120) / 92 : (width * 120) / 430}
      aria-label="RASB"
      role="img"
    >
      <g transform="translate(4, 4)">
        <rect
          x="4"
          y="4"
          width="52"
          height="82"
          fill="#FCFBF8"
          stroke="#20211F"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <line
          x1="11"
          y1="11"
          x2="11"
          y2="79"
          stroke="#20211F"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <g transform="translate(30, 11)">
          <polygon
            points="0,0 25,7 25,75 0,68"
            fill="#B56A35"
            stroke="#20211F"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="7" cy="39" r="3" fill="#20211F" />
        </g>
      </g>

      {!markOnly && (
        <text
          x="88"
          y="79"
          fill="#20211F"
          fontFamily="Inter, system-ui, sans-serif"
          fontSize="58"
          fontWeight="700"
          letterSpacing="-2.5"
        >
          RASB
        </text>
      )}
    </svg>
  );
}

const CAPABILITIES = [
  {
    number: "01",
    title: "Capture",
    desc: "Put thoughts, tasks, ideas and small pieces of information somewhere reliable before they disappear.",
  },
  {
    number: "02",
    title: "Remember",
    desc: "Turn reminders and important details into things RASB can surface when you need them.",
  },
  {
    number: "03",
    title: "Organize",
    desc: "Keep notes, files, accounts, projects and personal information connected instead of scattered.",
  },
  {
    number: "04",
    title: "Protect",
    desc: "Keep sensitive information inside a system designed around ownership, privacy and control.",
  },
];

const MODULES = [
  ["Notes", "Write, collect and find what matters."],
  ["Reminders", "Keep time-sensitive things from slipping."],
  ["Digital Life", "Keep accounts and personal details organized."],
  ["Storage", "Keep files close to the context where they belong."],
  ["Vault", "A dedicated place for sensitive information."],
  ["Activity", "Understand what changed and when."],
];

export default function LandingPage() {
  const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";
  function handleContactSubmit(e) {
    e.preventDefault();
    console.log("contact form submitted");
  }

  return (
    <div className="lp">
      <nav className="lp-nav">
        <Link to="/" className="lp-brand" aria-label="RASB home">
          <RasbLogo width={112} />
        </Link>

        <div className="lp-nav-links">
          <a href="#why">Why RASB</a>
          <a href="#modules">Inside RASB</a>
          <a href="#about">About</a>
        </div>

        <div className="lp-nav-actions">
          <Link
            to={DEMO_MODE ? "/overview" : "/login"}
            className="lp-login"
          >
            Log in
          </Link>
          <Link to="/signup" className="lp-button lp-button-dark">
            Get started
          </Link>
        </div>
      </nav>

      <main>
        <section className="lp-hero">
          <div className="lp-hero-copy">
            <div className="lp-kicker">
              <span className="lp-kicker-line" />
              YOUR SECONDARY BRAIN
            </div>

            <h1>
              Make space
              <br />
              <em>in your head.</em>
            </h1>

            <p className="lp-hero-sub">
              RASB gives the things you want to remember a place to live —
              notes, reminders, files, accounts, ideas and everything in between.
            </p>

            <div className="lp-hero-actions">
              <Link to="/signup" className="lp-button lp-button-accent">
                Start with RASB
                <span aria-hidden="true">→</span>
              </Link>
              <a href="#why" className="lp-text-link">
                See how it works
              </a>
            </div>

            <p className="lp-quiet-note">
              Built to be useful before it tries to be clever.
            </p>
          </div>

          <div className="lp-hero-product" aria-label="RASB product preview">
            <div className="lp-window">
              <div className="lp-window-top">
                <div className="lp-window-brand">
                  <RasbLogo width={74} markOnly />
                  <span>Overview</span>
                </div>
                <span className="lp-window-date">Tuesday · 29 Sep</span>
              </div>

              <div className="lp-window-body">
                <div className="lp-window-greeting">
                  <span>Good afternoon.</span>
                  <strong>Here is what needs your attention.</strong>
                </div>

                <div className="lp-preview-grid">
                  <div className="lp-preview-panel lp-preview-wide">
                    <div className="lp-preview-heading">
                      <span>Next up</span>
                      <span className="lp-preview-muted">3 items</span>
                    </div>

                    <div className="lp-preview-row">
                      <span className="lp-check" />
                      <div>
                        <strong>Finish RASB redesign</strong>
                        <small>Today · 6:00 PM</small>
                      </div>
                    </div>

                    <div className="lp-preview-row">
                      <span className="lp-check" />
                      <div>
                        <strong>Review project notes</strong>
                        <small>Today · 8:30 PM</small>
                      </div>
                    </div>

                    <div className="lp-preview-row">
                      <span className="lp-check lp-check-done">✓</span>
                      <div>
                        <strong>Update GitHub repository</strong>
                        <small>Completed</small>
                      </div>
                    </div>
                  </div>

                  <div className="lp-preview-panel">
                    <div className="lp-preview-heading">
                      <span>Recent notes</span>
                      <span className="lp-preview-arrow">↗</span>
                    </div>
                    <div className="lp-note-line">
                      <span>Product direction</span>
                      <small>2h ago</small>
                    </div>
                    <div className="lp-note-line">
                      <span>Backend checklist</span>
                      <small>Yesterday</small>
                    </div>
                    <div className="lp-note-line">
                      <span>Ideas to explore</span>
                      <small>Sep 27</small>
                    </div>
                  </div>
                </div>

                <div className="lp-preview-footer">
                  <span>Notes</span>
                  <span>Reminders</span>
                  <span>Digital Life</span>
                  <span>Storage</span>
                  <span>Vault</span>
                </div>
              </div>
            </div>

            <div className="lp-product-caption">
              <span className="lp-caption-dot" />
              One place for the things your mind shouldn't have to hold.
            </div>
          </div>
        </section>

        <section id="why" className="lp-statement">
          <div className="lp-section-label">WHY RASB</div>
          <div className="lp-statement-grid">
            <h2>
              Your brain is for
              <br />
              <em>thinking.</em>
            </h2>
            <div>
              <p>
                Remembering where you saved something, when a task is due, which
                account uses which email, or what you were supposed to do next
                consumes attention.
              </p>
              <p>
                RASB is built to take that background load somewhere else —
                without turning your life into another complicated system.
              </p>
            </div>
          </div>
        </section>

        <section className="lp-capabilities">
          {CAPABILITIES.map((item) => (
            <article className="lp-capability" key={item.number}>
              <span>{item.number}</span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </section>

        <section id="modules" className="lp-modules">
          <div className="lp-modules-heading">
            <div>
              <div className="lp-section-label">INSIDE RASB</div>
              <h2>A system that grows with your life.</h2>
            </div>
            <p>
              Start with what you need today. Add structure as your information
              grows.
            </p>
          </div>

          <div className="lp-module-list">
            {MODULES.map(([title, desc], index) => (
              <div className="lp-module" key={title}>
                <span className="lp-module-number">0{index + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
                <span className="lp-module-arrow">↗</span>
              </div>
            ))}
          </div>
        </section>

        <section id="about" className="lp-about">
          <div className="lp-about-mark">
            <RasbLogo width={92} markOnly />
          </div>
          <div>
            <div className="lp-section-label">THE IDEA</div>
            <h2>Less remembering. More living.</h2>
            <p>
              RASB is a personal secondary brain designed around a simple idea:
              the information that matters to you should be easy to capture,
              easy to find and under your control.
            </p>
          </div>
        </section>

        <section id="contact" className="lp-contact">
          <div className="lp-section-label">GET IN TOUCH</div>
          <h2>Have something to say?</h2>
          <p>
            Questions, feedback or ideas for RASB are welcome.
          </p>

          <form className="lp-contact-form" onSubmit={handleContactSubmit}>
            <div className="lp-contact-row">
              <input type="text" placeholder="Name" required />
              <input type="email" placeholder="Email" required />
            </div>
            <textarea rows={4} placeholder="Message" required />
            <button type="submit" className="lp-button lp-button-dark">
              Send message <span aria-hidden="true">→</span>
            </button>
          </form>
        </section>

        <section className="lp-final-cta">
          <div>
            <div className="lp-section-label">START HERE</div>
            <h2>Give your mind some room.</h2>
          </div>
          <Link to="/signup" className="lp-button lp-button-accent">
            Create your RASB
            <span aria-hidden="true">→</span>
          </Link>
        </section>
      </main>

      <footer className="lp-footer">
        <Link to="/" className="lp-footer-brand">
          <RasbLogo width={86} />
        </Link>

        <div className="lp-footer-links">
          <a href="#why">Why RASB</a>
          <a href="#modules">Inside RASB</a>
          <a href="#contact">Contact</a>
        </div>

        <span>© {new Date().getFullYear()} RASB</span>
      </footer>
    </div>
  );
}
