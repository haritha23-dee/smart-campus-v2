const mongoose = require("mongoose");
const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    section: { type: String, required: true, trim: true }, 
    description: { type: String, trim: true, default: "" },
    totalCopies: { type: Number, required: true, min: 0 },
    availableCopies: { type: Number, required: true, min: 0 },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
  },
  { timestamps: true }
);
module.exports = mongoose.model("Book", bookSchema);
