import { createRequest, createResponse } from "node-mocks-http"
import { budgets } from "../../mocks/budget"
import { BudgetController } from "../../../controllers/BudgetController"
import Expense from "../../../models/Expense"
import Budget from "../../../models/Budget"

jest.mock('../../../models/Budget', () => ({
    findAll: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
    // update: jest.fn()
}))



describe('BudgetController.getAll', () => {

    beforeEach(() => {
        (Budget.findAll as jest.Mock).mockReset();
        (Budget.findAll as jest.Mock).mockImplementation((options) => {
            const updateBudgets = budgets.filter(budget => budget.userId === options.where.userId);
            return Promise.resolve(updateBudgets)
        })
    })

    it('should return 2 budgets for user with ID 1', async () => {

        const req = createRequest({
            method: 'GET',
            url: '/api/budgets',
            user: { id: 1 }
        })

        const res = createResponse();
        await BudgetController.getAll(req, res)

        const data = res._getJSONData()
        expect(data).toHaveLength(2)
        expect(res.statusCode).toBe(200)
        expect(res.status).not.toBe(404)
    })

    it('should return 1 budgets for user with ID 2', async () => {

        const req = createRequest({
            method: 'GET',
            url: '/api/budgets',
            user: { id: 2 }
        })

        const res = createResponse();

        await BudgetController.getAll(req, res)

        const data = res._getJSONData()
        expect(data).toHaveLength(1)
        expect(res.statusCode).toBe(200)
        expect(res.status).not.toBe(404)
    })

    it('should return 0 budgets for user with ID 10', async () => {

        const req = createRequest({
            method: 'GET',
            url: '/api/budgets',
            user: { id: 10 }
        })

        const res = createResponse();

        // const updateBudgets = budgets.filter(budget => budget.userId === req.user.id);
        // (Budget.findAll as jest.Mock).mockResolvedValue(updateBudgets)
        await BudgetController.getAll(req, res)

        const data = res._getJSONData()
        expect(data).toHaveLength(0)
        expect(res.statusCode).toBe(200)
        expect(res.status).not.toBe(404)
    })

    it('Should handle errors when fetching budgets', async () => {
        const req = createRequest({
            method: 'GET',
            url: '/api/budgets',
            user: { id: 100 }
        })

        const res = createResponse();

        (Budget.findAll as jest.Mock).mockRejectedValue(new Error)
        await BudgetController.getAll(req, res)

        expect(res.statusCode).toBe(500)
        expect(res._getJSONData()).toEqual({ error: "Error getting budgets" })

    })
})

describe('BudgetController.create', () => {
    it('Should create a new budget and respond with status code 201', async () => {

        const mockBudget = {
            save: jest.fn().mockResolvedValue(true)
        };

        (Budget.create as jest.Mock).mockResolvedValue(mockBudget);
        const req = createRequest({
            method: 'POST',
            url: '/api/budgets',
            user: { id: 1 },
            body: { name: 'Test budget', amount: 1000 }
        })

        const res = createResponse();
        await BudgetController.create(req, res)

        const data = res._getJSONData()
        expect(res.statusCode).toBe(201)
        expect(data).toBe("Budget created")
        expect(mockBudget.save).toHaveBeenCalled()
        expect(mockBudget.save).toHaveBeenCalledTimes(1)
        expect(Budget.create).toHaveBeenCalledWith(req.body)
    })

    it('Should handle errors when creating a budget', async () => {

        const mockBudget = {
            save: jest.fn()
        };

        (Budget.create as jest.Mock).mockRejectedValue(new Error)
        const req = createRequest({
            method: 'POST',
            url: '/api/budgets',
            user: { id: 1 },
            body: { name: 'Test budget', amount: 1000 }
        })

        const res = createResponse();
        await BudgetController.create(req, res)

        expect(res.statusCode).toBe(500)
        expect(res._getJSONData()).toEqual({ error: "Error creating budget" })
        expect(mockBudget.save).not.toHaveBeenCalled()
        expect(Budget.create).toHaveBeenCalledWith(req.body)
    })
})

describe('BudgetController.getById', () => {

    beforeEach(() => {
        (Budget.findByPk as jest.Mock).mockReset();
        (Budget.findByPk as jest.Mock).mockImplementation((id, include) => {
            const budget = budgets.filter(budget => budget.id === id)[0];
            return Promise.resolve(budget)
        })
    })

    it ('Should return a budget with ID 1 and 3 expenses', async () => {

        const req = createRequest({
            method: 'GET',
            url: '/api/budgets/:budgetId',
            budget: { id: 1 }
        })
        const res = createResponse();
        await BudgetController.getById(req, res)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(200)
        expect(data.expenses).toHaveLength(3)
        expect(Budget.findByPk).toHaveBeenCalled()
        expect(Budget.findByPk).toHaveBeenCalledTimes(1)
        expect(Budget.findByPk).toHaveBeenCalledWith(1, { include: [ Expense] })
    })

    it('Should return a budget with ID 2 and 2 expenses', async () => {

        const req = createRequest({
            method: 'GET',
            url: '/api/budgets/2',
            budget: { id: 2 }
        })
        const res = createResponse();
        await BudgetController.getById(req, res)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(200)
        expect(data.expenses).toHaveLength(2)
    })

    it('Should return a budget with ID 3 and 0 expenses', async () => {

        const req = createRequest({
            method: 'GET',
            url: '/api/budgets/3',
            budget: { id: 3 }
        })
        const res = createResponse();
        await BudgetController.getById(req, res)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(200)
        expect(data.expenses).toHaveLength(0)
    })
})

describe('BudgetController.updateById', () => {
    it('Shold update the budget and return a success message', async () => {
        const budgetMock = {
            update: jest.fn().mockResolvedValue(true)
        }

        const req = createRequest({
            method: 'PUT',
            url: '/api/budgets/:budgetId',
            body: { name: 'Updated budget', amount: 2000 },
            budget: budgetMock
        })

        const res = createResponse();
        await BudgetController.updateById(req, res)

        const data = res._getJSONData()
        expect(res.statusCode).toBe(200)
        expect(data).toBe("Budget updated")
        expect(budgetMock.update).toHaveBeenCalled()
        expect(budgetMock.update).toHaveBeenCalledTimes(1)
        expect(budgetMock.update).toHaveBeenCalledWith(req.body)
    })
})

describe('BudgetController.deleteById', () => {
    it('Should delete the budget and return a success message', async () => {
        const budgetMock = {
            destroy: jest.fn().mockResolvedValueOnce(true)
        }

        const req = createRequest({
            method: 'DELETE',
            url: '/api/budgets/:budgetId',
            budget: budgetMock
        })

        const res = createResponse();
        await BudgetController.deleteById(req, res)

        const data = res._getJSONData()
        expect(res.statusCode).toBe(200)
        expect(data).toBe("Budget deleted")
        expect(budgetMock.destroy).toHaveBeenCalled()
        expect(budgetMock.destroy).toHaveBeenCalledTimes(1)
        
    })
})
