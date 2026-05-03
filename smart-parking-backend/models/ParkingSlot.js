const mongoose = require("mongoose");

const parkingSlotSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    ownerName: String,

    // ✅ NEW (for UI)
    name: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },

    // ✅ Only 4W allowed
    vehicleType: {
      type: String,
      enum: ["4W"],
      default: "4W",
    },

    pricePerHour: Number,
    pricePerDay: { type: Number, default: 0 },
    pricePerMonth: { type: Number, default: 0 },

    totalSlots: {
      type: Number,
      default: 50,
    },

    // ✅ NEW
    availableSlots: {
      type: Number,
      default: 20,
    },

    // ❌ removed availabilityWindow
    // ✅ replaced with:
    availability: {
      from: String, // "06:00"
      to: String,   // "23:00"
    },

    rules: String,

    photos: {
      type: [String],
      default: [],
    },

    approvalMode: {
      type: String,
      enum: ["auto-approve", "manual-approve"],
      default: "auto-approve",
    },

    // ✅ FIXED (date-based)
    blockedWindows: [
      {
        from: Date,
        to: Date,
      },
    ],

    // ✅ FIXED
    listingStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// 🔥 REQUIRED for Leaflet + geo queries
parkingSlotSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("ParkingSlot", parkingSlotSchema);