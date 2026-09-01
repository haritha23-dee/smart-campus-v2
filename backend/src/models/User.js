const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { ROLES, DESIGNATIONS } = require("../config/constants");
const options = { discriminatorKey: "role", collection: "users", timestamps: true };
const baseOptions = {
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  photo: { type: String, default: null }, // uploaded file path
  isActive: { type: Boolean, default: true }, // admin can disable, never delete
  yearJoined: { type: Number },
};
const userSchema = new mongoose.Schema(baseOptions, options);
userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
userSchema.methods.matchPassword = async function matchPassword(entered) {
  return bcrypt.compare(entered, this.password);
};
userSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};
const User = mongoose.model("User", userSchema);

//Student
const Student = User.discriminator(
  ROLES.STUDENT,
  new mongoose.Schema({
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true }, // locked by admin
    year: { type: String, enum: ["I", "II", "III", "IV"] },
    section: { type: String },
    batch: { type: String },
    studentId: { type: String, unique: true, sparse: true },
  })
);

//Faculty
const Faculty = User.discriminator(
  ROLES.FACULTY,
  new mongoose.Schema({
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true }, // locked by admin
    designation: { type: String, enum: DESIGNATIONS, default: "Assistant Professor" },
    subjectsCanTeach: [{ type: String, trim: true }], // reference only, comma-separated -> array
  })
);

//Library Staff(no department - manages universal inventory)
const LibraryStaff = User.discriminator(
  ROLES.LIBRARY_STAFF,
  new mongoose.Schema({
    staffId: { type: String, unique: true, sparse: true },
  })
);

//Lab Staff(department scoped)
const LabStaff = User.discriminator(
  ROLES.LAB_STAFF,
  new mongoose.Schema({
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    staffId: { type: String, unique: true, sparse: true },
  })
);

//Admin
const Admin = User.discriminator(
  ROLES.ADMIN,
  new mongoose.Schema({
    adminId: { type: String, unique: true, sparse: true },
  })
);
module.exports = { User, Student, Faculty, LibraryStaff, LabStaff, Admin };
