import { Resend } from 'resend';
import type { Booking } from '@shared/schema';

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('Email notifications disabled: RESEND_API_KEY not configured');
    return null;
  }
  return new Resend(apiKey);
};

const getFromEmail = () => process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

export async function sendNewBookingNotification(
  booking: Booking,
  adminEmail: string
): Promise<void> {
  const resend = getResendClient();
  if (!resend) {
    console.log('Skipping admin email notification (Resend not configured)');
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `THE MR Studio <${getFromEmail()}>`,
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
            <p style="margin: 0;">⏰ This booking is pending approval. Log in to the admin dashboard to approve or reject.</p>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #888; font-size: 12px;">Automated notification from THE MR Nail & Laser Studio.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend API error (admin notification):', error);
    } else {
      console.log(`Booking notification sent to ${adminEmail}, ID: ${data?.id}`);
    }
  } catch (error) {
    console.error('Failed to send booking notification:', error);
  }
}

export async function sendBookingConfirmationToClient(
  booking: Booking
): Promise<void> {
  const resend = getResendClient();
  if (!resend) return;

  try {
    const { data, error } = await resend.emails.send({
      from: `THE MR Studio <${getFromEmail()}>`,
      to: booking.email,
      subject: `✨ დაჯავშნა დადასტურებულია / Booking Confirmed - THE MR Studio`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #c9a063; border-bottom: 1px solid #eee; padding-bottom: 10px;">
            თქვენი ვიზიტი დადასტურებულია!
          </h2>
          <p>მოგესალმებით ${booking.fullName},</p>
          <p>მოხარულები ვართ გაცნობოთ, რომ თქვენი დაჯავშნა THE MR Studio-ში დადასტურებულია.</p>
          <div style="background: #fafafa; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #eee;">
            <h3 style="margin-top: 0; color: #c9a063;">ვიზიტის დეტალები:</h3>
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

    if (error) {
      console.error('Resend API error (client confirmation):', error);
    } else {
      console.log(`Confirmation sent to ${booking.email}, ID: ${data?.id}`);
    }
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
  }
}

export async function sendBookingRejectionToClient(
  booking: Booking,
  reason?: string
): Promise<void> {
  const resend = getResendClient();
  if (!resend) return;

  try {
    const { data, error } = await resend.emails.send({
      from: `THE MR Studio <${getFromEmail()}>`,
      to: booking.email,
      subject: `Booking Status Update - THE MR Studio`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #666; border-bottom: 1px solid #eee; padding-bottom: 10px;">Booking Update</h2>
          <p>მოგესალმებით ${booking.fullName},</p>
          <p>სამწუხაროდ, ამჯერად ვერ ვახერხებთ თქვენი დაჯავშნის დადასტურებას მითითებულ დროს.</p>
          ${reason ? `<div style="background: #fff5f5; padding: 15px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #fc8181;">
            <p style="margin: 0;"><strong>მიზეზი:</strong> ${reason}</p>
          </div>` : ''}
          <p>გთხოვთ, სცადოთ სხვა დროს დაჯავშნა ან დაგვიკავშირდით დეტალებისთვის.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666;">
            <p><strong>THE MR Studio</strong></p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend API error (client rejection):', error);
    } else {
      console.log(`Rejection sent to ${booking.email}, ID: ${data?.id}`);
    }
  } catch (error) {
    console.error('Failed to send rejection email:', error);
  }
}
