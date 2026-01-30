
// Task Domain
export enum Priority {
  P1 = 'P1',
  P2 = 'P2',
  P3 = 'P3',
  P4 = 'P4',
}

export enum TaskCategory {
  INBOX = 'Inbox',
  PROFESSIONAL = 'Professional',
  FINANCIAL = 'Financial',
  WELLNESS = 'Wellness',
  RELATIONSHIP = 'Relationship',
  PERSONAL = 'Personal',
  VISION = 'Vision',
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  category: TaskCategory;
  priority: Priority;
  isTodayFocus: boolean;
  dueDate?: string;
  projectId?: string;
}

// Habit Domain
export interface Habit {
  id: string;
  title: string;
  streak: number;
  history: Record<string, boolean>; // date string YYYY-MM-DD -> completed
  category: string;
}

// Finance Domain
export enum TransactionType {
  INCOME = 'Income',
  EXPENSE = 'Expense',
}

export enum ESBICategory {
  EMPLOYEE = 'Employee (E)',
  SELF_EMPLOYED = 'Self-Employed (S)',
  BUSINESS = 'Business (B)',
  INVESTOR = 'Investor (I)',
}

// Episode 3: Spending Engine Categories
export enum MasterCategory {
  CONSUMPTION = 'Consumption (Living)', // Food, Rent, Lifestyle
  COMMITMENT = 'Commitment (Debt)',    // EMIs, Loans
  SAFETY = 'Safety (Protection)',      // Insurance, Emergency Fund
  GROWTH = 'Growth (Investing)',       // SIPs, Stocks, Courses
}

export enum Necessity {
  NEED = 'Need',
  WANT = 'Want',
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: TransactionType;
  category: string; // Sub-category (e.g., "Food")
  esbiCategory?: ESBICategory; 
  masterCategory?: MasterCategory; // The 4 Buckets
  necessity?: Necessity; // Need vs Want
  date: string;
}

export interface WishlistItem {
  id: string;
  name: string;
  amount: number;
  category: MasterCategory;
  createdAt: string; // ISO Date
  note?: string;
}

export interface FinancialAsset {
  id: string;
  name: string;
  value: number;
  type: 'Saving' | 'Investment';
  target?: number;
}

// Episode 9 & 10: Investment & Wealth
export enum AssetClass {
  EQUITY = 'Equity (Growth)',         // Stocks, Equity MFs
  DEBT = 'Debt (Stability)',          // FD, Bonds, PPF
  COMMODITY = 'Commodity (Hedge)',    // Gold, SGB
  REAL_ESTATE = 'Real Estate (Illiquid)', // Land, REITs
  ALTERNATIVE = 'Alternative (High Risk)', // Crypto, P2P
}

export interface Investment {
  id: string;
  name: string;
  assetClass: AssetClass;
  amountInvested: number; // Principal
  currentValue: number;
  expectedReturn: number; // CAGR %
  linkedGoalId?: string; // Goal Based Investing
  isSIP: boolean;
  monthlySIPAmount?: number; // If SIP is active
}

// Episode 11: Tax Management
export enum TaxRegime {
  OLD = 'Old Regime',
  NEW = 'New Regime',
}

export interface TaxProfile {
  // 5 Heads of Income
  salary: number;
  houseProperty: number; // Rental Income
  businessProfession: number;
  capitalGains: number;
  otherSources: number; // Dividend, Interest
  
  // Deductions (Old Regime mainly)
  deduction80C: number; // Limit 1.5L
  deduction80D: number; // Health Insurance
  deduction80CCD: number; // NPS
  hraExemption: number;
  homeLoanInterest: number; // Section 24
  
  // Payments
  tdsDeducted: number;
  advanceTaxPaid: number;
  
  selectedRegime: TaxRegime;
}

// Episode 6: Loan/Debt Management (The 5 Lenses + Card Data)
export enum LoanPurpose {
  PRODUCTIVE = 'Productive (Asset Building)',
  CONSUMPTION = 'Consumption (Lifestyle)',
}

export enum LoanCollateral {
  SECURED = 'Secured (Asset Backed)',
  UNSECURED = 'Unsecured (Credit Score Based)',
}

