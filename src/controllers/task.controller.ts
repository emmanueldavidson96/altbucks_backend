import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';
import catchErrors from '../utils/catchErrors';
import { CREATED, OK, UNAUTHORISED } from '../constants/http';
import { verifyToken, AccessTokenPayload } from '../utils/jwt';
import appAssert from '../utils/appAssert';
import { Types } from 'mongoose';

// Helper function to verify user access token
const verifyAccessToken = (accessToken: string | undefined) => {
    appAssert(accessToken, UNAUTHORISED, "No access token provided");

    const { payload, error } = verifyToken<AccessTokenPayload>(accessToken);
    appAssert(!error && payload, UNAUTHORISED, "Invalid access token");

    // Type assertion since we know the structure from JWT utils
    const typedPayload = payload as AccessTokenPayload;
    appAssert(typedPayload.userId, UNAUTHORISED, "Invalid token payload");

    // Convert string ID to ObjectId
    const userId = new Types.ObjectId(typedPayload.userId.toString());
    return { ...typedPayload, userId };
};

export class TaskController {
    // Get all tasks with pagination
    static getAllTasks = catchErrors(async (req: Request, res: Response) => {
        const { accessToken } = req.cookies;
        const { userId } = verifyAccessToken(accessToken);

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await TaskService.getAllTasks(userId, page, limit);

        return res.status(OK).json({
            success: true,
            data: result.tasks,
            pagination: result.pagination
        });
    });

    // Create new task
    static createTask = catchErrors(async (req: Request, res: Response) => {
        const { accessToken } = req.cookies;
        const { userId } = verifyAccessToken(accessToken);

        const task = await TaskService.createTask(req.body, userId);

        return res.status(CREATED).json({
            success: true,
            data: task
        });
    });

    // Get recent tasks
    static getRecentTasks = catchErrors(async (req: Request, res: Response) => {
        const { accessToken } = req.cookies;
        const { userId } = verifyAccessToken(accessToken);

        const limit = parseInt(req.query.limit as string) || 8;
        const tasks = await TaskService.getRecentTasks(userId, limit);

        return res.status(OK).json({
            success: true,
            data: tasks
        });
    });

    // Search tasks
    static searchTasks = catchErrors(async (req: Request, res: Response) => {
        const { accessToken } = req.cookies;
        const { userId } = verifyAccessToken(accessToken);

        const tasks = await TaskService.searchTasks(userId, req.query);

        return res.status(OK).json({
            success: true,
            data: tasks
        });
    });

    // Get task by ID
    static getTaskById = catchErrors(async (req: Request, res: Response) => {
        const { accessToken } = req.cookies;
        const { userId } = verifyAccessToken(accessToken);

        const task = await TaskService.getTaskById(req.params.id, userId);

        return res.status(OK).json({
            success: true,
            data: task
        });
    });

    // Get tasks by status
    static getTasksByStatus = catchErrors(async (req: Request, res: Response) => {
        const { accessToken } = req.cookies;
        const { userId } = verifyAccessToken(accessToken);

        const tasks = await TaskService.getTasksByStatus(userId, req.params.status);

        return res.status(OK).json({
            success: true,
            data: tasks
        });
    });

    // Get upcoming deadlines
    static getUpcomingDeadlines = catchErrors(async (req: Request, res: Response) => {
        const { accessToken } = req.cookies;
        const { userId } = verifyAccessToken(accessToken);

        const days = parseInt(req.query.days as string) || 7;
        const tasks = await TaskService.getUpcomingDeadlines(userId, days);

        return res.status(OK).json({
            success: true,
            data: tasks
        });
    });

    // Mark task as complete
    static markTaskComplete = catchErrors(async (req: Request, res: Response) => {
        const { accessToken } = req.cookies;
        const { userId } = verifyAccessToken(accessToken);

        const task = await TaskService.markTaskAsComplete(req.params.id, userId);

        return res.status(OK).json({
            success: true,
            data: task
        });
    });

    // Mark task as pending
    static markTaskPending = catchErrors(async (req: Request, res: Response) => {
        const { accessToken } = req.cookies;
        const { userId } = verifyAccessToken(accessToken);

        const task = await TaskService.markTaskAsPending(req.params.id, userId);

        return res.status(OK).json({
            success: true,
            data: task
        });
    });

    // Delete task
    static deleteTask = catchErrors(async (req: Request, res: Response) => {
        const { accessToken } = req.cookies;
        const { userId } = verifyAccessToken(accessToken);

        const task = await TaskService.deleteTask(req.params.id, userId);

        return res.status(OK).json({
            success: true,
            data: task
        });
    });
}