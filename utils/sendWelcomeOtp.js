import transporter from "../config/nodemailer.js";
import { getWelcomeHtml } from "../templates/emailTemplates.js";

const sendWelcomeEmail = async (name, email) => {
  const fromSender = process.env.SENDER_EMAIL || process.env.SMTP_USER;
  
  const mailOptions = {
    from: `"Anand Utsav" <${fromSender}>`,
    to: email,
    subject: "Welcome to Anand Utsav",
    text: `Hello ${name}. Welcome to Anand Utsav! Explore event services and campus celebrations.`,
    html: getWelcomeHtml(name)
  };

  await transporter.sendMail(mailOptions);
};

export default sendWelcomeEmail;
