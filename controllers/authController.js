import cookie from "cookie";
import User from "../models/User";
import { getOrDie, sendEmail } from "./helpers";
import AuthError from "../errors/AuthError";

const signUp = async (req, res) => {
  const { email, password, passwordAgain } = await getOrDie(
    req.body, "email", "password", "passwordAgain"
  );
  const base = process.env.NODE_ENV === "prod" ? process.env.HOST : `localhost:${process.env.PORT}`;
  const user = await User.create({ email, password, passwordAgain }).catch((err) => {
    if (err.code === 11000) throw new AuthError("There's already an account with that email!", 400);
  });
  const token = await user.getToken("7d");
  const message = `
    <h3>Anki Account Activation</h3>
    <p>Click <a href="http://${base}/anki/v1/activate/${token}">here</a> to activate account.</p>
    <p>Activation window will expire in 7 days.</p>
  `;
  const info = await sendEmail(email, "Activate Anki Account", message);
  return res.status(200).json({ status: "pass", message: "Email sent.", info });
};

const activate = async (req, res) => {
  const { token } = await getOrDie(req.params, "token");
  let user = await User.fromToken(token);
  if (!user) throw new AuthError("Token invalid or expired!");
  user = await User.findByIdAndUpdate(user._id, { activated: true });
  const url = process.env.NODE_ENV === "prod" ? process.env.URL_PROD : process.env.URL_DEV;
  return res.redirect(301, url);
};

const signIn = async (req, res) => {
  const { email, password } = await getOrDie(req.body, "email", "password");
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new AuthError("Invalid credentials!");
  if (!user.activated) throw new AuthError("Account not activated! Check your email.");
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) throw new AuthError("Invalid credentials!");
  const token = await user.getToken();
  const cookieOptions = {
    maxAge: parseInt(process.env.COOKIE_MAX_AGE || "3600", 10), // 1h expiration by default
    httpOnly: true,
    sameSite: "strict"
  };
  if (process.env.NODE_ENV === "prod") cookieOptions.secure = true;
  res.setHeader("Set-Cookie", cookie.serialize("token", token, cookieOptions));
  return res.status(200).json({ status: "pass", message: "Signed in.", userId: user._id });
};

const signOut = async (req, res) => {
  const cookieOptions = {
    sameSite: "strict"
  };
  res.setHeader("Set-Cookie", cookie.serialize("token", "", cookieOptions));
  return res.status(200).json({ status: "pass", message: "Signed out." });
};

export { signUp, activate, signIn, signOut };
