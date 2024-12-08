import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';

export class TaskController {
    static async getTasks(req: Request, res: Response) {
        try {
            const filters = {
                category: req.query.category as string,
                payment: req.query.minPayment || req.query.maxPayment ? {
                    min: Number(req.query.minPayment),
                    max: Number(req.query.maxPayment)
                } : undefined,
                datePosted: req.query.datePosted as string,
                skills: req.query.skills ? (req.query.skills as string).split(',') : undefined
            };

            const tasks = await TaskService.getTasks(filters);
            res.status(200).json({
                success: true,
                data: tasks
            });
        } catch (err: any) {
            res.status(400).json({
                success: false,
                error: err.message || 'Failed to fetch tasks'
            });
        }
    }

    static async getTaskById(req: Request, res: Response) {
        try {
            const task = await TaskService.getTaskById(req.params.taskId);
            res.status(200).json({
                success: true,
                data: task
            });
        } catch (err: any) {
            res.status(404).json({
                success: false,
                error: err.message || 'Task not found'
            });
        }
    }

    static async getTaskCategories(req: Request, res: Response) {
        try {
            const categories = await TaskService.getTaskCategories();
            res.status(200).json({
                success: true,
                data: categories
            });
        } catch (err: any) {
            res.status(400).json({
                success: false,
                error: err.message || 'Failed to fetch categories'
            });
        }
    }

    static async searchTasks(req: Request, res: Response) {
        try {
            const searchTerm = req.query.q as string;
            if (!searchTerm) {
                return res.status(400).json({
                    success: false,
                    error: 'Search term is required'
                });
            }

            const tasks = await TaskService.searchTasks(searchTerm);
            res.status(200).json({
                success: true,
                data: tasks
            });
        } catch (err: any) {
            res.status(400).json({
                success: false,
                error: err.message || 'Search failed'
            });
        }
    }
}