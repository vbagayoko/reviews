const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const cors = require('cors');

// MongoDB connection string - replace with your own
const uri = process.env.MONGODB_URI || "mongodb+srv://vbagayoko:Energumene1@cluster0.3lqr6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

let reviewsCollection;

// Connect to MongoDB
async function connectDB() {
    try {
        await client.connect();
        const db = client.db('reviews_db');
        reviewsCollection = db.collection('reviews');
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
    }
}
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Get all reviews
app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await reviewsCollection.find().toArray();
        // Transform the data to match the previous format
        const formattedReviews = reviews.reduce((acc, review) => {
            if (!acc[review.itemName]) {
                acc[review.itemName] = [];
            }
            acc[review.itemName].push({
                text: review.text,
                rating: review.rating,
                date: review.date
            });
            return acc;
        }, {});
        res.json(formattedReviews);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// Add a review
app.post('/api/reviews', async (req, res) => {
    try {
        console.log('Received review request:', req.body);
        const { itemName, reviewText, rating } = req.body;
        
        if (!itemName || !reviewText) {
            console.log('Missing required fields');
            return res.status(400).json({ error: 'Item name and review text are required' });
        }

        const review = {
            itemName,
            text: reviewText,
            rating: parseInt(rating),
            date: new Date().toISOString()
        };
        
        console.log('Attempting to insert review:', review);
        await reviewsCollection.insertOne(review);
        console.log('Review inserted successfully');
        res.json({ success: true });
    } catch (err) {
        console.error('Error adding review:', err);
        res.status(500).json({ error: 'Failed to add review: ' + err.message });
    }
});

// Use environment port or fallback to 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Handle shutdown gracefully
process.on('SIGINT', async () => {
    await client.close();
    process.exit();
});
