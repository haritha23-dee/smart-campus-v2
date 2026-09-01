const multer = require("multer");
const path = require("path");
const fs = require("fs");
const makeStorage = (subfolder) => {
  const dest = path.join(__dirname, "..", "..", "uploads", subfolder);
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  });
};
const photoFileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ok = allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype);
  cb(ok ? null : new Error("Only image files (jpg, png, webp) are allowed for photos."), ok);
};
const resourceFileFilter = (req, file, cb) => {
  const allowed = /pdf|doc|docx|ppt|pptx|jpg|jpeg|png|txt|zip/;
  const ok = allowed.test(path.extname(file.originalname).toLowerCase());
  cb(ok ? null : new Error("File type not allowed."), ok);
};
const uploadPhoto = multer({
  storage: makeStorage("photos"),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: photoFileFilter,
});
const uploadResource = multer({
  storage: makeStorage("resources"),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: resourceFileFilter,
});
module.exports = { uploadPhoto, uploadResource };
