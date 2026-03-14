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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.loginId.trim() || !form.password) {
      setFeedback({ type: "error", text: "Enter Login ID and Password." });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const session = await loginUser({
        loginId: form.loginId.trim(),
        password: form.password
      });

      setSession(session);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setFeedback({ type: "error", text: error.message || "Login failed." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="form-card">
      <header className="page-header">
        <h2 className="page-title">Login</h2>
      </header>

      <form className="form" onSubmit={handleSubmit}>
        {feedback ? <div className={`feedback ${feedback.type}`}>{feedback.text}</div> : null}

        <div className="field">
          <label htmlFor="loginId">Login ID</label>
          <input
            id="loginId"
            name="loginId"
            value={form.loginId}
            onChange={handleChange}
            placeholder="Enter login ID"
            autoComplete="username"
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
            placeholder="Enter password"
            autoComplete="current-password"
          />
        </div>

        <button className="button block" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Checking..." : "Login"}
        </button>

        <div className="link-row">
          <Link className="text-button" to="/reset-password">
            Forgot Password?
          </Link>
          <Link className="text-button" to="/signup">
            Create account
          </Link>
        </div>
      </form>
    </section>
  );
}