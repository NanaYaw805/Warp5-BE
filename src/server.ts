import express from 'express';
import mongoose from 'mongoose';

import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI as string)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('Hello, World!!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 