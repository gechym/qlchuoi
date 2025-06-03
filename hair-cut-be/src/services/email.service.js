import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Cấu hình transporter email
const createTransporter = () => {
  // Sử dụng Gmail SMTP
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Email của bạn
      pass: process.env.EMAIL_PASS, // App password của Gmail
    },
  });
};

// Tạo mã xác thực 6 số
const generateVerificationCode = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Gửi email xác thực
const sendVerificationEmail = async (email, fullName, verificationCode) => {
  const transporter = createTransporter();
  
  const verificationLink = `http://localhost:3111/api/auth/verify?email=${encodeURIComponent(email)}&verification_code=${verificationCode}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Xác thực tài khoản - Hair Cut App',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Chào ${fullName}!</h2>
        <p>Cảm ơn bạn đã đăng ký tài khoản Hair Cut App.</p>
        <p>Để hoàn tất việc đăng ký, vui lòng xác thực email của bạn bằng một trong hai cách sau:</p>
        
        <div style="margin: 20px 0;">
          <h3>Cách 1: Nhấp vào liên kết</h3>
          <a href="${verificationLink}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Xác thực tài khoản
          </a>
        </div>
        
        <div style="margin: 20px 0;">
          <h3>Cách 2: Nhập mã xác thực</h3>
          <p>Mã xác thực của bạn là: <strong style="font-size: 24px; color: #007bff;">${verificationCode}</strong></p>
          <p><em>Mã này có hiệu lực trong 15 phút.</em></p>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Không thể gửi email xác thực');
  }
};

export default {
  generateVerificationCode,
  sendVerificationEmail,
}; 