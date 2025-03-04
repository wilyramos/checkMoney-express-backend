import { Request, Response } from 'express';
import User from '../models/User';

export class AuthController {
    static createAccount = async (req: Request, res: Response) =>{

        const { email } = req.body

        // Check if the email is already in use
        const emailExists = await User.findOne({ where: { email } })
        if (emailExists) {
            return res.status(409).json({ error: 'Email already in use' })
        }

        try {
            const user = new User(req.body)
            await user.save()
            res.json('Account created')
        } catch (error) {
            // console.log(error)
            res.status(500).json({ error: 'Error creating account' })
        }
    }
}