import type { Request, Response } from 'express'
import Budget from '../models/Budget'
import Expense from '../models/Expense'


export class BudgetController {
    static getAll = async (req: Request, res: Response) => {
        try {
            const budgets = await Budget.findAll({
                order: [['createdAt', 'DESC']],
                // Filter budgets by user
                where: { userId: req.user.id }
            })
            res.json(budgets)
        } catch (error) {
            // console.error(error)
            res.status(500).json({ error: "Error getting budgets" })
            
        }
    }

    static create = async (req: Request, res: Response) => {
        try {
            const budget = await Budget.create(req.body)
            budget.userId = req.user.id
            await budget.save()
            res.status(201).json("Budget created")
        } catch (error) {
            // console.error(error)
            res.status(500).json({ error: "Error creating budget" })
        }
    }

    static getById = async (req: Request, res: Response) => {
        try {
            // Include expenses in the response for the budget
            const budget = await Budget.findByPk(req.budget.id,{
                include: [Expense],
            })
            res.json(budget)
        } catch (error) {
            // console.error(error)
            res.status(500).json({ error: "Error getting budget by id" })            
        }
    }

    static updateById = async (req: Request, res: Response) => {
        await req.budget.update(req.body)
        res.json("Budget updated")
    }

    static deleteById = async (req: Request, res: Response) => {
        await req.budget.destroy()
        res.json("Budget deleted")
    }
}

