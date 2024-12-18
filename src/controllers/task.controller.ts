import { Request, Response, NextFunction } from 'express';
import { getTaskEarnings, addTaskEarning } from '../services/task.service';

export const getEarningsReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const { timeFrame } = req.query;

    // Define date filter based on the timeFrame
    let dateFilter = {};
    if (timeFrame === 'year') {
      dateFilter = { date: { $gte: new Date(new Date().getFullYear(), 0, 1) } };
    } else if (timeFrame === '7days') {
      const today = new Date();
      const weekAgo = new Date(today.setDate(today.getDate() - 7));
      dateFilter = { date: { $gte: weekAgo } };
    } else if (timeFrame === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dateFilter = { date: { $gte: today } };
    }

    const tasks = await getTaskEarnings(userId, dateFilter);
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

export const addEarning = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const earning = await addTaskEarning(req.body);
    res.status(201).json({ success: true, data: earning });
  } catch (error) {
    next(error);
  }
};
