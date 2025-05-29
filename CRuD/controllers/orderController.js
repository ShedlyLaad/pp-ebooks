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
    }    const newOrder = new Order({
      userId: req.user.id,
      orderItems,
      status: "pending",
      createdAt: new Date()
    });

    const savedOrder = await newOrder.save();

    await Promise.all(orderItems.map(item => 
      Book.findByIdAndUpdate(
        item.bookId,
        { $inc: { stock: -item.quantity } }
      )
    ));

    const populatedOrder = await Order.findById(savedOrder._id)
      .populate({
        path: "orderItems.bookId",
        populate: { path: "category" }
      })
      .populate("userId");

    const user = await User.findById(req.user.id);
    if (user?.mail) {
      const emailHtml = emailTemplates.orderConfirmation(user, populatedOrder);
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
    const { status, note } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format"
      });
    }

    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: " + validStatuses.join(", ")
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

    const updateData = {
      status,
      statusHistory: [
        ...order.statusHistory,
        {
          status,
          date: new Date(),
          note: note || undefined
        }
      ]
    };

    if (status === 'confirmed' && !order.confirmedAt) {
      updateData.confirmedAt = new Date();
    } else if (status === 'shipped' && !order.shippedAt) {
      updateData.shippedAt = new Date();
    } else if (status === 'delivered' && !order.deliveredAt) {
      updateData.deliveredAt = new Date();
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
    .populate('userId')
    .populate('orderItems.bookId');

    if (updatedOrder.userId?.mail) {
      const statusMessages = {
        confirmed: 'Your order has been confirmed and is being processed',
        shipped: 'Your order has been shipped and is on its way',
        delivered: 'Your order has been delivered successfully',
        cancelled: 'Your order has been cancelled'
      };

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Order Status Update</h2>
          <p>Dear ${updatedOrder.userId.name},</p>
          <p>${statusMessages[status] || 'Your order status has been updated'}</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Order Details:</strong></p>
            <ul style="list-style: none; padding: 0;">
              <li>Order ID: ${updatedOrder._id}</li>
              <li>New Status: ${status.toUpperCase()}</li>
              ${note ? `<li>Note: ${note}</li>` : ''}
            </ul>
          </div>
          <div style="margin-top: 20px;">
            <h3>Items:</h3>
            <ul style="list-style: none; padding: 0;">
              ${updatedOrder.orderItems.map(item => `
                <li style="margin-bottom: 10px;">
                  ${item.bookId.title} (Quantity: ${item.quantity})
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      `;

      try {
        await sendEmail({
          to: updatedOrder.userId.mail,
          subject: `Order Status Update - ${status.toUpperCase()}`,
          html: emailHtml
        });
      } catch (emailError) {
        console.warn('Failed to send status update email:', emailError);
      }
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: updatedOrder
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

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format"
      });
    }

    const order = await Order.findById(id)
      .populate({
        path: "orderItems.bookId",
        populate: { path: "category" }
      })
      .populate("userId", "-password");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (req.user.role !== 'admin' && order.userId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this order"
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
      error: error.message
    });
  }
};
