const asyncHandler = require("express-async-handler");
const Book = require("../models/Book");
const BookRequest = require("../models/BookRequest");
const { notify } = require("../utils/notify");
const { REQUEST_STATUS, NOTIFICATION_TYPES } = require("../config/constants");
const DEFAULT_LOAN_DAYS = 14;

//BOOK INVENTORY

const listSections = asyncHandler(async (req, res) => {
  const sections = await Book.distinct("section");
  res.json({ success: true, sections });
});
const listBooksInSection = asyncHandler(async (req, res) => {
  const books = await Book.find({ section: req.params.section }).sort({ title: 1 });
  res.json({ success: true, count: books.length, books });
});
const addBook = asyncHandler(async (req, res) => {
  const { title, author, section, description, totalCopies } = req.body;
  if (!title || !author || !section || totalCopies === undefined) {
    res.status(400);
    throw new Error("title, author, section and totalCopies are required.");
  }
  const book = await Book.create({
    title,
    author,
    section,
    description,
    totalCopies,
    availableCopies: totalCopies,
    addedBy: req.user._id,
  });
  res.status(201).json({ success: true, book });
});
const getBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    res.status(404);
    throw new Error("Book not found.");
  }
  res.json({ success: true, book });
});
const updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    res.status(404);
    throw new Error("Book not found.");
  }
  const { title, author, section, description, totalCopies, availableCopies } = req.body;
  if (title !== undefined) book.title = title;
  if (author !== undefined) book.author = author;
  if (section !== undefined) book.section = section;
  if (description !== undefined) book.description = description;
  if (totalCopies !== undefined) book.totalCopies = totalCopies;
  if (availableCopies !== undefined) book.availableCopies = availableCopies;
  await book.save();
  res.json({ success: true, book });
});
const removeBook = asyncHandler(async (req, res) => {
  const activeRequests = await BookRequest.exists({
    book: req.params.id,
    status: { $in: [REQUEST_STATUS.PENDING, REQUEST_STATUS.APPROVED] },
  });
  if (activeRequests) {
    res.status(409);
    throw new Error("Cannot remove a book with pending or active issue requests.");
  }
  const book = await Book.findByIdAndDelete(req.params.id);
  if (!book) {
    res.status(404);
    throw new Error("Book not found.");
  }
  res.json({ success: true, message: "Book removed." });
});
const listIssuedBooks = asyncHandler(async (req, res) => {
  const issued = await BookRequest.find({ status: REQUEST_STATUS.APPROVED })
    .populate("student", "name email studentId photo")
    .populate("book", "title author")
    .sort({ dueDate: 1 });
  res.json({ success: true, count: issued.length, issued });
});
const listOverdue = asyncHandler(async (req, res) => {
  const overdue = await BookRequest.find({
    status: { $in: [REQUEST_STATUS.APPROVED, REQUEST_STATUS.OVERDUE] },
    dueDate: { $lt: new Date() },
  })
    .populate("student", "name email studentId photo")
    .populate("book", "title author");
  res.json({ success: true, count: overdue.length, overdue });
});

//ISSUE REQUESTS

const listRequests = asyncHandler(async (req, res) => {
  const status = req.query.status || REQUEST_STATUS.PENDING;
  const requests = await BookRequest.find({ status })
    .populate("student", "name email studentId photo")
    .populate("book", "title author")
    .sort({ requestDate: 1 });
  res.json({ success: true, count: requests.length, requests });
});
const decideRequest = asyncHandler(async (req, res) => {
  const { decision, loanDays } = req.body;
  if (![REQUEST_STATUS.APPROVED, REQUEST_STATUS.REJECTED].includes(decision)) {
    res.status(400);
    throw new Error("decision must be 'approved' or 'rejected'.");
  }
  const request = await BookRequest.findById(req.params.id).populate("book");
  if (!request) {
    res.status(404);
    throw new Error("Request not found.");
  }
  if (request.status !== REQUEST_STATUS.PENDING) {
    res.status(409);
    throw new Error("This request has already been decided.");
  }
  if (decision === REQUEST_STATUS.APPROVED) {
    if (request.book.availableCopies < 1) {
      res.status(409);
      throw new Error("No copies available to approve this request.");
    }
    request.book.availableCopies -= 1;
    await request.book.save();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (loanDays || DEFAULT_LOAN_DAYS));
    request.dueDate = dueDate;
  }
  request.status = decision;
  request.decidedBy = req.user._id;
  request.decidedAt = new Date();
  await request.save();
  await notify({
    recipient: request.student,
    type: decision === REQUEST_STATUS.APPROVED ? NOTIFICATION_TYPES.BOOKING_APPROVED : NOTIFICATION_TYPES.BOOKING_REJECTED,
    title: `Book request ${decision}`,
    message:
      decision === REQUEST_STATUS.APPROVED
        ? `Your request for "${request.book.title}" was approved. Due date: ${request.dueDate.toDateString()}.`
        : `Your request for "${request.book.title}" was rejected.`,
    meta: { requestId: request._id, bookId: request.book._id },
  });
  res.json({ success: true, request });
});

//RETURN TRACKING

const returnTrackingList = asyncHandler(async (req, res) => {
  const list = await BookRequest.find({ status: { $in: [REQUEST_STATUS.APPROVED, REQUEST_STATUS.OVERDUE] } })
    .populate("student", "name email studentId")
    .populate("book", "title author")
    .sort({ dueDate: 1 });
  res.json({ success: true, count: list.length, list });
});
const markReturned = asyncHandler(async (req, res) => {
  const request = await BookRequest.findById(req.params.id).populate("book");
  if (!request) {
    res.status(404);
    throw new Error("Request not found.");
  }
  if (![REQUEST_STATUS.APPROVED, REQUEST_STATUS.OVERDUE].includes(request.status)) {
    res.status(409);
    throw new Error("Only approved or overdue issues can be marked returned.");
  }
  request.status = REQUEST_STATUS.RETURNED;
  request.returnedAt = new Date();
  await request.save();
  request.book.availableCopies += 1;
  await request.book.save();
  res.json({ success: true, request });
});
module.exports = {
  listSections,
  listBooksInSection,
  addBook,
  getBook,
  updateBook,
  removeBook,
  listIssuedBooks,
  listOverdue,
  listRequests,
  decideRequest,
  returnTrackingList,
  markReturned,
};
