import { Application, IApplication } from '../models/application.model';

export class ApplicationService {
    // Get all applications for a specific user with task details
    static async getUserApplications(userId: string) {
        return await Application.find({ userId })
            .populate('taskId', 'title description')
            .sort({ appliedDate: -1 });
    }

    // Create a new application
    static async createApplication(applicationData: Partial<IApplication>) {
        const application = await Application.create(applicationData);
        return await application.populate('taskId');
    }

    // Update application status
    static async updateStatus(applicationId: string, status: string) {
        const validStatuses = ['Pending', 'In Progress', 'Completed'];

        if (!validStatuses.includes(status)) {
            throw new Error('Invalid status provided');
        }

        const application = await Application.findByIdAndUpdate(
            applicationId,
            { status },
            { new: true }
        ).populate('taskId');

        if (!application) {
            throw new Error('Application not found');
        }

        return application;
    }

    // Get applications by status for a user
    static async getUserApplicationsByStatus(userId: string, status: string) {
        return await Application.find({ userId, status })
            .populate('taskId')
            .sort({ appliedDate: -1 });
    }

    // Get upcoming deadlines for user's applications
    static async getUserUpcomingDeadlines(userId: string, days = 7) {
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() + days);

        return await Application.find({
            userId,
            status: { $ne: 'Completed' },
            deadline: {
                $gte: new Date(),
                $lte: dateThreshold
            }
        })
            .populate('taskId')
            .sort({ deadline: 1 });
    }
}