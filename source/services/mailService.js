import nodemailer from 'nodemailer'

export const mailFunction = async ({ message, to, subject } = {}) => {
    const transporter = nodemailer.createTransport({
        host: "localhost",
        port: 587,
        secure: false,
        auth: {
            user: 'diaaabdelazizelshafie4491@gmail.com',
            pass: 'bmuacicevbqpilqu'
        },
        tls: {
            rejectUnauthorized: true
        },
        service: 'gmail'
    })
    const sendEmail = await transporter.sendMail({
        to: to ? to : '',
        from: `"E-commerce" <diaaabdelazizelshafie4491@gmail.com>`,
        subject: subject ? subject : 'none',
        html: message ? message : 'none'
    })
    console.log('message', sendEmail)
    if (sendEmail.accepted.length) {
        return true
    }
    return false
}