export enum LoanStructure {
  TERM = 'Term Loan (Fixed Tenure)',
  REVOLVING = 'Revolving (Credit Card/OD)',
}

export enum InterestCalculation {
  REDUCING = 'Reducing Balance',
  FLAT = 'Flat Rate',
}

export enum InterestRateType {
  FIXED = 'Fixed Rate',
  FLOATING = 'Floating Rate',
}

export enum LoanType {
  HOME = 'Home Loan',
  CAR = 'Car Loan',
  PERSONAL = 'Personal Loan',
  EDUCATION = 'Education Loan',
  CREDIT_CARD = 'Credit Card',
  OTHER = 'Other',
}

export interface Liability {
  id: string;
  name: string;
  totalAmount: number;     // Original Principal
  paidAmount: number;      // Principal Repaid (Outstanding = Total - Paid)
  monthlyPayment: number;  // EMI
  interestRate: number;    // Annual %
  tenureMonths: number;    // Total months
  startDate: string;
  
  // The 5 Lenses
  purpose: LoanPurpose;
  collateral: LoanCollateral;
  structure: LoanStructure;
  calculationMethod: InterestCalculation;
  rateType: InterestRateType;
  
  // New Fields
  loanType: LoanType;
  creditLimit?: number; // Only for Credit Cards
}

// Episode 8: Insurance (The Vault)
export enum InsuranceType {
  HEALTH = 'Health',
  TERM_LIFE = 'Term Life',
  MOTOR = 'Motor',
  ULIP_ENDOWMENT = 'ULIP/Endowment', // Bad Policy
  OTHER = 'Other',
}

export interface InsurancePolicy {
  id: string;
  type: InsuranceType;
  name: string; // Policy Name
  policyNumber: string;
  insurer: string;
  sumAssured: number; // Cover Amount
  premium: number; // Annual
  renewalDate: string;
  tpaContact?: string; // Emergency Contact
  nominee?: string; // Legacy
  isCorporate: boolean; // Office policy check
}

// Financial Tools (Episode 4)
export type FinancialToolCategory = 'Identity' | 'Banking' | 'Salary' | 'Safety' | 'Investment' | 'Credit' | 'Tax' | 'Legacy';

export interface FinancialTool {
  id: string;
  category: FinancialToolCategory;
  title: string;
  status: 'Complete' | 'Incomplete' | 'Pending';
  fields: Record<string, string>; // e.g., { "PAN Number": "ABC...", "Nominee": "Name" }
  lastUpdated: string;
  isBasic: boolean; // Basic vs Advanced tool
}

// Episode 5: Savings Engine
export interface SavingsConfig {
  monthlyExpense: number;
  isJobStable: boolean;
  hasDependents: boolean;
  monthsMultiplier: number; // 3, 6, 12
  targetAmount: number;
  isConfigured: boolean;
}

// Income Engine Types
export interface IncomeTarget {
  needs: number;
  wants: number;
  savings: number;
  insurance: number;
  investment: number;
  taxBuffer: number;
}

export interface IncomeOpportunity {
  id: string;
  name: string;
  interest: number; // 1-5
  capability: number; // 1-5
  effortlessness: number; // 1-5
  returnPotential: number; // 1-5
  score: number;
}

export interface GrowthStrategy {
  unfairAdvantage: string; // Skills (S)
  skillsToAcquire: string[];
  networkNotes: string; // Network (N)
  leverageAudit: string[]; // Leverage (L)
  geographyPlan: string; // Geography (G)
}

// CRM Domain
export enum LeadStage {
  NEW = 'New',
  CONTACTED = 'Contacted',
  PROCESSING = 'Processing',
  WON = 'Won',
  LOST = 'Lost',
}

export interface Contact {
  id: string;
  name: string;
  company?: string;
  role?: string;
  email?: string;
  phone?: string;
  stage: LeadStage;
  dealValue?: number;
  lastContacted: string;
}

// Vision & Goal Domain (Enhanced for Investing)
export interface Goal {
  id: string;
  title: string;
  horizon: '1 Year' | '3 Years' | '5 Years' | '10+ Years';
  progress: number; // 0-100 (Manual or Calculated)
  
