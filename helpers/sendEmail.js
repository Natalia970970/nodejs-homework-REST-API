const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const {SENDGRID_API_KEY1} = process.env;

sgMail.setApiKey(SENDGRID_API_KEY1);

const sendEmail = async (data) => {
    const email = {...data, from: "nataliasoldatenko970@gmail.com"};
    await sgMail.send(email);
    return true;
}

module.exports = sendEmail;
