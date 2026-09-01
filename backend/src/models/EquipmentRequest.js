const mongoose = require("mongoose");
const { REQUEST_STATUS } = require("../config/constants");
const equipmentRequestSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    equipment: { type: mongoose.Schema.Types.ObjectId, ref: "LabEquipment", required: true },
    status: {
      type: String,
      enum: Object.values(REQUEST_STATUS),
      default: REQUEST_STATUS.PENDING,
    },
    requestDate: { type: Date, default: Date.now },
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // lab staff
    decidedAt: { type: Date },
    dueDate: { type: Date }, // set on approval
    returnedAt: { type: Date },
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);
module.exports = mongoose.model("EquipmentRequest", equipmentRequestSchema);
