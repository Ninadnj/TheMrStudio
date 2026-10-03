import nodemailer from 'nodemailer';
import type { Booking } from '@shared/schema';
import { defaultStudioInfo } from '@shared/studioDefaults';
import { storage } from './storage';

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

/* ------------------------------------------------------------------
   Email markup — matches the site's invitation card
   (design_guidelines.md §10). Presentation only: same data, same logic.
   ------------------------------------------------------------------ */

const SITE_URL = 'https://themrstudio.net';

/** The studio's address and phone as the owner set them in the admin. */
type Contact = { addressKa: string; phone: string; mapQuery: string };
const defaultContact: Contact = defaultStudioInfo;

async function currentContact(): Promise<Contact> {
  try {
    return await storage.getStudioInfo();
  } catch {
    return defaultContact;
  }
}

const mapUrl = (c: Contact) => `https://maps.google.com/?q=${encodeURIComponent(c.mapQuery)}`;
const telHref = (c: Contact) => {
  const digits = c.phone.replace(/\D/g, '');
  return `tel:+${digits.length === 9 ? `995${digits}` : digits}`;
};
const C = {
  ground: '#F5F1EB',
  card: '#FDFBF8',
  ink: '#1F1A17',
  muted: '#6B625A',
  line: '#E0D7CB',
  gold: '#A8875A',
  goldText: '#7D603A',
  espresso: '#2B2420',
};
const SERIF = "'Instrument Serif', Georgia, 'Times New Roman', serif";
const SANS = "Geist, 'Noto Sans Georgian', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";

/** Client-typed text is escaped before it enters the HTML. */
function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function bookingRef(id: string) {
  return id.replace(/-/g, '').slice(0, 6).toUpperCase();
}

function formatDate(isoDate: string, locale: 'ka-GE' | 'en-GB') {
  try {
    const d = new Date(`${isoDate}T12:00:00`);
    return new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(d);
  } catch {
    return isoDate;
  }
}

function firstName(fullName: string) {
  return String(fullName || '').trim().split(/\s+/)[0] || '';
}

function wordmark() {
  return `<span style="font-family:${SANS};font-size:15px;letter-spacing:0.06em;color:${C.muted};font-weight:300;">THE</span>
    <span style="font-family:${SANS};font-size:15px;font-weight:600;color:${C.ink};">MR</span>
    <span style="font-family:${SERIF};font-size:17px;font-style:italic;color:${C.ink};">Studio</span>`;
}

function hairline(width = 64) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
    <tr><td width="${width}" height="1" bgcolor="${C.gold}" style="width:${width}px;height:1px;line-height:1px;font-size:1px;background:${C.gold};">&nbsp;</td></tr>
  </table>`;
}

function eyebrow(text: string) {
  return `<p style="margin:0;font-family:${SANS};font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${C.goldText};">${text}</p>`;
}

function detailRow(label: string, value: string) {
  return `<tr>
    <td valign="top" style="padding:10px 0;border-top:1px solid ${C.line};width:150px;font-family:${SANS};font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:${C.muted};">${label}</td>
    <td valign="top" style="padding:10px 0;border-top:1px solid ${C.line};font-family:${SANS};font-size:15px;line-height:1.5;color:${C.ink};">${value}</td>
  </tr>`;
}

function button(href: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
    <tr><td bgcolor="${C.espresso}" style="border-radius:999px;background:${C.espresso};">
      <a href="${href}" style="display:inline-block;padding:14px 28px;font-family:${SANS};font-size:15px;font-weight:500;color:#FAF6F0;text-decoration:none;border-radius:999px;">${label}</a>
    </td></tr>
  </table>`;
}

