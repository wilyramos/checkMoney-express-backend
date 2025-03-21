import { Router } from "express";
import { BudgetController } from "../controllers/BudgetController";
import { handleInputErrors } from "../middleware/validation";
import { hasAccess, validateBudgetExists, validateBudgetId, validateBudgetInput } from "../middleware/budget";
import { ExpensesController } from "../controllers/ExpenseController";
import { validateExpenseInput } from "../middleware/expense";
import { validateExpenseId } from "../middleware/expense";
import { validateExpenseExists } from "../middleware/expense";
import { authenticate } from "../middleware/auth";
import { belongsToBudget } from "../middleware/expense";

const router = Router();

// Use the authenticate middleware for all routes
router.use(authenticate);  // -<> req.user

// Validate budgetId parameter for all routes
router.param('budgetId', validateBudgetId);
router.param('budgetId', validateBudgetExists); // req.budget
router.param('budgetId', hasAccess);

// Validate expenseId parameter for all routes
router.param('expenseId', validateExpenseId);
router.param('expenseId', validateExpenseExists);
router.param('expenseId', belongsToBudget);

router.get("/", 
    BudgetController.getAll
);

router.post('/', 
    validateBudgetInput,
    handleInputErrors,
    BudgetController.create
);

router.get("/:budgetId", 
    BudgetController.getById
);

router.put("/:budgetId", 
    validateBudgetInput,
    handleInputErrors,
    BudgetController.updateById
);

router.delete("/:budgetId", 
    BudgetController.deleteById
);

/** Routes for expenses */

router.post('/:budgetId/expenses',
    validateExpenseInput,
    handleInputErrors,
    ExpensesController.create)

router.get('/:budgetId/expenses/:expenseId',ExpensesController.getById)

router.put('/:budgetId/expenses/:expenseId',
    validateExpenseInput,
    handleInputErrors,
    ExpensesController.updateById)

router.delete('/:budgetId/expenses/:expenseId',ExpensesController.deleteById)

export default router;