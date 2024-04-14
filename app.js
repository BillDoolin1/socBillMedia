const express = require('express');
const forge = require('node-forge');
const app = express();
app.use(express.static('public'));
app.use(express.json());


// to add / delete users from private rooms, add them to user function and as authorizedUsers of room
// this was meant to get integrated into the admin console but due to time constraints was left to be dynamically
// changed in the app.js file instead
let users = {
    'fullAccessUser1': generateKeyPair(),
    'fullAccessUser2': generateKeyPair()
};

// its here we store the log of messages along with tracking who has access to what rooms
let rooms = {
    'Public GroupChat 1': { messages: [] },
    'Public GroupChat 2': { messages: [] },
    'Private Groupchat 3': { messages: [], authorizedUsers: ['fullAccessUser1', 'fullAccessUser2'] },
    'Private Groupchat 4': { messages: [], authorizedUsers: ['fullAccessUser1', 'fullAccessUser2'] } 
};

// generate key pair and return
function generateKeyPair() {
    const keypair = forge.pki.rsa.generateKeyPair(2048);
    return {
        privateKey: forge.pki.privateKeyToPem(keypair.privateKey),
        publicKey: forge.pki.publicKeyToPem(keypair.publicKey)
    };
}

// in this function we are encrypting the message with the publik key
function encryptMessage(message, publicKey) {
    const buffer = forge.util.createBuffer(message, 'utf8');
    const encrypted = publicKey.encrypt(buffer.getBytes(), 'RSA-OAEP');
    return forge.util.encode64(encrypted);
}

// \nd here we decrypt it with the private key
function decryptMessage(encryptedMessage, privateKey) {
    const buffer = forge.util.createBuffer(forge.util.decode64(encryptedMessage));
    const decrypted = privateKey.decrypt(buffer.getBytes(), 'RSA-OAEP');
    return decrypted;
}

app.post('/messages', (req, res) => {
    const { message, room, username } = req.body;
    let messageToStore = message;
    // if room is private we encrypt all messages in the room with public key
    if (room.includes('Private') && rooms[room].authorizedUsers.includes(username)) {
        const publicKey = users[username].publicKey; 
        messageToStore = encryptMessage(message, publicKey);
    }
    if (rooms[room]) {
        rooms[room].messages.push({ username, message: messageToStore });
    }
    //send response back
    res.status(201).send('Message added');
});

app.get('/messages', (req, res) => {
    const { room, username } = req.query;
    let roomMessages = rooms[room]?.messages || [];
    // Decrypt messages if the room is private and the user is one of authorized users
    if (room.includes('Private') && rooms[room].authorizedUsers.includes(username)) {
        const privateKey = users[username].privateKey;
        roomMessages = roomMessages.map(msg => ({
            ...msg,
            message: decryptMessage(msg.message, privateKey)
        }));
    }
    //send response back
    res.json(roomMessages);
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
const PORT = 3000;
app.listen(PORT, () => console.log(`run me on http://localhost:${PORT}`));
