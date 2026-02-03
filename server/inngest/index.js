import { Inngest } from "inngest";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import sendEmail from "../configs/nodeMailer.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

//Inngest Function to save user data to database
const syncUserCreation = inngest.createFunction(
    {id:"sync-user-from-clerk"},
    {event:"clerk/user.created"},
    async ({event}) =>{
        const {id,first_name,last_name,email_addresses,image_url} = event.data
        const userData = {
            _id:id,
            name:`${first_name} ${last_name}`,
            email:email_addresses[0].email_address,
            image:image_url
        }
        await User.create(userData);
    }
)

// Inngest Function to delete user data from database
const syncUserDeletion = inngest.createFunction(
    {id:"delete-user-from-clerk"},
    {event:"clerk/user.deleted"},
    async ({event}) =>{
         const {id} = event.data
         await User.findByIdAndDelete(id);
        
    }
)

// Inngest Function to update user data in database
const syncUserUpdation = inngest.createFunction(
    {id:"update-user-from-clerk"},
    {event:"clerk/user.updated"},
    async ({event}) =>{
        const {id,first_name,last_name,email_addresses,image_url} = event.data
        const userData = {
            _id:id,
            name:`${first_name} ${last_name}`,
            email:email_addresses[0].email_address,
            image:image_url
        }
        await User.findByIdAndUpdate(id, userData);
    }
)

// Inngest Functions to cancel booking and release seats of show after 10 minutes of booking created if payment is not made
const relaseSeatsAndDeleteBooking = inngest.createFunction(
    {id:"release-seats-delete-booking"},
    {event:"app/checkpayment"},
    async ({event,step}) =>{
         const tenMintesLater = new Date(Date.now() + 10 *60 *1000);
         await step.sleepUntil('wait-for-10-minutes',tenMintesLater);

         await step.run('check-payment-status',async() =>{
            const bookingId = event.data.bookingId;
            const booking = await Booking.findById(bookingId);
            
            // If payment is not made, release the seats and delete the booking
            if(!booking.isPaid){
                const show = await Show.findById(booking.show);
                booking.bookedSeates.forEach((seat) =>{
                        delete show.occupiedSeats[seat]
                });
                show.markModified('occupiedSeats');
                await show.save();

                await Booking.findByIdAndDelete(booking._id);
            }
         })
    }
)

// Inngest function to send email when user books a show
const sendBookingConfirmationEmail = inngest.createFunction(
    {id:"send-booking-confirmation-email"},
    {event:"app/show.booked"},
    async ({event,step})=>{
        const {bookingId} = event.data;

        const booking = await Booking.findById(bookingId).populate({
            path:'show',
            populate:{
                path:'movie',
                model:'Movie'
            }
        }).populate('user');
      await sendEmail({
        to:booking.user.email,
        subject:`Payment Confirmation: ${booking.show.movie.title} booked - MovieGo`,
        body:`<h1>Payment Confirmed!</h1>
        <p>Enjoy your movie!</p>
        <p> Thank you for choosing MovieGo.</p>
        <p>Best regards,<br/>MovieGo Team</p>`
      })
    }
)


export const functions = [
    syncUserCreation,
    syncUserDeletion,
    syncUserUpdation,
    relaseSeatsAndDeleteBooking,
    sendBookingConfirmationEmail
];