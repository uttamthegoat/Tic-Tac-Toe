export interface Room {
  players: string[];
  currentPlayer: string;
  board: string[];
  gameState: {
    status: 'waiting' | 'playing' | 'finished';
    winner: string | null;
  };
}

export interface GameState {
  board: string[];
  currentPlayer: string;
  players: string[];
  gameState: {
    status: 'waiting' | 'playing' | 'finished';
    winner: string | null;
  };
} 