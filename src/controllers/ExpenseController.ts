import type { Request, Response } from 'express'
import Expense from '../models/Expense';

export class ExpensesController {
    
  
    static create = async (req: Request, res: Response) => {

        try {
            const expense = new Expense(req.body)
            expense.budgetId = req.budget.id
            await expense.save()
            res.status(201).json('Expense created successfully')
        } catch (error) {
            // Handle error
            res.status(500).send({ message: 'An error occurred while creating the expense' });
        }
    }
  
    static getById = async (req: Request, res: Response) => {
        res.json(req.expense)
    }

    static updateById = async (req: Request, res: Response) => {
        await req.expense.update(req.body)
        res.json("Expense updated")
    }
  
    static deleteById = async (req: Request, res: Response) => {
        await req.expense.destroy()
        res.json("Expense deleted")
    }
}