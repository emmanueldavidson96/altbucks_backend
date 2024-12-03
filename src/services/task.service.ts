import TaskModel, { ITask } from "../models/task.model";
import appAssert from "../utils/appAssert";
import { NOT_FOUND } from "../constants/http";
//import { toNamespacedPath } from "node:path/win32";

//creates a new task
export const createTask = async (data: Partial<ITask>) => {
  const task = await TaskModel.create(data);
  return task;
};

//retrieves all tasks for a user
export const getTasks = async () => {
  const tasks = await TaskModel.find();
  return tasks;
};

//Get task for a user by id
export const getTaskById = async (taskId: string) => {
  const task = await TaskModel.findById(taskId);
  appAssert(task, NOT_FOUND, "Task not found");
  return task;
};

//Update task with taskid
export const updateTask = async (taskId: string, data: Partial<ITask>) => {
  const task = await TaskModel.findByIdAndUpdate(taskId, data, { new: true });
  appAssert(task, NOT_FOUND, "Task not found");
  return task;
};

//Delete Task by id
export const deleteTask = async (taskId: string) => {
  const task = await TaskModel.findByIdAndDelete(taskId);
  appAssert(task, NOT_FOUND, "Task not found");
  return task;
};

// Fetch all tasks for a specific user
export const getUserTasks = async (userId: string) => {
  const tasks = await TaskModel.find({ userId });
  return tasks;
};

// Get task counts by status for a specific user
export const getUserTaskStats = async (userId: string) => {
  const [completedCount, pendingCount, cancelledCount] = await Promise.all([
    TaskModel.countDocuments({ userId, status: "completed" }),
    TaskModel.countDocuments({ userId, status: "pending" }),
    TaskModel.countDocuments({ userId, status: "cancelled" }),
  ]);

  return {
    completedCount,
    pendingCount,
    cancelledCount,
  };
};

// Service to get a task by title
export const getTaskByTitleService = async (title: string) => {
    const task = await TaskModel.findOne({ title: title.trim() });
    return task;
  };
  
  // Service to get the total number of tasks
  export const getTotalTasksService = async () => {
    const totalTasks = await TaskModel.countDocuments();
    return totalTasks;
  };

// Service to calculate total user earnings from completed tasks
export const getUserTotalEarningsService = async (userId: string) => {
  const completedTasks = await TaskModel.aggregate([
    {
      $match: {
        assignedTo: userId,
        status: 'completed',
      },
    },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: '$amount' },
      },
    },
  ]);

  // If there are no completed tasks, return zero earnings
  return completedTasks.length > 0 ? completedTasks[0].totalEarnings : 0;
};
 // Service to count tasks within a date range
export const getTotalTasksInDateRangeService = async (startDate: Date, endDate: Date) => {
    const totalTasks = await TaskModel.countDocuments({
      createdAt: {
        $gte: startDate,  // Greater than or equal to startDate
        $lte: endDate,    // Less than or equal to endDate
      },
    });
  
    return totalTasks;
};
//Get total approved tasks
export const getTotalApprovedTasks = async () => {
    const totalTasks = await TaskModel.countDocuments({ status: 'approved' });
    return totalTasks;
};

// Get total tasks under review
export const getTotalTasksUnderReview = async () => {
    const totalTasks = await TaskModel.countDocuments({ status: 'under review' });
    return totalTasks;
};

//Get total earning for a date range
export const getTotalEarningsInRange = async (startDate: Date, endDate: Date) => {
    const totalEarnings = await TaskModel.aggregate([
        {
            $match: {
                status: 'completed',
                createdAt: {
                    $gte: startDate,
                    $lte: endDate,
                },
            },
        },
        {
            $group: {
                _id: null,
                totalEarnings: { $sum: '$amount' },
            },
        },
    ]);
  
    return totalEarnings.length > 0 ? totalEarnings[0].totalEarnings : 0;
};