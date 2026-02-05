import React from "react";
import { assets } from "../assets/assets";
import { ClockIcon, CalendarIcon, ArrowBigRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <div className='flex flex-col items-start justify-center gap-4 px-6 md:px-16 lg:px-36  bg-[url("https://images.justwatch.com/poster/332215539/s718/jana-nayagan.jpg")] lg:bg-[url("/background6.jpg")] bg-cover bg-center w-screen h-screen'>
      {/* <img src={assets.marvelLogo} alt="Hero" className='max-h-11 lg:h-11 mt-20'/>
        <h1 className='text-5xl mg:text-[70px] md:leading-18 font-semibold max-w-110'>Guardians <br /> of the Galaxy</h1> */}
      <div className="flex items-center gap-4 text-yellow-300 drop-shadow-md mt-90 ml-18">
        <span className="text-cyan-300 drop-shadow-md">
          Action | Emotion | Thoughts
        </span>
        <div className="flex items-center gap-1">
          <CalendarIcon className="w-4.5 h-4.5" /> 2026
        </div>
        <div className="flex items-center gap-1">
          <ClockIcon className="w-4.5 h-4.5" /> 3h 6m
        </div>
      </div>
      <p className="max-w-md text-cyan-300 ml-18 drop-shadow-md">
        A brave leader rises to unite a divided land and end a ruthless tyrant bent on ruin.
      </p>
      <button
        onClick={() => navigate("/movies")}
        className="flex items-center gap-1 px-6 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer ml-18"
      >
        Explore Movies
        <ArrowBigRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default HeroSection;
