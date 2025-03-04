import type { Request, Response, NextFunction } from 'express'
import { body, param, validationResult } from 'express-validator'
import Budget from '../models/Budget'


// Global type for the request object
declare global {
    namespace Express {
        interface Request {
            budget?: Budget
        }
    }
}

export const validateBudgetId = async (req: Request, res: Response, next: NextFunction) => {
    
    await param("budgetId")
        .isInt().withMessage("Id must be a number")
        .custom((value) => value > 0).withMessage("Id not valid")
        .run(req)
    
        let errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        next()
}

export const validateBudgetExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { budgetId } = req.params
        const budget = await Budget.findByPk(budgetId)
        
        if (!budget) {
            const error = new Error("Budget not found")
            return res.status(404).json({ error: error.message })
        }
        req.budget = budget
        next()
    } catch (error) {
        res.status(500).json({ error: "Error getting budget by id" })   
    }   
}

export const validateBudgetInput = async (req: Request, res: Response, next: NextFunction) => {

    await body("name")
        .notEmpty().withMessage("Name is required")
        .run(req)

    await body("amount")
        .notEmpty().withMessage("Amount is required")
        .isNumeric().withMessage("Amount must be a number")
        .custom((value) => value > 0).withMessage("Amount must be greater than 0")
        .run(req)
    next()
}