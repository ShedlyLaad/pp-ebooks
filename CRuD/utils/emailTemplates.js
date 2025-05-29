export const emailTemplates = {
    orderConfirmation: (user, order) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2A2A2A; margin-bottom: 10px;">Order Confirmation</h1>
                <p style="color: #666; margin: 0;">Thank you for your order!</p>
            </div>
            
            <div style="margin-bottom: 30px;">
                <p style="margin-bottom: 15px;">Dear ${user.name},</p>
                <p style="color: #666; line-height: 1.5;">Your order has been successfully placed and is now pending confirmation. We'll process it as soon as possible.</p>
                <p style="color: #666; line-height: 1.5;">Current status: <strong style="color: #ed6c02;">PENDING</strong></p>
            </div>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <h3 style="color: #2A2A2A; margin-top: 0;">Order Details:</h3>
                <p style="margin: 5px 0;"><strong>Order ID:</strong> ${order._id}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                
                <div style="margin-top: 20px;">
                    <h4 style="color: #2A2A2A; margin-bottom: 10px;">Ordered Items:</h4>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background: #eef1f5;">
                            <th style="padding: 10px; text-align: left;">Book</th>
                            <th style="padding: 10px; text-align: center;">Quantity</th>
                            <th style="padding: 10px; text-align: right;">Price</th>
                        </tr>
                        ${order.orderItems.map(item => `
                            <tr>
                                <td style="padding: 10px; border-top: 1px solid #dee2e6;">${item.bookId.title}</td>
                                <td style="padding: 10px; border-top: 1px solid #dee2e6; text-align: center;">${item.quantity}</td>
                                <td style="padding: 10px; border-top: 1px solid #dee2e6; text-align: right;">$${(item.bookId.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #666; margin-bottom: 10px;">Need help? Contact us at support@bibliof.com</p>
                <p style="color: #999; font-size: 12px;">© 2024 BiblioF. All rights reserved.</p>
            </div>
        </div>
    `,

    orderStatusUpdate: (user, order) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Order Status Update</h2>
            <p>Dear ${user.name},</p>
            <p>Your order status has been updated to: <strong>${order.status}</strong></p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>Order ID:</strong> ${order._id}</p>
                <h3>Order Items:</h3>
                <ul>
                    ${order.orderItems.map(item => `
                        <li>${item.bookId.title} (Quantity: ${item.quantity})</li>
                    `).join('')}
                </ul>
            </div>
        </div>
    `,    rentalConfirmation: (user, rental) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2A2A2A; margin-bottom: 10px;">Rental Confirmation</h1>
                <p style="color: #666; margin: 0;">Your book rental is confirmed!</p>
            </div>
            
            <div style="margin-bottom: 30px;">
                <p style="margin-bottom: 15px;">Dear ${user.name},</p>
                <p style="color: #666; line-height: 1.5;">We're pleased to confirm your book rental. Here are the details:</p>
            </div>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <h3 style="color: #2A2A2A; margin-top: 0;">Rental Details:</h3>
                
                <div style="margin-top: 20px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><strong>Book Title:</strong></td>
                            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">${rental.bookId.title}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><strong>Rental Date:</strong></td>
                            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">${new Date().toLocaleDateString()}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><strong>Due Date:</strong></td>
                            <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">${new Date(rental.dueDate).toLocaleDateString()}</td>
                        </tr>
                    </table>
                </div>
            </div>

            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 30px;">
                <p style="color: #856404; margin: 0;">
                    <strong>Important:</strong> Please return the book by the due date to avoid late fees.
                </p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #666; margin-bottom: 10px;">Questions? Contact us at support@bibliof.com</p>
                <p style="color: #999; font-size: 12px;">© 2024 BiblioF. All rights reserved.</p>
            </div>
        </div>
    `,
};