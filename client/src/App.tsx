import React, { useState, useEffect } from 'react'
import Login from './components/Login'
import Room from './components/Room'
import GameBoard from './components/GameBoard'
import socketService from './services/socketService'
import './App.css'

type GameState = {
  board: string[]
  currentPlayer: string
  players: string[]
  gameState: {
    status: 'waiting' | 'playing' | 'finished'
    winner: string | null
  }
}

const App: React.FC = () => {
  const [username, setUsername] = useState<string | null>(null)
  const [roomId, setRoomId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [gameState, setGameState] = useState<any>(null)

  useEffect(() => {
    if (username) {
      socketService.connect()
      
      socketService.onGameError((errorMessage) => {
        setError(errorMessage)
        setIsLoading(false)
      })

      socketService.onGameUpdate((newGameState) => {
        setGameState(newGameState)
      })
    }

    return () => {
      socketService.disconnect()
    }
  }, [username])

  const handleLogin = (user: string) => {
    setUsername(user)
  }

  const handleCreateRoom = async (newRoomId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await socketService.createRoom(newRoomId, username!)
      setRoomId(newRoomId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room')
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinRoom = async (joinRoomId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await socketService.joinRoom(joinRoomId, username!)
      setRoomId(joinRoomId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room')
    } finally {
      setIsLoading(false)
    }
  }

  if (!username) {
    return <Login onLogin={handleLogin} />
  }

  if (!roomId) {
    return (
      <Room
        username={username}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        error={error || undefined}
        isLoading={isLoading}
      />
    )
  }

  return (
    <div>
      {gameState && (
        <GameBoard
          board={gameState.board}
          currentPlayer={gameState.currentPlayer}
          username={username}
          roomId={roomId}
          onMove={(position) => {
            socketService.makeMove(roomId, position, username)
          }}
          winner={gameState.winner}
        />
      )}
    </div>
  )
}

export default App
