const { Admin, User } = require("../models/User");
const { ROLES } = require("../config/constants");
const crypto = require("crypto");

const ensureBootstrapAdmin = async () => {
  const anyAdmin = await User.exists({ role: ROLES.ADMIN });
  if (anyAdmin) return;
  const email = (process.env.BOOTSTRAP_ADMIN_EMAIL || "admin@campus.edu").toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD || "Admin@12345";
  await Admin.create({
    name: "Super Admin",
    email,
    password,
    adminId: `ADM-${crypto.randomInt(100000, 999999)}`,
  });
  console.log(`[Bootstrap] Created initial admin account -> email: ${email} (see .env to change the password)`);
};
module.exports = ensureBootstrapAdmin;
