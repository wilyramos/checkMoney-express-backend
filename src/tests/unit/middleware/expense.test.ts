import { createRequest, createResponse } from 'node-mocks-http'
import { validateExpenseExists } from '../../../middleware/expense'
import Expense from '../../../models/Expense'
import { expenses } from '../../mocks/expenses'
import { hasAccess } from '../../../middleware/budget'
import { budgets } from '../../mocks/budget'

jest.mock('../../../models/Expense', () => ({
    findByPk: jest.fn()
}))

describe('Expense middleware- validateExpenseExists', () => {

    beforeEach(() => {
        (Expense.findByPk as jest.Mock).mockImplementation((id) => {
            // Find the expense by id from the mock expenses. Found param is the id
            const expense = expenses.filter(e => e.id === id)[0] ?? null 
            return Promise.resolve(expense)
        })
    })

    it('Should handle a non-existent budget ', async () => {
        
        const req = createRequest({
            params: { expenseId: 100 }
        });
        const res = createResponse();
        const next = jest.fn();

        await validateExpenseExists(req, res, next);

        const data = res._getJSONData();
        expect(res.statusCode).toBe(404);
        expect(data).toEqual({ error: "Expense not found" });
        expect(next).not.toHaveBeenCalled();
    })

    it('Should call NEXT middleware if expense exists', async () => {

        const req = createRequest({
            params: { expenseId: 1 }
        });
        const res = createResponse();
        const next = jest.fn();

        await validateExpenseExists(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(req.expense).toEqual(expenses[0]);
        expect(next).toHaveBeenCalledTimes(1);
    })

    it('Should handle error', async () => {
        (Expense.findByPk as jest.Mock).mockRejectedValue(new Error);

        const req = createRequest({
            params: { expenseId: 1 }
        });
        const res = createResponse();
        const next = jest.fn();

        await validateExpenseExists(req, res, next);
        const data = res._getJSONData();
        expect(res.statusCode).toBe(500);
        expect(data).toEqual({ error: "Error validating expense exists" });
        expect(next).not.toHaveBeenCalled();
    })

    it('Should prevent access to non-owner', async () => {
        const req = createRequest({
            method: 'POST',
            url: '/api/budgets/:budgetId/expenses',
            budget: budgets[0],
            user: { id: 20 },
            body: { name: 'Test expense', amount: 100 }
        })

        const res = createResponse()
        const next = jest.fn()
        
        hasAccess(req, res, next)

        const data = res._getJSONData()
        expect(res.statusCode).toBe(401)
        expect(data).toEqual({ error: "Access denied" })
        expect(next).not.toHaveBeenCalled
    })
})