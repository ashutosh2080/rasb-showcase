import { useState } from "react";
import {
  useNavigate,
  Link,
} from "react-router-dom";

import { useAuth } from "../AuthContext";

import "./Signup.css";

function RasbLogo({ width = 112, markOnly = false }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={markOnly ? "0 0 92 120" : "0 0 430 120"}
      width={width}
      height={markOnly ? (width * 120) / 92 : (width * 120) / 430}
      aria-label="RASB"
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
        />
        <line
          x1="11"
          y1="11"
          x2="11"
          y2="79"
          stroke="#20211F"
          strokeWidth="2.5"
        />
        <g transform="translate(30, 11)">
          <polygon
            points="0,0 25,7 25,75 0,68"
            fill="#B56A35"
            stroke="#20211F"
            strokeWidth="3"
          />
          <circle cx="7" cy="39" r="3" fill="#20211F" />
        </g>
      </g>

      {!markOnly && (
        <text
          x="88"
          y="79"
          fill="#20211F"
          fontFamily="Inter, sans-serif"
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

export default function Signup() {
  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirm, setConfirm] =
    useState("");

  const [error, setError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const navigate =
    useNavigate();

  const { register } =
    useAuth();

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (password !== confirm) {
      setError(
        "Passwords don't match."
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    try {
      setSubmitting(true);

      await register(
        name,
        email,
        password
      );

      navigate("/overview", {
        replace: true,
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to create account."
      );
    } finally {
      setSubmitting(false);
    }
  }


  return (
    <div className="auth-page">
      <aside className="auth-intro">
        <div className="auth-intro-top">
          <Link to="/" className="auth-logo">
            <RasbLogo width={112} />
          </Link>

          <Link to="/" className="auth-back">
            ← Back to RASB
          </Link>
        </div>

        <div className="auth-intro-content">
          <div className="auth-mark">
            <RasbLogo width={68} markOnly />
          </div>

          <div className="auth-label">START WITH THE ESSENTIALS</div>

          <h2>
            Stop carrying
            <br />
            everything <em>in your head.</em>
          </h2>

          <p>
            Create a place for the things you want to remember, return to and
            keep under your control.
          </p>
        </div>

        <div className="auth-intro-footer">
          <span>Capture</span>
          <i />
          <span>Organize</span>
          <i />
          <span>Remember</span>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-form-wrap">
          <div className="auth-mobile-logo">
            <Link to="/">
              <RasbLogo width={98} />
            </Link>
          </div>

          <div className="auth-eyebrow">GET STARTED</div>

          <h1 className="auth-title">Create your account</h1>

          <p className="auth-sub">
            Already have an account? <Link to="/login">Log in</Link>
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="signup-name">Name</label>
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                autoComplete="new-password"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="signup-confirm">Confirm password</label>
              <input
                id="signup-confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                autoComplete="new-password"
                required
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button
              type="submit"
              className="auth-submit"
              disabled={submitting}
            >
              {submitting
                ? "Creating account..."
                : "Create account"}

              {!submitting && (
                <span>→</span>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <button type="button" className="auth-google">
            <span className="google-mark">G</span>
            Continue with Google
          </button>

          <p className="auth-fine-print">
            By creating an account, you agree to RASB's Terms of Service and
            Privacy Policy.
          </p>
        </div>
      </main>
    </div>
  );
}
