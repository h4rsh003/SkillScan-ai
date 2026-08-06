import express from 'express';
import {
    startInterview,
    submitAnswer,
    getInterviewDetails
} from '../controllers/interviewController.js';

const router = express.Router();

router.post('/start', startInterview);
router.post('/answer', submitAnswer);

// Naya GET route Dashboard ke liye
router.get('/:id', getInterviewDetails);

export default router;