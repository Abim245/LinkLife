import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import emergencyRoutes from './routes/emergency.js';
import adminRoutes from './routes/admin.js';
import donorRoutes from './routes/donor.js';
import inventoryRoutes from './routes/inventory.js';
const app = express();
const allowed = env.clientUrl.split(',').map((s) => s.trim());
app.use(cors({ origin: allowed, credentials: true }));
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ ok: true }));

// ...
app.use('/api/auth', authRoutes);
// Mount routes here as you build them:
app.use('/api/donors', donorRoutes);
app.use('/api/emergencies', emergencyRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/admin', adminRoutes);
app.use(morgan('dev', { skip: (req, res) => res.statusCode === 304 }));
app.use(errorHandler);

export default app;