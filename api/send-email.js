const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const { formType, fields, attachment } = req.body;

    if (!formType || !fields) {
      return res.status(400).json({ success: false, error: 'Missing form data' });
    }

    // Create Gmail SMTP transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'alterventionsolutions@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    let subject, htmlBody;

    if (formType === 'idea') {
      subject = `💡 New Project Idea: ${fields.project_title || 'Untitled'}`;
      htmlBody = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #F97316, #EA580C); padding: 24px; border-radius: 12px 12px 0 0;">
            <h2 style="color: #fff; margin: 0;">💡 New Project Idea Submission</h2>
          </div>
          <div style="background: #fff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 12px; font-weight: 600; color: #374151; width: 40%;">Student Name</td>
                <td style="padding: 12px; color: #1f2937;">${fields.student_name || '-'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 12px; font-weight: 600; color: #374151;">Email</td>
                <td style="padding: 12px; color: #1f2937;"><a href="mailto:${fields.student_email}">${fields.student_email || '-'}</a></td>
              </tr>
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 12px; font-weight: 600; color: #374151;">Project Title</td>
                <td style="padding: 12px; color: #1f2937; font-weight: 600;">${fields.project_title || '-'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 12px; font-weight: 600; color: #374151; vertical-align: top;">Description</td>
                <td style="padding: 12px; color: #1f2937; white-space: pre-wrap;">${fields.project_desc || '-'}</td>
              </tr>
              <tr>
                <td style="padding: 12px; font-weight: 600; color: #374151;">PDF Attached</td>
                <td style="padding: 12px; color: #1f2937;">${attachment ? '✅ ' + attachment.name : '❌ No file'}</td>
              </tr>
            </table>
          </div>
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 16px;">
            Sent from ALTERVENTION website • ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
          </p>
        </div>
      `;
    } else {
      subject = `🚀 Job Application: ${fields.interested_role || 'General'} — ${fields.applicant_name || 'Unknown'}`;
      htmlBody = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #F97316, #EA580C); padding: 24px; border-radius: 12px 12px 0 0;">
            <h2 style="color: #fff; margin: 0;">🚀 New Job Application</h2>
          </div>
          <div style="background: #fff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 12px; font-weight: 600; color: #374151; width: 40%;">Applicant Name</td>
                <td style="padding: 12px; color: #1f2937;">${fields.applicant_name || '-'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 12px; font-weight: 600; color: #374151;">Email</td>
                <td style="padding: 12px; color: #1f2937;"><a href="mailto:${fields.applicant_email}">${fields.applicant_email || '-'}</a></td>
              </tr>
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 12px; font-weight: 600; color: #374151;">Phone</td>
                <td style="padding: 12px; color: #1f2937;"><a href="tel:${fields.applicant_phone}">${fields.applicant_phone || '-'}</a></td>
              </tr>
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 12px; font-weight: 600; color: #374151;">Interested Role</td>
                <td style="padding: 12px; color: #1f2937; font-weight: 600;">${fields.interested_role || '-'}</td>
              </tr>
              <tr>
                <td style="padding: 12px; font-weight: 600; color: #374151;">Resume Attached</td>
                <td style="padding: 12px; color: #1f2937;">${attachment ? '✅ ' + attachment.name : '❌ No file'}</td>
              </tr>
            </table>
          </div>
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 16px;">
            Sent from ALTERVENTION website • ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
          </p>
        </div>
      `;
    }

    // Build email
    const mailOptions = {
      from: `"ALTERVENTION Website" <${process.env.GMAIL_USER || 'alterventionsolutions@gmail.com'}>`,
      to: process.env.GMAIL_USER || 'alterventionsolutions@gmail.com',
      replyTo: fields.student_email || fields.applicant_email || undefined,
      subject,
      html: htmlBody,
      attachments: []
    };

    // Add file attachment if provided (base64 encoded from frontend)
    if (attachment && attachment.data && attachment.name) {
      mailOptions.attachments.push({
        filename: attachment.name,
        content: attachment.data,
        encoding: 'base64'
      });
    }

    // Send email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true, message: 'Email sent successfully' });

  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to send email. Please try again later.'
    });
  }
};
