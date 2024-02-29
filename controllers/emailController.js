// emailController.js

const nodemailer = require('nodemailer');

// Function to send email
function sendEmail(req, res) {
    // const { to, subject, text } = req.body;
    var username = 'mmuneesmtvp@gmail.com'
    // Create a transporter object using SMTP transport
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'muneesmmm@gmail.com',
            pass: 'gmkbzktxgtetpcec'
        }
    });

    // Email message options
    var mailOptions = {
        from: 'muneesmmm@gmail.com', // Sender address
        to: username,
        subject: "test",
        text: "test mail"
    };
    // let mailOptions = {
    //     from: 'your_email@gmail.com', // Sender address
    //     to: to,
    //     subject: subject,
    //     text: text
    // };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error occurred:', error.message);
            res.status(500).send('Error occurred while sending email.');
        } else {
            console.log('Email sent successfully!');
            console.log('Message ID:', info.messageId);
            res.status(200).send('Email sent successfully!');
        }
    });
}

module.exports = {
    sendEmail: sendEmail
};
