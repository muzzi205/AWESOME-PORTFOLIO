// server.js
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises; // Use promises version for async/await
const path = require('path');

const app = express();
const PORT = 3000; // Common port for local development

// Path to your comments data file
const COMMENTS_FILE = path.join(__dirname, 'comments.json');

// Middleware to serve static files (your HTML, CSS, JS, images, etc.) from the current directory
app.use(express.static(__dirname));
app.use(bodyParser.json()); // To parse JSON request bodies from the frontend

// --- Helper Functions for File Operations ---
async function readComments() {
    try {
        const data = await fs.readFile(COMMENTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // If the comments.json file doesn't exist yet, return an empty array
            console.log('comments.json not found, initializing with empty array.');
            return [];
        }
        console.error('Error reading comments file:', error);
        throw error;
    }
}

async function writeComments(comments) {
    try {
        // Pretty print JSON with 2-space indentation
        await fs.writeFile(COMMENTS_FILE, JSON.stringify(comments, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing comments file:', error);
        throw error;
    }
}

// --- API Endpoints for Comments ---

// GET endpoint: Fetch all comments
// Accessed by frontend via /api/comments
app.get('/api/comments', async (req, res) => {
    try {
        const comments = await readComments();
        // Sort comments by timestamp, newest first for display
        const sortedComments = comments.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        res.status(200).json(sortedComments);
    } catch (error) {
        // In case of error reading file, send 500 status
        res.status(500).json({ message: 'Failed to fetch comments', error: error.message });
    }
});

// POST endpoint: Add a new comment
// Accessed by frontend when a user publishes a comment
app.post('/api/comments', async (req, res) => {
    // Destructure properties from the request body (sent by frontend JS)
    const { name, message, avatar } = req.body; 

    // Basic validation: ensure name and message are provided
    if (!name || !message) {
        return res.status(400).json({ message: 'Name and message are required' });
    }

    try {
        const comments = await readComments(); // Get current comments
        const newComment = {
            id: Date.now(), // Simple unique ID based on timestamp
            name: name,     // Author's name
            message: message, // Comment text
            avatar: avatar || './img1/user.png', // User's selected avatar or a default
            timestamp: Date.now(), // Exact time for sorting
            date: new Date().toLocaleString() // Human-readable date/time
        };
        comments.push(newComment); // Add new comment to array
        await writeComments(comments); // Save updated array back to file
        
        // Respond with success message and the new comment details
        res.status(201).json({ message: 'Comment added successfully', comment: newComment });
    } catch (error) {
        // Handle server-side errors during comment saving
        res.status(500).json({ message: 'Failed to add comment', error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Open your browser to http://localhost:${PORT}/index.html`);
});