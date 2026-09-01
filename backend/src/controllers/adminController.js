const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const { User, Student, Faculty, LibraryStaff, LabStaff } = require("../models/User");
const Department = require("../models/Department");
const Classroom = require("../models/Classroom");
const Resource = require("../models/Resource");
const BookRequest = require("../models/BookRequest");
const EquipmentRequest = require("../models/EquipmentRequest");
const AuditLog = require("../models/AuditLog");
const { ROLES, STAFF_ROLES } = require("../config/constants");

const logAction = (action, performedBy, targetType, targetId, details = {}) =>
  AuditLog.create({ action, performedBy, targetType, targetId, details });

//USER MANAGEMENT 
const listUsers = asyncHandler(async (req, res) => {
  const { role, search } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  const users = await User.find(filter).populate("department").sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, users: users.map((u) => u.toSafeJSON()) });
});
const createUser = asyncHandler(async (req, res) => {
  const { role, name, email, password, department, year, batch, designation, staffRole } = req.body;

  if (!role || !name || !email || !password) {
    res.status(400);
    throw new Error("role, name, email and password are required.");
  }
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(409);
    throw new Error("A user with this email already exists.");
  }
  let user;
  const base = { name, email: email.toLowerCase(), password };
  switch (role) {
    case ROLES.STUDENT: {
      if (!department) {
        res.status(400);
        throw new Error("department is required for a student account.");
      }
      user = await Student.create({ ...base, department, year, batch, studentId: `STU-${crypto.randomInt(100000, 999999)}` });
      break;
    }
    case ROLES.FACULTY: {
      if (!department) {
        res.status(400);
        throw new Error("department is required for a faculty account.");
      }
      user = await Faculty.create({ ...base, department, designation });
      break;
    }
    case ROLES.LIBRARY_STAFF: {
      user = await LibraryStaff.create({ ...base, staffId: `LIB-${crypto.randomInt(100000, 999999)}` });
      break;
    }
    case ROLES.LAB_STAFF: {
      if (!department) {
        res.status(400);
        throw new Error("department is required for a lab staff account.");
      }
      user = await LabStaff.create({ ...base, department, staffId: `LAB-${crypto.randomInt(100000, 999999)}` });
      break;
    }
    default:
      res.status(400);
      throw new Error(`Unsupported role '${role}'. Use one of: student, faculty, library_staff, lab_staff.`);
  }
  await logAction("ACCOUNT_CREATED", req.user._id, "User", user._id, { role, email: user.email });
  res.status(201).json({ success: true, user: user.toSafeJSON() });
});
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate("department");
  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }
  res.json({ success: true, user: user.toSafeJSON() });
});
const disableUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }
  user.isActive = false;
  await user.save();
  await logAction("ACCOUNT_DISABLED", req.user._id, "User", user._id);
  res.json({ success: true, message: "Account disabled.", user: user.toSafeJSON() });
});
const enableUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }
  user.isActive = true;
  await user.save();
  await logAction("ACCOUNT_ENABLED", req.user._id, "User", user._id);
  res.json({ success: true, message: "Account re-enabled.", user: user.toSafeJSON() });
});
const resetPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    res.status(400);
    throw new Error("newPassword must be at least 6 characters.");
  }
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }
  user.password = newPassword;
  await user.save();
  await logAction("PASSWORD_RESET", req.user._id, "User", user._id);
  res.json({ success: true, message: "Password reset successfully." });
});
const canDeleteUser = async (userId) => {
  const [inClassroom, activeBook, activeEquip] = await Promise.all([
    Classroom.exists({ $or: [{ students: userId }, { "facultySubjects.faculty": userId }, { createdBy: userId }] }),
    BookRequest.exists({ student: userId, status: { $in: ["pending", "approved"] } }),
    EquipmentRequest.exists({ student: userId, status: { $in: ["pending", "approved"] } }),
  ]);
  return !inClassroom && !activeBook && !activeEquip;
};

//DEPARTMENT SETUP 

const listDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find().sort({ name: 1 });
  const withCounts = await Promise.all(
    departments.map(async (dept) => {
      const [classroomCount, facultyCount, studentCount] = await Promise.all([
        Classroom.countDocuments({ department: dept._id }),
        User.countDocuments({ role: ROLES.FACULTY, department: dept._id }),
        User.countDocuments({ role: ROLES.STUDENT, department: dept._id }),
      ]);
      return { ...dept.toObject(), classroomCount, facultyCount, studentCount };
    })
  );
  res.json({ success: true, count: withCounts.length, departments: withCounts });
});
const createDepartment = asyncHandler(async (req, res) => {
  const { name, code } = req.body;
  if (!name || !code) {
    res.status(400);
    throw new Error("name and code are required.");
  }
  const department = await Department.create({ name, code: code.toUpperCase() });
  await logAction("DEPARTMENT_ADDED", req.user._id, "Department", department._id, { name, code });
  res.status(201).json({ success: true, department });
});
const getDepartmentClassrooms = asyncHandler(async (req, res) => {
  const classrooms = await Classroom.find({ department: req.params.id })
    .populate("createdBy", "name email")
    .populate("facultySubjects.faculty", "name email")
    .sort({ year: 1, section: 1 });
  res.json({ success: true, count: classrooms.length, classrooms });
});
const deleteDepartment = asyncHandler(async (req, res) => {
  const deptId = req.params.id;
  const [hasClassrooms, hasUsers] = await Promise.all([
    Classroom.exists({ department: deptId }),
    User.exists({ department: deptId }),
  ]);
  if (hasClassrooms || hasUsers) {
    res.status(409);
    throw new Error("Cannot delete a department with active users or classrooms assigned.");
  }
  const department = await Department.findByIdAndDelete(deptId);
  if (!department) {
    res.status(404);
    throw new Error("Department not found.");
  }
  await logAction("DEPARTMENT_DELETED", req.user._id, "Department", deptId);
  res.json({ success: true, message: "Department deleted." });
});

//USAGE ANALYTICS

const getAnalytics = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalClassrooms,
    totalResources,
    activeLibraryBookings,
    activeLabBookings,
    overdueBooks,
    overdueEquipment,
    studentsCount,
    facultyCount,
  ] = await Promise.all([
    User.countDocuments(),
    Classroom.countDocuments(),
    Resource.countDocuments(),
    BookRequest.countDocuments({ status: "approved" }),
    EquipmentRequest.countDocuments({ status: "approved" }),
    BookRequest.countDocuments({ status: "overdue" }),
    EquipmentRequest.countDocuments({ status: "overdue" }),
    User.countDocuments({ role: ROLES.STUDENT }),
    User.countDocuments({ role: ROLES.FACULTY }),
  ]);
  const bookingStatusBreakdown = await Promise.all(
    ["pending", "approved", "rejected", "returned", "overdue"].map(async (status) => ({
      status,
      library: await BookRequest.countDocuments({ status }),
      lab: await EquipmentRequest.countDocuments({ status }),
    }))
  );
  const classroomBreakdown = await Classroom.find()
    .select("code year section facultySubjects students")
    .lean()
    .then((rows) =>
      rows.map((c) => ({
        code: c.code,
        year: c.year,
        section: c.section,
        facultyCount: new Set(c.facultySubjects.map((f) => String(f.faculty))).size,
        studentCount: c.students.length,
      }))
    );
  const resourceActivity = await Resource.aggregate([
    { $match: { postedByRole: ROLES.FACULTY } },
    { $group: { _id: "$postedBy", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 },
    {
      $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "faculty" },
    },
    { $unwind: "$faculty" },
    { $project: { count: 1, name: "$faculty.name", email: "$faculty.email" } },
  ]);
  const enrollmentByDept = await User.aggregate([
    { $match: { role: ROLES.STUDENT } },
    { $group: { _id: "$department", count: { $sum: 1 } } },
    { $lookup: { from: "departments", localField: "_id", foreignField: "_id", as: "dept" } },
    { $unwind: { path: "$dept", preserveNullAndEmptyArrays: true } },
    { $project: { count: 1, department: "$dept.name" } },
  ]);
  res.json({
    success: true,
    summary: {
      totalUsers,
      totalStudents: studentsCount,
      totalFaculty: facultyCount,
      totalClassrooms,
      totalResourcesPosted: totalResources,
      activeLibraryBookings,
      activeLabBookings,
      overdueItemsCount: overdueBooks + overdueEquipment,
    },
    bookingStatusBreakdown,
    classroomBreakdown,
    resourceActivityByFaculty: resourceActivity,
    enrollmentByDepartment: enrollmentByDept,
  });
});
const getAuditLog = asyncHandler(async (req, res) => {
  const logs = await AuditLog.find().populate("performedBy", "name email role").sort({ createdAt: -1 }).limit(200);
  res.json({ success: true, count: logs.length, logs });
});
module.exports = {
  listUsers,
  createUser,
  getUser,
  disableUser,
  enableUser,
  resetPassword,
  canDeleteUser,
  listDepartments,
  createDepartment,
  getDepartmentClassrooms,
  deleteDepartment,
  getAnalytics,
  getAuditLog,
};