/** Shared 600px frame: ivory ground, porcelain card, sign-off. Light-only so Gmail dark mode keeps it legible. */
function layout({ preheader, body, contact }: { preheader: string; body: string; contact: Contact }) {
  return `<!doctype html>
<html lang="ka">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <title>THE MR Studio</title>
</head>
<body style="margin:0;padding:0;background:${C.ground};" bgcolor="${C.ground}">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.ground};">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.ground}" style="background:${C.ground};">
    <tr><td align="center" style="padding:32px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
        <tr><td align="center" style="padding:0 0 20px;">${wordmark()}</td></tr>
        <tr><td bgcolor="${C.card}" style="background:${C.card};border:1px solid ${C.line};border-radius:16px;padding:36px 32px;">
          ${body}
        </td></tr>
        <tr><td align="center" style="padding:24px 12px 0;font-family:${SANS};font-size:12px;line-height:1.7;color:${C.muted};">
          ${esc(contact.addressKa)} · <a href="${telHref(contact)}" style="color:${C.muted};">${esc(contact.phone)}</a><br>
          <a href="${SITE_URL}" style="color:${C.goldText};text-decoration:underline;">themrstudio.net</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/* ---------- Renderers (exported so the markup can be previewed without sending) ---------- */

export function renderAdminNotification(booking: Booking, contact: Contact = defaultContact): string {
  return layout({
        preheader: `${esc(booking.fullName)} · ${esc(booking.date)} ${esc(booking.time)}`,
        body: `
          ${eyebrow('New booking request · ახალი მოთხოვნა')}
          <h1 style="margin:12px 0 20px;font-family:${SERIF};font-weight:400;font-size:30px;line-height:1.15;color:${C.ink};">${esc(booking.fullName)}</h1>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${detailRow('Date · Time', `${esc(booking.date)} · ${esc(booking.time)}`)}
            ${detailRow('Service', esc(booking.service))}
            ${detailRow('Staff', esc(booking.staffName || 'Not specified'))}
            ${detailRow('Duration', `${esc(booking.duration)} minutes`)}
            ${detailRow('Phone', `<a href="tel:${esc(booking.phone)}" style="color:${C.ink};">${esc(booking.phone)}</a>`)}
            ${detailRow('Email', `<a href="mailto:${esc(booking.email)}" style="color:${C.ink};">${esc(booking.email)}</a>`)}
            ${booking.notes ? detailRow('Notes', esc(booking.notes)) : ''}
            ${detailRow('Reference', `#${bookingRef(booking.id)}`)}
          </table>
          <p style="margin:24px 0 0;padding:14px 16px;border-left:2px solid ${C.gold};background:${C.ground};font-family:${SANS};font-size:14px;line-height:1.55;color:${C.ink};">
            This booking is pending approval. Log in to the admin dashboard to approve or reject.
          </p>
        `,
        contact,
      });
}

export function renderClientConfirmation(booking: Booking, contact: Contact = defaultContact): string {
  const name = esc(firstName(booking.fullName));
  return layout({
        preheader: `${formatDate(booking.date, 'ka-GE')} · ${esc(booking.time)} — THE MR Studio`,
        body: `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td align="center">${hairline()}</td></tr>
            <tr><td align="center" style="padding:20px 0 0;">${eyebrow('ვიზიტი დადასტურებულია · Booking confirmed')}</td></tr>
            <tr><td align="center" style="padding:14px 0 4px;font-family:${SERIF};font-size:32px;line-height:1.15;color:${C.ink};">
              ${name ? `${name}, გელოდებით` : 'გელოდებით'}
            </td></tr>
            <tr><td align="center" style="font-family:${SERIF};font-style:italic;font-size:18px;color:${C.muted};">
              We look forward to seeing you${name ? `, ${name}` : ''}
            </td></tr>
            <tr><td align="center" style="padding:24px 0 28px;">
              <p style="margin:24px 0 2px;font-family:${SERIF};font-size:22px;color:${C.ink};">${formatDate(booking.date, 'ka-GE')}</p>
              <p style="margin:0 0 6px;font-family:${SANS};font-size:13px;color:${C.muted};">${formatDate(booking.date, 'en-GB')}</p>
              <p style="margin:0;font-family:${SERIF};font-size:46px;line-height:1;color:${C.goldText};">${esc(booking.time)}</p>
            </td></tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;">
            ${detailRow('პროცედურა · Treatment', esc(booking.service))}
            ${detailRow('სპეციალისტი · Specialist', esc(booking.staffName || '—'))}
            ${detailRow('ნომერი · Reference', `#${bookingRef(booking.id)}`)}
            ${detailRow('მისამართი · Address', `${esc(contact.addressKa)}<br><a href="${mapUrl(contact)}" style="color:${C.goldText};text-decoration:underline;">რუკაზე ნახვა · Open map</a>`)}
          </table>
          <p style="margin:24px 0 0;font-family:${SANS};font-size:14px;line-height:1.65;color:${C.ink};">
            გთხოვთ, მობრძანდეთ დათქმულ დროს. თუ გეგმები შეგეცვლებათ, გთხოვთ შეგვატყობინოთ წინასწარ.<br>
            <span style="color:${C.muted};">Please arrive at your booked time. If your plans change, let us know in advance.</span>
          </p>
        `,
        contact,
      });
}

export function renderClientRejection(booking: Booking, reason?: string, contact: Contact = defaultContact): string {
  const name = esc(firstName(booking.fullName));
  return layout({
        preheader: `${formatDate(booking.date, 'ka-GE')} · ${esc(booking.time)}`,
        body: `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td align="center">${hairline()}</td></tr>
            <tr><td align="center" style="padding:20px 0 0;">${eyebrow('ვიზიტი ვერ დადასტურდა · Booking not confirmed')}</td></tr>
            <tr><td align="center" style="padding:14px 0 4px;font-family:${SERIF};font-size:28px;line-height:1.2;color:${C.ink};">
              ${name ? `${name}, ბოდიშს გიხდით` : 'ბოდიშს გიხდით'}
            </td></tr>
            <tr><td align="center" style="font-family:${SERIF};font-style:italic;font-size:17px;color:${C.muted};">We're sorry${name ? `, ${name}` : ''}</td></tr>
            <tr><td style="padding:24px 0 0;font-family:${SANS};font-size:15px;line-height:1.65;color:${C.ink};">
              სამწუხაროდ, თქვენი დაჯავშნა <strong>${formatDate(booking.date, 'ka-GE')}</strong>, <strong>${esc(booking.time)}</strong> საათზე ვერ დადასტურდა.<br>
              <span style="color:${C.muted};">Unfortunately we couldn't confirm your booking for ${formatDate(booking.date, 'en-GB')} at ${esc(booking.time)}.</span>
            </td></tr>
            ${reason ? `<tr><td style="padding:16px 0 0;"><p style="margin:0;padding:14px 16px;border-left:2px solid ${C.gold};background:${C.ground};font-family:${SANS};font-size:14px;line-height:1.55;color:${C.ink};"><strong>მიზეზი / Reason:</strong> ${esc(reason)}</p></td></tr>` : ''}
            <tr><td style="padding:24px 0 28px;font-family:${SANS};font-size:15px;line-height:1.65;color:${C.ink};">
              გთხოვთ, აირჩიოთ სხვა დრო — სიამოვნებით გიმასპინძლებთ.<br>
              <span style="color:${C.muted};">Please choose another time — we'd love to welcome you.</span>
            </td></tr>
            <tr><td align="center">${button(`${SITE_URL}/#booking`, 'ახალი დაჯავშნა · Book again')}</td></tr>
          </table>
        `,
        contact,
      });
}

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
      html: renderAdminNotification(booking, await currentContact()),
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
      html: renderClientConfirmation(booking, await currentContact()),
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
      html: renderClientRejection(booking, reason, await currentContact()),
    });
    console.log(`Booking rejection sent to client ${booking.email}, ID: ${info.messageId}`);
  } catch (error) {
    console.error('Failed to send rejection email to client:', error);
  }
}
