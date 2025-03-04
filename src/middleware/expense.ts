import type { Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import Expense from '../models/Expense';

// Declarate Expense type Global
declare global {
    namespace Express {
        interface Request {
            expense?: Expense
        }
    }
}

export const validateExpenseInput = async (req: Request, res: Response, next: NextFunction) => {
    await body('name')
        .notEmpty().withMessage('Name is required')
        .run(req);

    await body('amount')
        .notEmpty().withMessage('Amount is required')
        .isNumeric().withMessage('Amount must be a number')
        .custom(value => value > 0 ).withMessage('Amount must be greater than 0')
        .run(req);
    next();
}

export const validateExpenseId = async (req: Request, res: Response, next: NextFunction) => {
    await param('expenseId')
        .isNumeric().withMessage('Expense ID must be a number')
        .custom(value => value > 0).withMessage('Expense ID must be greater than 0')
        .run(req);
        
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    next()
}

export const validateExpenseExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { expenseId } = req.params
        const expense = await Expense.findByPk(expenseId)
        if (!expense) {
            const error = new Error ('Expense not found')
            return res.status(404).json({ error: error.message })
        }
        req.expense = expense
        next()     
    } catch (error) {
        // console.error(error)
        res.status(500).json({ error: 'Error validating expense exists' })
    }
}

