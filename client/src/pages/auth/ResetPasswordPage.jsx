import { useState } from "react";
import { Link } from "react-router-dom";
import {
  confirmPasswordReset,
  isValidEmail,
  isValidPassword,
  passwordHint,
  requestPasswordReset
} from "../../services/authApi.js";

export default function ResetPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [confirmForm, setConfirmForm] = useState({ otp: "", newPassword: "", confirmPassword: "" });
  const [feedback, setFeedback] = useState(null);
  const [devOtp, setDevOtp] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleConfirmChange = (e) => {
    const { name, value } = e.target;
    setConfirmForm((c) => ({ ...c, [name]: value }));
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email.trim())) {
      setFeedback({ type: "error", text: "Enter a valid email address." });
      return;
    }
    setIsSending(true);
    setFeedback(null);
    try {
      const response = await requestPasswordReset({ email: email.trim() });
      setDevOtp(response.devOtp || "");
      setFeedback({ type: "success", text: response.message || "OTP sent to your email." });
      setStep(2);
    } catch (error) {
      setFeedback({ type: "error", text: error.message || "Could not send OTP." });
    } finally {
      setIsSending(false);
    }
  };

  const handleConfirmSubmit = async (e) => {
    e.preventDefault();
    if (!confirmForm.otp.trim()) {
      setFeedback({ type: "error", text: "Enter the OTP code." });
      return;
    }
    if (!isValidPassword(confirmForm.newPassword)) {
      setFeedback({ type: "error", text: passwordHint });
      return;
    }
    if (confirmForm.newPassword !== confirmForm.confirmPassword) {
      setFeedback({ type: "error", text: "Passwords do not match." });
      return;
    }
    setIsResetting(true);
    setFeedback(null);
    try {
      const response = await confirmPasswordReset({
        email: email.trim(),
        otp: confirmForm.otp.trim(),
        newPassword: confirmForm.newPassword
      });
      setFeedback({ type: "success", text: response.message || "Password updated successfully." });
      setDevOtp("");
      setStep(1);
      setEmail("");
      setConfirmForm({ otp: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setFeedback({ type: "error", text: error.message || "Could not reset password." });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-brand">
        <div className="logo-mark">IMS</div>
        <span className="brand-name">CoreInventory</span>
      </div>

      <h1 className="auth-title">Reset Password</h1>

      <div className="stepper">
        <div className={`step ${step === 1 ? "active" : "done"}`}>
          <span className="step-dot">{step > 1 ? "✓" : "1"}</span>
          <span className="step-label">Email</span>
        </div>
        <div className={`step-connector${step > 1 ? " done" : ""}`} />
        <div className={`step ${step === 2 ? "active" : ""}`}>
          <span className="step-dot">2</span>
          <span className="step-label">Reset</span>
        </div>
      </div>

      {feedback && (
        <div className={`feedback ${feedback.type}`} style={{ marginBottom: "16px" }}>
          {feedback.text}
        </div>
      )}

      {step === 1 && (
        <form className="form" onSubmit={handleRequestSubmit}>
          <div className="field">
            <label htmlFor="req-email">Email address</label>
            <input
              id="req-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Registered email address"
              autoComplete="email"
              autoFocus
            />
          </div>
          <button className="button block" type="submit" disabled={isSending}>
            {isSending ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form className="form" onSubmit={handleConfirmSubmit}>
          {devOtp && (
            <div className="feedback success">
              Dev OTP: <strong>{devOtp}</strong>
            </div>
          )}
          <div className="field">
            <label htmlFor="confirm-otp">OTP Code</label>
            <input
              id="confirm-otp"
              name="otp"
              value={confirmForm.otp}
              onChange={handleConfirmChange}
              placeholder="6-digit code from email"
              inputMode="numeric"
              autoFocus
            />
          </div>
          <div className="field">
            <label htmlFor="confirm-newPassword">New Password</label>
            <input
              id="confirm-newPassword"
              name="newPassword"
              type="password"
              value={confirmForm.newPassword}
              onChange={handleConfirmChange}
              placeholder="Create new password"
              autoComplete="new-password"
            />
          </div>
          <div className="field">
            <label htmlFor="confirm-confirmPassword">Confirm Password</label>
            <input
              id="confirm-confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmForm.confirmPassword}
              onChange={handleConfirmChange}
              placeholder="Re-enter new password"
              autoComplete="new-password"
            />
          </div>
          <p className="hint">{passwordHint}</p>
          <button className="button block" type="submit" disabled={isResetting}>
            {isResetting ? "Updating..." : "Reset Password"}
          </button>
          <button
            type="button"
            className="ghost-button block"
            onClick={() => { setStep(1); setFeedback(null); }}
          >
            Back
          </button>
        </form>
      )}

      <footer className="auth-footer">
        <Link to="/login">Back to login</Link>
      </footer>
    </div>
  );
}