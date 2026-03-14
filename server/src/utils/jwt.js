import jwt from "jsonwebtoken";

export const signToken = (user) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }

  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role
    },
    secret,
    {
      expiresIn: "7d"
    }
  );
};

export const sanitizeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  loginId: user.loginId,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt
});
