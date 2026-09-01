const asyncHandler = require("express-async-handler");
const { User } = require("../models/User");
const generateToken = require("../utils/generateToken");
const { ROLES } = require("../config/constants");

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required.");
  }
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password").populate("department");
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password.");
  }
  if (!user.isActive) {
    res.status(403);
    throw new Error("Your account has been disabled. Please contact admin.");
  }
  res.json({
    success: true,
    token: generateToken(user),
    user: user.toSafeJSON(),
  });
});
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("department");
  res.json({ success: true, user: user.toSafeJSON() });
});
const updateMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const commonEditable = ["name", "yearJoined"];
  commonEditable.forEach((field) => {
    if (req.body[field] !== undefined) user[field] = req.body[field];
  });
  if (user.role === ROLES.FACULTY) {
    if (req.body.designation !== undefined) user.designation = req.body.designation;
    if (req.body.subjectsCanTeach !== undefined) {
      user.subjectsCanTeach = Array.isArray(req.body.subjectsCanTeach)
        ? req.body.subjectsCanTeach
        : String(req.body.subjectsCanTeach)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
    }
  }
  if (req.file) {
    user.photo = `/uploads/photos/${req.file.filename}`;
  }
  await user.save();
  res.json({ success: true, user: user.toSafeJSON() });
});
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("currentPassword and newPassword are required.");
  }
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error("Current password is incorrect.");
  }
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: "Password updated successfully." });
});
module.exports = { login, getMe, updateMyProfile, changePassword };
