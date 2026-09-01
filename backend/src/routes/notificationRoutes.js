const express = require("express");
const router = express.Router();
const { getMyNotifications, markAsRead, clearAll } = require("../controllers/notificationController");
const { protect } = require("../middleware/auth");

router.use(protect);
router.get("/", getMyNotifications);
router.put("/clear-all", clearAll);
router.put("/:id/read", markAsRead);

module.exports = router;
