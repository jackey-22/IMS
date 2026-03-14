import mongoose from "mongoose";

const passwordResetOtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    otpHash: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: 0
    },
    used: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

passwordResetOtpSchema.index({ email: 1, createdAt: -1 });

export default mongoose.model("PasswordResetOtp", passwordResetOtpSchema);
