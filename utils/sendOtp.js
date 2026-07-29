import transporter from "../config/nodemailer.js";
import { getOtpHtml } from "../templates/emailTemplates.js";

const sendOtpEmail = async (email, otp, customMailOptions = {}) => {
  const fromSender = process.env.SENDER_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER || 'aanand.utsav01@gmail.com';
  const subject = customMailOptions.subject || 'Your Anand Utsav OTP Verification Code';

  const mailOptions = {
    from: `"Anand Utsav" <${fromSender}>`,
    to: email,
    subject: subject,
    text: customMailOptions.text || `Your Anand Utsav OTP code is ${otp}. This code is valid for 2-5 minutes.`,
    html: getOtpHtml(otp, subject)
  };

  await transporter.sendMail(mailOptions);
};

export default sendOtpEmail;
