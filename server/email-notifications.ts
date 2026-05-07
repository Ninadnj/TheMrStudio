import nodemailer from 'nodemailer';
import type { Booking } from '@shared/schema';

// Store previous email state separately so we don't spam on restart
const processedBookings = new Set<number>();

// Initialize transporter directly using environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Add timeouts to prevent hanging if DO blocks SMTP again
  connectionTimeout: 10000,
  greetingTimeout: 5000,
  socketTimeout: 10000,
});

// Test SMTP connection on startup silently to not crash the server if it fails
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter.verify().then(() => {
    console.log('SMTP connection successful: Email notifications are active');
  }).catch((error) => {
    console.error('SMTP connection failed (Check Gmail App Password or Port Block):', error.message);
  });
} else {
  console.warn('Email credentials not found. Notifications will not be sent.');
}

const getFromEmail = () => process.env.EMAIL_USER || 'no-reply@themrstudio.net';

export async function sendNewBookingNotification(
  booking: Booking,
  adminEmail: string
): Promise<void> {
  const fromEmail = getFromEmail();
  if (!fromEmail || !process.env.EMAIL_PASS) {
    console.log('Skipping email notification: EMAIL_USER or EMAIL_PASS not configured');
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"THE MR Studio" <${fromEmail}>`,
      to: adminEmail,
      subject: `New Booking Request - ${booking.fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #000; padding-bottom: 10px;">
            New Booking Request
          </h2>
          <div style="background: #F7FAF6; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #CDD9CA;">
            <h3 style="margin-top: 0; color: #555;">Client Information</h3>
            <p><strong>Name:</strong> ${booking.fullName}</p>
            <p><strong>Email:</strong> ${booking.email}</p>
            <p><strong>Phone:</strong> ${booking.phone}</p>
          </div>
          <div style="background: #F7FAF6; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #CDD9CA;">
            <h3 style="margin-top: 0; color: #555;">Booking Details</h3>
            <p><strong>Service:</strong> ${booking.service}</p>
            <p><strong>Staff:</strong> ${booking.staffName || 'Not specified'}</p>
            <p><strong>Date:</strong> ${booking.date}</p>
            <p><strong>Time:</strong> ${booking.time}</p>
            <p><strong>Duration:</strong> ${booking.duration} minutes</p>
            ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
          </div>
          <div style="background: #EAF1E8; padding: 15px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #738A6E;">
            <p style="margin: 0;">This booking is pending approval. Log in to the admin dashboard to approve or reject.</p>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #888; font-size: 12px;">Automated notification from THE MR Nail & Laser Studio.</p>
          </div>
        </div>
      `,
    });
    console.log(`Booking notification sent to ${adminEmail}, ID: ${info.messageId}`);
  } catch (error) {
    console.error('Failed to send booking notification:', error);
  }
}

export async function sendBookingConfirmationToClient(
  booking: Booking
): Promise<void> {
  const fromEmail = getFromEmail();
  if (!fromEmail || !process.env.EMAIL_PASS) return;

  try {
    const info = await transporter.sendMail({
      from: `"THE MR Studio" <${fromEmail}>`,
      to: booking.email,
      subject: `დაჯავშნა დადასტურებულია / Booking Confirmed - THE MR Studio`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #344C3D; border-bottom: 1px solid #CDD9CA; padding-bottom: 10px;">
            თქვენი ვიზიტი დადასტურებულია!
          </h2>
          <p>მოგესალმებით ${booking.fullName},</p>
          <p>მოხარულები ვართ გაცნობოთ, რომ თქვენი დაჯავშნა THE MR Studio-ში დადასტურებულია.</p>
          <div style="background: #F7FAF6; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #CDD9CA;">
            <h3 style="margin-top: 0; color: #344C3D;">ვიზიტის დეტალები:</h3>
            <p><strong>პროცედურა:</strong> ${booking.service}</p>
            <p><strong>სპეციალისტი:</strong> ${booking.staffName || 'N/A'}</p>
            <p><strong>თარიღი:</strong> ${booking.date}</p>
            <p><strong>დრო:</strong> ${booking.time}</p>
          </div>
          <p>გთხოვთ, მობრძანდეთ დათქმულ დროს. თუ გეგმები შეგეცვლებათ, გთხოვთ შეგვატყობინოთ წინასწარ.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666;">
            <p><strong>THE MR Studio</strong><br>Nail & Laser Artistic Studio<br>თბილისი, საქართველო</p>
          </div>
        </div>
      `,
    });
    console.log(`Booking confirmation sent to client ${booking.email}, ID: ${info.messageId}`);
  } catch (error) {
    console.error('Failed to send confirmation email to client:', error);
  }
}

export async function sendBookingRejectionToClient(
  booking: Booking,
  reason?: string
): Promise<void> {
  const fromEmail = getFromEmail();
  if (!fromEmail || !process.env.EMAIL_PASS) return;

  try {
    const info = await transporter.sendMail({
      from: `"THE MR Studio" <${fromEmail}>`,
      to: booking.email,
      subject: `დაჯავშნა გაუქმებულია / Booking Cancelled - THE MR Studio`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #344C3D; border-bottom: 1px solid #CDD9CA; padding-bottom: 10px;">
            თქვენი ვიზიტი გაუქმებულია
          </h2>
          <p>მოგესალმებით ${booking.fullName},</p>
          <p>სამწუხაროდ, თქვენი დაჯავშნა <strong>${booking.date}</strong>-ში, <strong>${booking.time}</strong> საათზე ვერ დადასტურდა.</p>
          ${reason ? `<p><strong>მიზეზი / Reason:</strong> ${reason}</p>` : ''}
          <p>გთხოვთ, ეწვიოთ ჩვენს ვებსაიტს და აირჩიოთ სხვა დრო.</p>
          <p><a href="https://mrstudio.ge" style="display: inline-block; padding: 10px 20px; background-color: #344C3D; color: white; text-decoration: none; border-radius: 4px; margin-top: 10px;">ახალი დაჯავშნა / Book Again</a></p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666;">
            <p>ბოდიშს გიხდით დისკომფორტისთვის.<br><strong>THE MR Studio</strong></p>
          </div>
        </div>
      `,
    });
    console.log(`Booking rejection sent to client ${booking.email}, ID: ${info.messageId}`);
  } catch (error) {
    console.error('Failed to send rejection email to client:', error);
  }
}
