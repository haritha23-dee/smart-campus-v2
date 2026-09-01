const asyncHandler = require("express-async-handler");
const Notification = require("../models/Notification");
const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(100);
  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
  res.json({ success: true, unreadCount, notifications });
});
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user._id });
  if (!notification) {
    res.status(404);
    throw new Error("Notification not found.");
  }
  notification.isRead = true;
  await notification.save();
  res.json({ success: true, notification });
});
const clearAll = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { $set: { isRead: true } });
  res.json({ success: true, message: "All notifications marked as read." });
});
module.exports = { getMyNotifications, markAsRead, clearAll };
