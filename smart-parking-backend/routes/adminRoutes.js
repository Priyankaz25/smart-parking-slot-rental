const express = require("express");
const router = express.Router();
const { authenticate, requireRole } = require("../middleware/auth");
const {
  getAllBookings,
  getDisputes,
  getListingsForVerification,
  getUsers,
  resolveDispute,
  updateUserStatus,
  verifyListing,
  verifyOwner,
} = require("../controllers/adminController");

router.use(authenticate);
router.use(requireRole("admin"));

router.get("/users", getUsers);
router.put("/users/:id/status", updateUserStatus);
router.put("/owners/:id/verify", verifyOwner);

router.get("/listings/verification", getListingsForVerification);
router.put("/listings/:id/verify", verifyListing);

router.get("/bookings", getAllBookings);
router.get("/disputes", getDisputes);
router.put("/disputes/:bookingId/resolve", resolveDispute);

module.exports = router;
