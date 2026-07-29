/**
 * Centralized HTML Email Templates for Anand Utsav Backend
 */

/**
 * Generates an HTML email template for OTP Verification
 */
export const getOtpHtml = (otp, title = "Verification Code", subtitle = "Your One-Time Password for Anand Utsav") => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333333;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f7f9; padding: 30px 0;">
    <tr>
      <td align="center">
        <table role="presentation" style="width: 100%; max-width: 550px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.08); border: 1px solid #e9edf0;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e1e24 0%, #342042 50%, #FF671F 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 0.5px;">Anand Utsav</h1>
              <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">${subtitle}</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 36px 28px; text-align: center;">
              <h2 style="margin: 0 0 12px 0; font-size: 20px; color: #1e1e24; font-weight: 600;">${title}</h2>
              <p style="margin: 0 0 24px 0; font-size: 15px; color: #555555; line-height: 1.5;">
                Please use the following One-Time Password (OTP) to complete your verification. Click or tap the box below to select and copy the code.
              </p>
              
              <!-- Single-click Selectable OTP Box -->
              <div style="margin: 20px auto 28px auto; text-align: center;">
                <div style="display: inline-block; background-color: #fff4ee; border: 2px dashed #FF671F; border-radius: 12px; padding: 16px 28px; cursor: pointer; -webkit-user-select: all; -moz-user-select: all; -ms-user-select: all; user-select: all;">
                  <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 700; color: #E6550D; letter-spacing: 10px; -webkit-user-select: all; -moz-user-select: all; -ms-user-select: all; user-select: all; display: inline-block; padding-left: 10px;">${otp}</span>
                </div>
              </div>

              <p style="margin: 0 0 20px 0; font-size: 13px; color: #888888; line-height: 1.4;">
                This code will expire shortly (in <strong>2 to 5 minutes</strong>). If you did not request this code, please ignore this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #fafbfc; border-top: 1px solid #e9edf0; padding: 20px 24px; text-align: center; font-size: 12px; color: #888888; line-height: 1.5;">
              <p style="margin: 0;">Developed by Students of NIT Raipur • Anand Utsav Platform</p>
              <p style="margin: 4px 0 0 0;">This is an automated message, please do not reply to this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Generates an HTML email template for Welcome Messages
 */
export const getWelcomeHtml = (name) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Anand Utsav</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333333;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f7f9; padding: 30px 0;">
    <tr>
      <td align="center">
        <table role="presentation" style="width: 100%; max-width: 550px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.08); border: 1px solid #e9edf0;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e1e24 0%, #342042 50%, #FF671F 100%); padding: 36px 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Welcome to Anand Utsav</h1>
              <p style="margin: 8px 0 0 0; font-size: 15px; opacity: 0.92;">Your Premier Campus Celebration Marketplace</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 36px 28px;">
              <h2 style="margin: 0 0 14px 0; font-size: 20px; color: #1e1e24; font-weight: 600;">Hello ${name || 'Festive Friend'}!</h2>
              <p style="margin: 0 0 16px 0; font-size: 15px; color: #555555; line-height: 1.6;">
                We are thrilled to welcome you to <strong>Anand Utsav</strong> — a student-led platform proudly created by students of <strong>National Institute of Technology (NIT) Raipur</strong>.
              </p>
              <p style="margin: 0 0 24px 0; font-size: 15px; color: #555555; line-height: 1.6;">
                Explore verified event vendors, catering, photography, decorations, and seamless bookings for all your campus events and celebrations!
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #fafbfc; border-top: 1px solid #e9edf0; padding: 20px 24px; text-align: center; font-size: 12px; color: #888888;">
              <p style="margin: 0;">Developed by Students of NIT Raipur • Anand Utsav</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Generates an HTML email template for Contact Us Submissions
 */
export const getContactNotificationHtml = (name, email, subject, message) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Contact Form Submission</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333333;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f7f9; padding: 30px 0;">
    <tr>
      <td align="center">
        <table role="presentation" style="width: 100%; max-width: 550px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.08); border: 1px solid #e9edf0;">
          <tr>
            <td style="background: linear-gradient(135deg, #1e1e24 0%, #342042 50%, #FF671F 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700;">New Contact Form Submission</h1>
              <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">Anand Utsav Support Portal</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 28px;">
              <p style="margin: 0 0 12px 0; font-size: 15px; color: #333333;"><strong>Sender Name:</strong> ${name}</p>
              <p style="margin: 0 0 12px 0; font-size: 15px; color: #333333;"><strong>Sender Email:</strong> ${email}</p>
              <p style="margin: 0 0 12px 0; font-size: 15px; color: #333333;"><strong>Subject:</strong> ${subject || 'N/A'}</p>
              <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
              <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #555555;">Message Content:</p>
              <blockquote style="margin: 0; background: #fff4ee; padding: 16px 20px; border-left: 4px solid #FF671F; border-radius: 8px; font-size: 14px; line-height: 1.6; color: #222222;">
                ${message.replace(/\n/g, '<br>')}
              </blockquote>
            </td>
          </tr>
          <tr>
            <td style="background-color: #fafbfc; border-top: 1px solid #e9edf0; padding: 18px 24px; text-align: center; font-size: 12px; color: #888888;">
              <p style="margin: 0;">Anand Utsav Admin System • NIT Raipur Student Initiative</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Generates an HTML email template for Fraud / Misconduct Alerts
 */
export const getFraudReportHtml = (reporterName, reporterEmail, fraudType, targetName, proofUrl, description) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Fraud Report Alert</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333333;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f7f9; padding: 30px 0;">
    <tr>
      <td align="center">
        <table role="presentation" style="width: 100%; max-width: 550px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.08); border: 1px solid #e9edf0;">
          <tr>
            <td style="background: linear-gradient(135deg, #2c0e0e 0%, #6a1b1b 50%, #e65100 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Fraud / Misconduct Alert</h1>
              <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">Anand Utsav Security Portal</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 28px;">
              <p style="margin: 0 0 12px 0; font-size: 15px; color: #333333;"><strong>Reporter Name:</strong> ${reporterName || 'Anonymous'}</p>
              <p style="margin: 0 0 12px 0; font-size: 15px; color: #333333;"><strong>Reporter Email:</strong> ${reporterEmail || 'N/A'}</p>
              <p style="margin: 0 0 12px 0; font-size: 15px; color: #333333;"><strong>Category:</strong> ${fraudType || 'N/A'}</p>
              <p style="margin: 0 0 12px 0; font-size: 15px; color: #333333;"><strong>Target Entity / Provider:</strong> ${targetName}</p>
              <p style="margin: 0 0 12px 0; font-size: 15px; color: #333333;"><strong>Proof URL:</strong> ${proofUrl || 'N/A'}</p>
              <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
              <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #d32f2f;">Incident Details:</p>
              <blockquote style="margin: 0; background: #fff0f0; padding: 16px 20px; border-left: 4px solid #d32f2f; border-radius: 8px; font-size: 14px; line-height: 1.6; color: #222222;">
                ${description.replace(/\n/g, '<br>')}
              </blockquote>
            </td>
          </tr>
          <tr>
            <td style="background-color: #fafbfc; border-top: 1px solid #e9edf0; padding: 18px 24px; text-align: center; font-size: 12px; color: #888888;">
              <p style="margin: 0;">Anand Utsav Security Desk • NIT Raipur Student Initiative</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
