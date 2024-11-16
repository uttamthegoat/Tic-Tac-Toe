import React, { useState } from 'react';

interface RoomProps {
  username: string;
  onJoinRoom: (roomId: string) => void;
  onCreateRoom: (roomId: string) => void;
  error?: string;
  isLoading?: boolean;
}

const Room: React.FC<RoomProps> = ({ 
  username, 
  onJoinRoom, 
  onCreateRoom, 
  error, 
  isLoading 
}) => {
  const [roomId, setRoomId] = useState('');
  const [mode, setMode] = useState<'join' | 'create' | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim()) return;

    if (mode === 'create') {
      onCreateRoom(roomId);
    } else if (mode === 'join') {
      onJoinRoom(roomId);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl mb-4">Welcome, {username}!</h2>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {!mode ? (
        <div className="space-y-4">
          <button
            onClick={() => setMode('create')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
          >
            Create New Room
          </button>
          <button
            onClick={() => setMode('join')}
            className="w-full bg-green-500 hover:bg-green-600 text-white p-2 rounded"
          >
            Join Existing Room
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">
              {mode === 'create' ? 'Enter New Room ID:' : 'Enter Room ID:'}
            </label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder={mode === 'create' ? 'Create room ID' : 'Enter room ID'}
              className="w-full p-2 border rounded"
              disabled={isLoading}
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !roomId.trim()}
            className={`w-full ${
              isLoading || !roomId.trim()
                ? 'bg-gray-400'
                : mode === 'create'
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-green-500 hover:bg-green-600'
            } text-white p-2 rounded`}
          >
            {isLoading 
              ? 'Processing...' 
              : mode === 'create'
                ? 'Create Room'
                : 'Join Room'
            }
          </button>

          <button
            type="button"
            onClick={() => setMode(null)}
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 p-2 rounded"
          >
            Back
          </button>
        </form>
      )}
    </div>
  );
};

export default Room; 