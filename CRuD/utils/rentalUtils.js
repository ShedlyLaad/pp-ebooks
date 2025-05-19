import Rental from "../model/rentalModel.js";
import { sendEmail } from "./sendEmail.js";
import { emailTemplates } from "./emailTemplates.js";

export const checkOverdueRentals = async () => {
  try {
    const now = new Date();
    
    // Find active rentals that are overdue
    const overdueRentals = await Rental.find({
      status: "active",
      returned: false,
      dueDate: { $lt: now }
    }).populate("userId bookId");

    // Update status and send notifications
    for (const rental of overdueRentals) {
      // Update status to overdue
      rental.status = "overdue";
      await rental.save();

      // Send overdue notification if user has email
      if (rental.userId?.mail) {
        try {
          const emailHtml = emailTemplates.rentalOverdue(rental.userId, rental);
          await sendEmail({
            to: rental.userId.mail,
            subject: "BiblioF - Overdue Rental Notice",
            html: emailHtml
          });
        } catch (error) {
          console.error(`Failed to send overdue notification to ${rental.userId.mail}:`, error);
        }
      }
    }

    return {
      checked: overdueRentals.length,
      updated: overdueRentals.length
    };
  } catch (error) {
    console.error("Error checking overdue rentals:", error);
    throw error;
  }
};