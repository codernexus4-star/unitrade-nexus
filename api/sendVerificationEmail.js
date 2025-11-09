const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { email, code } = req.body;

  if (!email || !code) {
    res.status(400).json({ error: 'Missing email or code' });
    return;
  }

  // Set up transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'UniTrade Account Verification Code',
    html: `
      <div>
        <h2>UniTrade Account Verification</h2>
        <p>Your verification code is: <b>${code}</b></p>
        <p>This code will expire in 30 minutes.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Verification code sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send verification email', details: error.message });
  }
};
