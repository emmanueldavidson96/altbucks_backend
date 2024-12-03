import { Router } from "express";
import {
    createTaskHandler,
    getTasksHandler,
    getTaskByIdHandler,
    updateTaskHandler,
    deleteTaskHandler,
    getUserTasksHandler,
    getUserTaskStatsHandler,
    getTaskByTitle,
    getTotalTasks,
    getUserTotalEarnings,
    getTotalTasksInDateRange,
    getTotalApprovedTasksHandler,
    getTotalTasksUnderReviewHandler,
    getTotalEarningsInRangeHandler
} from "../controllers/task.controller";

const router = Router();

router.post("/create", createTaskHandler);
router.get("/get", getTasksHandler);
router.get("/:taskId", getTaskByIdHandler);
router.put("/:taskId", updateTaskHandler);
router.delete("/:taskId", deleteTaskHandler);
router.get("/user/:userId/", getUserTasksHandler);
router.get("/user/:userId/stats", getUserTaskStatsHandler);
router.get("/title/:title", getTaskByTitle);
router.get("/total", getTotalTasks);
router.get("/user/:userId/earnings", getUserTotalEarnings);
router.get("/date-range", getTotalTasksInDateRange);
router.get("/total-approved", getTotalApprovedTasksHandler);
router.get("/total-under-review", getTotalTasksUnderReviewHandler);
router.get("/total-earnings-range", getTotalEarningsInRangeHandler);

export default router;