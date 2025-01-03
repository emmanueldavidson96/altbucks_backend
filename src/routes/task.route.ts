import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';

const router = Router();

// Task routes - authentication is handled in the controller
router.post('/', TaskController.createTask);
router.get('/', TaskController.getAllTasks);
router.get('/recent', TaskController.getRecentTasks);
router.get('/search', TaskController.searchTasks);
router.get('/status/:status', TaskController.getTasksByStatus);
router.get('/upcoming', TaskController.getUpcomingDeadlines);
router.get('/:id', TaskController.getTaskById);

// Status changes ,deletion and update
router.patch('/:id/complete', TaskController.markTaskComplete);
router.patch('/:id/pending', TaskController.markTaskPending);
router.delete('/:id', TaskController.deleteTask);
router.patch('/:id', TaskController.updateTask);

export default router;