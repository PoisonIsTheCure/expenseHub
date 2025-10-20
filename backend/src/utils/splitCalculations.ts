import { IExpense, IHousehold, MemberBalance, DebtRelationship } from '../types';
import { User } from '../models/User';

export const calculateSplitDetails = (
  expense: Partial<IExpense>,
  household: IHousehold
): Array<{ userId: string; amount: number; percentage?: number }> => {
  const { amount, splitMethod, splitDetails, paidBy } = expense;
  
  if (!amount || !household.members || household.members.length === 0) {
    return [];
  }

  switch (splitMethod) {
    case 'equal': {
      // Split equally among all members
      const amountPerMember = amount / household.members.length;
      return household.members.map((userId) => ({
        userId: userId.toString(),
        amount: amountPerMember,
        percentage: (100 / household.members.length),
      }));
    }

    case 'percentage': {
      // Use household member weights/percentages
      const weights = household.memberWeights || [];
      const totalWeight = weights.reduce((sum, w) => sum + (w.percentage || w.weight || 0), 0);
      
      if (totalWeight === 0) {
        // Fall back to equal split if no weights defined
        const amountPerMember = amount / household.members.length;
        return household.members.map((userId) => ({
          userId: userId.toString(),
          amount: amountPerMember,
          percentage: (100 / household.members.length),
        }));
      }

      return weights.map((w) => {
        const percentage = w.percentage || (w.weight / totalWeight * 100);
        return {
          userId: w.userId.toString(),
          amount: (amount * percentage) / 100,
          percentage,
        };
      });
    }

    case 'custom': {
      // Use custom split details provided
      if (splitDetails && splitDetails.length > 0) {
        return splitDetails.map((detail) => ({
          userId: detail.userId.toString(),
          amount: detail.amount || 0,
          percentage: detail.percentage,
        }));
      }
      // Fall back to equal if no custom details provided
      const amountPerMember = amount / household.members.length;
      return household.members.map((userId) => ({
        userId: userId.toString(),
        amount: amountPerMember,
      }));
    }

    case 'none':
    default:
      // No split - only the payer owes
      return paidBy ? [{
        userId: paidBy.toString(),
        amount: amount,
        percentage: 100,
      }] : [];
  }
};

export const calculateHouseholdBalances = async (
  householdId: string,
  expenses: IExpense[]
): Promise<MemberBalance[]> => {
  // Initialize balances map
  const balancesMap = new Map<string, MemberBalance>();

  // Process each expense
  for (const expense of expenses) {
    const paidBy = expense.paidBy?.toString() || expense.ownerId.toString();
    
    // The person who paid gets credited
    if (!balancesMap.has(paidBy)) {
      const user = await User.findById(paidBy).select('name email');
      if (user) {
        balancesMap.set(paidBy, {
          userId: paidBy,
          name: user.name,
          email: user.email,
          totalPaid: 0,
          totalOwed: 0,
          balance: 0,
        });
      }
    }
    
    const payerBalance = balancesMap.get(paidBy);
    if (payerBalance) {
      payerBalance.totalPaid += expense.amount;
    }

    // Each person in splitDetails owes their share
    if (expense.splitDetails && expense.splitDetails.length > 0) {
      for (const split of expense.splitDetails) {
        const userId = split.userId.toString();
        
        if (!balancesMap.has(userId)) {
          const user = await User.findById(userId).select('name email');
          if (user) {
            balancesMap.set(userId, {
              userId,
              name: user.name,
              email: user.email,
              totalPaid: 0,
              totalOwed: 0,
              balance: 0,
            });
          }
        }
        
        const memberBalance = balancesMap.get(userId);
        if (memberBalance && split.amount) {
          memberBalance.totalOwed += split.amount;
        }
      }
    }
  }

  // Calculate net balance for each member
  const balances = Array.from(balancesMap.values());
  balances.forEach((balance) => {
    balance.balance = balance.totalPaid - balance.totalOwed;
  });

  return balances;
};

export const simplifyDebts = (balances: MemberBalance[]): DebtRelationship[] => {
  // Separate creditors (positive balance) and debtors (negative balance)
  const creditors = balances
    .filter((b) => b.balance > 0.01)
    .sort((a, b) => b.balance - a.balance);
  
  const debtors = balances
    .filter((b) => b.balance < -0.01)
    .sort((a, b) => a.balance - b.balance);

  const debts: DebtRelationship[] = [];
  let i = 0;
  let j = 0;

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];
    
    const amount = Math.min(creditor.balance, Math.abs(debtor.balance));
    
    debts.push({
      fromUser: {
        id: debtor.userId,
        name: debtor.name,
        email: debtor.email,
      },
      toUser: {
        id: creditor.userId,
        name: creditor.name,
        email: creditor.email,
      },
      amount: Math.round(amount * 100) / 100,
      currency: 'EUR', // TODO: Handle multiple currencies
    });

    creditor.balance -= amount;
    debtor.balance += amount;

    if (creditor.balance < 0.01) i++;
    if (Math.abs(debtor.balance) < 0.01) j++;
  }

  return debts;
};

export const calculateNextOccurrence = (
  currentDate: Date,
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'
): Date => {
  const next = new Date(currentDate);

  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'biweekly':
      next.setDate(next.getDate() + 14);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'quarterly':
      next.setMonth(next.getMonth() + 3);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
  }

  return next;
};

export const shouldCreateRecurringExpense = (
  recurringExpense: any,
  now: Date = new Date()
): boolean => {
  if (!recurringExpense.isActive) return false;
  if (recurringExpense.endDate && recurringExpense.endDate < now) return false;
  if (recurringExpense.nextOccurrence > now) return false;
  
  return true;
};

