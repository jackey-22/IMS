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
  const [requestForm, setRequestForm] = useState({ email: "" });
  const [confirmForm, setConfirmForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [feedback, setFeedback] = useState(null);
  const [devOtp, setDevOtp] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleRequestChange = (event) => {
    const { name, value } = event.target;
    setRequestForm((current) => ({ ...current, [name]: value }));
  };

  const handleConfirmChange = (event) => {
    const { name, value } = event.target;
    setConfirmForm((current) => ({ ...current, [name]: value }));
  };

  const handleRequestSubmit = async (event) => {
    event.preventDefault();

    if (!isValidEmail(requestForm.email.trim())) {
      setFeedback({ type: "error", text: "Enter a valid Email ID." });
      return;
    }

    setIsSending(true);
    setFeedback(null);

    try {
      const response = await requestPasswordReset({ email: requestForm.email.trim() });
      setDevOtp(response.devOtp || "");
      setConfirmForm((current) => ({ ...current, email: requestForm.email.trim() }));
      setFeedback({ type: "success", text: response.message || "OTP sent successfully." });
    } catch (error) {
      setFeedback({ type: "error", text: error.message || "Could not send OTP." });
    } finally {
      setIsSending(false);
    }
  };

  const handleConfirmSubmit = async (event) => {
    event.preventDefault();

    if (!isValidEmail(confirmForm.email.trim())) {
      setFeedback({ type: "error", text: "Enter a valid Email ID." });
      return;
    }

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
        email: confirmForm.email.trim(),
        otp: confirmForm.otp.trim(),
        newPassword: confirmForm.newPassword
      });

      setDevOtp("");
      setRequestForm({ email: "" });
      setConfirmForm({ email: "", otp: "", newPassword: "", confirmPassword: "" });
      setFeedback({ type: "success", text: response.message || "Password updated successfully." });
    } catch (error) {
      setFeedback({ type: "error", text: error.message || "Could not reset password." });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <section className="split-form">
      {feedback ? <div className={`feedback ${feedback.type} split-feedback`}>{feedback.text}</div> : null}

      <form className="form-card form" onSubmit={handleRequestSubmit}>
        <header className="page-header">
          <h2 className="page-title">Send OTP</h2>
        </header>

        <div className="field">
          <label htmlFor="request-email">Email ID</label>
          <input
            id="request-email"
            name="email"
            type="email"
            value={requestForm.email}
            onChange={handleRequestChange}
            placeholder="Registered email"
            autoComplete="email"
          />
        </div>

        <button className="ghost-button block" type="submit" disabled={isSending}>
          {isSending ? "Sending..." : "Send OTP"}
        </button>
      </form>

      <form className="form-card form" onSubmit={handleConfirmSubmit}>
        <header className="page-header">
          <h2 className="page-title">Reset Password</h2>
        </header>

        <div className="field">
          <label htmlFor="confirm-email">Email ID</label>
          <input
            id="confirm-email"
            name="email"
            type="email"
            value={confirmForm.email}
            onChange={handleConfirmChange}
            placeholder="Registered email"
            autoComplete="email"
          />
        </div>

        <div className="field">
          <label htmlFor="confirm-otp">OTP</label>
          <input
            id="confirm-otp"
            name="otp"
            value={confirmForm.otp}
            onChange={handleConfirmChange}
            placeholder="6-digit code"
            inputMode="numeric"
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
            placeholder="New password"
            autoComplete="new-password"
          />
        </div>

        <div className="field">
          <label htmlFor="confirm-confirmPassword">Re-enter Password</label>
          <input
            id="confirm-confirmPassword"
            name="confirmPassword"
            type="password"
            value={confirmForm.confirmPassword}
            onChange={handleConfirmChange}
            placeholder="Confirm password"
            autoComplete="new-password"
          />
        </div>

        <p className="hint">{passwordHint}</p>
        {devOtp ? <div className="feedback success">Development OTP: {devOtp}</div> : null}

        <button className="button block" type="submit" disabled={isResetting}>
          {isResetting ? "Updating..." : "Reset Password"}
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