import { createRequest, createResponse } from 'node-mocks-http'
import Expense from '../../../models/Expense'
import { ExpensesController } from '../../../controllers/ExpenseController'
import { expenses } from '../../mocks/expenses'
import { UpdatedAt } from 'sequelize-typescript'


jest.mock('../../../models/Expense', () => ({
    create: jest.fn()
}))

describe('ExpenseController.create', () => {
    it('Should create a new expense', async () => {
        const expenseMock = {
            save: jest.fn().mockResolvedValue(true)
        };

        (Expense.create as jest.Mock).mockResolvedValue(expenseMock);

        const req = createRequest({
            method: 'POST',
            url: '/api/budgets/:budgetId/expenses',
            body: {
                name: 'Test expense',
                amount: 100
            },
            budget: {
                id: 1
            }
        });

        const res = createResponse();

        await ExpensesController.create(req, res);
        const data = res._getJSONData();
        expect(res.statusCode).toBe(201);
        expect(data).toBe('Expense created successfully');
        expect(expenseMock.save).toHaveBeenCalled();
        expect(expenseMock.save).toHaveBeenCalledTimes(1);
        expect(Expense.create).toHaveBeenCalledWith(req.body);

    })

    it('Should handle expense creation error', async () => {
        const expenseMock = {
            save: jest.fn()
        };

        (Expense.create as jest.Mock).mockRejectedValue(new Error);

        const req = createRequest({
            method: 'POST',
            url: '/api/budgets/:budgetId/expenses',
            body: { name: 'Test expense', amount: 500},
            budget: {id: 1}
        });

        const res = createResponse();
        await ExpensesController.create(req, res);

        const data = res._getJSONData();
        expect(res.statusCode).toBe(500);
        expect(data).toEqual({ error: 'An error occurred while creating the expense' });
        expect(expenseMock.save).not.toHaveBeenCalled();
        expect(Expense.create).toHaveBeenCalledWith(req.body);
    })
})

describe('ExpenseController.getById', () => {
    it('Should return an expense by id', async () => {
        const req = createRequest({
            method: 'GET',
            url: '/api/budgets/:budgetId/expenses/:expenseId',
            expense: expenses[0]
        });

        const res = createResponse();
        await ExpensesController.getById(req, res);

        expect(res.statusCode).toBe(200);
        const data = res._getJSONData();
        expect(data).toEqual(expenses[0]); // Check if the response is equal to the first expense in the mock data
    })
})

describe('ExpenseController.updateById', () => {
    it('Should update an expense by id', async () => {

        const expenseMock = {
            ...expenses[0],
            update: jest.fn().mockResolvedValue(true)
        };

        const req = createRequest({
            method: 'PUT',
            url: '/api/budgets/:budgetId/expenses/:expenseId',
            expense: expenseMock,
            body: { name: 'Updated expense', amount: 500 }
        });

        const res = createResponse();
        await ExpensesController.updateById(req, res);

        expect(res.statusCode).toBe(200);
        const data = res._getJSONData();
        expect(data).toBe('Expense updated');
        expect(expenseMock.update).toHaveBeenCalled();
        expect(expenseMock.update).toHaveBeenCalledTimes(1);
        expect(expenseMock.update).toHaveBeenCalledWith(req.body);
    })
})

describe('ExpenseController.deleteById', () => {
    it('Should delete an expense by id', async () => {
        const expenseMock = {
            destroy: jest.fn().mockResolvedValue(true)
        }

        const req = createRequest({
            method: 'DELETE',
            url: '/api/budgets/:budgetId/expenses/:expenseId',
            expense: expenseMock
        });

        const res = createResponse();
        await ExpensesController.deleteById(req, res);

        expect(res.statusCode).toBe(200);
        const data = res._getJSONData();
        expect(data).toBe('Expense deleted');
        expect(expenseMock.destroy).toHaveBeenCalled();
        expect(expenseMock.destroy).toHaveBeenCalledTimes(1);
        
    })
})