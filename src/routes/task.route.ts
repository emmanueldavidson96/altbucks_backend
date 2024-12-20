// routes/task.routes.ts
import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';

const router = Router();

// Existing routes...
router.post('/', TaskController.createTask);
router.get('/', TaskController.getAllTasks);
router.get('/recent', TaskController.getRecentTasks);
router.get('/search', TaskController.searchTasks);
router.get('/status/:status', TaskController.getTasksByStatus);
router.get('/upcoming', TaskController.getUpcomingDeadlines);
router.get('/:id', TaskController.getTaskById);

//  routes for status changes and deletion
router.patch('/:id/complete', TaskController.markTaskComplete);
router.patch('/:id/pending', TaskController.markTaskPending);
router.delete('/:id', TaskController.deleteTask);

export default router;