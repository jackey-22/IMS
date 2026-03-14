import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  isValidEmail,
  isValidLoginId,
  isValidPassword,
  passwordHint,
  registerUser
} from "../../services/authApi.js";

export default function SignupPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [form, setForm] = useState({
    name: "",
    loginId: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((c) => ({ ...c, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFeedback({ type: "error", text: "Enter your full name." });
      return;
    }
    if (!isValidLoginId(form.loginId.trim())) {
      setFeedback({ type: "error", text: "Login ID must be 6 to 24 characters (letters, numbers, - or _)." });
      return;
    }
    if (!isValidEmail(form.email.trim())) {
      setFeedback({ type: "error", text: "Enter a valid email address." });
      return;
    }
    if (!isValidPassword(form.password)) {
      setFeedback({ type: "error", text: passwordHint });
      return;
    }
    if (form.password !== form.confirmPassword) {
      setFeedback({ type: "error", text: "Passwords do not match." });
      return;
    }
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const session = await registerUser({
        name: form.name.trim(),
        loginId: form.loginId.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword
      });
      setSession(session);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setFeedback({ type: "error", text: error.message || "Sign up failed." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-brand">
        <div className="logo-mark">IMS</div>
        <span className="brand-name">CoreInventory</span>
      </div>

      <h1 className="auth-title">Create account</h1>

      <form className="form" onSubmit={handleSubmit}>
        {feedback && <div className={`feedback ${feedback.type}`}>{feedback.text}</div>}

        <div className="field">
          <label htmlFor="signup-name">Full Name</label>
          <input
            id="signup-name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your full name"
            autoComplete="name"
            autoFocus
          />
        </div>

        <div className="field">
          <label htmlFor="signup-loginId">Login ID</label>
          <input
            id="signup-loginId"
            name="loginId"
            value={form.loginId}
            onChange={handleChange}
            placeholder="6-24 chars (letters, numbers, - or _)"
            autoComplete="username"
          />
        </div>

        <div className="field">
          <label htmlFor="signup-email">Email</label>
          <input
            id="signup-email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="name@company.com"
            autoComplete="email"
          />
        </div>

        <div className="field">
          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Create a strong password"
            autoComplete="new-password"
          />
        </div>

        <div className="field">
          <label htmlFor="signup-confirmPassword">Confirm Password</label>
          <input
            id="signup-confirmPassword"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter password"
            autoComplete="new-password"
          />
        </div>

        <p className="hint">{passwordHint}</p>

        <button className="button block" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <footer className="auth-footer">
        <span>Already have an account?</span>
        <Link to="/login">Login</Link>
      </footer>
    </div>
  );
}