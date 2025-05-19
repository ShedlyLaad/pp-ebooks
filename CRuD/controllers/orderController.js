import Order from "../model/orderModel.js";
import Book from "../model/bookModel.js";
import User from "../model/userModel.js";
import mongoose from "mongoose";
import { sendEmail } from "../utils/sendEmail.js";
import { emailTemplates } from "../utils/emailTemplates.js";

export const createOrder = async (req, res) => {
  try {
    const { orderItems } = req.body;
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "No order items provided" 
      });
    }

    // Validate stock for all items
    for (const item of orderItems) {
      const book = await Book.findById(item.bookId);
      if (!book) {
        return res.status(404).json({
          success: false,
          message: `Book not found: ${item.bookId}`
        });
      }
      if (book.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for book: ${book.title}. Available: ${book.stock}`
        });
      }
    }

    // Create order
    const newOrder = new Order({
      userId: req.user.id,
      orderItems,
      status: "confirmed",
      createdAt: new Date()
    });

    const savedOrder = await newOrder.save();

    // Update stock for all items
    await Promise.all(orderItems.map(item => 
      Book.findByIdAndUpdate(
        item.bookId,
        { $inc: { stock: -item.quantity } }
      )
    ));

    // After successful save, get fully populated order
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate({
        path: "orderItems.bookId",
        populate: { path: "category" }
      })
      .populate("userId");

    // Send confirmation email
    const user = await User.findById(req.user.id);
    if (user?.mail) {
      const emailHtml = emailTemplates.orderConfirmation(user, populatedOrder);
      // Send email asynchronously
      sendEmail({
        to: user.mail,
        subject: "Your BiblioF Order Confirmation",
        html: emailHtml
      }).catch(error => {
        console.error("Order confirmation email error:", error);
      });
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: populatedOrder
    });

  } catch (error) {
    console.error("Order creation error:", error);
    res.status(error.message?.includes("not found") ? 404 : 500).json({
      success: false,
      message: error.message || "Failed to place order"
    });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate({
        path: "orderItems.bookId",
        populate: { path: "category" }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch orders",
      error: error.message 
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({
        path: "orderItems.bookId",
        populate: { path: "category" }
      })
      .populate("userId", "-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch orders",
      error: error.message 
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format"
      });
    }

    const order = await Order.findById(id)
      .populate('userId')
      .populate('orderItems.bookId');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    order.status = status;
    await order.save();

    // Send email notification
    if (order.userId?.mail) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Order Status Update</h2>
          <p>Dear ${order.userId.name},</p>
          <p>Your order status has been updated to: <strong>${status}</strong></p>
          <p>Order ID: ${order._id}</p>
          <h3>Order Details:</h3>
          <ul>
            ${order.orderItems.map(item => `
              <li>${item.bookId.title} (Quantity: ${item.quantity})</li>
            `).join('')}
          </ul>
        </div>
      `;

      await sendEmail({
        to: order.userId.mail,
        subject: `Order Status Update - ${status.toUpperCase()}`,
        html: emailHtml
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order
    });
  } catch (error) {
    console.error("Update order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message
    });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format"
      });
    }

    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Restore stock for all items
    for (const item of order.orderItems) {
      await Book.findByIdAndUpdate(item.bookId, {
        $inc: { stock: item.quantity }
      });
    }

    await Order.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: "Order deleted successfully"
    });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to delete order",
      error: error.message 
    });
  }
};
