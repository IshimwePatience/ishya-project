const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 465,
  secure: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) === 465 : true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false }
});

/**
 * Send OTP verification email
 */
const sendOTPEmail = async ({ to, name, otp }) => {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ishya Studios – Email Verification</title>
  </head>
  <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
      <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #222;border-radius:4px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:#e5a00d;padding:24px 36px;">
              <p style="margin:0;font-size:11px;font-weight:900;letter-spacing:0.3em;color:#000;text-transform:uppercase;">Ishya Studios</p>
              <p style="margin:4px 0 0;font-size:11px;color:rgba(0,0,0,0.5);letter-spacing:0.15em;text-transform:uppercase;">Email Verification</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 36px;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;">Hello, ${name}</p>
              <p style="margin:0 0 32px;font-size:14px;color:rgba(255,255,255,0.4);line-height:1.6;">
                Use the code below to verify your email address and continue to checkout.
              </p>
              <!-- OTP Box -->
              <div style="background:#0a0a0a;border:1px solid #333;border-radius:4px;padding:32px;text-align:center;margin-bottom:32px;">
                <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.3em;color:#e5a00d;text-transform:uppercase;">Your Verification Code</p>
                <p style="margin:0;font-size:52px;font-weight:900;letter-spacing:12px;color:#fff;font-family:monospace;">${otp}</p>
              </div>
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.3);line-height:1.6;">
                This code expires in <strong style="color:rgba(255,255,255,0.6);">10 minutes</strong>. If you did not request this, please ignore this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 36px;border-top:1px solid #1a1a1a;">
              <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.15);letter-spacing:0.2em;text-transform:uppercase;">© ${new Date().getFullYear()} Ishya Studios • All rights reserved</p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `${otp} – Your Ishya Verification Code`,
    html
  });
};

/**
 * Send a beautiful professional ticket email after purchase
 */
