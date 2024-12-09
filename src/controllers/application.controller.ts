import { Request, Response } from 'express';
import { ApplicationService } from '../services/application.service';

export class ApplicationController {
    static async submitApplication(req: Request, res: Response) {
        const application = await ApplicationService.createApplication(req.body);
        res.status(201).json({ success: true, data: application });
    }

    static async getUserApplications(req: Request, res: Response) {
        const applications = await ApplicationService.getUserApplications(req.user.id);
        res.status(200).json({ success: true, data: applications });
    }

    static async updateApplicationStatus(req: Request, res: Response) {
        const { id } = req.params;
        const { status } = req.body;
        const application = await ApplicationService.updateStatus(id, status);
        res.status(200).json({ success: true, data: application });
    }
}