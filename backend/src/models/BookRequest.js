const mongoose = require("mongoose");
const { REQUEST_STATUS } = require("../config/constants");
const bookRequestSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    status: {
      type: String,
      enum: Object.values(REQUEST_STATUS),
      default: REQUEST_STATUS.PENDING,
    },
    requestDate: { type: Date, default: Date.now },
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
    decidedAt: { type: Date },
    dueDate: { type: Date }, // set on approval
    returnedAt: { type: Date },
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);
module.exports = mongoose.model("BookRequest", bookRequestSchema);
