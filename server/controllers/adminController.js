import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import User from "../models/User.js";


// API to check if user is admin
export const isAdmin = async (res, req) => {
  res.status(200).json({
    success: true,
    isAdmin: true,
  });
};

// API to get dashboard data
export const getDashboardData = async (req, res) => {
    try {
        const bookings = await Booking.find({ isPaid: true });
        const activeShows = await Show.find({ showDateTime: { $gte: new Date() } }).populate('movie');
        const totalUser = await User.countDocuments();

        const dashboardData = {
            totalBookings: bookings.length,
            totalRevenue: bookings.reduce((acc,booking) => acc + booking.amount, 0),
            totalActiveShows: activeShows.length,
            totalUsers: totalUser,
        }

        res.status(200).json({
            success: true,
            dashboardData,
        });
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching dashboard data",
        });
    }
}

// API to get all shows
export const getAllShows = async (req, res) => {
    try {
        const shows = await Show.find({showDateTime: { $gte: new Date() }}).populate('movie').sort({ showDateTime: 1 });
        res.status(200).json({
            success: true,
            shows,
        });
    } catch (error) {
        console.error("Error fetching shows:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching shows",
        });
    }
}

// API to get all bookings
export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({}).populate('user').populate({
            path: 'show',
            populate: { path: 'movie' }
        }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            bookings,
        });   
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching bookings",
        });
    }
}


