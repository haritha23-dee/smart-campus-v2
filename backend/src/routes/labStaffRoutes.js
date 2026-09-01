const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/labStaffController");
const { getMe, updateMyProfile, changePassword } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");
const { uploadPhoto } = require("../middleware/upload");
const { ROLES } = require("../config/constants");

router.use(protect, authorize(ROLES.LAB_STAFF));

// Profile management
router.get("/profile", getMe);
router.put("/profile", uploadPhoto.single("photo"), updateMyProfile);
router.put("/profile/change-password", changePassword);

// Equipment inventory
router.get("/sections", ctrl.listSections);
router.get("/sections/:section/equipment", ctrl.listEquipmentInSection);
router.post("/equipment", ctrl.addEquipment);
router.get("/equipment/:id", ctrl.getEquipment);
router.put("/equipment/:id", ctrl.updateEquipment);
router.delete("/equipment/:id", ctrl.removeEquipment);
router.get("/booked", ctrl.listBooked);
router.get("/overdue", ctrl.listOverdue);

// Booking requests
router.get("/requests", ctrl.listRequests);
router.put("/requests/:id/decision", ctrl.decideRequest);
router.put("/requests/:id/return", ctrl.markReturned);

// Return tracking
router.get("/return-tracking", ctrl.returnTrackingList);

module.exports = router;
