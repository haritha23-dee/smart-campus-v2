const asyncHandler = require("express-async-handler");
const LabEquipment = require("../models/LabEquipment");
const EquipmentRequest = require("../models/EquipmentRequest");
const { notify } = require("../utils/notify");
const { REQUEST_STATUS, NOTIFICATION_TYPES } = require("../config/constants");
const DEFAULT_LOAN_DAYS = 7;

// EQUIPMENT INVENTORY (lab staff's own department)

const listSections = asyncHandler(async (req, res) => {
  const sections = await LabEquipment.distinct("section", { department: req.user.department });
  res.json({ success: true, sections });
});

const listEquipmentInSection = asyncHandler(async (req, res) => {
  const equipment = await LabEquipment.find({
    department: req.user.department,
    section: req.params.section,
  }).sort({ name: 1 });
  res.json({ success: true, count: equipment.length, equipment });
});

const addEquipment = asyncHandler(async (req, res) => {
  const { name, section, description, totalUnits } = req.body;
  if (!name || !section || totalUnits === undefined) {
    res.status(400);
    throw new Error("name, section and totalUnits are required.");
  }

  const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";

  const equipment = await LabEquipment.create({
    name,
    section,
    description,
    imageUrl,
    totalUnits: Number(totalUnits),
    availableUnits: Number(totalUnits),
    department: req.user.department,
    addedBy: req.user._id,
  });
  res.status(201).json({ success: true, equipment });
});

const getEquipment = asyncHandler(async (req, res) => {
  const equipment = await LabEquipment.findOne({ _id: req.params.id, department: req.user.department });
  if (!equipment) {
    res.status(404);
    throw new Error("Equipment not found.");
  }
  res.json({ success: true, equipment });
});

const updateEquipment = asyncHandler(async (req, res) => {
  console.log("UPDATE PAYLOAD:", req.body);
  console.log("UPDATE FILE:", req.file);
  const equipment = await LabEquipment.findOne({ _id: req.params.id, department: req.user.department });
  if (!equipment) {
    res.status(404);
    throw new Error("Equipment not found.");
  }
  const { name, section, description, totalUnits, availableUnits } = req.body;
  if (name !== undefined) equipment.name = name;
  if (section !== undefined) equipment.section = section;
  if (description !== undefined) equipment.description = description;
  if (totalUnits !== undefined) equipment.totalUnits = Number(totalUnits);
  if (availableUnits !== undefined) equipment.availableUnits = Number(availableUnits);
  if (req.file) {
    equipment.imageUrl = `/uploads/${req.file.filename}`;
  }
  await equipment.save();
  res.json({ success: true, equipment });
});

const removeEquipment = asyncHandler(async (req, res) => {
  const activeRequests = await EquipmentRequest.exists({
    equipment: req.params.id,
    status: { $in: [REQUEST_STATUS.PENDING, REQUEST_STATUS.APPROVED] },
  });
  if (activeRequests) {
    res.status(409);
    throw new Error("Cannot remove equipment with pending or active booking requests.");
  }
  const equipment = await LabEquipment.findOneAndDelete({ _id: req.params.id, department: req.user.department });
  if (!equipment) {
    res.status(404);
    throw new Error("Equipment not found.");
  }
  res.json({ success: true, message: "Equipment removed." });
});

const listBooked = asyncHandler(async (req, res) => {
  const equipmentIds = await LabEquipment.find({ department: req.user.department }).distinct("_id");
  const booked = await EquipmentRequest.find({ equipment: { $in: equipmentIds }, status: REQUEST_STATUS.APPROVED })
    .populate("student", "name email studentId photo")
    .populate("equipment", "name imageUrl")
    .sort({ dueDate: 1 });
  res.json({ success: true, count: booked.length, booked });
});

const listOverdue = asyncHandler(async (req, res) => {
  const equipmentIds = await LabEquipment.find({ department: req.user.department }).distinct("_id");
  const overdue = await EquipmentRequest.find({
    equipment: { $in: equipmentIds },
    status: { $in: [REQUEST_STATUS.APPROVED, REQUEST_STATUS.OVERDUE] },
    dueDate: { $lt: new Date() },
  })
    .populate("student", "name email studentId photo")
    .populate("equipment", "name imageUrl");
  res.json({ success: true, count: overdue.length, overdue });
});

