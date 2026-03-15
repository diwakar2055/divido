import { Router } from 'express';
import {
    createExpense,
    deleteExpense,
    getExpenses,
    getGroupBalances,
    updateExpense,
} from '../controllers/expenseController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/', createExpense);
router.get('/:groupId', getExpenses);
router.put('/:expenseId', updateExpense);
router.delete('/:expenseId', deleteExpense);
router.get('/:groupId/balances', getGroupBalances);

export default router;
