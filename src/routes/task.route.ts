import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import catchErrors from '../utils/catchErrors';

const router = Router();

router.post('/', catchErrors(TaskController.createTask));
router.get('/recent', catchErrors(TaskController.getRecentTasks));
router.get('/filter', catchErrors(TaskController.getFilteredTasks));
router.get('/search', catchErrors(TaskController.searchTasks));
router.get('/:id', catchErrors(TaskController.getTaskById));

export default router;