// BOOKING REQUESTS

const listRequests = asyncHandler(async (req, res) => {
  const status = req.query.status || REQUEST_STATUS.PENDING;
  const equipmentIds = await LabEquipment.find({ department: req.user.department }).distinct("_id");
  const requests = await EquipmentRequest.find({ equipment: { $in: equipmentIds }, status })
    .populate("student", "name email studentId photo")
    .populate("equipment", "name imageUrl section")
    .sort({ requestDate: 1 });
  res.json({ success: true, count: requests.length, requests });
});

const decideRequest = asyncHandler(async (req, res) => {
  const { decision, loanDays } = req.body;
  if (![REQUEST_STATUS.APPROVED, REQUEST_STATUS.REJECTED].includes(decision)) {
    res.status(400);
    throw new Error("decision must be 'approved' or 'rejected'.");
  }
  const request = await EquipmentRequest.findById(req.params.id).populate("equipment");
  if (!request) {
    res.status(404);
    throw new Error("Request not found.");
  }
  if (String(request.equipment.department) !== String(req.user.department)) {
    res.status(403);
    throw new Error("This equipment does not belong to your department.");
  }
  if (request.status !== REQUEST_STATUS.PENDING) {
    res.status(409);
    throw new Error("This request has already been decided.");
  }
  if (decision === REQUEST_STATUS.APPROVED) {
    if (request.equipment.availableUnits < 1) {
      res.status(409);
      throw new Error("No units available to approve this request.");
    }
    request.equipment.availableUnits -= 1;
    await request.equipment.save();

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (Number(loanDays) || DEFAULT_LOAN_DAYS));
    request.dueDate = dueDate;
  }
  request.status = decision;
  request.decidedBy = req.user._id;
  request.decidedAt = new Date();
  await request.save();
  await notify({
    recipient: request.student,
    type: decision === REQUEST_STATUS.APPROVED ? NOTIFICATION_TYPES.BOOKING_APPROVED : NOTIFICATION_TYPES.BOOKING_REJECTED,
    title: `Equipment request ${decision}`,
    message:
      decision === REQUEST_STATUS.APPROVED
        ? `Your request for "${request.equipment.name}" was approved. Due date: ${request.dueDate.toDateString()}.`
        : `Your request for "${request.equipment.name}" was rejected.`,
    meta: { requestId: request._id, equipmentId: request.equipment._id },
  });
  res.json({ success: true, request });
});

// RETURN TRACKING

const returnTrackingList = asyncHandler(async (req, res) => {
  const equipmentIds = await LabEquipment.find({ department: req.user.department }).distinct("_id");
  const list = await EquipmentRequest.find({
    equipment: { $in: equipmentIds },
    status: { $in: [REQUEST_STATUS.APPROVED, REQUEST_STATUS.OVERDUE] },
  })
    .populate("student", "name email studentId")
    .populate("equipment", "name imageUrl")
    .sort({ dueDate: 1 });
  res.json({ success: true, count: list.length, list });
});

const markReturned = asyncHandler(async (req, res) => {
  const request = await EquipmentRequest.findById(req.params.id).populate("equipment");
  if (!request) {
    res.status(404);
    throw new Error("Request not found.");
  }
  if (String(request.equipment.department) !== String(req.user.department)) {
    res.status(403);
    throw new Error("This equipment does not belong to your department.");
  }
  if (![REQUEST_STATUS.APPROVED, REQUEST_STATUS.OVERDUE].includes(request.status)) {
    res.status(409);
    throw new Error("Only approved or overdue bookings can be marked returned.");
  }
  request.status = REQUEST_STATUS.RETURNED;
  request.returnedAt = new Date();
  await request.save();
  request.equipment.availableUnits += 1;
  await request.equipment.save();
  res.json({ success: true, request });
});

module.exports = {
  listSections,
  listEquipmentInSection,
  addEquipment,
  getEquipment,
  updateEquipment,
  removeEquipment,
  listBooked,
  listOverdue,
  listRequests,
  decideRequest,
  returnTrackingList,
  markReturned,
};