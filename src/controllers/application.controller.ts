import { Request, Response } from 'express';
import { ApplicationService } from '../services/application.service';

export class ApplicationController {
    static async getUserCompletedTasks(req: Request, res: Response) {
        try {
            const { userId } = req.query;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'userId is required'
                });
            }

            const completedTasks = await ApplicationService.getUserCompletedApplications(userId as string);

            res.status(200).json({
                success: true,
                data: completedTasks
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    static async searchUserTasks(req: Request, res: Response) {
        try {
            const { userId, search } = req.query;

            if (!userId || !search) {
                return res.status(400).json({
                    success: false,
                    message: 'userId and search terms are required'
                });
            }

            const tasks = await ApplicationService.searchUserApplications(userId as string, search as string);

            res.status(200).json({
                success: true,
                data: tasks
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}

export default new ApplicationController();