const mongoose = require("mongoose");
const { RESOURCE_TYPES } = require("../config/constants");
const resourceSchema = new mongoose.Schema(
  {
    classroom: { type: mongoose.Schema.Types.ObjectId, ref: "Classroom", required: true },
    subject: { type: String, required: true, trim: true }, 
    type: { type: String, enum: Object.values(RESOURCE_TYPES), required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    filePath: { type: String, required: true }, // uploaded file
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    postedByRole: { type: String, required: true },
  },
  { timestamps: true }
);
resourceSchema.index({ classroom: 1, subject: 1, type: 1 });
module.exports = mongoose.model("Resource", resourceSchema);
