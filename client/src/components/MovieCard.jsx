import { StarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import timeFormat from "../lib/timeFormat";

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  return (
    <div
      className="flex flex-col justify-between p-4 bg-slate-800 rounded-3xl 
hover:-translate-y-1 transition-all duration-300 w-64 shadow-lg"
    >
      <img
        onClick={() => {
          scrollTo(0, 0);
          navigate(`/movies/${movie._id}`);
        }}
        src={movie.backdrop_path}
        alt={movie.title}
        className="rounded-2xl h-56 w-full object-cover cursor-pointer"
      />

      <p className="font-semibold text-lg mt-3 truncate text-white">
        {movie.title}
      </p>

      <p className="text-sm text-gray-400 mt-1">
        {new Date(movie.release_date).getFullYear()}{" "}{" "}
        {movie.genres
          .slice(0, 2)
          .map((g) => g.name)
          .join(" | ")}{" "}
         {timeFormat(movie.runtime)}
      </p>

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => {
            scrollTo(0, 0);
            navigate(`/movies/${movie._id}`);
          }}
          className="px-5 py-2 text-sm bg-pink-500 hover:bg-pink-600 
      transition rounded-full font-medium text-white cursor-pointer"
        >
          Buy Tickets
        </button>

        <p className="flex items-center gap-1 text-sm text-gray-300">
          <StarIcon className="w-4 h-4 text-pink-500 fill-pink-500" />

          {movie.vote_average.toFixed(1)}
        </p>
      </div>
    </div>
  );
};

export default MovieCard;
