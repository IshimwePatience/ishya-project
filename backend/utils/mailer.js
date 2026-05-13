const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

exports.sendEmail = async (to, subject, text, html) => {
  try {
    // 🕵️ DEVELOPER LOG: Backup in case email is delayed
    console.log('\n' + '='.repeat(50));
    console.log(`📬 [SENDING EMAIL] TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`CONTENT: ${text}`);
    console.log('='.repeat(50) + '\n');

    await transporter.sendMail({
      from: `"ISHYA System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log('✅ Email sent successfully to:', to);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    // In dev, we don't throw so you can still use the console code
    if (process.env.NODE_ENV === 'production') throw error;
  }
};
