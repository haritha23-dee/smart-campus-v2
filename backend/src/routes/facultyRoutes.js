const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/facultyController");
const { getMe, updateMyProfile, changePassword } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");
const { uploadResource, uploadPhoto } = require("../middleware/upload");
const { ROLES } = require("../config/constants");

router.use(protect, authorize(ROLES.FACULTY));

// Profile management
router.get("/profile", getMe);
router.put("/profile", uploadPhoto.single("photo"), updateMyProfile);
router.put("/profile/change-password", changePassword);
router.get("/classrooms", ctrl.listDepartmentClassrooms);
router.get("/classrooms/mine", ctrl.myClassrooms);
router.post("/classrooms", ctrl.createClassroom);
router.post("/classrooms/:id/join", ctrl.joinClassroom);
router.get("/classrooms/:id", ctrl.getClassroom);
router.post("/classrooms/:id/resources", uploadResource.single("file"), ctrl.postResource);
router.get("/resources/mine", ctrl.myResources);
module.exports = router;
