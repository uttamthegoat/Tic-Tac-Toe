import React, { useState } from 'react';

interface LoginProps {
  onLogin: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // First, test if server is reachable
      const testResponse = await fetch('http://localhost:3001/test');
      if (!testResponse.ok) {
        throw new Error('Cannot connect to server');
      }

      // Proceed with login
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (data.success) {
        onLogin(username);
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Server connection failed. Please make sure the server is running on port 3001');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl mb-4">Login</h2>
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2">Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={isLoading}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={isLoading}
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full ${
            isLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
          } text-white p-2 rounded`}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="mt-4 text-sm text-gray-600">
        <p>Available users:</p>
        <p>Username: player1, Password: pass123</p>
        <p>Username: player2, Password: pass456</p>
      </div>
    </div>
  );
};

export default Login; 