import cookie from "cookie";
import User from "../models/User";
import { getOrDie } from "./helpers";
import AuthError from "../errors/AuthError";

const signUp = async (req, res) => {
  const { email, password, passwordAgain } = await getOrDie(
    req.body, "email", "password", "passwordAgain"
  );
  const user = await User.create({ email, password, passwordAgain });
  return res.status(200).json({ message: "pass", user });
};

const signIn = async (req, res) => {
  const { email, password } = await getOrDie(req.body, "email", "password");
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new AuthError("Invalid credentials!");
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) throw new AuthError("Invalid credentials!");
  const token = await user.getToken();
  const cookieOptions = {
    maxAge: parseInt(process.env.COOKIE_MAX_AGE || "3600", 10), // 1h expiration by default
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "prod") cookieOptions.secure = true;
  res.setHeader("Set-Cookie", cookie.serialize("token", token, cookieOptions));
  return res.status(200).json({ status: "pass", message: "Signed in." });
};

const signOut = async (req, res) => {
  res.setHeader("Set-Cookie", cookie.serialize("token", ""));
  return res.status(200).json({ status: "pass", message: "Signed out." });
};

export { signUp, signIn, signOut };
