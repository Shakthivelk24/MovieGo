import { Inngest, step } from "inngest";
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
        <p>Dear ${booking.user.name},</p>
        <p>We are excited to inform you that your payment for the movie <strong>${booking.show.movie.title}</strong> has been successfully processed.</p>
        <p><strong>Booking Details:</strong></p>
        <p>Enjoy your movie!</p>
        <p> Thank you for choosing MovieGo.</p>
        <p>Best regards,<br/>MovieGo Team</p>`
      })
    }
)

// Inngest Function to Send reminders
const sendShowReminders = inngest.createFunction(
    {id:"send-show-reminders"},
    {cron:"0 */8 * * *"}, // Every 8 hours
    async({step}) =>{
        const now = new Date();
        const in8Hours = new Date(now.getTime() + 8 * 60 * 60 * 1000);
        const windowStart = new Date(in8Hours.getTime() - 30 * 60 * 1000); // 30 minutes before

        //Prepare reminder tasks
        const reminderTasks = await step.run
        ('prepare-reminder-tasks',async() =>{
            const shows = await Show.find({
                startTime: {$gte: windowStart, $lte: in8Hours}
            }).populate('movie');

            const tasks = [];

            for(const show of shows){
                if(!show.movie || !show.occupiedSeats) continue;

                const userIds = [
                    ...new Set(
                        Object.values(show.occupiedSeats)
                    )
                ]
                if(userIds.length === 0) continue;

                const users = await User.find({_id:{$in:userIds}}).select('name email');

                for(const user of users){
                    tasks.push({
                        userEmail:user.email,
                        userName:user.name,
                        movieTitle:show.movie.title,
                        showTime:show.showDateTime
                    })
                }

            }
            return tasks;
        })
        if(reminderTasks.length === 0) return {sent:0,message:'No reminders to send'};

        // Send Reminders emails
        const results = await step.run('send-reminder-emails', async() =>{
               return await Promise.allSettled(
                reminderTasks.map(task => sendEmail({
                    to:task.userEmail,
                    subject:`Reminder: Upcoming Movie Show - ${task.movieTitle} starts soon!`,
                    body:`<h1>Upcoming Movie Show Reminder</h1>
                    <p>Dear ${task.userName},</p>
                    <p>This is a friendly reminder that your booked movie <strong>${task.movieTitle}</strong> is starting at <strong>${new Date(task.showTime).toLocaleString()}</strong>.</p>
                    <p>We look forward to seeing you there!</p>
                    <p>Best regards,<br/>MovieGo Team</p>`
                }))
               )
        })
        const sent = results.filter(r=>r.status === 'fulfilled').length;
        const failed = results.length - sent;

        return {sent,failed,message:`Reminders sent: ${sent}, failed: ${failed}`};
    }
)

// Ingest Function to send email when new show is added
const sendNewShowNotification = inngest.createFunction(
    {id:"send-new-show-notification"},
    {event:"app/show.added"},
    async ({event}) =>{
        const {movieTitle} = event.data;

        const users = await User.find({});

        for(const user of users){
            const userEmail = user.email;
            const userName = user.name;

            const subject = `🎬 New Show Added: ${movieTitle}`;
            const body = `<h1>New Show Alert!</h1>
            <h2>Dear ${userName},</h2>
            <h3 style="color: #2E86C1;">Don't Miss the Latest Show for ${movieTitle}!</h3>
            <p>We are excited to announce that a new show for the movie <strong>${movieTitle}</strong> has been added to our schedule.</p>
            <p>Don't miss out on the chance to book your tickets now!</p>

            <p>Visit our website to explore showtimes and book your seats.</p>
            
            <p>Best regards,<br/>MovieGo Team</p>`;

            await sendEmail({
            to:userEmail,
            subject,
            body
        })
     }  
     return {message:'New show notifications sent to all users'};      
    }
)


export const functions = [
    syncUserCreation,
    syncUserDeletion,
    syncUserUpdation,
    relaseSeatsAndDeleteBooking,
    sendBookingConfirmationEmail,
    sendShowReminders,
    sendNewShowNotification
];