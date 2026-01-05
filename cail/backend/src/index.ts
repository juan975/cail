import express, { Application } from 'express';
import cors from 'cors';
import { config } from './shared/infrastructure/config/env.config';
import { errorHandler } from './shared/infrastructure/middleware/error.middleware';
import authRoutes from './modules/auth/infrastructure/routes/auth.routes';
import usersRoutes from './modules/users/infrastructure/routes/users.routes';
import offersRoutes from './modules/offers/infrastructure/routes/offers.routes';
import matchingRoutes from './modules/matching/infrastructure/routes/matching.routes';

const app: Application = express();

app.use(cors({
    origin: config.cors.allowedOrigins,
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
    });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/offers', offersRoutes);
app.use('/api/v1/matching', matchingRoutes);

app.use(errorHandler);

const PORT = config.port;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;
