import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import inventoryRoutes from './routes/inventory.routes';
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables
dotenv.config();

// Initialize Prisma Client
const prisma = new PrismaClient();

// Create Express application
const app = express();

app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  credentials: true
}));

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/inventory', inventoryRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Server startup
const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
});

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down gracefully...');
  
  try {
    await prisma.$disconnect();
    console.log('Database connection closed');
    
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
    
    // Force close after 5 seconds
    setTimeout(() => {
      console.error('Forcing shutdown after timeout');
      process.exit(1);
    }, 5000);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  shutdown();
});

export { app, prisma };