import express from 'express';
import { getFavorites, getUserBookings ,updateFavorite } from '../controllers/userController.js';

const userRoutes = express.Router();

userRoutes.get('/bookings',getUserBookings)
userRoutes.post('/update-favorites',updateFavorite)
userRoutes.get('/favorites', getFavorites);

export default userRoutes;