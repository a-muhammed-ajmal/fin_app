import { useMemo } from 'react';
import { Transaction, TransactionType, Liability, LoanPurpose } from '../types';
import { safeCalculate } from './validators';

// Hook for calculating debt analysis
export const useDebtAnalysis = (liabilities: Liability[]) => {
  return useMemo(() => {
    const goodDebt = liabilities
      .filter(l => l.purpose === LoanPurpose.PRODUCTIVE)
      .reduce((sum, l) => sum + (l.totalAmount - l.paidAmount), 0);

    const badDebt = liabilities
      .filter(l => l.purpose === LoanPurpose.CONSUMPTION)
      .reduce((sum, l) => sum + (l.totalAmount - l.paidAmount), 0);

    const highInterestDebt = liabilities
      .filter(l => l.interestRate > 12)
      .reduce((sum, l) => sum + (l.totalAmount - l.paidAmount), 0);

    return { goodDebt, badDebt, highInterestDebt, totalDebt: goodDebt + badDebt };
  }, [liabilities]);
};

// Hook for calculating financial readiness score
export const useFinancialReadinessScore = (
  basicToolsCount: number,
  basicToolsComplete: number,
  advancedToolsCount: number,
  advancedToolsComplete: number
) => {
  return useMemo(() => {
    return safeCalculate(() => {
      const basicScore = basicToolsCount > 0 ? (basicToolsComplete / basicToolsCount) * 50 : 0;
      const advancedScore = advancedToolsCount > 0 ? (advancedToolsComplete / advancedToolsCount) * 50 : 0;
      return Math.round(basicScore + advancedScore);
    }, 0);
  }, [basicToolsCount, basicToolsComplete, advancedToolsCount, advancedToolsComplete]);
};

// Hook for calculating income statistics
export const useIncomeStats = (transactions: Transaction[]) => {
  return useMemo(() => {
    const incomeTransactions = transactions.filter(t => t.type === TransactionType.INCOME);
    const expenseTransactions = transactions.filter(t => t.type === TransactionType.EXPENSE);

    const totalIncome = safeCalculate(() =>
      incomeTransactions.reduce((sum, t) => sum + t.amount, 0), 0
    );

    const totalExpenses = safeCalculate(() =>
      expenseTransactions.reduce((sum, t) => sum + t.amount, 0), 0
    );

    const savingsRate = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

    return {
      totalIncome,
      totalExpenses,
      netSavings: totalIncome - totalExpenses,
      savingsRate,
      transactionCount: transactions.length
    };
  }, [transactions]);
};

// Hook for calculating expense breakdown
export const useExpenseBreakdown = (transactions: Transaction[]) => {
  return useMemo(() => {
    const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);
    const breakdown: Record<string, number> = {};

    expenses.forEach(t => {
      breakdown[t.category] = (breakdown[t.category] || 0) + t.amount;
    });

    return breakdown;
  }, [transactions]);
};

// Hook for calculating EMI
export const useEMICalculation = (principal: number, rate: number, tenure: number) => {
  return useMemo(() => {
    return safeCalculate(() => {
      if (rate === 0) return principal / tenure;
      const monthlyRate = rate / 100 / 12;
      return (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
             (Math.pow(1 + monthlyRate, tenure) - 1);
    }, 0);
  }, [principal, rate, tenure]);
};

// Hook for calculating future value with inflation
export const useFutureValue = (currentAmount: number, yearsAway: number, inflationRate: number) => {
  return useMemo(() => {
    return safeCalculate(() => {
      return currentAmount * Math.pow(1 + inflationRate / 100, yearsAway);
    }, 0);
  }, [currentAmount, yearsAway, inflationRate]);
};
