import movies from "../moviesData.js";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";
import { inngest } from "../inngest/index.js";

// API to get now playing movies from TMDB
export const getNowPlayingMovies = async (req, res) => {
  try {
    const moviesList = movies; // Using local data from moviesData.js
    res.status(200).json({ success: true, movies: moviesList });
  } catch (error) {
    console.error("Error fetching now playing movies:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch now playing movies" });
  }
};

// API to add a new show to the database
export const addNewShow = async (req, res) => {
  try {
    const { movieId, showsInput, showPrice } = req.body;
    let movie = await Movie.findById(movieId);
    if (!movie) {
      movie = movies.find(
        (mov) => mov.id.toString() === movieId.toString(),
      );
      const movieDetailsResponse = movie;
      const movieData = movieDetailsResponse;

      const movieDetails = {
        _id: movieData.id.toString(),
        title: movieData.title,
        overview: movieData.overview,
        poster_path: movieData.poster_path,
        backdrop_path: movieData.backdrop_path,
        genres: movieData.genre_ids,
        casts: movieData.credits.cast,
        release_date: movieData.release_date,
        original_language: movieData.original_language,
        tagline: movieData.tagline || "",
        vote_average: movieData.vote_average,
        runtime: movieData.runtime || 120,
      };
      // Save movie to database
      movie = await Movie.create(movieDetails);
    }
    const showsToCreate = [];
    showsInput.forEach((show) => {
      const showDate = show.date;
      show.time.forEach((time) => {
        const dateTimeString = `${showDate}T${time}`;
        showsToCreate.push({
          movie: movieId.toString(),
          showDateTime: new Date(dateTimeString),
          showPrice: showPrice,
          occupiedSeats: {},
        });
      });
    });
    if (showsToCreate.length > 0) {
      await Show.insertMany(showsToCreate);
    }

    // Trigger Inngest event for new show added
    await inngest.send({
      name: "app/show.added",
      data: {
        movieTitle: movie.title,
      },
    });

    res
      .status(201)
      .json({ success: true, message: "New shows added successfully" });
  } catch (error) {
    console.error("Error adding new show:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add new show",
      message: error.message,
    });
  }
};

// API to get all shows from the database
export const getAllShows = async (req, res) => {
  try {
    const shows = await Show.find({ showDateTime: { $gte: new Date() } })
      .populate("movie")
      .sort({ showDateTime: 1 });

    // Filter unique Shows
    const uniqueSHows = new Set(shows.map((show) => show.movie));

    res.status(200).json({ success: true, shows: Array.from(uniqueSHows) });
  } catch (error) {
    console.error("Error fetching shows:", error);
    res.status(500).json({ success: false, message: "Failed to fetch shows" });
  }
};

// API to get shows for a specific movie
export const getShow = async (req, res) => {
  try {
    const { movieId } = req.params;
    // get all upcoming shows for the movie
    const shows = await Show.find({
      movie: movieId,
      showDateTime: { $gte: new Date() },
    });
    const movie = await Movie.findById(movieId);
    const dateTime = {};
    shows.forEach((show) => {
      const date = show.showDateTime.toISOString().split("T")[0];
      if (!dateTime[date]) {
        dateTime[date] = [];
      }
      dateTime[date].push({ time: show.showDateTime, showId: show._id });
    });
    res.status(200).json({ success: true, movie, dateTime });
  } catch (error) {
    console.error("Error fetching shows for movie:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch shows for movie" });
  }
};
