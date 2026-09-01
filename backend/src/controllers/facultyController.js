const asyncHandler = require("express-async-handler");
const Classroom = require("../models/Classroom");
const Resource = require("../models/Resource");
const { User } = require("../models/User");
const { notify, notifyMany } = require("../utils/notify");
const { RESOURCE_TYPES, RESOURCE_TYPES_BY_POSTER, NOTIFICATION_TYPES, ROLES } = require("../config/constants");

const listDepartmentClassrooms = asyncHandler(async (req, res) => {
  const classrooms = await Classroom.find({ department: req.user.department })
    .populate("facultySubjects.faculty", "name email")
    .sort({ year: 1, section: 1 });

  res.json({
    success: true,
    count: classrooms.length,
    classrooms: classrooms.map((c) => ({
      _id: c._id,
      code: c.code,
      year: c.year,
      section: c.section,
      subjectsTaught: c.facultySubjects.map((fs) => fs.subject),
      facultyCount: new Set(c.facultySubjects.map((fs) => String(fs.faculty._id))).size,
    })),
  });
});
const myClassrooms = asyncHandler(async (req, res) => {
  const classrooms = await Classroom.find({ "facultySubjects.faculty": req.user._id })
    .populate("facultySubjects.faculty", "name email")
    .populate("createdBy", "name");
  res.json({ success: true, count: classrooms.length, classrooms });
});
const joinClassroom = asyncHandler(async (req, res) => {
  const { subject } = req.body;
  if (!subject) {
    res.status(400);
    throw new Error("subject is required.");
  }
  const classroom = await Classroom.findById(req.params.id);
  if (!classroom) {
    res.status(404);
    throw new Error("Classroom not found.");
  }
  if (String(classroom.department) !== String(req.user.department)) {
    res.status(403);
    throw new Error("You can only join classrooms within your own department.");
  }
  const already = classroom.facultySubjects.some(
    (fs) => String(fs.faculty) === String(req.user._id) && fs.subject.toLowerCase() === subject.toLowerCase()
  );
  if (already) {
    res.status(409);
    throw new Error("You are already teaching this subject in this classroom.");
  }
  classroom.facultySubjects.push({ faculty: req.user._id, subject });
  await classroom.save();
  res.json({ success: true, message: "Joined classroom.", classroom });
});
const createClassroom = asyncHandler(async (req, res) => {
  const { year, section, subject } = req.body;
  if (!year || !section || !subject) {
    res.status(400);
    throw new Error("year, section and subject are required.");
  }
  const Department = require("../models/Department");
  const dept = await Department.findById(req.user.department);
  if (!dept) {
    res.status(400);
    throw new Error("Your department could not be resolved.");
  }
  const code = `${dept.code}-${year}-${section}`;
  const existing = await Classroom.findOne({ department: req.user.department, year, section });
  if (existing) {
    res.status(409);
    throw new Error(`Classroom ${code} already exists. Join it instead.`);
  }
  const classroom = await Classroom.create({
    department: req.user.department,
    year,
    section,
    code,
    createdBy: req.user._id,
    facultySubjects: [{ faculty: req.user._id, subject }],
    students: [],
  });
  const admins = await User.find({ role: ROLES.ADMIN, isActive: true }).select("_id");
  await notifyMany(
    admins.map((a) => a._id),
    {
      type: NOTIFICATION_TYPES.CLASSROOM_CREATED,
      title: "New classroom created",
      message: `${req.user.name} created classroom ${code}.`,
      meta: { classroomId: classroom._id },
    }
  );
  res.status(201).json({ success: true, classroom });
});
const getClassroom = asyncHandler(async (req, res) => {
  const classroom = await Classroom.findById(req.params.id)
    .populate("facultySubjects.faculty", "name email photo designation")
    .populate("students", "name email photo studentId year section")
    .populate("createdBy", "name");
  if (!classroom) {
    res.status(404);
    throw new Error("Classroom not found.");
  }
  res.json({ success: true, classroom });
});
const postResource = asyncHandler(async (req, res) => {
  const { subject, type, title, description } = req.body;
  if (!subject || !type || !title) {
    res.status(400);
    throw new Error("subject, type and title are required.");
  }
  if (!RESOURCE_TYPES_BY_POSTER[ROLES.FACULTY].includes(type)) {
    res.status(400);
    throw new Error(`Invalid resource type. Allowed: ${RESOURCE_TYPES_BY_POSTER[ROLES.FACULTY].join(", ")}`);
  }
  if (!req.file) {
    res.status(400);
    throw new Error("A file upload is required.");
  }
  const classroom = await Classroom.findById(req.params.id);
  if (!classroom) {
    res.status(404);
    throw new Error("Classroom not found.");
  }
  const teachesSubject = classroom.facultySubjects.some(
    (fs) => String(fs.faculty) === String(req.user._id) && fs.subject === subject
  );
  if (!teachesSubject) {
    res.status(403);
    throw new Error("You can only post resources for a subject you teach in this classroom.");
  }
  const resource = await Resource.create({
    classroom: classroom._id,
    subject,
    type,
    title,
    description,
    filePath: `/uploads/resources/${req.file.filename}`,
    postedBy: req.user._id,
    postedByRole: ROLES.FACULTY,
  });
  await notifyMany(classroom.students, {
    type: NOTIFICATION_TYPES.NEW_RESOURCE,
    title: "New resource posted",
    message: `${req.user.name} posted "${title}" (${type.replace(/_/g, " ")}) for ${subject}.`,
    meta: { classroomId: classroom._id, resourceId: resource._id },
  });
  res.status(201).json({ success: true, resource });
});
const myResources = asyncHandler(async (req, res) => {
  const { classroom, subject, type, from, to } = req.query;
  const filter = { postedBy: req.user._id };
  if (classroom) filter.classroom = classroom;
  if (subject) filter.subject = subject;
  if (type) filter.type = type;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }
  const resources = await Resource.find(filter).populate("classroom", "code").sort({ createdAt: -1 });
  res.json({ success: true, count: resources.length, resources });
});
module.exports = {
  listDepartmentClassrooms,
  myClassrooms,
  joinClassroom,
  createClassroom,
  getClassroom,
  postResource,
  myResources,
};
