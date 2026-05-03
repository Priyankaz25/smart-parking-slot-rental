const express = require("express");
const router = express.Router();

const ParkingSlot = require("../models/ParkingSlot");
const Booking = require("../models/Booking");

// ADD SLOT
router.post("/", async (req, res) => {
  try {
    const { name, address, location, vehicleType } = req.body || {};
    if (!name || !address || !location?.coordinates || !vehicleType) {
      return res.status(400).json({
        error: "name, address, location.coordinates, and vehicleType are required",
      });
    }
    const slot = new ParkingSlot(req.body);
    await slot.save();
    res.json(slot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL
router.get("/", async (req, res) => {
  try {
    const { location, vehicleType, startTime, endTime } = req.query;

    const filter = {};
    if (vehicleType) {
      filter.vehicleType = vehicleType;
    }
    if (location) {
      filter.$or = [
        { name: { $regex: location, $options: "i" } },
        { address: { $regex: location, $options: "i" } },
      ];
    }

    let excludedSlotIds = [];
    if (startTime && endTime) {
      const overlappingBookings = await Booking.find({
        status: { $nin: ["cancelled", "rejected"] },
        startTime: { $lt: new Date(endTime) },
        endTime: { $gt: new Date(startTime) },
      }).select("slotId");
      excludedSlotIds = overlappingBookings.map((item) => item.slotId);
    }

    const slots = await ParkingSlot.find({
      ...filter,
      ...(excludedSlotIds.length ? { _id: { $nin: excludedSlotIds } } : {}),
    });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AVAILABLE SLOTS (FIXED)
router.get("/available", async (req, res) => {
  try {
    const { startTime, endTime } = req.query;

    if (!startTime || !endTime) {
      return res.status(400).json({ error: "Start and end time required" });
    }

    const bookings = await Booking.find({
      startTime: { $lt: new Date(endTime) },
      endTime: { $gt: new Date(startTime) },
    });

    const bookedIds = bookings.map((b) => b.slotId);

    const available = await ParkingSlot.find({
      _id: { $nin: bookedIds },
      listingStatus: "approved",
      isAvailable: true,
      vehicleType: "4W"
    });

    res.json(available);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// NEARBY SLOTS WITH DISTANCE (500 meters)
router.get("/nearby", async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const latitude = Number(lat);
    const longitude = Number(lng);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return res.status(400).json({ error: "Valid lat and lng are required" });
    }

    const nearbySlots = await ParkingSlot.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          distanceField: "distanceMeters",
          maxDistance: 500,
          spherical: true,
          query: {
            listingStatus: "approved",
            isAvailable: true,
            vehicleType: "4W",
          },
        },
      },
      {
        $addFields: {
          distanceKm: {
            $round: [{ $divide: ["$distanceMeters", 1000] }, 1],
          },
        },
      },
    ]);

    return res.json(nearbySlots);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;