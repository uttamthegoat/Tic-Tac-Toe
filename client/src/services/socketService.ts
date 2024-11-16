import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    this.socket = io('http://localhost:3001', {
      transports: ['websocket'],
      withCredentials: true
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  }

  createRoom(roomId: string, username: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('createRoom', { roomId, username });

      this.socket.once('roomCreated', () => {
        resolve();
      });

      this.socket.once('gameError', (error: string) => {
        reject(new Error(error));
      });
    });
  }

  joinRoom(roomId: string, username: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('joinRoom', { roomId, username });

      this.socket.once('roomJoined', () => {
        resolve();
      });

      this.socket.once('gameError', (error: string) => {
        reject(new Error(error));
      });
    });
  }

  makeMove(roomId: string, position: number, username: string) {
    if (this.socket) {
      this.socket.emit('makeMove', { roomId, position, username });
    }
  }

  onGameUpdate(callback: (gameState: any) => void) {
    if (this.socket) {
      this.socket.on('gameUpdate', callback);
    }
  }

  onGameError(callback: (error: string) => void) {
    if (this.socket) {
      this.socket.on('gameError', callback);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default new SocketService(); 