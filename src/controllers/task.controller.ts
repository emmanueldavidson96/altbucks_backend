import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';

export class TaskController {
    static async createTask(req: Request, res: Response) {
        const task = await TaskService.createTask(req.body);
        res.status(201).json({ success: true, data: task });
    }

    static async getRecentTasks(req: Request, res: Response) {
        const tasks = await TaskService.getRecentTasks();
        res.status(200).json({ success: true, data: tasks });
    }

    static async getFilteredTasks(req: Request, res: Response) {
        const { datePosted, skills, minAmount, maxAmount } = req.query;
        const tasks = await TaskService.getFilteredTasks({
            datePosted: datePosted as string,
            skills: skills as string[],
            compensation: { min: Number(minAmount), max: Number(maxAmount) }
        });
        res.status(200).json({ success: true, data: tasks });
    }

    static async searchTasks(req: Request, res: Response) {
        const { query } = req.query;
        const tasks = await TaskService.searchTasks(query as string);
        res.status(200).json({ success: true, data: tasks });
    }

    static async getTaskById(req: Request, res: Response) {
        const task = await TaskService.getTaskById(req.params.id);
        res.status(200).json({ success: true, data: task });
    }
}