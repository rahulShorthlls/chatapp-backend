require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
});

io.on("connect_error", (err) => {
    console.log(`Connect Error: ${err.message}`);
});

app.use(cors({
    origin: "*",
    credentials: true
}));
app.use(express.json());

let messages = [];

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('new-user', (name) => {
        console.log(`${name} has joined the chat.`);
    });

    socket.on('send-message', (data) => {
        console.log('Message received:', data);
        messages.push(data);
        io.emit('receive-message', data);
    });

    socket.on('send-reply', (data) => {
        console.log('Reply received:', data);
        const replyMessage = {
            ...data,
            replyTo: data.replyTo // Include the ID or content of the message being replied to
        };
        messages.push(replyMessage);
        io.emit('receive-reply', replyMessage);
    });

    socket.on('clear-chat', () => {
        console.log('Chat cleared by user.');
        messages = [];
        io.emit('chat-cleared');
    });

    socket.on('mark-seen', (data) => {
        io.emit('message-seen', data);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

app.get("/hello", (req, res) => {
    return res.send("Hello World!ddhhd");
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
