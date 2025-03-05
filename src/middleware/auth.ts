import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User'

// Declar global user property in Request
declare global {
    namespace Express {
        interface Request {
            user?: User
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const bearer = req.headers.authorization
    if (!bearer) {
        return res.status(401).json({ error: 'Token is requeried' })
    }

    const [ , token] = bearer.split(' ')
    if (!token) {
        return res.status(401).json({ error: 'Token is requeried' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (typeof decoded === 'object' && decoded.id) {
            req.user = await User.findByPk(decoded.id, {
                attributes: ['id', 'name', 'email']
            })
            next()
        }

    } catch (error) {
        res.status(401).json({ error: 'Invalid token' })
    }
}