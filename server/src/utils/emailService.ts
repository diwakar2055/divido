import nodemailer from 'nodemailer';

// Create email transporter
// In production, use environment variables for email configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password',
  },
});

export const sendInvitationEmail = async (
  email: string,
  groupName: string,
  invitationToken: string,
  invitedByName: string
): Promise<void> => {
  const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/join-group/${invitationToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@divido.com',
    to: email,
    subject: `You're invited to join "${groupName}" on Divido!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #9333ea; margin: 0;">Divido</h1>
          <p style="color: #666; margin: 5px 0 0 0;">Split expenses effortlessly</p>
        </div>

        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0 0 15px 0;">Hi there! 👋</p>
          <p style="margin: 0 0 15px 0;">
            <strong>${invitedByName}</strong> has invited you to join the group <strong>"${groupName}"</strong> on Divido.
          </p>
          <p style="margin: 0 0 20px 0;">
            Divido helps you split expenses with friends and keep track of who owes what.
          </p>
        </div>

        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${invitationLink}" style="display: inline-block; background: linear-gradient(to right, #9333ea, #ec4899); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
            Accept Invitation & Join Group
          </a>
        </div>

        <p style="color: #666; font-size: 14px; margin: 0 0 10px 0;">
          Or copy and paste this link in your browser:
        </p>
        <p style="color: #9333ea; font-size: 12px; word-break: break-all; margin: 0 0 20px 0;">
          ${invitationLink}
        </p>

        <div style="border-top: 1px solid #ddd; padding-top: 20px; color: #999; font-size: 12px;">
          <p style="margin: 0 0 10px 0;">
            This invitation will expire in 7 days. If you don't have a Divido account yet, you'll be prompted to create one when you accept.
          </p>
          <p style="margin: 0;">
            If you didn't expect this invitation, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send invitation email:', error);
    throw new Error('Failed to send invitation email');
  }
};

export const sendWelcomeEmail = async (
  email: string,
  name: string
): Promise<void> => {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@divido.com',
    to: email,
    subject: 'Welcome to Divido!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #9333ea; margin: 0;">Divido</h1>
          <p style="color: #666; margin: 5px 0 0 0;">Split expenses effortlessly</p>
        </div>

        <p style="margin: 0 0 15px 0;">Hi ${name},</p>
        <p style="margin: 0 0 15px 0;">
          Welcome to Divido! We're excited to have you on board.
        </p>
        <p style="margin: 0 0 15px 0;">
          With Divido, you can:
        </p>
        <ul style="margin: 0 0 15px 0; padding-left: 20px;">
          <li>Create groups to split expenses with friends</li>
          <li>Track who paid for what</li>
          <li>Automatically calculate who owes whom</li>
          <li>Settle up easily</li>
        </ul>

        <p style="color: #666; font-size: 12px;">
          If you have any questions, feel free to reach out to our support team.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
};
