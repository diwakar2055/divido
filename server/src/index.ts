import dotenv from 'dotenv';
dotenv.config();

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import os from 'os';
import authRoutes from './routes/authRoutes';
import expenseRoutes from './routes/expenseRoutes';
import groupRoutes from './routes/groupRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
const MAX_RETRIES = 5;
const RETRY_INTERVAL_MS = 3000;

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI is not defined in environment variables');
    if (process.env.NODE_ENV === 'production') process.exit(1);
    return;
  }

  const options = {
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    maxPoolSize: 50, // Maintain up to 50 socket connections
  };

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(mongoUri, options);
      console.log('✅ MongoDB connected successfully');

      // Setup event listeners for connection dropping after initial connect
      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected! Attempting to reconnect...');
      });
      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected successfully');
      });

      return; // Exit loop on success
    } catch (error: any) {
      console.error(`❌ MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed:`, error.message);

      if (attempt === MAX_RETRIES) {
        if (error.code === 'ENOTFOUND') {
          console.log('\n💡 TIP: Your MONGODB_URI hostname is invalid (ENOTFOUND).');
          console.log('   Check server/.env - you might be missing the unique cluster ID.');
          console.log('   Example: cluster0.xxxxx.mongodb.net instead of cluster0.mongodb.net\n');
        }

        if (process.env.NODE_ENV === 'production') {
          process.exit(1);
        } else {
          console.log('⚠️ Running in development mode without database');
          console.log('📝 Configure MONGODB_URI in .env and restart to enable database features');
          return;
        }
      }

      console.log(`⏳ Retrying in ${RETRY_INTERVAL_MS / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL_MS));
    }
  }
};

import rateLimit from 'express-rate-limit';

// Rate Limiting Config
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per `window` for auth routes to prevent brute-force
  message: { message: 'Too many login attempts from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply API general rate limit to all /api routes
app.use('/api', apiLimiter);

// Routes
// Apply strict auth rate limiter to all /api/auth routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/expenses', expenseRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

// Start server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    // Detect local network IP
    const interfaces = os.networkInterfaces();
    let networkIp = 'localhost';
    for (const name of Object.keys(interfaces)) {
      const iface = interfaces[name];
      if (iface) {
        for (const entry of iface) {
          if (entry.family === 'IPv4' && !entry.internal) {
            networkIp = entry.address;
          }
        }
      }
    }

    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Network URL: http://${networkIp}:${PORT}`);
    console.log(`📝 API available at http://localhost:${PORT}/api`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
