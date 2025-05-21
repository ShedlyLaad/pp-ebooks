import Rental from "../model/rentalModel.js";
import { sendEmail } from "./sendEmail.js";
import { emailTemplates } from "./emailTemplates.js";

export const checkDueRentals = async () => {
  try {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // Find rentals due in the next 24 hours
    const dueRentals = await Rental.find({
      status: "active",
      returned: false,
      dueDate: {
        $gt: now,
        $lte: in24Hours
      }
    }).populate("userId bookId");

    for (const rental of dueRentals) {
      if (rental.userId?.mail) {
        try {
          const emailHtml = emailTemplates.rentalReminder(rental.userId, rental);
          await sendEmail({
            to: rental.userId.mail,
            subject: "BiblioF - Rental Due Soon",
            html: emailHtml
          });
        } catch (error) {
          console.error(`Failed to send due reminder to ${rental.userId.mail}:`, error);
        }
      }
    }

    return {
      checked: dueRentals.length,
      notified: dueRentals.length
    };
  } catch (error) {
    console.error("Error checking due rentals:", error);
    throw error;
  }
};

export const checkOverdueRentals = async () => {
  try {
    const now = new Date();
    
    const overdueRentals = await Rental.find({
      status: "active",
      returned: false,
      dueDate: { $lt: now }
    }).populate("userId bookId");

    for (const rental of overdueRentals) {

      rental.status = "overdue";
      await rental.save();

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