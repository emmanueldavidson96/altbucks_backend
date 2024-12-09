import { Task, ITask } from '../models/task.model';

export class TaskService {
    static async createTask(data: Partial<ITask>) {
        return await Task.create(data);
    }

    static async getRecentTasks(limit = 10) {
        return await Task.find({ status: 'Open' })
            .sort({ postedDate: -1 })
            .limit(limit);
    }

    static async getFilteredTasks(filters: {
        datePosted?: string;
        skills?: string[];
        compensation?: { min?: number; max?: number };
    }) {
        const query: any = { status: 'Open' };

        if (filters.datePosted) {
            const date = new Date();
            switch (filters.datePosted) {
                case 'past24hours':
                    date.setDate(date.getDate() - 1);
                    break;
                case 'pastweek':
                    date.setDate(date.getDate() - 7);
                    break;
                case 'pastmonth':
                    date.setMonth(date.getMonth() - 1);
                    break;
            }
            query.postedDate = { $gte: date };
        }

        if (filters.skills?.length) {
            query.taskType = { $in: filters.skills };
        }

        if (filters.compensation) {
            if (filters.compensation.min) {
                query['compensation.amount'] = { $gte: filters.compensation.min };
            }
            if (filters.compensation.max) {
                query['compensation.amount'] = {
                    ...query['compensation.amount'],
                    $lte: filters.compensation.max
                };
            }
        }

        return await Task.find(query).sort({ postedDate: -1 });
    }

    static async searchTasks(query: string) {
        return await Task.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        }).sort({ postedDate: -1 });
    }

    static async getTaskById(id: string) {
        return await Task.findById(id);
    }
}