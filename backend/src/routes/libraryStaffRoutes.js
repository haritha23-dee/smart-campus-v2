const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/libraryStaffController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");
const { ROLES } = require("../config/constants");

router.use(protect, authorize(ROLES.LIBRARY_STAFF));

// Book inventory
router.get("/sections", ctrl.listSections);
router.get("/sections/:section/books", ctrl.listBooksInSection);
router.post("/books", ctrl.addBook);
router.get("/books/:id", ctrl.getBook);
router.put("/books/:id", ctrl.updateBook);
router.delete("/books/:id", ctrl.removeBook);
router.get("/issued", ctrl.listIssuedBooks);
router.get("/overdue", ctrl.listOverdue);

//Issue requests
router.get("/requests", ctrl.listRequests);
router.put("/requests/:id/decision", ctrl.decideRequest);
router.put("/requests/:id/return", ctrl.markReturned);

//Return tracking
router.get("/return-tracking", ctrl.returnTrackingList);

module.exports = router;
