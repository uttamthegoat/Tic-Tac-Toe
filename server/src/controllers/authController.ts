import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import authService from '../services/authService';

// You should store this in an environment variable
const JWT_SECRET = 'your-secret-key';

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

    // Generate JWT token
    const token = jwt.sign(
      { 
        username,
        // You can add more data to the token payload if needed
      }, 
      JWT_SECRET,
      { 
        expiresIn: '24h' // Token expires in 24 hours
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { 
        username,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Add middleware to verify JWT tokens
export const verifyToken = (req: Request, res: Response, next: Function) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Extract token from Bearer header
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add decoded user data to request object
    // req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
}; 