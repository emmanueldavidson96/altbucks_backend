/*import mongoose from "mongoose";

export interface TaskActivityDocument extends mongoose.Document {
    referralId: mongoose.Types.ObjectId;
    result:string;
    status:string;
    createdAt:Date;
}


const TaskActivitySchema = new mongoose.Schema<TaskActivityDocument>({
    referralId: {  type: mongoose.Schema.Types.ObjectId, ref: "Referral" },
    result: { type: String, enum: ["accepted", "pending", "rejected"], required: true },
    status: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  });
  
  const TaskActivityModel = mongoose.model("TaskActivity", TaskActivitySchema);
  
  export default TaskActivityModel;
*/