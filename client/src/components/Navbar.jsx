import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets.js";
import { MenuIcon, SearchIcon, TicketPlus, XIcon } from "lucide-react";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import { useAppContext } from "../context/AppContext.jsx";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const navigate = useNavigate();
 
  const { favorites } = useAppContext();

  return (
    <div className="fixed top-0 left-0 z-50 w-full flex items-center justify-between px-6 md:px-16 lg:px-36 py-5">
      <Link to="/" className="max-md:flex-1 flex items-center gap-2">
        <img src={assets.logo} alt="Logo" className="w-25 h-auto" />
        <p className="text-2xl font-bold text-white">
          <span className="text-red-400 text-3xl">M</span>ovieGo
        </p>
      </Link>
      <div
        className={`max-md:absolute max-md:top-0 max-md:left-0 max-md:font-medium max-md:text-lg z-50 flex flex-col md:flex-row items-center max-md:justify-center gap-8 min-md:px-8 py-3 max-md:h-screen min-md:rounded-full backdrop-blur bg-black/70 md:bg-white/10 md:border border-gray-300/20 overflow-hidden transition-[width] duration-300 ${isMenuOpen ? "max-md:w-full" : "max-md:w-0 max-md:overflow-hidden"}`}
      >
        <XIcon
          className="w-6 h-6 cursor-pointer md:hidden absolute top-6 right-6 "
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        />
        <Link
          onClick={() => {
            (scrollTo(0, 0), setIsMenuOpen(false));
          }}
          to="/"
          className="hover:text-red-400"
        >
          Home
        </Link>
        <Link
          onClick={() => {
            (scrollTo(0, 0), setIsMenuOpen(false));
          }}
          to="/movies"
          className="hover:text-red-400"
        >
          Movies
        </Link>
        {/* <Link
          onClick={() => {
            scrollTo(0, 0);
            setIsMenuOpen(false);
          }}
          to="/"
          className="hover:text-red-400"
        >
          Theaters
        </Link> */}
        <Link
          onClick={() => {
            scrollTo(0, 0);
            setIsMenuOpen(false);
          }}
          to="/movies"
          className="hover:text-red-400"
        >
          Releases
        </Link>
      {favorites.length > 0 && (<Link
        onClick={() => {
          scrollTo(0, 0);
          setIsMenuOpen(false);
        }}
        to="/favorite"
        className="hover:text-red-400"
      >
        Favorites
      </Link>)}
      </div>
      <div className="flex items-center gap-8">
        <SearchIcon className="w-6 h-6 max-md:hidden cursor-pointer" />
        {!user ? (
          <button
            onClick={openSignIn}
            className="px-4 py-1 sm:px-7 sm:py-2 bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer"
          >
            Login
          </button>
        ) : (
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action
                label="My Bookings"
                onClick={() => navigate("/my-bookings")}
                labelIcon={<TicketPlus width={15} />}
              />
            </UserButton.MenuItems>
          </UserButton>
        )}
      </div>
      <MenuIcon
        className="max-md:ml-4 md:hidden w-8 h-8 cursor-pointer"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      />
    </div>
  );
};

export default Navbar;
