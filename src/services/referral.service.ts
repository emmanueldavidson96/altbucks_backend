import  Referral from "../models/referral.model";
import TaskActivity  from "../models/taskActivity.model";

export const createReferralWithActivity = async () => {
  try {
    // Create a new TaskActivity
    const taskActivity = await TaskActivity.create({
      result: "Success",
      status: "Completed",
    });

    // Create a Referral and link the TaskActivity
    const referral = await Referral.create({
      referralLink: "https://example.com/signup?referralCode=123",
      status: "active",
      taskActivities: [taskActivity._id], // Link the TaskActivity
    });

    console.log("Referral created:", referral);
    return referral; // Return the referral if needed
  } catch (error) {
    console.error("Error creating referral with activity:", error);
    throw error;
  }
};
