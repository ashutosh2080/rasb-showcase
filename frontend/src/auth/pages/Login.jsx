import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import { useAuth } from "../AuthContext";

import "./Login.css";

function RasbLogo({ width = 112, markOnly = false }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={markOnly ? "0 0 92 120" : "0 0 430 120"}
      width={width} height={markOnly ? (width * 120) / 92 : (width * 120) / 430} aria-label="RASB">
      <g transform="translate(4, 4)">
        <rect x="4" y="4" width="52" height="82" fill="#FCFBF8" stroke="#20211F" strokeWidth="4" />
        <line x1="11" y1="11" x2="11" y2="79" stroke="#20211F" strokeWidth="2.5" />
        <g transform="translate(30, 11)">
          <polygon points="0,0 25,7 25,75 0,68" fill="#B56A35" stroke="#20211F" strokeWidth="3" />
          <circle cx="7" cy="39" r="3" fill="#20211F" />
        </g>
      </g>
      {!markOnly && <text x="88" y="79" fill="#20211F" fontFamily="Inter, sans-serif" fontSize="58" fontWeight="700" letterSpacing="-2.5">RASB</text>}
    </svg>
  );
}

export default function Login() {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const navigate =
    useNavigate();

  const { login } =
    useAuth();

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError(
        "Email and password are required."
      );
      return;
    }

    try {
      setSubmitting(true);

      await login(
        email,
        password
      );

      navigate("/overview", {
        replace: true,
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Invalid email or password."
      );
    } finally {
      setSubmitting(false);
    }
  }


  return (
    <div className="auth-page">
      <aside className="auth-intro">
        <div className="auth-intro-top">
          <Link to="/" className="auth-logo"><RasbLogo width={112} /></Link>
          <Link to="/" className="auth-back">← Back to RASB</Link>
        </div>
        <div className="auth-intro-content">
          <div className="auth-mark"><RasbLogo width={68} markOnly /></div>
          <div className="auth-label">YOUR SECONDARY BRAIN</div>
          <h2>Keep the important<br />things <em>somewhere else.</em></h2>
          <p>Notes, reminders, files, accounts and ideas — organized in one personal system you control.</p>
        </div>
        <div className="auth-intro-footer"><span>Capture</span><i /><span>Organize</span><i /><span>Remember</span></div>
      </aside>

      <main className="auth-main">
        <div className="auth-form-wrap">
          <div className="auth-mobile-logo"><Link to="/"><RasbLogo width={98} /></Link></div>
          <div className="auth-eyebrow">WELCOME BACK</div>
          <h1 className="auth-title">Log in to RASB</h1>
          <p className="auth-sub">New to RASB? <Link to="/signup">Create an account</Link></p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="login-email">Email</label>
              <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" autoComplete="email" required />
            </div>
            <div className="auth-field">
              <div className="auth-field-head">
                <label htmlFor="login-password">Password</label>
                <a href="/forgot-password" className="auth-forgot">Forgot password?</a>
              </div>
              <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password" autoComplete="current-password" required />
            </div>
            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}
            <button
              type="submit"
              className="auth-submit"
              disabled={submitting}
            >
              {submitting
                ? "Logging in..."
                : "Log in"}

              {!submitting && (
                <span>→</span>
              )}
            </button>
          </form>

          <div className="auth-divider"><span>or continue with</span></div>
          <button type="button" className="auth-google"><span className="google-mark">G</span>Continue with Google</button>
          <p className="auth-fine-print">By continuing, you agree to RASB's Terms of Service and Privacy Policy.</p>
        </div>
      </main>
    </div>
  );
}
