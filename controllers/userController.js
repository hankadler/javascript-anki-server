import User from "../models/User";
import { getOrDie } from "./helpers";

const readUser = async (req, res) => {
  const { userId } = req.params;
  if (userId) {
    const user = await User.findById(userId);
    return res.status(200).json({ status: "pass", user });
  }
  const users = await User.find();
  return res.status(200).json({ status: "pass", users });
};

const updateUser = async (req, res) => {
  const { userId } = await getOrDie(req.params, "userId");
  const { email, password, passwordAgain } = req.body;
  let user = await User.findById(userId);
  if (email) user = await User.findByIdAndUpdate(userId, { email });
  if (password) await user.updatePassword(password, passwordAgain);
  return res.status(200).json({ status: "pass", user });
};

const deleteUser = async (req, res) => {
  const { userId } = req.params;
  const response = userId ? await User.deleteOne({ _id: userId }) : await User.deleteMany();
  return res.status(200).json({ status: "pass", response });
};

export { readUser, updateUser, deleteUser };
