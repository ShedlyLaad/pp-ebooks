import { sendEmail } from "../utils/sendEmail.js";

export const sendContactMail = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    if (!email || !subject || !message || !name) {
      return res.status(400).json({ 
        success: false,
        error: "Missing required fields" 
      });
    }

    // Format the message for better readability
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Contact Form Submission</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Message:</strong></p>
          ${message.replace(/\n/g, '<br>')}
        </div>
      </div>
    `;

    // Send to admin email
    await sendEmail({
      to: process.env.ADMIN_EMAIL || "admin@bibliof.com", // Make sure to set ADMIN_EMAIL in your environment
      subject: `Contact Form: ${subject}`,
      html: htmlMessage
    });

    // Send confirmation to user
    const userConfirmation = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Thank you for contacting us!</h2>
        <p>Dear ${name},</p>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Your message:</strong></p>
          ${message.replace(/\n/g, '<br>')}
        </div>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: "We received your message - BiblioF",
      html: userConfirmation
    });

    res.status(200).json({ 
      success: true,
      message: "Message sent successfully" 
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ 
      success: false,
      error: "Failed to send message", 
      details: error.message 
    });
  }
};

export const sendConfirmationEmail = async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    
    if (!to || !subject || !message) {
      return res.status(400).json({ 
        success: false,
        error: "Missing required fields" 
      });
    }

    await sendEmail({ to, subject, html: message });
    res.status(200).json({ 
      success: true,
      message: "Email sent successfully" 
    });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ 
      success: false,
      error: "Failed to send email", 
      details: error.message 
    });
  }
};
