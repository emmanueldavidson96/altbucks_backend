import { Router } from "express";
import { TaskController } from "../controllers/task.controller";
import catchErrors from "../utils/catchErrors";

const taskRoutes = Router();

// prefix: /tasks
taskRoutes.get("/", catchErrors(TaskController.getTasks));
taskRoutes.get("/categories", catchErrors(TaskController.getTaskCategories));
taskRoutes.get("/search", catchErrors(TaskController.searchTasks));
taskRoutes.get("/:taskId", catchErrors(TaskController.getTaskById));  // Changed from getTask to getTaskById

export default taskRoutes;