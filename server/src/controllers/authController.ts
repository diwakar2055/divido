import { Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { generateToken, hashPassword, verifyPassword } from '../utils/auth';

const setTokenCookie = (res: Response, token: string) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const signup = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    // Check if user exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = new User({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
    });

    await user.save();

    // Generate token and set cookie
    const token = generateToken(user._id.toString());
    setTokenCookie(res, token);

    res.status(201).json({
      message: 'User created successfully',
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Signup failed', error: error.message });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    // Find user
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token and set cookie
    const token = generateToken(user._id.toString());
    setTokenCookie(res, token);

    res.status(200).json({
      message: 'Login successful',
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
};

export const loginWithGoogle = async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return res.status(500).json({ message: 'Google Client ID not configured' });
    }

    const client = new OAuth2Client(clientId);

    // Verify the token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const { email, name, picture } = payload;
    const cleanEmail = email?.toLowerCase().trim();

    // Find or create user
    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // Create new user for Google OAuth
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await hashPassword(randomPassword);

      user = new User({
        name: name || cleanEmail?.split('@')[0],
        email: cleanEmail,
        password: hashedPassword,
        googleId: payload.sub,
      });

      await user.save();
    } else {
      // Update googleId if not set
      if (!user.googleId) {
        user.googleId = payload.sub;
        await user.save();
      }
    }

    // Generate token and set cookie
    const authToken = generateToken(user._id.toString());
    setTokenCookie(res, authToken);

    res.status(200).json({
      message: 'Google login successful',
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error: any) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Google login failed', error: error.message });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.status(200).json({ message: 'Logged out successfully' });
};
