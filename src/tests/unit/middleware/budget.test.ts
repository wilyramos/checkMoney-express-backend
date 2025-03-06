import { createRequest, createResponse } from "node-mocks-http"
import { hasAccess, validateBudgetExists } from "../../../middleware/budget"
import Budget from "../../../models/Budget"
import { budgets } from "../../mocks/budget"

jest.mock('../../../models/Budget', () => ({
    findByPk: jest.fn()
}))

describe('Budget middleware- validateBudgetExists', () => {

    it('Should handle non-existent budget', async () => {

        (Budget.findByPk as jest.Mock).mockResolvedValue(null)

        const req = createRequest({
            params: { budgetId: 1 }
        })

        const res = createResponse()
        const next = jest.fn()

        await validateBudgetExists(req, res, next)
        const data = res._getJSONData()
        expect(res.statusCode).toBe(404)
        expect(data).toEqual({ error: "Budget not found" })
        expect(next).not.toHaveBeenCalled()
    })

    it('Should proceed to next middleware if budget exists', async() => {
        
        (Budget.findByPk as jest.Mock).mockResolvedValue(budgets[0])

        const req = createRequest({
            params: { budgetId: 1 }
        })

        const res = createResponse()
        const next = jest.fn()

        await validateBudgetExists(req, res, next)
        expect(next).toHaveBeenCalled()
        expect(req.budget).toEqual(budgets[0])
    })

    it('Should handle error', async () => {
        (Budget.findByPk as jest.Mock).mockRejectedValue(new Error)

        const req = createRequest({
            params: { budgetId: 1 }
        })

        const res = createResponse()
        const next = jest.fn()

        await validateBudgetExists(req, res, next)
        const data = res._getJSONData()
        expect(res.statusCode).toBe(500)
        expect(data).toEqual({ error: "Error getting budget by id" })
        expect(next).not.toHaveBeenCalled()
    })
})

describe('Budget middleware- hasAccess', () => {

    it('Should call next() if user has access to budget', () => {
        const req = createRequest({
            user: { id: 1 },
            budget: { userId: 1 }
        })

        const res = createResponse()
        const next = jest.fn()

        hasAccess(req, res, next)
        expect(next).toHaveBeenCalled()
        expect(next).toHaveBeenCalledTimes(1)
    })

    it('Should should return 401 if user does not have access to budget', () => {
        const req = createRequest({
            budget: budgets[0],
            user: { id: 2 }
        })

        const res = createResponse()
        const next = jest.fn()

        hasAccess(req, res, next)
        expect(next).not.toHaveBeenCalled()
        expect(res.statusCode).toBe(401)
        expect(res._getJSONData()).toEqual({ error: "Access denied" })
    })
})
