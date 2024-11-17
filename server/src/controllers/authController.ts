import pool from '../config/database';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config()

// const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const JWT_SECRET = 'your-secret-key';

export async function login(req: Request, res: Response) {
  const { username, password } = req.body;
  
  try {
    const [rows]: any = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if password matches
    if (rows[0].password !== password) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid password' 
      });
    }

    // Generate token if password matches
    const token = jwt.sign(
      { id: rows[0].id, username: rows[0].username }, 
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      success: true,
      token,
      user: {
        id: rows[0].id,
        username: rows[0].username
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}


export async function register(req: Request, res: Response) {
  const { username, email, password } = req.body;
  
  try {
    // Check if user already exists
    const [existingUser]: any = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    // Insert new user
    const [result]: any = await pool.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, password]
    );

    // Generate token for new user
    const token = jwt.sign(
      { id: result.insertId, username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: result.insertId,
        username,
        email
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}