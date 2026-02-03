import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import stripe from "stripe";

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
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    // Creating line items to for Stripe
    const line_items = [{
      price_data:{
         currency: 'usd',
         product_data:{
            name:showData.movie.title,
         },
         unit_amount: Math.floor(booking.amount) * 100
      },
      quantity:1
      }
    ]

    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/loading/my-bookings`,
      cancel_url: `${origin}/my-bookings`,
      line_items: line_items,
      mode: 'payment',
      metadata:{
        bookingId: booking._id.toString()
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 15 minutes from now
    })
    
    booking.paymentLink = session.url;

    await booking.save();


    return res.status(201).json({
      success: true,
      url: session.url,
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
