// src/routes/application.routes.ts

import { Router } from 'express';
import { ApplicationController } from '../controllers/application.controller';

const router = Router();

// Get user's applications
router.get('/user/:userId', ApplicationController.getUserApplications);

// Create new application
router.post('/', ApplicationController.createApplication);

// Update application status
router.patch('/:id/status', ApplicationController.updateApplicationStatus);

// Get user's applications by status
router.get('/user/:userId/status/:status', ApplicationController.getUserApplicationsByStatus);

// Get user's upcoming deadlines
router.get('/user/:userId/upcoming', ApplicationController.getUserUpcomingDeadlines);

export default router;