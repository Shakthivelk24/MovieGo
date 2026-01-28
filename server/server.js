import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';

const app = express();

const port = process.env.PORT || 4000;

await connectDB();

// Middleware
app.use(express.json());
app.use(cors());


// API Routes
app.get('/',(req,res) =>{
    res.send('Server is running');
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

