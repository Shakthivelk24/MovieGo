import React from 'react'
import Navbar from './components/Navbar'
import { Routes ,Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Movies from './pages/Movies'
import MovieDetails from './pages/MovieDetails'
import SeatLayout from './pages/SeatLayout'
import MyBookings from './pages/MyBookings'
import Favorite from './pages/Favorite'
import Footer from './components/Footer'
import { Toaster } from 'react-hot-toast'

const App = () => {
  const isAdmin = useLocation().pathname.startsWith('/admin');
  return (
    <>
      <Toaster/>
      {!isAdmin && <Navbar />}
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/movies' element={<Movies />} />
        <Route path='/movies/:id' element={<MovieDetails />} />
        <Route path='/movies/:id/:date' element={<SeatLayout />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/favorite" element={<Favorite />} />
      </Routes>
      {!isAdmin && <Footer />}
    </>
  )
}

export default App
