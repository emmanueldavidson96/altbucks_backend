import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';

// Initialize router
const router = Router();

// Task management routes
router.post('/', TaskController.createTask);
router.get('/', TaskController.getAllTasks);
router.get('/recent', TaskController.getRecentTasks);
router.get('/search', TaskController.searchTasks);
router.get('/status/:status', TaskController.getTasksByStatus);
router.get('/upcoming', TaskController.getUpcomingDeadlines);
router.get('/:id', TaskController.getTaskById);
router.patch('/:id/status', TaskController.updateTaskStatus);

export default router;