const mongoose = require("mongoose");
const auditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true }, // e.g. "ACCOUNT_CREATED", "DEPARTMENT_ADDED", "CLASSROOM_CREATED"
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    targetType: { type: String }, // "User" | "Department" | "Classroom" ...
    targetId: { type: mongoose.Schema.Types.ObjectId },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);
module.exports = mongoose.model("AuditLog", auditLogSchema);
