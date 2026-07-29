import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const smtpUser = process.env.SMTP_USER ? process.env.SMTP_USER.replace(/['"]/g, '').trim() : '';
const smtpPass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/['"]/g, '').trim() : '';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

export default transporter;