import express from 'express';
import { 
  createVideo, getVideos, getVideoById, updateVideo, deleteVideo, toggleLike 
} from '../controllers/videoController.js';
import { upload } from '../lib/upload.js';

const router = express.Router();

router.get('/', getVideos);
router.get('/:id', getVideoById);
router.post('/toggle-like', toggleLike);
router.post('/', upload.single('video'), createVideo);
router.patch('/:id', upload.single('video'), updateVideo);
router.delete('/:id', deleteVideo);

export default router;
