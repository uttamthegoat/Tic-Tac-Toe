import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) {
      return;
    }

    const token = localStorage.getItem('token');
    
    this.socket = io('http://localhost:3001', {
      transports: ['websocket'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('Socket connected successfully');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  createRoom(roomId: string, username: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        this.connect();
      }

      this.socket!.emit('createRoom', { roomId, username });

      this.socket!.once('roomCreated', () => {
        resolve();
      });

      this.socket!.once('gameError', (error: string) => {
        reject(new Error(error));
      });
    });
  }

  joinRoom(roomId: string, username: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
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

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  handleLogout() {
    this.disconnect();
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
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

  leaveRoom(roomId: string, username: string) {
    if (this.socket) {
      this.socket.emit('leaveRoom', { roomId, username });
    }
  }

  rejoinRoom(roomId: string, username: string) {
    if (this.socket) {
      this.socket.emit('rejoinRoom', { roomId, username });
    }
  }

  removeListener(event: string, listener: Function) {
    if (this.socket) {
      this.socket.off(event, listener as any);
    }
  }
}

export default new SocketService(); 