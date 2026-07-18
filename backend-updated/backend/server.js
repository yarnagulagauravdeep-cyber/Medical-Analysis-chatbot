import express from 'express';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';

dotenv.config();

const app = express();
app.use(express.json());

// Open CORS configurations to bypass any local origin blocking walls during development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); 
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Register API routes
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;

// Wrap the listener so it only starts a server process when running locally, not as a serverless function
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[🚀 MEDPULSE CORE] Engine active on: http://localhost:${PORT}`);
  });
}

// Export the application instance so Vercel can handle incoming serverless traffic
export default app;