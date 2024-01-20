const User = require('../models/user');
const VerificationToken = require('../models/verificationToken');
const {Wine} = require('../models/wine');
const { transporter, sendEmail } = require('../config/email');

const generateOTP = function () {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString();
}

const sendOTP = async ({user}) => {
    const otp = generateOTP();
    console.log(user);
    const verificationToken = new VerificationToken({
        userId: user._id,
        token: otp,
        expirationDate: Date.now() + 600000, // Token expires in 10 min.
    });

    await verificationToken.save();

    const mailOptions = {
        from: 'alexander_forss@hotmail.com',
        to: user.email,
        subject: 'OTP Verification for account deletion.',
        text: `Here is your OTP ${otp}, this is valid for 10 minutes`,
        html: `<p>Here is your OTP <b>${otp}</b>, this is valid for 10 minutes</p>`,
    };

    await transporter.sendMail(mailOptions);
}

exports.deleteProfile = async (req, res) => {
    if (req.isAuthenticated()) {
        await sendOTP({user: req.user})
        res.redirect('/delete-profile/verify-otp');
    } else {
        return res.status(401).json({ error: 'User is not authenticated' });
    }
}

exports.verifyOtp = async (req, res) => {
    if(req.isAuthenticated()) {
        const { otp } = req.body;
        const verificationOtp = await VerificationToken.findOne({ token: otp }).populate('userId');

        if(!verificationOtp || verificationOtp.expirationDate < new Date()) {
            return res.status(401).send({error: 'Invalid or expired OTP'});
        }

        await Wine.deleteMany({owner: verificationOtp.userId._id});
        const user = await User.findByIdAndDelete(verificationOtp.userId._id);

        if(!user) {
            return res.status(404).send({error: 'Invalid or expired OTP'});
        }

        await VerificationToken.deleteOne({ token: otp });
        await sendEmail({subject: 'Account Deleted', message: 'Your Account Deleted Successfully.', email: verificationOtp.userId.email});

        res.redirect('/login');
    } else {    
        res.redirect('/login');
    }
}