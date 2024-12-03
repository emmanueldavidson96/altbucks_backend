import { Request, Response } from "express";
import { CREATED, OK, NOT_FOUND, BAD_REQUEST } from "../constants/http";
import catchErrors from "../utils/catchErrors";
import {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    getUserTasks,
    getUserTaskStats,
    getTaskByTitleService,
    getTotalTasksService,
    getUserTotalEarningsService,
    getTotalTasksInDateRangeService,
    getTotalTasksUnderReview,
    getTotalApprovedTasks,
    getTotalEarningsInRange,
} from "../services/task.service";

export const createTaskHandler = catchErrors(async (request: Request, response: Response) => {
  const taskData = request.body;
  const task = await createTask(taskData);
  return response.status(CREATED).json({ task });
});

export const getTasksHandler = catchErrors(async (_request: Request, response: Response) => {
  const tasks = await getTasks();
  return response.status(OK).json({ tasks });
});

export const getTaskByIdHandler = catchErrors(async (request: Request, response: Response) => {
  const { taskId } = request.params;
  const task = await getTaskById(taskId);
  return response.status(OK).json({ task });
});

export const updateTaskHandler = catchErrors(async (request: Request, response: Response) => {
  const { taskId } = request.params;
  const updatedData = request.body;
  const updatedTask = await updateTask(taskId, updatedData);
  return response.status(OK).json({ task: updatedTask });
});

export const deleteTaskHandler = catchErrors(async (request: Request, response: Response) => {
  const { taskId } = request.params;
  await deleteTask(taskId);
  return response.status(OK).json({ message: "Task deleted successfully" });
});

// Fetch all tasks performed by a user
export const getUserTasksHandler = catchErrors(async (request: Request, response: Response) => {
    const { userId } = request.params;
    const tasks = await getUserTasks(userId);
    return response.status(OK).json({ tasks });
  });
  
  // Fetch task counts by status for a user
  export const getUserTaskStatsHandler = catchErrors(async (request: Request, response: Response) => {
    const { userId } = request.params;
    const stats = await getUserTaskStats(userId);
    return response.status(OK).json({ stats });
  });

  // Get a task by its title
export const getTaskByTitle = catchErrors(async (req: Request, res: Response) => {
    const { title } = req.params;
    const task = await getTaskByTitleService(title);
  
    if (!task) {
      return res.status(NOT_FOUND).json({ message: 'Task not found' });
    }
  
    res.status(OK).json(task);
  });
  
  // Get the total number of tasks
  export const getTotalTasks = catchErrors(async (_req: Request, res: Response) => {
    const totalTasks = await getTotalTasksService();
    res.status(OK).json({ totalTasks });
  });

  // Controller to get total earnings of a user
export const getUserTotalEarnings = catchErrors(async (req: Request, res: Response) => {
    const { userId } = req.params; // Extract user ID from request parameters
    const totalEarnings = await getUserTotalEarningsService(userId);
  
    res.status(OK).json({ userId, totalEarnings });
});

// Controller to get total tasks within a date range
export const getTotalTasksInDateRange = catchErrors(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
  
    // Validate date inputs
    if (!startDate || !endDate) {
      return res.status(BAD_REQUEST).json({ error: 'Please provide startDate and endDate.' });
    }
  
    // Convert query parameters to Date objects
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
  
    const totalTasks = await getTotalTasksInDateRangeService(start, end);
  
    res.status(OK).json({ totalTasks, startDate, endDate });
});

// Controller to get total approved tasks
export const getTotalApprovedTasksHandler = catchErrors(async (_req: Request, res: Response) => {
    const totalTasks = await getTotalApprovedTasks();
  
    res.status(OK).json({ totalTasks });
});

// Controller to get total tasks under review
export const getTotalTasksUnderReviewHandler = catchErrors(async (_req: Request, res: Response) => {
    const totalTasks = await getTotalTasksUnderReview();
  
    res.status(OK).json({ totalTasks });
});

// controller to get total task within a date range
export const getTotalEarningsInRangeHandler = catchErrors(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
  
    // Validate date inputs
    if (!startDate || !endDate) {
      return res.status(BAD_REQUEST).json({ error: 'Please provide startDate and endDate.' });
    }
  
    // Convert query parameters to Date objects
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
  
    const totalEarnings = await getTotalEarningsInRange(start, end);
  
    res.status(OK).json({ totalEarnings, startDate, endDate });
});