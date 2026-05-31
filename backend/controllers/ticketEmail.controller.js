const { sendOTPEmail, sendTicketEmail } = require('../utils/mailer');

// In-memory OTP store: { email -> { otp, expiresAt } }
// For production replace with Redis
const otpStore = {};

/**
 * POST /api/ticket-email/send-otp
 * Body: { email, name }
 */
exports.sendOTP = async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) return res.status(400).json({ message: 'Email and name are required.' });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore[email.toLowerCase()] = { otp, expiresAt };

    try {
      await sendOTPEmail({ to: email, name, otp });
    } catch (err) {
      console.warn(`\n==============================================`);
      console.warn(`[RENDER FIREWALL BLOCKED EMAIL]`);
      console.warn(`Render Free Tier blocks outbound SMTP connections.`);
      console.warn(`Your OTP code for ${email} is: ${otp}`);
      console.warn(`==============================================\n`);
    }

    res.json({ message: 'Verification code sent. (If using Render Free Tier, check Render Logs for the code)' });
  } catch (err) {
    console.error('OTP send error:', err);
    res.status(500).json({ message: 'Failed to generate verification code.' });
  }
};

/**
 * POST /api/ticket-email/verify-otp
 * Body: { email, otp }
 */
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and code are required.' });

    const record = otpStore[email.toLowerCase()];

    if (!record) return res.status(400).json({ message: 'No verification code found for this email. Please request a new one.' });
    if (Date.now() > record.expiresAt) {
      delete otpStore[email.toLowerCase()];
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }
    if (record.otp !== otp.trim()) {
      return res.status(400).json({ message: 'Incorrect code. Please try again.' });
    }

    // Valid – remove from store
    delete otpStore[email.toLowerCase()];
    res.json({ message: 'Email verified successfully.' });
  } catch (err) {
    console.error('OTP verify error:', err);
    res.status(500).json({ message: 'Verification failed. Please try again.' });
  }
};

/**
 * POST /api/ticket-email/send-ticket
 * Body: { to, ticket: { buyerName, showTitle, venue, startTime, tier, quantity, amount, ticketId, transactionId } }
 */
exports.sendTicket = async (req, res) => {
  try {
    const { to, ticket } = req.body;
    if (!to || !ticket) return res.status(400).json({ message: 'Recipient email and ticket data are required.' });

    await sendTicketEmail({ to, ticket });
    res.json({ message: 'Ticket sent to ' + to });
  } catch (err) {
    console.error('Ticket email error:', err);
    res.status(500).json({ message: 'Failed to send ticket email.' });
  }
};
