import { Router } from 'express';
import { ApplicationController }  from '../controllers/application.controller';

const router = Router();

router.get('/completed', ApplicationController.getUserCompletedTasks);
router.get('/search', ApplicationController.searchUserTasks);

export default router;