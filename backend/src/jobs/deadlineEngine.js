const cron = require("node-cron");
const BookRequest = require("../models/BookRequest");
const EquipmentRequest = require("../models/EquipmentRequest");
const { notify } = require("../utils/notify");
const { REQUEST_STATUS, NOTIFICATION_TYPES } = require("../config/constants");

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const endOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

const runDeadlineCheck = async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStart = startOfDay(tomorrow);
  const tomorrowEnd = endOfDay(tomorrow);
  const now = new Date();

  //Due-tomorrow reminders-Books
  const dueBooks = await BookRequest.find({
    status: REQUEST_STATUS.APPROVED,
    dueDate: { $gte: tomorrowStart, $lte: tomorrowEnd },
    reminderSent: false,
  }).populate("book", "title");
  for (const req of dueBooks) {
    await notify({
      recipient: req.student,
      type: NOTIFICATION_TYPES.DUE_REMINDER,
      title: "Return reminder",
      message: `"${req.book.title}" is due tomorrow (${req.dueDate.toDateString()}).`,
      meta: { requestId: req._id, bookId: req.book._id },
    });
    req.reminderSent = true;
    await req.save();
  }
  //Due-tomorrow reminders-Equipment
  const dueEquipment = await EquipmentRequest.find({
    status: REQUEST_STATUS.APPROVED,
    dueDate: { $gte: tomorrowStart, $lte: tomorrowEnd },
    reminderSent: false,
  }).populate("equipment", "name");
  for (const req of dueEquipment) {
    await notify({
      recipient: req.student,
      type: NOTIFICATION_TYPES.DUE_REMINDER,
      title: "Return reminder",
      message: `"${req.equipment.name}" is due tomorrow (${req.dueDate.toDateString()}).`,
      meta: { requestId: req._id, equipmentId: req.equipment._id },
    });
    req.reminderSent = true;
    await req.save();
  }

  //Flip overdue-Books
  await BookRequest.updateMany(
    { status: REQUEST_STATUS.APPROVED, dueDate: { $lt: now } },
    { $set: { status: REQUEST_STATUS.OVERDUE } }
  );

  //Flip overdue-Equipment
  await EquipmentRequest.updateMany(
    { status: REQUEST_STATUS.APPROVED, dueDate: { $lt: now } },
    { $set: { status: REQUEST_STATUS.OVERDUE } }
  );
  console.log(
    `[DeadlineEngine] Ran at ${new Date().toISOString()} — reminders sent: books=${dueBooks.length}, equipment=${dueEquipment.length}`
  );
};

const scheduleDeadlineEngine = () => {
  cron.schedule("0 0 * * *", () => {
    runDeadlineCheck().catch((err) => console.error("[DeadlineEngine] Error:", err));
  });
  console.log("[DeadlineEngine] Scheduled daily run at 00:00.");
};
module.exports = { scheduleDeadlineEngine, runDeadlineCheck };
