import { Router } from 'express';
import { ApplicationController } from '../controllers/application.controller';
import catchErrors from '../utils/catchErrors';

const router = Router();

router.post('/', catchErrors(ApplicationController.submitApplication));
router.get('/user', catchErrors(ApplicationController.getUserApplications));
router.patch('/:id/status', catchErrors(ApplicationController.updateApplicationStatus));

export default router;