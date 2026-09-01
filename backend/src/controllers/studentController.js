const asyncHandler = require("express-async-handler");
const Department = require("../models/Department");
const Classroom = require("../models/Classroom");
const Resource = require("../models/Resource");
const Book = require("../models/Book");
const LabEquipment = require("../models/LabEquipment");
const BookRequest = require("../models/BookRequest");
const EquipmentRequest = require("../models/EquipmentRequest");
const { User } = require("../models/User");
const { notify, notifyMany } = require("../utils/notify");
const { REQUEST_STATUS, RESOURCE_TYPES, NOTIFICATION_TYPES, ROLES } = require("../config/constants");

//HOME/DEPARTMENT 

const listDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find().sort({ name: 1 });
  res.json({
    success: true,
    myDepartment: req.user.department,
    departments,
  });
});
const listClassrooms = asyncHandler(async (req, res) => {
  const classrooms = await Classroom.find({ department: req.params.deptId })
    .populate("createdBy", "name email")
    .select("code year section facultySubjects students createdBy")
    .sort({ year: 1, section: 1 });
  res.json({
    success: true,
    canJoin: String(req.params.deptId) === String(req.user.department),
    count: classrooms.length,
    classrooms: classrooms.map((c) => ({
      _id: c._id,
      code: c.code,
      year: c.year,
      section: c.section,
      createdBy: c.createdBy,
      studentCount: c.students.length,
      subjects: c.facultySubjects.map((fs) => fs.subject),
    })),
  });
});
const joinClassroom = asyncHandler(async (req, res) => {
  const classroom = await Classroom.findById(req.params.id);
  if (!classroom) {
    res.status(404);
    throw new Error("Classroom not found.");
  }
  if (String(classroom.department) !== String(req.user.department)) {
    res.status(403);
    throw new Error("You can only join classrooms in your own department.");
  }
  if (classroom.students.some((s) => String(s) === String(req.user._id))) {
    return res.json({ success: true, message: "Already joined.", classroom });
  }
  classroom.students.push(req.user._id);
  await classroom.save();
  const facultyIds = [...new Set(classroom.facultySubjects.map((fs) => String(fs.faculty)))];
  if (facultyIds.length) {
    await notifyMany(facultyIds, {
      type: NOTIFICATION_TYPES.STUDENT_JOINED_CLASSROOM,
      title: "New student joined your classroom",
      message: `${req.user.name} joined classroom ${classroom.code}.`,
      meta: { classroomId: classroom._id, studentId: req.user._id },
    });
  }
  res.json({ success: true, message: "Joined classroom.", classroom });
});
const myClassrooms = asyncHandler(async (req, res) => {
  const classrooms = await Classroom.find({ students: req.user._id })
    .populate("facultySubjects.faculty", "name email photo designation")
    .populate("department", "name code");
  res.json({ success: true, count: classrooms.length, classrooms });
});
const getClassroom = asyncHandler(async (req, res) => {
  const classroom = await Classroom.findById(req.params.id)
    .populate("facultySubjects.faculty", "name email photo designation")
    .populate("department", "name code");
  if (!classroom) {
    res.status(404);
    throw new Error("Classroom not found.");
  }
  res.json({ success: true, classroom });
});
const getSubjectResources = asyncHandler(async (req, res) => {
  const { id, subject } = req.params;
  const resources = await Resource.find({ classroom: id, subject })
    .populate("postedBy", "name email photo designation role")
    .sort({ createdAt: -1 });
  res.json({ success: true, count: resources.length, resources });
});
const postNotes = asyncHandler(async (req, res) => {
  const { id, subject } = req.params;
  const { title, description } = req.body;

  const classroom = await Classroom.findById(id);
  if (!classroom) {
    res.status(404);
    throw new Error("Classroom not found.");
  }
  if (!classroom.students.some((s) => String(s) === String(req.user._id))) {
    res.status(403);
    throw new Error("Join this classroom before posting notes.");
  }
  if (!req.file) {
    res.status(400);
    throw new Error("A file upload is required to post notes.");
  }
  const resource = await Resource.create({
    classroom: id,
    subject,
    type: RESOURCE_TYPES.NOTES,
    title,
    description,
    filePath: `/uploads/resources/${req.file.filename}`,
    postedBy: req.user._id,
    postedByRole: ROLES.STUDENT,
  });
  const facultyIds = classroom.facultySubjects.filter((fs) => fs.subject === subject).map((fs) => fs.faculty);
  const classmateIds = classroom.students.filter((s) => String(s) !== String(req.user._id));
  await notifyMany([...facultyIds, ...classmateIds], {
    type: NOTIFICATION_TYPES.NEW_RESOURCE,
    title: "New notes posted",
    message: `${req.user.name} posted notes for ${subject} in ${classroom.code}.`,
    meta: { classroomId: classroom._id, resourceId: resource._id },
  });
  res.status(201).json({ success: true, resource });
});

