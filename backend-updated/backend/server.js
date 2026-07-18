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
// Bind to 0.0.0.0 (not just localhost) so the frontend PC on the same
// network can reach this server using this machine's LAN IP.
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[🚀 MEDPULSE CORE] Engine active on: http://localhost:${PORT}`);
  console.log('If your frontend is on a different PC, find this machine\'s LAN IP');
  console.log('(Windows: run `ipconfig` and look for IPv4 Address, e.g. 192.168.x.x)');
  console.log(`and point the frontend at http://<that-ip>:${PORT}/api/analyze`);
});