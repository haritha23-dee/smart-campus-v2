const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/studentController");
const { getMe, updateMyProfile, changePassword } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");
const { uploadResource, uploadPhoto } = require("../middleware/upload");
const { ROLES } = require("../config/constants");

router.use(protect, authorize(ROLES.STUDENT));

// Profile management (own dashboard's namespace)
router.get("/profile", getMe);
router.put("/profile", uploadPhoto.single("photo"), updateMyProfile);
router.put("/profile/change-password", changePassword);

// Department / classroom
router.get("/departments", ctrl.listDepartments);
router.get("/departments/:deptId/classrooms", ctrl.listClassrooms);
router.post("/classrooms/:id/join", ctrl.joinClassroom);
router.get("/classrooms/joined", ctrl.myClassrooms);
router.get("/classrooms/:id", ctrl.getClassroom);
router.get("/classrooms/:id/subjects/:subject/resources", ctrl.getSubjectResources);
router.post(
  "/classrooms/:id/subjects/:subject/notes",
  uploadResource.single("file"),
  ctrl.postNotes
);

// Library
router.get("/library/sections", ctrl.listLibrarySections);
router.get("/library/sections/:section/books", ctrl.listBooksInSection);
router.post("/library/books/:id/request", ctrl.requestBook);

// Lab equipment
router.get("/lab/departments/:deptId/sections", ctrl.listLabSections);
router.get("/lab/departments/:deptId/sections/:section/equipment", ctrl.listEquipmentInSection);
router.post("/lab/equipment/:id/request", ctrl.requestEquipment);

// History
router.get("/history", ctrl.getHistory);

module.exports = router;
