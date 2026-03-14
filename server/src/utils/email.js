import nodemailer from "nodemailer";

const getSmtpConfig = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  return {
    host,
    port,
    secure,
    user,
    pass
  };
};

const createTransporter = () => {
  const { host, port, secure, user, pass } = getSmtpConfig();

  if (!host || !user || !pass) {
    throw new Error("SMTP configuration is incomplete");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    }
  });
};

export const isEmailConfigured = () => {
  const { host, user, pass } = getSmtpConfig();
  return Boolean(host && user && pass);
};

export const sendResetOtpEmail = async ({ to, otp, name }) => {
  const from = process.env.SMTP_FROM || "IMS <no-reply@example.com>";
  const transporter = createTransporter();
  const subject = "Your IMS password reset code";
  const safeName = name ? `Hi ${name},` : "Hi,";
  const text = `${safeName}\n\nUse this one-time code to reset your IMS password: ${otp}.\nThis code expires soon. If you did not request this, you can ignore this email.\n\n- IMS Team`;

  await transporter.sendMail({
    from,
    to,
    subject,
    text
  });
};
