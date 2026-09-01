const ROLES = Object.freeze({
  STUDENT: "student",
  FACULTY: "faculty",
  LIBRARY_STAFF: "library_staff",
  LAB_STAFF: "lab_staff",
  ADMIN: "admin",
});

const RESOURCE_TYPES = Object.freeze({
  SYLLABUS: "syllabus",
  BLUEPRINT: "blueprint",
  PYQ: "previous_year_qp",
  NOTES: "notes",
  STUDY_MATERIAL: "study_material",
});

const RESOURCE_TYPES_BY_POSTER = Object.freeze({
  [ROLES.FACULTY]: [
    RESOURCE_TYPES.SYLLABUS,
    RESOURCE_TYPES.BLUEPRINT,
    RESOURCE_TYPES.PYQ,
    RESOURCE_TYPES.NOTES,
    RESOURCE_TYPES.STUDY_MATERIAL,
  ],
  [ROLES.STUDENT]: [RESOURCE_TYPES.NOTES],
});

const REQUEST_STATUS = Object.freeze({
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  RETURNED: "returned",
  OVERDUE: "overdue",
});

const NOTIFICATION_TYPES = Object.freeze({
  BOOKING_APPROVED: "booking_approved",
  BOOKING_REJECTED: "booking_rejected",
  DUE_REMINDER: "due_reminder",
  NEW_RESOURCE: "new_resource",
  STUDENT_JOINED_CLASSROOM: "student_joined_classroom",
  NEW_BOOK_REQUEST: "new_book_request",
  NEW_EQUIPMENT_REQUEST: "new_equipment_request",
  CLASSROOM_CREATED: "classroom_created", // admin audit alert
  OVERDUE_ALERT: "overdue_alert",
});

const YEARS = Object.freeze(["I", "II", "III", "IV"]);
const SECTIONS = Object.freeze(["A", "B", "C", "D", "E"]);

const DESIGNATIONS = Object.freeze(["Professor", "Associate Professor", "Assistant Professor"]);

const STAFF_ROLES = Object.freeze([ROLES.LIBRARY_STAFF, ROLES.LAB_STAFF]);

module.exports = {
  ROLES,
  RESOURCE_TYPES,
  RESOURCE_TYPES_BY_POSTER,
  REQUEST_STATUS,
  NOTIFICATION_TYPES,
  YEARS,
  SECTIONS,
  DESIGNATIONS,
  STAFF_ROLES,
};
