import { Task, ITask } from '../models/task.model';

export class TaskService {
    static async getTasks(filters: {
        category?: string;
        payment?: { min?: number; max?: number };
        datePosted?: string;
        skills?: string[];
    }) {
        try {
            const query: any = {};

            if (filters.category) {
                query.category = filters.category;
            }

            if (filters.skills?.length) {
                query.skillsRequired = { $in: filters.skills };
            }

            if (filters.payment) {
                query['payment.amount'] = {};
                if (filters.payment.min) {
                    query['payment.amount'].$gte = filters.payment.min;
                }
                if (filters.payment.max) {
                    query['payment.amount'].$lte = filters.payment.max;
                }
            }

            if (filters.datePosted) {
                const date = new Date();
                switch (filters.datePosted) {
                    case 'today':
                        date.setHours(0, 0, 0, 0);
                        break;
                    case 'week':
                        date.setDate(date.getDate() - 7);
                        break;
                    case 'month':
                        date.setMonth(date.getMonth() - 1);
                        break;
                }
                query.postedDate = { $gte: date };
            }

            const tasks = await Task.find(query)
                .sort({ postedDate: -1 })
                .select('title description category payment postedDate deadline applicationsCount');

            return tasks;
        } catch (err: any) {
            throw new Error(`Failed to fetch tasks: ${err.message}`);
        }
    }

    static async getTaskById(taskId: string) {
        try {
            const task = await Task.findById(taskId);
            if (!task) throw new Error('Task not found');
            return task;
        } catch (err: any) {
            throw new Error(`Failed to fetch task: ${err.message}`);
        }
    }

    static async getTaskCategories() {
        try {
            const categories = await Task.distinct('category');
            return categories;
        } catch (err: any) {
            throw new Error(`Failed to fetch categories: ${err.message}`);
        }
    }

    static async searchTasks(searchTerm: string) {
        try {
            const tasks = await Task.find({
                $or: [
                    { title: { $regex: searchTerm, $options: 'i' } },
                    { description: { $regex: searchTerm, $options: 'i' } }
                ]
            }).sort({ postedDate: -1 });

            return tasks;
        } catch (err: any) {
            throw new Error(`Search failed: ${err.message}`);
        }
    }
}