  // Financial Goal Specs
  isFinancial: boolean;
  currentCost?: number;
  yearsAway?: number;
  inflationRate?: number;
  futureValue?: number;
  requiredSIP?: number;
  tier?: 'Freedom' | 'Lifestyle'; // Episode 12: Priority Hierarchy
}

export interface LifeGoal {
  id: string;
  title: string;
  type: 'Must-Have' | 'Good-to-Have';
}

export interface RiskProfile {
  score: number; // 0-30
  label: 'Conservative' | 'Moderate' | 'Aggressive';
  description: string;
}

// Episode 2: Income Engine - Detailed Structures
export interface IncomeSource {
  id: string;
  name: string;
  category: ESBICategory;
  monthlyAmount: number;
  isStable: boolean;
  growthTarget?: number; // Target yearly growth %
}

export interface CashflowQuadrant {
  employee: number;
  selfEmployed: number;
  business: number;
  investor: number;
}

// Episode 12: Financial Planning - 3-Plan Framework
export interface FinancialAudit {
  monthlyIncome: number;
  monthlyExpense: number; // Non-loan expenses
  totalEMI: number;
  currentInsurancePremium: number;
  currentSavings: number;
  currentInvestments: number;
  totalLiabilities: number;
  netWorth: number;
  healthStatus: 'Green' | 'Yellow' | 'Red';
  auditDate: string;
}

export interface FinancialPlan {
  id: string;
  planType: 'Today Safety' | 'Future Goals' | 'Lifestyle';
  status: 'Green' | 'Yellow' | 'Red';
  summary: string;
  actionItems: string[];
  targetDate?: string;
  progressPercentage: number;
}

// Spending Engine - Detailed Budget Allocation
export interface BudgetAllocation {
  safetyPercentage: number; // Insurance + Emergency
  growthPercentage: number; // Investment + SIPs
  spendingPercentage: number; // Remaining for consumption
  safetyAmount: number;
  growthAmount: number;
  spendingAmount: number;
  monthlyIncome: number;
}

// Transaction for detailed tracking with all enrichments
export interface TransactionLog {
  id: string;
  date: string;
  amount: number;
  description: string;
  type: TransactionType;
  masterCategory: MasterCategory;
  subCategory: string;
  necessity?: Necessity;
  relatedLoanId?: string;
  linkedGoalId?: string;
  tags: string[];
  notes?: string;
  receiptUrl?: string;
}

// Document Management for Financial Tools
export interface FinancialDocument {
  id: string;
  category: FinancialToolCategory | 'Investment' | 'Loan';
  documentType: string; // e.g., "Policy Document", "Loan Sanction Letter"
  name: string;
  linkedEntityId: string; // Links to Policy/Loan/Tool
  uploadDate: string;
  expiryDate?: string;
  storageLocation: string; // URL or local path
  status: 'Active' | 'Expired' | 'Archived';
}

// Financial Health Report
export interface HealthReport {
  generatedDate: string;
  emiToIncomeRatio: number; // Should be < 40%
  savingsRate: number; // % of income saved
  investmentRate: number; // % of income invested
  emergencyFundMonths: number; // Months covered
  debtToAssetRatio: number;
  netWorthTrend: number; // % change from last month
  recommendations: string[];
  redFlags: string[];
}

export interface AppData {
  tasks: Task[];
  habits: Habit[];
  transactions: Transaction[];
  transactionLogs: TransactionLog[]; // Enhanced transaction tracking
  wishlist: WishlistItem[];
  assets: FinancialAsset[];
  liabilities: Liability[];
  insurancePolicies: InsurancePolicy[];
  investments: Investment[]; 
  financialTools: FinancialTool[];
  financialDocuments: FinancialDocument[];
  savingsConfig: SavingsConfig;
  incomeTarget: IncomeTarget;
  incomeSources: IncomeSource[];
  incomeOpportunities: IncomeOpportunity[];
  growthStrategy: GrowthStrategy;
  contacts: Contact[];
  goals: Goal[];
  lifeGoals: LifeGoal[];
  missionStatement: string;
  riskProfile?: RiskProfile;
  taxProfile: TaxProfile;
  budgetAllocation?: BudgetAllocation;
  financialAudit?: FinancialAudit;
  financialPlans: FinancialPlan[];
  healthReport?: HealthReport;
}
