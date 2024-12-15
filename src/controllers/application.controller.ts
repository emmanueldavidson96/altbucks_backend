import { Request, Response } from 'express';
import { ApplicationService } from '../services/application.service';

export class ApplicationController {
    // Get user's applications with pagination
    static async getUserApplications(req: Request, res: Response) {
        try {
            const userId = req.params.userId;
            const applications = await ApplicationService.getUserApplications(userId);
            res.status(200).json({
                success: true,
                data: applications,
                message: "Applications retrieved successfully"
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Create new application
    static async createApplication(req: Request, res: Response) {
        try {
            const application = await ApplicationService.createApplication(req.body);
            res.status(201).json({
                success: true,
                data: application,
                message: "Application submitted successfully"
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Update application status
    static async updateApplicationStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const application = await ApplicationService.updateStatus(id, status);
            res.status(200).json({
                success: true,
                data: application,
                message: "Application status updated successfully"
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get user's applications by status
    static async getUserApplicationsByStatus(req: Request, res: Response) {
        try {
            const { userId, status } = req.params;
            const applications = await ApplicationService.getUserApplicationsByStatus(userId, status);
            res.status(200).json({
                success: true,
                data: applications
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get user's upcoming deadlines
    static async getUserUpcomingDeadlines(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const days = parseInt(req.query.days as string) || 7;
            const applications = await ApplicationService.getUserUpcomingDeadlines(userId, days);
            res.status(200).json({
                success: true,
                data: applications
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}