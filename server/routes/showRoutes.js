import express from "express";
import { addNewShow, getAllShows, getNowPlayingMovies, getShow } from "../controllers/showController.js";
import { protectAdmin } from "../middleware/auth.js";

const showRouter = express.Router();

showRouter.get('/now-playing',protectAdmin,getNowPlayingMovies);
showRouter.post('/add',protectAdmin,addNewShow);
showRouter.get('/all',protectAdmin,getAllShows);
showRouter.get('/:movieId',getShow);

export default showRouter;