const express = require("express");
const router = express.Router();
const {
  authenticate,
  requireOwnerParamAccess,
  requireRole,
} = require("../middleware/auth");
const {
  blockOwnerListingWindow,
  createOwnerListing,
  deleteOwnerListing,
  getOwnerBookings,
  getOwnerListings,
  ownerBookingDecision,
  updateOwnerListing,
} = require("../controllers/ownerController");

router.use(authenticate);
router.use(requireRole("owner", "admin"));

router.get("/:ownerId/listings", requireOwnerParamAccess("ownerId"), getOwnerListings);
router.post("/:ownerId/listings", requireOwnerParamAccess("ownerId"), createOwnerListing);
router.put("/:ownerId/listings/:slotId", requireOwnerParamAccess("ownerId"), updateOwnerListing);
router.delete("/:ownerId/listings/:slotId", requireOwnerParamAccess("ownerId"), deleteOwnerListing);
router.put(
  "/:ownerId/listings/:slotId/block-window",
  requireOwnerParamAccess("ownerId"),
  blockOwnerListingWindow
);
router.get("/:ownerId/bookings", requireOwnerParamAccess("ownerId"), getOwnerBookings);
router.put(
  "/:ownerId/bookings/:bookingId/decision",
  requireOwnerParamAccess("ownerId"),
  ownerBookingDecision
);

module.exports = router;
