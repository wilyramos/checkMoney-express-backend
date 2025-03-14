import { transport } from "../config/nodemailer"

type EmailType = {
    name: string
    email: string
    token: string
}

export class AuthEmail {
    static sendConfirmationEmail = async (user: EmailType) => {
        const email = await transport.sendMail({
            from: "Castracker admin@cash.com",
            to: user.email,
            subject: 'Confirm your email',
            html: `
                <h1>Welcome ${user.name}</h1>
                <p> Hola: ${user.name}</p>
                <p> Gracias por registrarte en CashTracker</p>
                <p> Por favor confirma tu email</p>
                <p> Visita el siguiente enlace</p>
                <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar email
                <p> e ingresa el codigo: <b>${user.token}</b></p>
            `
        })
    }

    static sendForgotPasswordEmail = async (user: EmailType) => {
        const email = await transport.sendMail({
            from: "Castracker admin",
            to: user.email,
            subject: 'Reset your password',
            html: 
            `
                <h1>Reset your password</h1>
                <p> Hi: ${user.name}</p>
                <p> You have requested to reset your password</p>
                <p> Please visit the following link</p>
                <a href="${process.env.FRONTEND_URL}/auth/new-password">Reset password</a>
                <p> and enter the code: <b>${user.token}</b></p>`
        })
    }
}

