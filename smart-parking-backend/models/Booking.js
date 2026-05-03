const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ParkingSlot",
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  vehicleType: String,

  startTime: {
    type: Date,
    required: true,
  },

  endTime: {
    type: Date,
    required: true,
  },

  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "rejected", "disputed", "resolved"],
    default: "pending",
  },
  disputeStatus: {
    type: String,
    enum: ["none", "open", "resolved", "rejected"],
    default: "none",
  },
  disputeReason: String,
  disputeResolutionNote: String,
  ownerDecisionBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Booking", bookingSchema);