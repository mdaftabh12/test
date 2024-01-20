const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com', 
    port: 587, 
    secure: false,
    auth: {
        user: process.env.MAIL,
        pass: process.env.PASS,
    },
    tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false,
    },
});

const sendEmail = async function({subject, message, email}) {
    const mailOptions = {
        from: 'alexander_forss@hotmail.com',
        to: email,
        subject: `${subject}`,
        text: `${message}`,
        html: `<p>${message}</p>`,
    };

    await transporter.sendMail(mailOptions);
}

module.exports = {transporter, sendEmail};