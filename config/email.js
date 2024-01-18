const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL,
        pass: process.env.PASS,
    },
    // tls: {
    //     ciphers: 'SSLv3',
    //     rejectUnauthorized: false,
    // },
});

module.exports.transporter = transporter;