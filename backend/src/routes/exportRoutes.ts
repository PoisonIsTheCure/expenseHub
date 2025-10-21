import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { exportExpensesCSV, exportExpensesPDF, exportHouseholdBudgetPDF } from '../controllers/exportController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Export expenses as CSV
router.get('/expenses/csv', exportExpensesCSV);

// Export expenses as PDF
router.get('/expenses/pdf', exportExpensesPDF);

// Export household budget as PDF
router.get('/household/:householdId/budget/pdf', exportHouseholdBudgetPDF);

export default router;
