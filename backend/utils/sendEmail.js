import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    // SMTP transporter oluştur
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    // E-posta seçeneklerini ayarla
    const mailOptions = {
        from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
    };

    // E-postayı gönder
    await transporter.sendMail(mailOptions);
};

export default sendEmail; 