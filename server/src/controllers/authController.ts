import { Request, Response } from 'express';
import authService from '../services/authService';

export const login = (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }

    const isAuthenticated = authService.authenticateUser(username, password);

    if (!isAuthenticated) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { username }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}; 