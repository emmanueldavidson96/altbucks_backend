import Task, { ITask } from '../models/taskReport.model';

export const getTaskEarnings = async (userId: string, dateFilter: object): Promise<ITask[]> => {
  return await Task.find({ userId, ...dateFilter });
};

export const addTaskEarning = async (taskData: Partial<ITask>): Promise<ITask> => {
  return await Task.create(taskData);
};
