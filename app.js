const express = require('express');
const crypto = require('crypto');
const app = express();
app.use(express.static('public'));
app.use(express.json());

// Symmetric key encryption setup
const ENCRYPTION_KEY = crypto.randomBytes(32); // Replace with your secure key
const IV = crypto.randomBytes(16); // Initialization vector

let messages = {
    'Public GroupChat 1': [],
    'Public GroupChat 2': [],
    'Private Groupchat 3': [],
    'Private Groupchat 4': []
};

// Function to encrypt messages
function encrypt(text) {
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, IV);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

app.get('/messages', (req, res) => {
    const room = req.query.room;
    // Send back messages in their current form (encrypted for private, plain for public)
    res.json(messages[room] || []);
});

app.post('/messages', (req, res) => {
    const { message, room, username } = req.body;
    
    // Check if the room is private and encrypt the message if it is
    const isPrivate = room.includes('Private');
    const messageToStore = isPrivate ? encrypt(message) : message;
    
    if (!messages[room]) {
        messages[room] = [];
    }

    messages[room].push({ username, message: messageToStore });
    
    res.status(201).send('Message added');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
