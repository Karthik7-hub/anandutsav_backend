import transporter from "../config/nodemailer.js";
import { getOtpHtml } from "../templates/emailTemplates.js";

const sendOtpEmail = async (email, otp, customMailOptions = {}) => {
  const fromSender = process.env.SENDER_EMAIL || process.env.SMTP_USER;
  const subject = customMailOptions.subject || `${otp} is your Anand Utsav verification code`;

  const mailOptions = {
    from: `"Anand Utsav" <${fromSender}>`,
    to: email,
    subject: subject,
    text: `${otp} is your Anand Utsav verification code.\n\nPlease enter this 6-digit code to complete your request. This code expires in 5 minutes.\n\nIf you did not request this code, please ignore this message.\n\n— Anand Utsav Platform`,
    html: getOtpHtml(otp, "Verification Code", "Your One-Time Password for Anand Utsav")
  };

  await transporter.sendMail(mailOptions);
};

export default sendOtpEmail;
