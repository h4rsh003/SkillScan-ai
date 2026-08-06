import express from 'express';
import { upload } from '../middlewares/uploadMiddleware.js';
import { processResumeUpload } from '../controllers/resumeController.js';

const router = express.Router();

router.post('/upload', upload.single('resume'), processResumeUpload);

export default router;