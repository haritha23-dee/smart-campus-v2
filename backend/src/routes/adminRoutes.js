const express = require("express");
const router = express.Router();
const {
  listUsers,
  createUser,
  getUser,
  disableUser,
  enableUser,
  resetPassword,
  listDepartments,
  createDepartment,
  getDepartmentClassrooms,
  deleteDepartment,
  getAnalytics,
  getAuditLog,
} = require("../controllers/adminController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");
const { ROLES } = require("../config/constants");
router.use(protect, authorize(ROLES.ADMIN));

//User management
router.get("/users", listUsers);
router.post("/users", createUser);
router.get("/users/:id", getUser);
router.put("/users/:id/disable", disableUser);
router.put("/users/:id/enable", enableUser);
router.put("/users/:id/reset-password", resetPassword);

//Department setup
router.get("/departments", listDepartments);
router.post("/departments", createDepartment);
router.get("/departments/:id/classrooms", getDepartmentClassrooms);
router.delete("/departments/:id", deleteDepartment);

//Usage analytics + audit log
router.get("/analytics", getAnalytics);
router.get("/audit-log", getAuditLog);
module.exports = router;
