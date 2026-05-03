const Booking = require("../models/Booking");
const ParkingSlot = require("../models/ParkingSlot");

exports.createBooking = async (req, res) => {
  try {
    const { slotId, startTime, endTime } = req.body;

    const slot = await ParkingSlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ message: "Parking slot not found" });
    }

    // Check for blocked windows on the listing.
    const blockedWindows = slot.blockedWindows || [];
    const blocked = blockedWindows.some((windowText) => {
      const normalized = (windowText || "").toLowerCase();
      return (
        normalized.includes(new Date(startTime).toISOString().slice(0, 10)) ||
        normalized.includes(new Date(endTime).toISOString().slice(0, 10))
      );
    });
    if (blocked) {
      return res.status(400).json({ message: "Slot is blocked for selected time window" });
    }

    // Check for overlapping bookings.
    const existingBooking = await Booking.findOne({
      slotId,
      status: { $nin: ["cancelled", "rejected"] },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime },
        },
      ],
    });

    if (existingBooking) {
      return res.status(400).json({
        message: "This slot is already booked for the selected time.",
      });
    }

    const booking = new Booking({
      ...req.body,
      status: slot.approvalMode === "manual-approve" ? "pending" : "confirmed",
    });
    await booking.save();

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const { userName, status, disputeStatus } = req.query;

    let filter = {};
    if (userName) {
      filter.userName = userName;
    }
    if (status) {
      filter.status = status;
    }
    if (disputeStatus) {
      filter.disputeStatus = disputeStatus;
    }

    const bookings = await Booking.find(filter).populate("slotId");

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: "cancelled" },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ message: "Booking cancelled successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.raiseDispute = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      id,
      {
        status: "disputed",
        disputeStatus: "open",
        disputeReason: reason || "Dispute raised by user",
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.json(booking);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};