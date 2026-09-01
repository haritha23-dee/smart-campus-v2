const mongoose = require("mongoose");
const labEquipmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    section: { type: String, required: true, trim: true }, 
    description: { type: String, trim: true, default: "" },
    totalUnits: { type: Number, required: true, min: 0 },
    availableUnits: { type: Number, required: true, min: 0 },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);
module.exports = mongoose.model("LabEquipment", labEquipmentSchema);
