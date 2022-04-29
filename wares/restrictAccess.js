import cookie from "cookie";
import AuthError from "../errors/AuthError";
import User from "../models/User";

const restrictAccess = () => async (req, res, next) => {
  const { token } = cookie.parse(req.headers.cookie || "");
  if (!token) throw new AuthError("Unauthorized!");
  const isAuth = await User.isAuth(token);
  if (!isAuth) throw new AuthError("Unauthorized!");
  return next();
};

export default restrictAccess;
