import cron from 'node-cron';
import { RecurringExpense } from '../models/RecurringExpense';
import { Expense } from '../models/Expense';
import { Household } from '../models/Household';
import { calculateNextOccurrence, calculateSplitDetails } from '../services/calculationService';

export const startRecurringExpenseScheduler = () => {
  // Run every day at midnight (00:00)
  cron.schedule('0 0 * * *', async () => {
    console.log('🔄 Processing recurring expenses...');
    
    try {
      const now = new Date();
      
      // Find all active recurring expenses that are due
      const dueExpenses = await RecurringExpense.find({
        isActive: true,
        nextOccurrence: { $lte: now },
        $or: [
          { endDate: { $exists: false } },
          { endDate: { $gte: now } }
        ],
      }).populate('householdId');

      let created = 0;
      let failed = 0;

      for (const recurring of dueExpenses) {
        try {
          // Calculate split details if it's a household expense
          let splitDetails = recurring.splitDetails;
          if (recurring.householdId && recurring.splitMethod !== 'none') {
            const household = await Household.findById(recurring.householdId);
            if (household) {
              splitDetails = calculateSplitDetails(
                {
                  amount: recurring.amount,
                  splitMethod: recurring.splitMethod,
                  splitDetails: recurring.splitDetails,
                  paidBy: recurring.paidBy,
                },
                household
              );
            }
          }

          // Create the actual expense
          await Expense.create({
            amount: recurring.amount,
            description: `${recurring.description} (Recurring)`,
            category: recurring.category,
            date: new Date(),
            ownerId: recurring.ownerId,
            householdId: recurring.householdId || undefined,
            currency: recurring.currency,
            paidBy: recurring.paidBy,
            splitMethod: recurring.splitMethod,
            splitDetails,
          });

          created++;

          // Update next occurrence
          recurring.nextOccurrence = calculateNextOccurrence(
            recurring.nextOccurrence,
            recurring.frequency
          );
          await recurring.save();

          console.log(`✅ Created expense from recurring: ${recurring._id}`);
        } catch (error: any) {
          console.error(`❌ Failed to create expense from recurring ${recurring._id}:`, error.message);
          failed++;
        }
      }

      console.log(`✅ Recurring expenses processed: ${created} created, ${failed} failed`);
    } catch (error: any) {
      console.error('❌ Error processing recurring expenses:', error);
    }
  });

  console.log('📅 Recurring expense scheduler started');
};

