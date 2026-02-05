import React, { useEffect, useState } from 'react'
import Loading from '../components/Loading';
import BlurCircle from '../components/BlurCircle';
import timeFormat from '../lib/timeFormat';
import { dateFotmat } from '../lib/dateFormat';
import { useAppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';

const MyBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY ;

  const { axios, getToken, user} = useAppContext();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const getMyBookings = async () => {
      try {
         const { data } = await axios.get('/api/user/bookings', {
          headers: { Authorization: `Bearer ${await getToken()}` }
         })
         if(data.success){
          setBookings(data.bookings);
          setLoading(false);
        }
        
      } catch (error) {
        console.log("Error fetching bookings:", error);
      }
      setLoading(false);
  }
  useEffect(() => {
    if(user){
      getMyBookings();
    }
  }, [user])

  
  return !loading ? (
    <div className='relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]'>
       <BlurCircle top="100px" left='100px'/>
       <div>
          <BlurCircle bottom='0px' left='600px'/>
       </div>
       <h1 className='text-lg font-semibold mb-4'>My Bookings</h1>
       
       {bookings.map((items,index) =>(
            <div key={index} className='flex flex-col md:flex-row justify-between bg-primary/8 border border-primary/20 rounded-lg mt-4 p-2 max-w-3xl'>
                 <div className='flex flex-col md:flex-row'>
                     <img src={items.show.movie.poster_path} alt="" className='md:max-w-45 aspect-video h-auto object-cover object-top rounded'/>
                     <div className='flex flex-col p-4'>
                          <p className='text-lg font-semibold'>{items.show.movie.title}</p>
                          <p className='text-gray-400 text-sm'>{timeFormat(items.show.movie.runtime)}</p>
                          <p className='text-gray-400 text-sm mt-auto'>{dateFotmat(items.show.showDateTime)}</p>
                     </div>
                 </div>
                 <div className='flex flex-col md:items-end md:text-right justify-between p-4'>
                     <div className='flex items-center gap-4'>
                      <p className='text-2xl font-semibold mb-3'>{currency}{items.amount}</p>
                      {!items.isPaid && <Link to={items.paymentLink} className='bg-primary px-4 py-1.5 mb-3 text-sm rounded-full font-medium cursor-pointer'>Pay Now</Link>}
                     </div>
                     <div className='text-sm'>
                        <p><span className='text-gray-400'>Total Tickets:</span>{items.bookedSeates.length}</p>
                        <p><span className='text-gray-400'>Seats Number:</span>{items.bookedSeates.join(",")}</p>
                     </div>
                 </div>
            </div>
       ))}
    </div>
  ) : <Loading />
}

export default MyBookings
