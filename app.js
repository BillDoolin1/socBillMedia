const express = require('express');  
const app = express();
app.use(express.static('public'));
app.use(express.json()); 

let messages = {}; // Object to store messages by room

app.get('/messages', (req, res) => {
    const room = req.query.room;
    res.json(messages[room] || []);
});

app.post('/messages', (req, res) => {
    const { message, room, username } = req.body;
    if (!messages[room]) {
        messages[room] = [];
    }
    messages[room].push({ username: username, message: message });
    res.status(201).send('Message added');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
