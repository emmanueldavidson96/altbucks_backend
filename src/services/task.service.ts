import { Task, ITask } from '../models/task.model';
import { Types } from 'mongoose';
import { UNAUTHORISED } from '../constants/http';
import appAssert from '../utils/appAssert';

export class TaskService {
    // Creates new task with user ownership
    static async createTask(taskData: Partial<ITask>, userId: Types.ObjectId) {
        const task = await Task.create({
            ...taskData,
            userId, // Associate task with user
            status: 'pending', // Changed default status to pending
            postedDate: new Date()
        });
        return task;
    }

    // Fetches paginated tasks for specific user
    static async getAllTasks(userId: Types.ObjectId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const tasks = await Task.find({ userId })
            .sort({ postedDate: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Task.countDocuments({ userId });

        return {
            tasks,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalTasks: total,
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            }
        };
    }

    // Gets recent tasks for specific user
    static async getRecentTasks(userId: Types.ObjectId, limit = 15) {
        return await Task.find({
            userId,
            status: 'pending'
        })
            .sort({ postedDate: -1 })
            .limit(limit);
    }

    // Finds specific task by ID with ownership check
    static async getTaskById(taskId: string, userId: Types.ObjectId) {
        const task = await Task.findOne({
            _id: taskId,
            userId
        });
        appAssert(task, UNAUTHORISED, "Task not found or access denied");
        return task;
    }

    // Searches tasks with user context
    static async searchTasks(
        userId: Types.ObjectId,
        searchParams: {
            query?: string,
            taskType?: string,
            minAmount?: number,
            maxAmount?: number,
            location?: string,
            status?: string
        }
    ) {
        const { query, taskType, minAmount, maxAmount, location, status } = searchParams;

        const filterQuery: any = { userId }; // Add user filter

        if (query) {
            filterQuery.$or = [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ];
        }

        if (taskType) filterQuery.taskType = taskType;
        if (location) filterQuery.location = location;
        if (status) filterQuery.status = status;

        if (minAmount || maxAmount) {
            filterQuery['compensation.amount'] = {};
            if (minAmount) filterQuery['compensation.amount'].$gte = minAmount;
            if (maxAmount) filterQuery['compensation.amount'].$lte = maxAmount;
        }

        return await Task.find(filterQuery)
            .sort({ postedDate: -1 });
    }

    // Updates task status with ownership validation
    static async updateTaskStatus(
        taskId: string,
        userId: Types.ObjectId,
        status: 'pending' | 'completed' // Simplified status options
    ) {
        const validStatuses = ['pending', 'completed'];
        appAssert(validStatuses.includes(status), 400, 'Invalid status provided');

        const task = await Task.findOneAndUpdate(
            { _id: taskId, userId }, // Check ownership
            { status },
            { new: true, runValidators: true }
        );

        appAssert(task, UNAUTHORISED, "Task not found or access denied");
        return task;
    }

    // Gets tasks by status for specific user
    static async getTasksByStatus(userId: Types.ObjectId, status: string) {
        return await Task.find({ userId, status })
            .sort({ postedDate: -1 });
    }

    // Gets upcoming deadlines for specific user
    static async getUpcomingDeadlines(userId: Types.ObjectId, days = 7) {
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() + days);

        return await Task.find({
            userId,
            status: 'pending', // Changed from 'Open' to 'pending'
            deadline: {
                $gte: new Date(),
                $lte: dateThreshold
            }
        }).sort({ deadline: 1 });
    }

    // Completes task with ownership check
    static async markTaskAsComplete(taskId: string, userId: Types.ObjectId) {
        const task = await Task.findOneAndUpdate(
            { _id: taskId, userId },
            { status: 'completed' },
            { new: true, runValidators: true }
        );

        appAssert(task, UNAUTHORISED, "Task not found or access denied");
        return task;
    }

    // Sets task to pending with ownership check
    static async markTaskAsPending(taskId: string, userId: Types.ObjectId) {
        const task = await Task.findOneAndUpdate(
            { _id: taskId, userId },
            { status: 'pending' },
            { new: true, runValidators: true }
        );

        appAssert(task, UNAUTHORISED, "Task not found or access denied");
        return task;
    }

    // Deletes task with ownership check
    static async deleteTask(taskId: string, userId: Types.ObjectId) {
        const task = await Task.findOneAndDelete({
            _id: taskId,
            userId
        });

        appAssert(task, UNAUTHORISED, "Task not found or access denied");
        return task;
    }
}