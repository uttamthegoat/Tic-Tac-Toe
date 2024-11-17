import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { login, register } from './controllers/authController';

const app = express();
const httpServer = createServer(app);

// Enable CORS
app.use(cors({
    origin: "http://localhost:5173",
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(express.json());
// Auth routes
app.post('/api/auth/login', (req, res) => {
    login(req, res);
});
app.post('/api/auth/register', (req, res) => {
    register(req, res);
});

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'Server is running!' });
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
const rooms = new Map<string, Room>();

interface Room {
  players: string[];
  board: string[];
  currentPlayer: string;
  gameState: {
    status: 'waiting' | 'playing' | 'finished';
    winner: string | null;
  };
}

// Socket connection handling
io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    socket.on('createRoom', ({ roomId, username }) => {
        console.log('Creating room:', roomId, 'for user:', username);
        
        if (rooms.has(roomId)) {
            socket.emit('gameError', 'Room already exists');
            return;
        }

        const newRoom: Room = {
            players: [username],
            board: Array(9).fill(''),
            currentPlayer: username,
            gameState: {
                status: 'waiting',
                winner: null
            }
        };

        rooms.set(roomId, newRoom);
        socket.join(roomId);

        // Emit initial game state
        socket.emit('gameUpdate', newRoom);
        socket.emit('roomCreated');
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
        room.gameState.status = 'playing';
        socket.join(roomId);

        // Emit game state to all players in the room
        io.to(roomId).emit('gameUpdate', room);
        socket.emit('roomJoined');
    });

    socket.on('makeMove', ({ roomId, position, username }) => {
        const room = rooms.get(roomId);
        if (!room) return;

        // Verify it's the player's turn
        if (room.currentPlayer !== username) {
            socket.emit('gameError', "It's not your turn");
            return;
        }

        // Verify the position is valid and empty
        if (position < 0 || position > 8 || room.board[position] !== '') {
            socket.emit('gameError', 'Invalid move');
            return;
        }

        // Make the move
        const symbol = room.players[0] === username ? 'X' : 'O';
        room.board[position] = symbol;

        // Check for winner
        if (checkWinner(room.board)) {
            room.gameState.status = 'finished';
            room.gameState.winner = username;
        } else if (!room.board.includes('')) {
            room.gameState.status = 'finished';
            room.gameState.winner = null; // Draw
        }

        // Switch turns
        room.currentPlayer = room.players.find(player => player !== username)!;

        // Broadcast the updated game state
        io.to(roomId).emit('gameUpdate', room);
    });

    socket.on('rejoinRoom', ({ roomId, username }) => {
        console.log('Rejoining room:', roomId, 'user:', username);
        const room = rooms.get(roomId);

        if (!room) {
            socket.emit('gameError', 'Room not found');
            return;
        }

        if (!room.players.includes(username)) {
            socket.emit('gameError', 'Not a member of this room');
            return;
        }

        socket.join(roomId);
        socket.emit('gameUpdate', room);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Helper function to check for a winner
function checkWinner(board: string[]): boolean {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    return winningCombinations.some(([a, b, c]) => {
        return board[a] && board[a] === board[b] && board[a] === board[c];
    });
}

const PORT = 3001;

// Start server
httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}); 