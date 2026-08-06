import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import resumeRoutes from './routes/resumeRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/v1/resume', resumeRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/interview', interviewRoutes);

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to SkillScan AI API' });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'SkillScan AI Backend is running smoothly!' });
});

app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Server Error'
    });
});

export default app;