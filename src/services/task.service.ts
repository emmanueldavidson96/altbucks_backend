import { Task, ITask } from '../models/task.model';

export class TaskService {
    // Creates new task with default 'Open' status
    static async createTask(taskData: Partial<ITask>) {
        const task = await Task.create({
            ...taskData,
            status: 'Open',
            postedDate: new Date()
        });
        return task;
    }

    // Fetches paginated tasks with metadata
    static async getAllTasks(page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const tasks = await Task.find()
            .sort({ postedDate: -1 })  // Latest first
            .skip(skip)
            .limit(limit);

        const total = await Task.countDocuments();

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

    // Gets recent open tasks for quick access
    static async getRecentTasks(limit = 5) {
        return await Task.find({ status: 'Open' })
            .sort({ postedDate: -1 })
            .limit(limit);
    }

    // Finds specific task by ID
    static async getTaskById(taskId: string) {
        const task = await Task.findById(taskId);
        if (!task) {
            throw new Error('Task not found');
        }
        return task;
    }

    // Searches tasks based on various filters
    static async searchTasks(searchParams: {
        query?: string,
        taskType?: string,
        minAmount?: number,
        maxAmount?: number,
        location?: string,
        status?: string
    }) {
        const { query, taskType, minAmount, maxAmount, location, status } = searchParams;

        const filterQuery: any = {};

        // Add text search filters
        if (query) {
            filterQuery.$or = [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ];
        }

        // Add optional filters if provided
        if (taskType) filterQuery.taskType = taskType;
        if (location) filterQuery.location = location;
        if (status) filterQuery.status = status;

        // Add compensation range filter
        if (minAmount || maxAmount) {
            filterQuery['compensation.amount'] = {};
            if (minAmount) filterQuery['compensation.amount'].$gte = minAmount;
            if (maxAmount) filterQuery['compensation.amount'].$lte = maxAmount;
        }

        return await Task.find(filterQuery)
            .sort({ postedDate: -1 });
    }

    // Updates task status with validation
    static async updateTaskStatus(taskId: string, status: 'Open' | 'In Progress' | 'Completed' | 'Pending') {
        const validStatuses = ['Open', 'In Progress', 'Completed', 'Pending'];
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid status provided');
        }

        const task = await Task.findByIdAndUpdate(
            taskId,
            { status },
            { new: true, runValidators: true }
        );

        if (!task) {
            throw new Error('Task not found');
        }

        return task;
    }
    // Gets tasks filtered by status
    static async getTasksByStatus(status: string) {
        return await Task.find({ status })
            .sort({ postedDate: -1 });
    }

    // Finds tasks due within specified days
    static async getUpcomingDeadlines(days = 7) {
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() + days);

        return await Task.find({
            status: 'Open',
            deadline: {
                $gte: new Date(),
                $lte: dateThreshold
            }
        }).sort({ deadline: 1 });
    }


    //  method for marking task as complete
    static async markTaskAsComplete(taskId: string) {
        const task = await Task.findByIdAndUpdate(
            taskId,
            { status: 'Completed' },
            { new: true, runValidators: true }
        );

        if (!task) {
            throw new Error('Task not found');
        }

        return task;
    }

    //  method for marking task as pending
    static async markTaskAsPending(taskId: string) {
        const task = await Task.findByIdAndUpdate(
            taskId,
            { status: 'Pending' },
            { new: true, runValidators: true }
        );

        if (!task) {
            throw new Error('Task not found');
        }

        return task;
    }

    // New method for deleting task
    static async deleteTask(taskId: string) {
        const task = await Task.findByIdAndDelete(taskId);

        if (!task) {
            throw new Error('Task not found');
        }

        return task;
    }

}