import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './config/database';
import apiRoutes from './routes';
import { setupLegacyRoutes } from './middleware/legacyAdapter';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

// Import models to register associations
import './models/index';

const app = express();
const PORT = parseInt(process.env.PORT || '8080', 10);

// ─── Global Middleware ───────────────────────────────────────────────────────

// CORS: Allow Angular frontend (default localhost:4200) and any origin in dev
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Parse JSON bodies (large payloads for enrollment batches)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── API Routes ─────────────────────────────────────────────────────────────────
app.use(apiRoutes);

// ─── Health Check ────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ─── Legacy API Adapter Routes ───────────────────────────────────────────────
// Maps the existing Angular frontend API paths to our controller functions.
// This is the compatibility layer so the frontend works without modification.
setupLegacyRoutes(app);

// ─── Centralized Error Handler ───────────────────────────────────────────────
app.use(errorHandler);

// ─── Database Sync & Server Start ────────────────────────────────────────────

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync models (alter: true adds missing columns without dropping data)
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized.');

    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 CRM Backend server running on http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
