import { Request, Response } from 'express';
import User from '../models/User';
import { hashPassword } from '../utils/auth';
import { generateToken } from '../utils/token';
import { AuthEmail } from '../emails/AuthEmail';
import { comparePassword } from '../utils/auth';
import { generateJWT } from '../utils/jwt';

export class AuthController {
    static createAccount = async (req: Request, res: Response) => {

        const { email, password } = req.body

        // Check if the email is already in use
        const emailExists = await User.findOne({ where: { email } })
        if (emailExists) {
            const error = new Error('Email already in use')
            return res.status(409).json({ error: error.message })
        }

        try {
            const user = await User.create(req.body)
            user.password = await hashPassword(password)
            const token = generateToken()
            user.token = token;

            if(process.env.NODE_ENV !== 'production') {
                globalThis.cashTrackrConfirmationToken = token
            }

            await user.save()

            // Email confirmation
            
            // await AuthEmail.sendConfirmationEmail({
            //     name: user.name,
            //     email: user.email,
            //     token: user.token
            // })
            res.status(201).json('Account created successfully')
        } catch (error) {
            // console.log(error)
            res.status(500).json({ error: 'Error creating account' })
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {

        const { token } = req.body

        const user = await User.findOne({ where: { token: token } })
        if (!user) {
            return res.status(401).json({ error: 'Invalid token' })
        }

        user.confirmed = true
        user.token = ''
        await user.save()

        res.json('Account confirmed')
    }

    static login = async (req: Request, res: Response) => {
        const { email, password } = req.body

        // Check if the user exists
        const user = await User.findOne({ where: { email } })
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        // Check if user is confirmed
        if (!user.confirmed) {
            return res.status(403).json({ error: 'Account not confirmed' })
        }

        // check if the password is correct

        const isPasswordCorrect = await comparePassword(password, user.password)
        if (!isPasswordCorrect) {
            return res.status(401).json({ error: 'Invalid password' })
        }

        // Generate token

        const token = generateJWT(user.id)
        res.json(token)
    }

    static forgotPassword = async (req: Request, res: Response) => {
        const { email } = req.body

        const user = await User.findOne({ where: { email } })
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        user.token = generateToken()
        await user.save()

        await AuthEmail.sendForgotPasswordEmail({
            name: user.name,
            email: user.email,
            token: user.token
        })

        res.json(" Email sent ")
    }

    static validateToken = async (req: Request, res: Response) => {
        const { token } = req.body

        const tokenExists = await User.findOne({ where: { token: token } })
        if (!tokenExists) {
            return res.status(404).json({ error: 'Invalid token' })
        }

        res.json('Token is valid')
    }

    static resetPasswordWithToken = async (req: Request, res: Response) => {

        const { token } = req.params
        const { password } = req.body

        const user = await User.findOne({ where: { token } })
        if (!user) {
            return res.status(404).json({ error: 'Invalid token' })
        }

        user.password = await hashPassword(password)
        user.token = ''
        await user.save()

        res.json('Password updated successfully')
    }

    static user = async (req: Request, res: Response) => {
        res.json(req.user)
    }

    static updateCurrentPassword = async (req: Request, res: Response) => {
        const { current_password, password } = req.body
        const { id } = req.user

        const user = await User.findByPk(id)

        const isPasswordCorrect = await comparePassword(current_password, user.password)

        if (!isPasswordCorrect) {
            return res.status(403).json({ error: 'Invalid password' })
        }

        user.password = await hashPassword(password)
        await user.save()

        res.json('Password updated successfully')
    }

    static checkPassword = async (req: Request, res: Response) => {
        const { password } = req.body
        const { id } = req.user

        const user = await User.findByPk(id)
        const isPasswordCorrect = await comparePassword(password, user.password)

        if (!isPasswordCorrect) {
            return res.status(403).json({ error: 'Invalid password' })
        }
        res.json('Password is correct')
    }

}