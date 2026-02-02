import Booking from "../models/Booking.js";
import Show from "../models/Show.js";

// Function to check availability of selected seats for a movie
const checkSeatsAvailability = async (showId, selectedSeats) => {
  try {
    const showData = await Show.findById(showId);
    if (!showData) {
      return false;
    }
    const occupiedSeats = showData.occupiedSeats;

    const isAnySeatTaaken = selectedSeats.some((seat) => occupiedSeats[seat]);

    return !isAnySeatTaaken;
  } catch (error) {
    console.error("Error checking seat availability:", error);
    return false;
  }
};

export const createBooking = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { showId, selectedSeats } = req.body;
    const { origin } = req.headers;

    // Check seat availability
    const isAvailable = await checkSeatsAvailability(showId, selectedSeats);
    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Selected seats are already booked.",
      });
    }

    // Get the Show Details
    const showData = await Show.findById(showId).populate("movie");

    // Create a new booking
    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount: showData.showPrice * selectedSeats.length,
      bookedSeates: selectedSeats,
    });
    selectedSeats.map((seat) => {
      showData.occupiedSeats[seat] = userId;
    });
    showData.markModified("occupiedSeats");

    await showData.save();

    // Stripe Gateway Initialize
    return res.status(201).json({
      success: true,
      message: "Booked successfully",
      bookingId: booking._id,
    });
  } catch (error) {
    console.error("Error creating booking:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const getOccupiedSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    const showData = await Show.findById(showId);

    const occupiedSeats = Object.keys(showData.occupiedSeats);

    return res.status(200).json({
      success: true,
      occupiedSeats,
    });
  } catch (error) {
    console.error("Error fetching occupied seats:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
