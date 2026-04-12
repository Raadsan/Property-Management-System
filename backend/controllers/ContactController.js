import nodemailer from 'nodemailer';
import { prisma } from '../lib/prisma.js';

export const sendContactMessage = async (req, res) => {
  const { firstName, lastName, email, phone, inquiryType, message } = req.body;

  if (!firstName || !lastName || !email || !message) {
    return res.status(400).json({ status: 'ERR', message: 'Missing required fields' });
  }

  try {
    // 1. Save to Database
    await prisma.contact.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        inquiryType,
        message,
        status: 'UNREAD'
      }
    });

    // 2. Send Email Notification
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: email,
      to: process.env.CONTACT_RECEIVER_EMAIL || 'imustaqbalproperties@gmail.com',
      subject: `New Contact Inquiry: ${inquiryType} from ${firstName} ${lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #fdfdfd;">
          <h2 style="color: #214347; text-align: center; border-bottom: 2px solid #214347; padding-bottom: 10px;">New Contact Message</h2>
          
          <div style="margin-top: 20px;">
            <p style="margin: 5px 0;"><strong>First Name:</strong> ${firstName}</p>
            <p style="margin: 5px 0;"><strong>Last Name:</strong> ${lastName}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #214347;">${email}</a></p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${phone || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Inquiry Type:</strong> <span style="background-color: #e6f2f3; padding: 2px 8px; rounded: 4px; color: #214347; font-weight: bold;">${inquiryType}</span></p>
          </div>

          <div style="margin-top: 30px; background-color: #fff; padding: 15px; border-left: 4px solid #214347; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <p style="margin: 0; font-weight: bold; color: #333; margin-bottom: 5px;">Message Content:</p>
            <p style="margin: 0; line-height: 1.6; color: #444;">${message}</p>
          </div>

          <p style="margin-top: 30px; font-size: 12px; color: #888; text-align: center;">
            This message was sent via the Damal Property Contact Form.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ status: 'OK', message: 'Message sent successfully' });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ status: 'ERR', message: 'Failed to send message: ' + error.message });
  }
};

export const getContactMessages = async (req, res) => {
  try {
    const messages = await prisma.contact.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      status: 'OK',
      data: messages
    });
  } catch (error) {
    console.error('Fetch messages error:', error);
    res.status(500).json({
      status: 'ERR',
      message: 'Failed to fetch messages'
    });
  }
};
