// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config({ path: './config/.env' });

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Middleware
app.use(cors()); // Allows our frontend to safely communicate with this API
app.use(express.json()); // Allows the server to accept JSON data in request bodies

// Basic test route
app.get('/', (req, res) => {
    res.send('Shoe Smart Catalog API is running smoothly...');
});

// Routes
app.use('/api/products', require('./routes/productRoutes'));

const PORT = process.env.PORT || 2121;

app.listen(PORT, () => {
    console.log(`Server blazing on port ${PORT}`);
});