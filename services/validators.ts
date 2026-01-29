// Input validation utilities for financial data
export const validators = {
  // Validate positive number
  isPositive: (value: number, fieldName: string = 'Value'): { valid: boolean; error?: string } => {
    if (value < 0) return { valid: false, error: `${fieldName} cannot be negative` };
    return { valid: true };
  },

  // Validate percentage (0-100)
  isValidPercentage: (value: number, fieldName: string = 'Percentage'): { valid: boolean; error?: string } => {
    if (value < 0 || value > 100) {
      return { valid: false, error: `${fieldName} must be between 0 and 100` };
    }
    return { valid: true };
  },

  // Validate interest rate (realistic range)
  isValidInterestRate: (value: number): { valid: boolean; error?: string } => {
    if (value < 0 || value > 50) {
      return { valid: false, error: 'Interest rate must be between 0% and 50%' };
    }
    return { valid: true };
  },

  // Validate tenure (months)
  isValidTenure: (months: number): { valid: boolean; error?: string } => {
    if (months <= 0 || months > 600) {
      return { valid: false, error: 'Tenure must be between 1 and 600 months' };
    }
    return { valid: true };
  },

  // Validate affordability (monthly payment vs income)
  isAffordable: (monthlyPayment: number, monthlyIncome: number): { valid: boolean; error?: string } => {
    const ratio = (monthlyPayment / monthlyIncome) * 100;
    if (ratio > 40) {
      return { valid: false, error: `EMI-to-income ratio (${ratio.toFixed(1)}%) exceeds safe limit of 40%` };
    }
    return { valid: true };
  },

  // Validate debt-to-income ratio
  isValidDebtToIncome: (totalDebt: number, monthlyIncome: number): { valid: boolean; error?: string } => {
    const ratio = (totalDebt / (monthlyIncome * 12)) * 100;
    if (ratio > 60) {
      return { valid: false, error: `Debt-to-income ratio (${ratio.toFixed(1)}%) exceeds safe limit of 60%` };
    }
    return { valid: true };
  },

  // Validate savings rate
  isValidSavingsTarget: (target: number, income: number): { valid: boolean; error?: string } => {
    if (target > income * 0.7) {
      return { valid: false, error: 'Savings target cannot exceed 70% of monthly income' };
    }
    return { valid: true };
  },

  // Validate amount
  isValidAmount: (amount: number, fieldName: string = 'Amount'): { valid: boolean; error?: string } => {
    if (isNaN(amount) || !isFinite(amount)) {
      return { valid: false, error: `${fieldName} must be a valid number` };
    }
    if (amount <= 0) {
      return { valid: false, error: `${fieldName} must be greater than 0` };
    }
    return { valid: true };
  }
};

// Safe calculation wrapper
export const safeCalculate = (fn: () => number, defaultValue: number = 0): number => {
  try {
    const result = fn();
    if (isNaN(result) || !isFinite(result)) return defaultValue;
    return result;
  } catch (error) {
    console.error('Calculation error:', error);
    return defaultValue;
  }
};
