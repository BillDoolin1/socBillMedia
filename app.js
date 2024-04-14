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
    // For private rooms, send back encrypted messages as they are
    // For public rooms, send back plaintext messages
    res.json(messages[room] || []);
});

app.post('/messages', (req, res) => {
    const { message, room, username } = req.body;
    
    // Encrypt message if it's a private room
    if (room.includes('Private')) {
        const encryptedMessage = encrypt(message);
        messages[room].push({ username, message: encryptedMessage });
    } else {
        messages[room].push({ username, message }); // Public messages are not encrypted
    }
    
    res.status(201).send('Message added');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
