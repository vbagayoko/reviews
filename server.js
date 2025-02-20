const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const cors = require('cors');

const REVIEWS_FILE = 'reviews.json';

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Initialize reviews file if it doesn't exist
if (!fs.existsSync(REVIEWS_FILE)) {
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify({}));
}

// Get all reviews
app.get('/api/reviews', (req, res) => {
    const reviews = JSON.parse(fs.readFileSync(REVIEWS_FILE));
    res.json(reviews);
});

// Add a review
app.post('/api/reviews', (req, res) => {
    const { itemName, reviewText, rating } = req.body;
    
    if (!itemName || !reviewText) {
        return res.status(400).json({ error: 'Item name and review text are required' });
    }

    const reviews = JSON.parse(fs.readFileSync(REVIEWS_FILE));
    
    if (!reviews[itemName]) {
        reviews[itemName] = [];
    }

    reviews[itemName].push({
        text: reviewText,
        rating: parseInt(rating),
        date: new Date().toISOString()
    });

    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2));
    res.json({ success: true });
});

// Use environment port or fallback to 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
