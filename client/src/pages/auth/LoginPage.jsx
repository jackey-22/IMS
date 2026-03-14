import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { loginUser } from "../../services/authApi.js";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [form, setForm] = useState({ loginId: "", password: "" });
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((c) => ({ ...c, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.loginId.trim() || !form.password) {
      setFeedback({ type: "error", text: "Enter Login ID and Password." });
      return;
    }
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const session = await loginUser({ loginId: form.loginId.trim(), password: form.password });
      const target =
        session.user?.role === "warehouse_staff"
          ? "/warehouse/dashboard"
          : session.user?.role === "admin"
            ? "/admin/dashboard"
            : "/dashboard";
      setSession(session);
      navigate(target, { replace: true });
    } catch (error) {
      setFeedback({ type: "error", text: error.message || "Login failed." });
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

      <h1 className="auth-title">Welcome back</h1>

      <form className="form" onSubmit={handleSubmit}>
        {feedback && <div className={`feedback ${feedback.type}`}>{feedback.text}</div>}

        <div className="field">
          <label htmlFor="loginId">Login ID</label>
          <input
            id="loginId"
            name="loginId"
            value={form.loginId}
            onChange={handleChange}
            placeholder="Enter your login ID"
            autoComplete="username"
            autoFocus
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </div>

        <button className="button block" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Checking..." : "Login"}
        </button>
      </form>

      <footer className="auth-footer">
        <Link to="/reset-password">Forgot password?</Link>
        <span className="auth-divider">·</span>
        <Link to="/signup">Create account</Link>
      </footer>
    </div>
  );
}