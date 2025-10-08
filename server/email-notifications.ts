import nodemailer from 'nodemailer';
import type { Booking } from '@shared/schema';

let transporter: nodemailer.Transporter | null = null;

// Initialize email transporter
function getTransporter() {
  if (transporter) return transporter;

  // Check for email credentials in environment
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.warn('Email notifications disabled: EMAIL_USER and EMAIL_PASS not configured');
    return null;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail', // You can change this to other services
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  return transporter;
}

export async function sendNewBookingNotification(
  booking: Booking,
  adminEmail: string
): Promise<void> {
  const transport = getTransporter();
  
  if (!transport) {
    console.log('Skipping email notification (not configured)');
    return;
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject: `🔔 New Booking Request - ${booking.fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #000; padding-bottom: 10px;">
            New Booking Request
          </h2>
          
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #555;">Client Information</h3>
            <p><strong>Name:</strong> ${booking.fullName}</p>
            <p><strong>Email:</strong> ${booking.email}</p>
            <p><strong>Phone:</strong> ${booking.phone}</p>
          </div>
          
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #555;">Booking Details</h3>
            <p><strong>Service:</strong> ${booking.service}</p>
            <p><strong>Staff:</strong> ${booking.staffName || 'Not specified'}</p>
            <p><strong>Date:</strong> ${booking.date}</p>
            <p><strong>Time:</strong> ${booking.time}</p>
            <p><strong>Duration:</strong> ${booking.duration} minutes</p>
            ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
          </div>
          
          <div style="background: #fff3cd; padding: 15px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #ffc107;">
            <p style="margin: 0;">
              ⏰ This booking is pending approval. Please log in to the admin dashboard to review and approve or reject this request.
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #888; font-size: 12px;">
              This is an automated notification from THE MR Nail & Laser Studio booking system.
            </p>
          </div>
        </div>
      `,
    };

    await transport.sendMail(mailOptions);
    console.log(`Booking notification email sent to ${adminEmail}`);
  } catch (error) {
    console.error('Failed to send booking notification email:', error);
    // Don't throw - we don't want email failures to break the booking process
  }
}
