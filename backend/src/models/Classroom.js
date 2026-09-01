const mongoose = require("mongoose");
const { YEARS, SECTIONS } = require("../config/constants");
const facultySubjectSchema = new mongoose.Schema(
  {
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true, trim: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);
const classroomSchema = new mongoose.Schema(
  {
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    year: { type: String, enum: YEARS, required: true },
    section: { type: String, enum: SECTIONS, required: true },
    code: { type: String, required: true, unique: true }, // e.g. CSE-I-A, auto-derived
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // implicit owner, "Created by <Name>"
    facultySubjects: [facultySubjectSchema], // one entry per faculty+subject combo
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // joining requires no approval
  },
  { timestamps: true }
);
classroomSchema.index({ department: 1, year: 1, section: 1 }, { unique: true });
module.exports = mongoose.model("Classroom", classroomSchema);
