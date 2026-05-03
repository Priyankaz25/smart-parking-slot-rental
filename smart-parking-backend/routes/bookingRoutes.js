const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");

const {
  createBooking,
  getBookings,
  cancelBooking,
  raiseDispute,
} = require("../controllers/bookingController");

// ✅ GET all bookings
router.get("/", getBookings);

// ✅ CREATE booking
router.post("/", createBooking);

// ✅ CANCEL booking
router.delete("/:id", authenticate, cancelBooking);

// ✅ RAISE dispute
router.put("/:id/dispute", authenticate, raiseDispute);

module.exports = router;