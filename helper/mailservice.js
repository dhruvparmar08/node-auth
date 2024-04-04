const nodemailer = require("nodemailer");

const logger = require('./logger');

module.exports.sendMail = async (data) => {
    try {
        logger.info("Request received on mailservice");

        const transporter = nodemailer.createTransport({
            // service: "Gmail",
            host: data.mail_host,
            port: data.mail_port,
            secure: true,
            auth: {
                user: data.mail_auth_email,
                pass: data.mail_auth_password,
            },
        });

        const mailOptions = {
            from: data.from_mail,
            to: data.to_mail,
            subject: data.subject,
            html: data.template,
        };

        const info = await transporter.sendMail(mailOptions);
          
        console.log("Email sent: ", info.response);
    } catch (err) {
        console.log("err ::", err);
    }
}