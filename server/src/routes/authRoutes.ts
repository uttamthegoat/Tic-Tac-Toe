import express from 'express';
import { login, register } from '../controllers/authController';

const router = express.Router();

router.post('/login', (req, res) => {
  login(req, res);
});

router.post('/register', (req, res) => {
  register(req, res);
});

export default router; 