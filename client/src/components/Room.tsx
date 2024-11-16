import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socketService from '../services/socketService';

const Room: React.FC = () => {
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'create' | 'join' | null>(null);
  const navigate = useNavigate();
  const username = localStorage.getItem('username')!;

  useEffect(() => {
    // Connect socket when component mounts
    if (!socketService.isConnected()) {
      socketService.connect();
    }

    // Don't disconnect when component unmounts
    return () => {};
  }, []);

  const handleCreateRoom = async () => {
    if (!roomId.trim()) return;
    setIsLoading(true);
    setError('');
    try {
      await socketService.createRoom(roomId, username);
      navigate(`/game/${roomId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomId.trim()) return;
    setIsLoading(true);
    setError('');
    try {
      await socketService.joinRoom(roomId, username);
      navigate(`/game/${roomId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
    } finally {
      setIsLoading(false);
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
        // Mode Selection Buttons
        <div className="space-y-4">
          <button
            onClick={() => setMode('create')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white p-3 rounded transition-colors"
          >
            Create New Room
          </button>
          <button
            onClick={() => setMode('join')}
            className="w-full bg-green-500 hover:bg-green-600 text-white p-3 rounded transition-colors"
          >
            Join Existing Room
          </button>
        </div>
      ) : (
        // Room ID Input and Submit
        <div className="space-y-4">
          <div>
            <label className="block mb-2">
              {mode === 'create' ? 'Create Room ID:' : 'Enter Room ID:'}
            </label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder={mode === 'create' ? 'Enter new room ID' : 'Enter existing room ID'}
              className="w-full p-2 border rounded mb-4"
              disabled={isLoading}
              required
            />
          </div>
          
          <button
            onClick={mode === 'create' ? handleCreateRoom : handleJoinRoom}
            disabled={isLoading || !roomId.trim()}
            className={`w-full ${
              isLoading || !roomId.trim()
                ? 'bg-gray-400'
                : mode === 'create'
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-green-500 hover:bg-green-600'
            } text-white p-2 rounded transition-colors`}
          >
            {isLoading 
              ? 'Processing...' 
              : mode === 'create'
                ? 'Create Room'
                : 'Join Room'
            }
          </button>

          <button
            onClick={() => {
              setMode(null);
              setRoomId('');
              setError('');
            }}
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 p-2 rounded transition-colors"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
};

export default Room; 