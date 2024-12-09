import { Application, IApplication } from '../models/application.model';

export class ApplicationService {
    static async createApplication(data: Partial<IApplication>) {
        return await Application.create(data);
    }

    static async getUserApplications(userId: string) {
        return await Application.find({ userId })
            .populate('taskId')
            .sort({ appliedOn: -1 });
    }

    static async updateStatus(id: string, status: string) {
        return await Application.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );
    }
}