//LIBRARY

const listLibrarySections = asyncHandler(async (req, res) => {
  const sections = await Book.distinct("section");
  res.json({ success: true, sections });
});
const listBooksInSection = asyncHandler(async (req, res) => {
  const books = await Book.find({ section: req.params.section }).sort({ title: 1 });
  res.json({ success: true, count: books.length, books });
});
const requestBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    res.status(404);
    throw new Error("Book not found.");
  }
  if (book.availableCopies < 1) {
    res.status(409);
    throw new Error("No copies currently available.");
  }
  const existing = await BookRequest.findOne({
    student: req.user._id,
    book: book._id,
    status: { $in: [REQUEST_STATUS.PENDING, REQUEST_STATUS.APPROVED] },
  });
  if (existing) {
    res.status(409);
    throw new Error("You already have a pending or active request for this book.");
  }
  const request = await BookRequest.create({ student: req.user._id, book: book._id });
  const libraryStaff = await User.find({ role: ROLES.LIBRARY_STAFF, isActive: true }).select("_id");
  await notifyMany(
    libraryStaff.map((s) => s._id),
    {
      type: NOTIFICATION_TYPES.NEW_BOOK_REQUEST,
      title: "New book request",
      message: `${req.user.name} requested "${book.title}".`,
      meta: { requestId: request._id, bookId: book._id },
    }
  );
  res.status(201).json({ success: true, request });
});

//LAB EQUIPMENT

const listLabSections = asyncHandler(async (req, res) => {
  const sections = await LabEquipment.distinct("section", { department: req.params.deptId });
  res.json({ success: true, sections });
});
const listEquipmentInSection = asyncHandler(async (req, res) => {
  const equipment = await LabEquipment.find({
    department: req.params.deptId,
    section: req.params.section,
  }).sort({ name: 1 });
  res.json({ success: true, count: equipment.length, equipment });
});
const requestEquipment = asyncHandler(async (req, res) => {
  const equipment = await LabEquipment.findById(req.params.id);
  if (!equipment) {
    res.status(404);
    throw new Error("Equipment not found.");
  }
  if (equipment.availableUnits < 1) {
    res.status(409);
    throw new Error("No units currently available.");
  }
  const existing = await EquipmentRequest.findOne({
    student: req.user._id,
    equipment: equipment._id,
    status: { $in: [REQUEST_STATUS.PENDING, REQUEST_STATUS.APPROVED] },
  });
  if (existing) {
    res.status(409);
    throw new Error("You already have a pending or active request for this equipment.");
  }
  const request = await EquipmentRequest.create({ student: req.user._id, equipment: equipment._id });
  const labStaff = await User.find({
    role: ROLES.LAB_STAFF,
    department: equipment.department,
    isActive: true,
  }).select("_id");
  await notifyMany(
    labStaff.map((s) => s._id),
    {
      type: NOTIFICATION_TYPES.NEW_EQUIPMENT_REQUEST,
      title: "New equipment request",
      message: `${req.user.name} requested "${equipment.name}".`,
      meta: { requestId: request._id, equipmentId: equipment._id },
    }
  );
  res.status(201).json({ success: true, request });
});

//HISTORY

const getHistory = asyncHandler(async (req, res) => {
  const [bookHistory, equipmentHistory, postedResources] = await Promise.all([
    BookRequest.find({ student: req.user._id }).populate("book", "title author").sort({ createdAt: -1 }),
    EquipmentRequest.find({ student: req.user._id }).populate("equipment", "name").sort({ createdAt: -1 }),
    Resource.find({ postedBy: req.user._id }).populate("classroom", "code").sort({ createdAt: -1 }),
  ]);
  res.json({ success: true, bookHistory, equipmentHistory, postedResources });
});
module.exports = {
  listDepartments,
  listClassrooms,
  joinClassroom,
  myClassrooms,
  getClassroom,
  getSubjectResources,
  postNotes,
  listLibrarySections,
  listBooksInSection,
  requestBook,
  listLabSections,
  listEquipmentInSection,
  requestEquipment,
  getHistory,
};
