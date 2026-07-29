import Contact from '../model/contactModel.js';
import transporter from '../config/nodemailer.js';
import { getContactNotificationHtml, getFraudReportHtml } from '../templates/emailTemplates.js';

export const handleContactForm = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: 'Please provide your name, email, and message.' });
        }

        // Save submission in MongoDB
        await Contact.create({
            name,
            email,
            subject: subject || 'Contact Us Submission',
            message,
            type: 'contact'
        });

        // Send notification email to support team via SMTP
        try {
            const recipientEmail = process.env.SENDER_EMAIL || process.env.SMTP_USER || 'aanand.utsav01@gmail.com';
            await transporter.sendMail({
                from: `"Anand Utsav Contact Form" <${process.env.SMTP_USER}>`,
                to: recipientEmail,
                replyTo: email,
                subject: `[Contact Form] ${subject || 'New Inquiry'}`,
                html: getContactNotificationHtml(name, email, subject, message)
            });
        } catch (mailErr) {
            console.warn("Nodemailer notice: Could not send email alert, but DB record was created:", mailErr.message);
        }

        return res.status(200).json({
            success: true,
            message: 'Your message has been sent successfully. Our support team will respond shortly!'
        });
    } catch (error) {
        console.error("Contact Form Error:", error);
        return res.status(500).json({ success: false, message: 'Failed to process contact request.', error: error.message });
    }
};

export const handleFraudReport = async (req, res) => {
    try {
        const { reporterName, reporterEmail, fraudType, targetName, proofUrl, description } = req.body;

        if (!targetName || !description) {
            return res.status(400).json({ success: false, message: 'Please provide reported target name and description.' });
        }

        // Save fraud report in MongoDB
        await Contact.create({
            name: reporterName || 'Anonymous',
            email: reporterEmail || 'N/A',
            subject: `[FRAUD REPORT] ${targetName}`,
            message: description,
            type: 'fraud',
            details: { fraudType, targetName, proofUrl }
        });

        // Send email alert to security team via SMTP
        try {
            const recipientEmail = process.env.SENDER_EMAIL || process.env.SMTP_USER || 'aanand.utsav01@gmail.com';
            await transporter.sendMail({
                from: `"Anand Utsav Fraud Alert" <${process.env.SMTP_USER}>`,
                to: recipientEmail,
                subject: `[FRAUD REPORT] Alert: ${targetName}`,
                html: getFraudReportHtml(reporterName, reporterEmail, fraudType, targetName, proofUrl, description)
            });
        } catch (mailErr) {
            console.warn("Nodemailer notice: Could not send alert email, but DB record was created:", mailErr.message);
        }

        return res.status(200).json({
            success: true,
            message: 'Your report has been submitted securely. Our moderation team will investigate promptly.'
        });
    } catch (error) {
        console.error("Fraud Report Error:", error);
        return res.status(500).json({ success: false, message: 'Failed to process fraud report.', error: error.message });
    }
};
