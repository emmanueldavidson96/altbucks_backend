import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';

export class TaskController {
    // Get all tasks with pagination
    static async getAllTasks(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const result = await TaskService.getAllTasks(page, limit);

            res.status(200).json({
                success: true,
                data: result.tasks,
                pagination: result.pagination
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Create new task
    static async createTask(req: Request, res: Response) {
        try {
            const task = await TaskService.createTask(req.body);
            res.status(201).json({
                success: true,
                data: task
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get recent tasks
    static async getRecentTasks(req: Request, res: Response) {
        try {
            const limit = parseInt(req.query.limit as string) || 8;
            const tasks = await TaskService.getRecentTasks(limit);
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

    // Search tasks
    static async searchTasks(req: Request, res: Response) {
        try {
            const tasks = await TaskService.searchTasks(req.query);
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

    // Get task by ID
    static async getTaskById(req: Request, res: Response) {
        try {
            const task = await TaskService.getTaskById(req.params.id);
            res.status(200).json({
                success: true,
                data: task
            });
        } catch (error: any) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    // Update task status
    static async updateTaskStatus(req: Request, res: Response) {
        try {
            const task = await TaskService.updateTaskStatus(
                req.params.id,
                req.body.status
            );
            res.status(200).json({
                success: true,
                data: task
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get tasks by status
    static async getTasksByStatus(req: Request, res: Response) {
        try {
            const tasks = await TaskService.getTasksByStatus(req.params.status);
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

    // Get upcoming deadlines
    static async getUpcomingDeadlines(req: Request, res: Response) {
        try {
            const days = parseInt(req.query.days as string) || 7;
            const tasks = await TaskService.getUpcomingDeadlines(days);
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


    // Mark task as complete
    static async markTaskComplete(req: Request, res: Response) {
        try {
            const task = await TaskService.markTaskAsComplete(req.params.id);
            res.status(200).json({
                success: true,
                data: task
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Mark task as pending
    static async markTaskPending(req: Request, res: Response) {
        try {
            const task = await TaskService.markTaskAsPending(req.params.id);
            res.status(200).json({
                success: true,
                data: task
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Delete task
    static async deleteTask(req: Request, res: Response) {
        try {
            const task = await TaskService.deleteTask(req.params.id);
            res.status(200).json({
                success: true,
                data: task
            });
        } catch (error: any) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }
}

