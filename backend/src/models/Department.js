const mongoose = require("mongoose");
const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    code: { type: String, required: true, trim: true, uppercase: true, unique: true },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Department", departmentSchema);
