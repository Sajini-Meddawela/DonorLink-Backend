import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import inventoryRoutes from './routes/inventory.routes';
import needRoutes from './routes/need.routes';
import mealDonationRoutes from './routes/mealDonation.routes';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const prisma = new PrismaClient();

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true
}));

app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/inventory', inventoryRoutes);
app.use('/api/needs', needRoutes);
app.use('/api/mealdonations', mealDonationRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});


app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
});

const shutdown = async () => {
  console.log('Shutting down gracefully...');
  
  try {
    await prisma.$disconnect();
    console.log('Database connection closed');
    
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
    
    setTimeout(() => {
      console.error('Forcing shutdown after timeout');
      process.exit(1);
    }, 5000);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  shutdown();
});

export { app, prisma };