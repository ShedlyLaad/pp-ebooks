import nodemailer from 'nodemailer';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const sendEmail = async ({ to, subject, html }, retryCount = 0) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_FROM || '"BiblioF" <noreply@bibliof.com>',
      to,
      subject,
      html
    };

    await transporter.verify();
    const result = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', result.messageId);
    return result;

  } catch (error) {
    console.error(`Email sending attempt ${retryCount + 1} failed:`, error);

    if (retryCount < MAX_RETRIES) {
      await sleep(RETRY_DELAY * (retryCount + 1));
      return sendEmail({ to, subject, html }, retryCount + 1);
    }

    // Log the final failure after all retries
    console.error('Email sending failed after all retries:', {
      to,
      subject,
      error: error.message
    });

    throw new Error('Failed to send email after multiple attempts');
  }
};
