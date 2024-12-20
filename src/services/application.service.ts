import { Application } from '../models/application.model';

export class ApplicationService {
    static async getUserCompletedApplications(userId: string) {
        try {
            const applications = await Application.find({
                userId: userId,
                status: 'Completed'
            }).sort({ appliedOn: -1 });

            return applications;
        } catch (error) {
            console.error('Error in getUserCompletedApplications:', error);
            throw error;
        }
    }

    static async searchUserApplications(userId: string, searchTerm: string) {
        try {
            const applications = await Application.find({
                userId: userId,
                status: 'Completed',
                $or: [
                    { brand: { $regex: searchTerm, $options: 'i' } },
                    { taskType: { $regex: searchTerm, $options: 'i' } }
                ]
            }).sort({ appliedOn: -1 });

            return applications;
        } catch (error) {
            console.error('Error in searchUserApplications:', error);
            throw error;
        }
    }
}