import Rental from '../model/rentalModel.js';
import Order from '../model/orderModel.js';
import User from '../model/userModel.js';
import { sendEmail } from './sendEmail.js';
import { emailTemplates } from './emailTemplates.js';

// Check rentals that are due within 24 hours
export const checkUpcomingDueRentals = async () => {
    try {
        const now = new Date();
        const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        
        // Find active rentals due in next 24 hours
        const dueRentals = await Rental.find({
            status: 'active',
            returned: false,
            dueDate: {
                $gt: now,
                $lte: in24Hours
            }
        })
        .populate('userId')
        .populate('bookId');

        console.log(`Found ${dueRentals.length} rentals due in next 24 hours`);

        let notifiedCount = 0;
        for (const rental of dueRentals) {
            if (rental.userId?.mail) {
                try {
                    const dueDate = new Date(rental.dueDate);
                    const emailHtml = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2>Rental Due Reminder</h2>
                            <p>Dear ${rental.userId.name},</p>
                            <p>This is a reminder that your rental is due soon:</p>
                            <ul>
                                <li>Book: ${rental.bookId.title}</li>
                                <li>Due Date: ${dueDate.toLocaleDateString()}</li>
                                <li>Time Remaining: Less than 24 hours</li>
                            </ul>
                            <p>Please ensure to return the book on time to avoid any late fees.</p>
                        </div>
                    `;

                    await sendEmail({
                        to: rental.userId.mail,
                        subject: 'Your Rental is Due Soon',
                        html: emailHtml
                    });

                    notifiedCount++;
                } catch (error) {
                    console.error(`Failed to send reminder for rental ${rental._id}:`, error);
                }
            }
        }

        return {
            checked: dueRentals.length,
            notified: notifiedCount
        };
    } catch (error) {
        console.error('Error checking upcoming due rentals:', error);
        throw error;
    }
};

// Check overdue rentals
export const checkOverdueRentals = async () => {
    try {
        const now = new Date();
        
        const overdueRentals = await Rental.find({
            status: { $ne: 'overdue' },
            returned: false,
            dueDate: { $lt: now }
        })
        .populate('userId')
        .populate('bookId');

        console.log(`Found ${overdueRentals.length} overdue rentals`);

        let updatedCount = 0;
        for (const rental of overdueRentals) {
            // Update rental status
            rental.status = 'overdue';
            await rental.save();
            updatedCount++;

            if (rental.userId?.mail) {
                try {
                    const dueDate = new Date(rental.dueDate);
                    const daysOverdue = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
                    
                    const emailHtml = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2>Rental Overdue Notice</h2>
                            <p>Dear ${rental.userId.name},</p>
                            <p>Your rental is now overdue:</p>
                            <ul>
                                <li>Book: ${rental.bookId.title}</li>
                                <li>Due Date: ${dueDate.toLocaleDateString()}</li>
                                <li>Days Overdue: ${daysOverdue}</li>
                            </ul>
                            <p>Please return the book as soon as possible to avoid additional fees.</p>
                        </div>
                    `;

                    await sendEmail({
                        to: rental.userId.mail,
                        subject: 'Rental Overdue Notice',
                        html: emailHtml
                    });
                } catch (error) {
                    console.error(`Failed to send overdue notice for rental ${rental._id}:`, error);
                }
            }
        }

        return {
            checked: overdueRentals.length,
            updated: updatedCount
        };
    } catch (error) {
        console.error('Error checking overdue rentals:', error);
        throw error;
    }
};

export const notifyOrderStatusUpdate = async (orderId, newStatus, note) => {
    try {
        const order = await Order.findById(orderId)
            .populate('userId')
            .populate({
                path: 'orderItems.bookId',
                populate: { path: 'category' }
            });

        if (!order || !order.userId?.mail) {
            console.log('Order not found or user has no email');
            return false;
        }

        const statusMessages = {
            confirmed: 'Your order has been confirmed and is being processed',
            shipped: 'Your order has been shipped and is on its way',
            delivered: 'Your order has been delivered successfully',
            cancelled: 'Your order has been cancelled'
        };

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Order Status Update</h2>
                <p>Dear ${order.userId.name},</p>
                <p>${statusMessages[newStatus] || 'Your order status has been updated'}</p>
                <ul>
                    <li>Order ID: ${order._id}</li>
                    <li>New Status: ${newStatus.toUpperCase()}</li>
                    ${note ? `<li>Note: ${note}</li>` : ''}
                </ul>
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
            subject: `Order Status Update - ${newStatus.toUpperCase()}`,
            html: emailHtml
        });

        return true;
    } catch (error) {
        console.error('Error sending status update notification:', error);
        return false;
    }
};
