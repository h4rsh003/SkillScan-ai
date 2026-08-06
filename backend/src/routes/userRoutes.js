import express from 'express';
import multer from 'multer';

import { parseResume, getUserProfile } from '../controllers/userController.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post('/parse-resume', upload.single('resume'), parseResume);
router.get('/:id', getUserProfile);

export default router;