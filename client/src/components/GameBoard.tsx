import React from 'react';

interface GameBoardProps {
  board: string[];
  currentPlayer: string;
  username: string;
  roomId: string;
  onMove: (index: number) => void;
  winner: string | null;
}

const GameBoard: React.FC<GameBoardProps> = ({
  board,
  currentPlayer,
  username,
  roomId,
  onMove,
  winner
}) => {
  const isMyTurn = currentPlayer === username;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <div className="mb-4">
        <h2 className="text-xl">Room ID: {roomId}</h2>
        <p className="text-md">
          {winner 
            ? `Game Over! ${winner === 'DRAW' ? "It's a draw!" : `${winner} wins!`}` 
            : `Current Player: ${currentPlayer}`}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, index) => (
          <button
            key={index}
            className="w-20 h-20 border-2 border-gray-400 flex items-center justify-center text-2xl"
            onClick={() => onMove(index)}
            disabled={!isMyTurn || !!cell || !!winner}
          >
            {cell}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GameBoard; 