const sendTicketEmail = async ({ to, ticket }) => {
  const { buyerName, showTitle, venue, startTime, tier, quantity, amount, ticketId, transactionId } = ticket;

  const eventDate = startTime ? new Date(startTime) : null;
  const dateStr  = eventDate ? eventDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'TBA';
  const timeStr  = eventDate ? eventDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : 'TBA';
  const tierLabel = { regular: 'Regular', vip: 'VIP Pass', vvip: 'VVIP Pass', table: 'Table (Group)' }[tier] || tier;
  const amountStr = amount > 0 ? `${Number(amount).toLocaleString()} RWF` : 'FREE ENTRY';
  const ticketCode = `ISHYA-${ticketId || Date.now()}`.toUpperCase();

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Ishya Event Ticket</title>
  </head>
  <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
      <tr><td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #222;border-radius:4px;overflow:hidden;">

          <!-- Gold Header Bar -->
          <tr>
            <td style="background:linear-gradient(135deg,#e5a00d,#f5c842);padding:28px 36px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0;font-size:13px;font-weight:900;letter-spacing:0.4em;color:#000;text-transform:uppercase;">Ishya Studios</p>
                    <p style="margin:4px 0 0;font-size:11px;color:rgba(0,0,0,0.55);letter-spacing:0.2em;text-transform:uppercase;">Official Event Ticket</p>
                  </td>
                  <td align="right">
                    <p style="margin:0;font-size:10px;font-weight:700;color:rgba(0,0,0,0.5);text-transform:uppercase;letter-spacing:0.15em;">Ticket Code</p>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:900;color:#000;letter-spacing:2px;font-family:monospace;">${ticketCode}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Show Title Block -->
          <tr>
            <td style="background:#0d0d0d;padding:36px 36px 28px;">
              <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#e5a00d;letter-spacing:0.3em;text-transform:uppercase;">You're Going!</p>
              <h1 style="margin:0;font-size:32px;font-weight:900;color:#fff;letter-spacing:-1px;line-height:1.1;">${showTitle}</h1>
            </td>
          </tr>

          <!-- Event Details Grid -->
          <tr>
            <td style="padding:0 36px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #222;padding-top:24px;">
                <tr>
                  <td width="50%" style="padding:16px 16px 16px 0;border-right:1px solid #1a1a1a;vertical-align:top;">
                    <p style="margin:0 0 6px;font-size:10px;font-weight:700;color:rgba(255,255,255,0.3);letter-spacing:0.25em;text-transform:uppercase;">Date</p>
                    <p style="margin:0;font-size:15px;font-weight:700;color:#fff;">${dateStr}</p>
                  </td>
                  <td width="50%" style="padding:16px 0 16px 24px;vertical-align:top;">
                    <p style="margin:0 0 6px;font-size:10px;font-weight:700;color:rgba(255,255,255,0.3);letter-spacing:0.25em;text-transform:uppercase;">Time</p>
                    <p style="margin:0;font-size:15px;font-weight:700;color:#fff;">${timeStr}</p>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding:16px 16px 0 0;border-right:1px solid #1a1a1a;border-top:1px solid #1a1a1a;vertical-align:top;">
                    <p style="margin:0 0 6px;font-size:10px;font-weight:700;color:rgba(255,255,255,0.3);letter-spacing:0.25em;text-transform:uppercase;">Venue</p>
                    <p style="margin:0;font-size:15px;font-weight:700;color:#fff;">${venue || 'TBA'}</p>
                  </td>
                  <td width="50%" style="padding:16px 0 0 24px;border-top:1px solid #1a1a1a;vertical-align:top;">
                    <p style="margin:0 0 6px;font-size:10px;font-weight:700;color:rgba(255,255,255,0.3);letter-spacing:0.25em;text-transform:uppercase;">Ticket Class</p>
                    <p style="margin:0;font-size:15px;font-weight:700;color:#e5a00d;">${tierLabel}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Holder + Qty + Amount -->
          <tr>
            <td style="padding:0 36px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;border:1px solid #222;border-radius:4px;padding:20px 24px;">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:rgba(255,255,255,0.3);letter-spacing:0.25em;text-transform:uppercase;">Ticket Holder</p>
                    <p style="margin:0;font-size:17px;font-weight:900;color:#fff;">${buyerName}</p>
                    <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.3);">${to}</p>
                  </td>
                  <td align="right">
                    <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:rgba(255,255,255,0.3);letter-spacing:0.25em;text-transform:uppercase;">Qty × Amount</p>
                    <p style="margin:0;font-size:22px;font-weight:900;color:#e5a00d;">${quantity}× ${amountStr}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Tear-line separator -->
          <tr>
            <td style="padding:0 20px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-top:2px dashed #222;"></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Entry Instructions -->
          <tr>
            <td style="padding:0 36px 32px;">
              <p style="margin:0 0 16px;font-size:11px;font-weight:700;color:#e5a00d;letter-spacing:0.3em;text-transform:uppercase;">Entry Instructions</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;">
                    <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.7);">① Present this email (printed or on your phone) at the entrance</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;">
                    <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.7);">② Quote your ticket code: <strong style="color:#fff;font-family:monospace;">${ticketCode}</strong></p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;">
                    <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.7);">③ Arrive at least 30 minutes before the event starts</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;">
                    <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.7);">④ This ticket is non-transferable and valid for one-time entry</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${transactionId ? `
          <!-- Transaction Reference -->
          <tr>
            <td style="padding:0 36px 28px;">
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.2);">PayPal Transaction ID: <span style="font-family:monospace;">${transactionId}</span></p>
            </td>
          </tr>` : ''}

          <!-- Footer -->
          <tr>
            <td style="background:#0d0d0d;padding:20px 36px;border-top:1px solid #1a1a1a;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.15);letter-spacing:0.2em;text-transform:uppercase;">© ${new Date().getFullYear()} Ishya Studios • ishya.rw</p>
                  </td>
                  <td align="right">
                    <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.15);">Questions? umutonigaella70@gmail.com</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td></tr>
    </table>
  </body>
  </html>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject: `🎭 Your Ticket – ${showTitle} | Ishya Studios`,
    html
  });
};

const sendEmail = async (to, subject, text, html) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    text,
    html
  });
};

module.exports = { sendOTPEmail, sendTicketEmail, sendEmail };
