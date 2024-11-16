import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import socketService from '../services/socketService';

interface GameState {
  board: string[];
  players: string[];
  currentPlayer: string;
  gameState: {
    status: 'waiting' | 'playing' | 'finished';
    winner: string | null;
  };
}

const GameBoard: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const username = localStorage.getItem('username')!;
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;

    // Connect only if not already connected
    if (!socketService.isConnected()) {
      socketService.connect();
    }

    // Re-emit join/create room to get the current game state
    if (gameState === null) {
      socketService.rejoinRoom(roomId, username);
    }
    
    // Listen for game updates
    const handleGameUpdate = (newGameState: GameState) => {
      console.log('Game state updated:', newGameState);
      setGameState(newGameState);
      setError(null);
    };

    const handleGameError = (errorMessage: string) => {
      console.error('Game error:', errorMessage);
      setError(errorMessage);
    };

    socketService.onGameUpdate(handleGameUpdate);
    socketService.onGameError(handleGameError);

    return () => {
      // Only remove listeners, don't disconnect
      socketService.removeListener('gameUpdate', handleGameUpdate);
      socketService.removeListener('gameError', handleGameError);
    };
  }, [roomId, username]);

  const handleCellClick = (position: number) => {
    if (!roomId || !gameState) return;
    
    // Check if it's player's turn and cell is empty
    if (gameState.currentPlayer === username && !gameState.board[position]) {
      socketService.makeMove(roomId, position, username);
    }
  };

  const handleLeaveRoom = () => {
    if (roomId) {
      socketService.leaveRoom(roomId, username);
      navigate('/room');
    }
  };

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading game...</div>
      </div>
    );
  }

  const isMyTurn = gameState.currentPlayer === username;
  const isPlayer1 = username === gameState.players[0];
  const mySymbol = isPlayer1 ? 'X' : 'O';

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      {/* Players Info */}
      <div className="mb-6 grid grid-cols-2 gap-4 text-center">
        <div className={`p-2 rounded ${isPlayer1 ? 'bg-blue-100' : 'bg-gray-100'}`}>
          <div className="font-bold">{gameState.players[0]} (X)</div>
          <div className="text-sm">
            {gameState.players[0] === gameState.currentPlayer ? 'Current Turn' : ''}
          </div>
        </div>
        <div className={`p-2 rounded ${!isPlayer1 ? 'bg-blue-100' : 'bg-gray-100'}`}>
          <div className="font-bold">
            {gameState.players[1] ? `${gameState.players[1]} (O)` : 'Waiting for player...'}
          </div>
          <div className="text-sm">
            {gameState.players[1] === gameState.currentPlayer ? 'Current Turn' : ''}
          </div>
        </div>
      </div>

      {/* Game Status */}
      <div className="mb-4 text-center">
        {gameState.gameState.winner ? (
          <div className="text-xl font-bold text-green-600">
            {gameState.gameState.winner === username ? '🎉 You won! 🎉' : `${gameState.gameState.winner} won!`}
          </div>
        ) : (
          <div className="text-xl font-semibold text-blue-600">
            {isMyTurn ? 'Your turn' : `Waiting for ${gameState.currentPlayer}'s move`}
          </div>
        )}
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {gameState.board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleCellClick(index)}
            disabled={!isMyTurn || !!gameState.gameState.winner}
            className={`
              w-20 h-20 text-4xl font-bold rounded
              ${!cell && isMyTurn && !gameState.gameState.winner ? 'hover:bg-gray-100 cursor-pointer' : 'cursor-not-allowed'}
              ${cell ? 'bg-white' : 'bg-gray-50'}
              border-2 
              ${cell === mySymbol ? 'border-blue-300' : cell ? 'border-red-300' : 'border-gray-200'}
              transition-colors duration-200
            `}
          >
            <span className={cell === mySymbol ? 'text-blue-600' : 'text-red-600'}>
              {cell}
            </span>
          </button>
        ))}
      </div>

      {/* Draw Message */}
      {gameState.gameState.winner === null && !gameState.board.includes('') && (
        <div className="mt-4 text-xl text-center font-bold text-yellow-600">
          Game Draw!
        </div>
      )}

      {/* Room Info */}
      <div className="mt-4 text-sm text-gray-600 text-center">
        <div>Room ID: {roomId}</div>
        <div>You are playing as: {mySymbol}</div>
      </div>

      {/* Leave Room Button */}
      <button
        onClick={handleLeaveRoom}
        className="mt-4 w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200"
      >
        Leave Room
      </button>
    </div>
  );
};

export default GameBoard; 