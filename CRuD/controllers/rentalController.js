import Rental from "../model/rentalModel.js";
import Book from "../model/bookModel.js";
import User from "../model/userModel.js";
import { sendEmail } from "../utils/sendEmail.js";
import { emailTemplates } from "../utils/emailTemplates.js";
import mongoose from "mongoose";

export const rentBook = async (req, res) => {
  try {
    const { bookId, dueDate } = req.body;
    const userId = req.user.id;

    if (!bookId || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Book ID and Due Date are required'
      });
    }

    // Validate due date format and ensure it's in the future
    const dueDateObj = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(dueDateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    if (dueDateObj <= today) {
      return res.status(400).json({
        success: false,
        message: 'Due date must be at least one day in the future'
      });
    }

    // Check book availability
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    if (book.stock < 1) {
      return res.status(400).json({
        success: false,
        message: 'Book is currently out of stock'
      });
    }

    // Check existing rental
    const existingRental = await Rental.findOne({
      userId,
      bookId,
      returned: false
    });

    if (existingRental) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active rental for this book'
      });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create rental with proper date handling
    const rental = new Rental({
      userId,
      bookId,
      rentedAt: new Date(),
      dueDate: dueDateObj,
      status: 'active',
      returned: false
    });

    const savedRental = await rental.save();

    await Book.findByIdAndUpdate(
      bookId,
      { $inc: { stock: -1 } }
    );

    if (user.mail) {
      const emailHtml = emailTemplates.rentalConfirmation(user, { 
        ...savedRental._doc, 
        bookId: book 
      });
      
      sendEmail({
        to: user.mail,
        subject: "Your BiblioF Rental Confirmation",
        html: emailHtml
      }).catch(error => {
        console.error("Rental confirmation email error:", error);
      });
    }

    // Populate the rental with book details for the response
    const populatedRental = await Rental.findById(savedRental._id)
      .populate('bookId');

    return res.status(201).json({
      success: true,
      message: 'Book rented successfully',
      data: populatedRental
    });

  } catch (error) {
    console.error('Rental creation error:', error);
    return res.status(error.message?.includes('not found') ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to rent book'
    });
  }
};

export const returnBook = async (req, res) => {
  try {
    const { rentalId } = req.params;
    const rental = await Rental.findById(rentalId)
      .populate('userId')
      .populate('bookId');

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: "Rental not found"
      });
    }

    if (rental.returned) {
      return res.status(400).json({
        success: false,
        message: "Book already returned"
      });
    }

    // Update rental status
    rental.returned = true;
    rental.returnedAt = new Date();
    rental.status = 'returned';
    await rental.save();

    // Update book stock
    await Book.findByIdAndUpdate(rental.bookId._id, {
      $inc: { stock: 1 }
    });

    // Send confirmation email
    if (rental.userId?.mail) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Book Return Confirmation</h2>
          <p>Dear ${rental.userId.name},</p>
          <p>We confirm that you have returned the following book:</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Book:</strong> ${rental.bookId.title}</p>
            <p><strong>Return Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <p>Thank you for using our service!</p>
        </div>
      `;

      await sendEmail({
        to: rental.userId.mail,
        subject: "Book Return Confirmation",
        html: emailHtml
      });
    }

    res.status(200).json({
      success: true,
      message: "Book returned successfully",
      data: rental
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to process return",
      error: error.message
    });
  }
};

export const getMyRentals = async (req, res) => {
  try {
    const rentals = await Rental.find({ userId: req.user.id })
      .populate("bookId")
      .sort({ rentedAt: -1 });

    res.status(200).json({
      success: true,
      data: rentals
    });
  } catch (error) {
    console.error("Get rentals error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch rentals",
      error: error.message
    });
  }
};

export const getAllRentals = async (req, res) => {
  try {
    const rentals = await Rental.find()
      .populate('userId', '-password')
      .populate('bookId')
      .sort({ rentedAt: -1 });
    res.status(200).json({
      success: true,
      data: rentals
      });
      } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch rentals",
      error: error.message
    });
  }
};

export const deleteRental = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid rental ID format" 
      });
    }

    const rental = await Rental.findById(id).populate('bookId userId');
    
    if (!rental) {
      return res.status(404).json({ 
        success: false,
        message: "Rental not found" 
      });
    }

    // If the rental is active, return the book to stock
    if (!rental.returned) {
      await Book.findByIdAndUpdate(rental.bookId._id, {
        $inc: { stock: 1 }
      });
    }

    // Delete the rental
    await Rental.findByIdAndDelete(id);

    // Send notification email to user
    if (rental.userId && rental.userId.mail) {
      try {
        const emailHtml = emailTemplates.rentalCancellation(rental.userId, rental);
        sendEmail({
          to: rental.userId.mail,
          subject: "Rental Cancellation Notice",
          html: emailHtml
        }).catch(error => console.error("Email sending error:", error));
      } catch (error) {
        console.error("Email template error:", error);
      }
    }

    res.status(200).json({
      success: true,
      message: "Rental deleted successfully"
    });
  } catch (error) {
    console.error("Delete rental error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete rental",
      error: error.message
    });
  }
};