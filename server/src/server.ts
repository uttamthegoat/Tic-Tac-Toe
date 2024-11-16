import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);

// Enable CORS
app.use(cors({
    origin: "http://localhost:5173",
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(express.json());

// Test users
const users = [
    { username: 'player1', password: 'pass123' },
    { username: 'player2', password: 'pass456' }
];

// Test route to verify server is running
app.get('/test', (req, res) => {
    res.json({ message: 'Server is running!' });
});

// Login route
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, password });

    const user = users.find(u => 
        u.username === username && 
        u.password === password
    );

    if (user) {
        res.json({ 
            success: true, 
            username: user.username 
        });
    } else {
        res.status(401).json({ 
            success: false, 
            message: 'Invalid credentials' 
        });
    }
});

// Socket.IO setup
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Store rooms data
const rooms = new Map();

// Socket connection handling
io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    socket.on('createRoom', ({ roomId, username }) => {
        console.log('Creating room:', roomId, 'for user:', username);
        
        if (rooms.has(roomId)) {
            socket.emit('gameError', 'Room already exists');
            return;
        }

        rooms.set(roomId, {
            players: [username],
            board: Array(9).fill(''),
            currentPlayer: username
        });

        socket.join(roomId);
        socket.emit('roomCreated', { roomId });
        console.log('Room created:', roomId);
    });

    socket.on('joinRoom', ({ roomId, username }) => {
        console.log('Joining room:', roomId, 'user:', username);
        const room = rooms.get(roomId);

        if (!room) {
            socket.emit('gameError', 'Room not found');
            return;
        }

        if (room.players.length >= 2) {
            socket.emit('gameError', 'Room is full');
            return;
        }

        room.players.push(username);
        socket.join(roomId);
        socket.emit('roomJoined', { roomId });
        
        io.to(roomId).emit('gameUpdate', {
            board: room.board,
            players: room.players,
            currentPlayer: room.currentPlayer
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = 3001;

// Start server
httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}); 