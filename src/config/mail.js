const config = require('./index')
const nodemailer = require('nodemailer')

const mail = nodemailer.createTransport({
    host:"smtp.gmail.com",
    service: "gmail",
    port: 465,
    secure: true,
    auth: {
        user: config.USER_MAIL,
        pass: config.APP_PASSWORD
    }
})
module.exports = mail