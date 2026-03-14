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
    loginId: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isValidLoginId(form.loginId.trim())) {
      setFeedback({ type: "error", text: "Login ID must be 6 to 12 characters." });
      return;
    }

    if (!isValidEmail(form.email.trim())) {
      setFeedback({ type: "error", text: "Enter a valid Email ID." });
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
    <section className="form-card">
      <header className="page-header">
        <h2 className="page-title">Sign Up</h2>
      </header>

      <form className="form" onSubmit={handleSubmit}>
        {feedback ? <div className={`feedback ${feedback.type}`}>{feedback.text}</div> : null}

        <div className="field">
          <label htmlFor="signup-loginId">Login ID</label>
          <input
            id="signup-loginId"
            name="loginId"
            value={form.loginId}
            onChange={handleChange}
            placeholder="6-12 characters"
            autoComplete="username"
          />
        </div>

        <div className="field">
          <label htmlFor="signup-email">Email ID</label>
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
            placeholder="Create password"
            autoComplete="new-password"
          />
        </div>

        <div className="field">
          <label htmlFor="signup-confirmPassword">Re-enter Password</label>
          <input
            id="signup-confirmPassword"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm password"
            autoComplete="new-password"
          />
        </div>

        <p className="hint">{passwordHint}</p>

        <button className="button block" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Sign Up"}
        </button>

        <div className="link-row">
          <Link className="text-button" to="/login">
            Back to login
          </Link>
        </div>
      </form>
    </section>
  );
}