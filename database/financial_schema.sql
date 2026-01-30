-- Life OS Financial Module - PostgreSQL Schema
-- Version: 1.0.0
-- Comprehensive financial management system with offline-first support

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users (Multi-tenant support)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- User Financial Profile
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mission_statement TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================================
-- INCOME MODULE (Episode 2)
-- ============================================================================

-- Income Sources (E-S-B-I Framework)
CREATE TABLE income_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'Employee', 'Self-Employed', 'Business', 'Investor'
  monthly_amount DECIMAL(12, 2) NOT NULL,
  is_stable BOOLEAN DEFAULT true,
  growth_target DECIMAL(5, 2), -- Yearly growth % 
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Income Targets (Freedom Number Calculator)
CREATE TABLE income_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  needs DECIMAL(12, 2),
  wants DECIMAL(12, 2),
  savings DECIMAL(12, 2),
  insurance DECIMAL(12, 2),
  investment DECIMAL(12, 2),
  tax_buffer DECIMAL(12, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Income Opportunities (ICER Validator)
CREATE TABLE income_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  interest INT CHECK (interest >= 1 AND interest <= 5),
  capability INT CHECK (capability >= 1 AND capability <= 5),
  effortlessness INT CHECK (effortlessness >= 1 AND effortlessness <= 5),
  return_potential INT CHECK (return_potential >= 1 AND return_potential <= 5),
  score INT GENERATED ALWAYS AS (interest + capability + effortlessness + return_potential) STORED,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Growth Strategy (S-N-L-G Framework)
CREATE TABLE growth_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  unfair_advantage TEXT,
  network_notes TEXT,
  geography_plan TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Growth Strategy Skills & Leverage (One-to-Many)
CREATE TABLE growth_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID NOT NULL REFERENCES growth_strategies(id) ON DELETE CASCADE,
  skill VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE growth_leverage_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID NOT NULL REFERENCES growth_strategies(id) ON DELETE CASCADE,
  task_description VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- SPENDING MODULE (Episode 3)
-- ============================================================================

-- Transactions (Enhanced with Master Categories)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  description VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'Income', 'Expense'
  category VARCHAR(255), -- Sub-category (e.g., "Food", "Rent")
  master_category VARCHAR(100), -- 'Consumption', 'Commitment', 'Safety', 'Growth'
  necessity VARCHAR(50), -- 'Need', 'Want' (for Consumption only)
  related_loan_id UUID, -- Link to Liability if applicable
  linked_goal_id UUID, -- Link to Goal if applicable
  tags TEXT[], -- JSON array of tags
  notes TEXT,
  receipt_url VARCHAR(500),
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for fast querying
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_master_category ON transactions(master_category);

-- Wishlist Items (24-Hour Pause Feature)
CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  category VARCHAR(100), -- Master category
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '24 hours'),
  purchased_at TIMESTAMP, -- NULL until purchased
  CONSTRAINT wishlist_not_null_expires CHECK (expires_at IS NOT NULL)
);

-- Budget Allocation (Pay Yourself First)
CREATE TABLE budget_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  safety_percentage DECIMAL(5, 2) DEFAULT 15,
  growth_percentage DECIMAL(5, 2) DEFAULT 10,
  spending_percentage DECIMAL(5, 2) GENERATED ALWAYS AS (100 - safety_percentage - growth_percentage) STORED,
  monthly_income DECIMAL(12, 2) NOT NULL,
  safety_amount DECIMAL(12, 2) GENERATED ALWAYS AS (monthly_income * safety_percentage / 100) STORED,
  growth_amount DECIMAL(12, 2) GENERATED ALWAYS AS (monthly_income * growth_percentage / 100) STORED,
  spending_amount DECIMAL(12, 2) GENERATED ALWAYS AS (monthly_income - safety_amount - growth_amount) STORED,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  year_month VARCHAR(7), -- 'YYYY-MM' for monthly tracking
  UNIQUE(user_id, year_month)
);

-- ============================================================================
-- SAVINGS MODULE (Episode 5)
-- ============================================================================

-- Financial Assets (Savings & Simple Investments)
CREATE TABLE financial_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  value DECIMAL(12, 2) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'Saving', 'Investment'
  target_value DECIMAL(12, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Savings Configuration
CREATE TABLE savings_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  monthly_expense DECIMAL(12, 2) NOT NULL,
  is_job_stable BOOLEAN DEFAULT true,
  has_dependents BOOLEAN DEFAULT false,
  months_multiplier INT DEFAULT 6, -- 3, 6, or 12
  target_amount DECIMAL(12, 2) GENERATED ALWAYS AS (monthly_expense * months_multiplier) STORED,
  is_configured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Emergency Fund Audit Log (Track withdrawals)
CREATE TABLE emergency_fund_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  reason VARCHAR(255),
  transaction_type VARCHAR(50), -- 'Withdrawal', 'Deposit', 'Emergency'
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- LOAN/DEBT MODULE (Episode 6)
-- ============================================================================

-- Liabilities (Loans with 5-Lens Framework)
CREATE TABLE liabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL, -- Original principal
  paid_amount DECIMAL(12, 2) DEFAULT 0,
  monthly_payment DECIMAL(12, 2) NOT NULL,
  interest_rate DECIMAL(5, 3) NOT NULL,
  tenure_months INT NOT NULL,
  start_date DATE NOT NULL,
  -- 5-Lens Framework
  purpose VARCHAR(100) NOT NULL, -- 'Productive', 'Consumption'
  collateral VARCHAR(100) NOT NULL, -- 'Secured', 'Unsecured'
  structure VARCHAR(100) NOT NULL, -- 'Term', 'Revolving'
  calculation_method VARCHAR(100) NOT NULL, -- 'Reducing', 'Flat'
  rate_type VARCHAR(100) NOT NULL, -- 'Fixed', 'Floating'
  loan_type VARCHAR(100), -- 'Home', 'Car', 'Personal', 'Education', 'Credit Card'
  credit_limit DECIMAL(12, 2), -- For Credit Cards
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_liabilities_user_id ON liabilities(user_id);

-- EMI Payment History
CREATE TABLE emi_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  liability_id UUID NOT NULL REFERENCES liabilities(id) ON DELETE CASCADE,
  payment_amount DECIMAL(12, 2) NOT NULL,
  principal_amount DECIMAL(12, 2) NOT NULL,
  interest_amount DECIMAL(12, 2) NOT NULL,
  payment_date DATE NOT NULL,
  is_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- INSURANCE MODULE (Episode 8)
-- ============================================================================

-- Insurance Policies (The Vault)
CREATE TABLE insurance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL, -- 'Health', 'Term Life', 'Motor', 'ULIP/Endowment', 'Other'
  name VARCHAR(255) NOT NULL,
  policy_number VARCHAR(255) UNIQUE NOT NULL,
  insurer VARCHAR(255) NOT NULL,
  sum_assured DECIMAL(12, 2) NOT NULL,
  premium DECIMAL(12, 2) NOT NULL, -- Annual
  renewal_date DATE NOT NULL,
  tpa_contact VARCHAR(255),
  nominee VARCHAR(255),
  is_corporate BOOLEAN DEFAULT false, -- Office policy flag
  policy_document_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_insurance_user_id ON insurance_policies(user_id);
CREATE INDEX idx_insurance_renewal_date ON insurance_policies(renewal_date);

-- Insurance Claim History
CREATE TABLE insurance_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID NOT NULL REFERENCES insurance_policies(id) ON DELETE CASCADE,
  claim_amount DECIMAL(12, 2) NOT NULL,
  claim_date DATE NOT NULL,
  claim_status VARCHAR(50), -- 'Pending', 'Approved', 'Rejected'
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- INVESTMENT MODULE (Episodes 9 & 10)
-- ============================================================================

-- Investments (Detailed Portfolio)
CREATE TABLE investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  asset_class VARCHAR(100) NOT NULL, -- 'Equity', 'Debt', 'Commodity', 'Real Estate', 'Alternative'
  amount_invested DECIMAL(12, 2) NOT NULL,
  current_value DECIMAL(12, 2) NOT NULL,
  expected_return DECIMAL(5, 2), -- CAGR %
  linked_goal_id UUID, -- Links to Goal for goal-based investing
  is_sip BOOLEAN DEFAULT false,
  monthly_sip_amount DECIMAL(12, 2),
  purchase_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_investments_user_id ON investments(user_id);

-- Investment Transaction History
CREATE TABLE investment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_id UUID NOT NULL REFERENCES investments(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50), -- 'Buy', 'Sell', 'Dividend'
  amount DECIMAL(12, 2) NOT NULL,
  units DECIMAL(12, 4),
  unit_price DECIMAL(12, 2),
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- FINANCIAL TOOLS & DOCUMENTS (Episode 4)
-- ============================================================================

-- Financial Tools Checklist
CREATE TABLE financial_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL, -- 'Identity', 'Banking', 'Salary', 'Safety', 'Investment', 'Credit', 'Tax', 'Legacy'
  title VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'Incomplete', -- 'Complete', 'Incomplete', 'Pending'
  fields JSONB, -- Flexible storage for tool-specific data
  last_updated TIMESTAMP DEFAULT NOW(),
  is_basic BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Financial Documents (Digital Locker)
CREATE TABLE financial_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL, -- 'Identity', 'Banking', 'Investment', 'Loan', 'Insurance'
  document_type VARCHAR(255) NOT NULL, -- 'Policy Document', 'Loan Letter', etc.
  name VARCHAR(255) NOT NULL,
  linked_entity_id UUID, -- Link to Policy/Loan/Tool
  storage_location VARCHAR(500) NOT NULL, -- URL or local path
  expiry_date DATE,
  status VARCHAR(50) DEFAULT 'Active', -- 'Active', 'Expired', 'Archived'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_financial_documents_user_id ON financial_documents(user_id);
CREATE INDEX idx_financial_documents_expiry ON financial_documents(expiry_date);

-- ============================================================================
-- TAX MODULE (Episode 11)
-- ============================================================================

-- Tax Profile
CREATE TABLE tax_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- 5 Heads of Income
  salary DECIMAL(12, 2),
  house_property DECIMAL(12, 2),
  business_profession DECIMAL(12, 2),
  capital_gains DECIMAL(12, 2),
  other_sources DECIMAL(12, 2),
  -- Deductions
  deduction_80c DECIMAL(12, 2), -- Limit 1.5L
  deduction_80d DECIMAL(12, 2), -- Health Insurance
  deduction_80ccd DECIMAL(12, 2), -- NPS
  hra_exemption DECIMAL(12, 2),
  home_loan_interest DECIMAL(12, 2),
  -- Payments
  tds_deducted DECIMAL(12, 2),
  advance_tax_paid DECIMAL(12, 2),
  selected_regime VARCHAR(50), -- 'Old', 'New'
  financial_year VARCHAR(9), -- '2023-24'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, financial_year)
);

-- Tax Payment Schedule
CREATE TABLE tax_payment_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  financial_year VARCHAR(9),
  installment_date DATE NOT NULL,
  installment_number INT, -- 1-4
  amount_due DECIMAL(12, 2),
  amount_paid DECIMAL(12, 2),
  is_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- GOALS & VISION MODULE
-- ============================================================================

-- Life Goals (The "Why" Check)
CREATE TABLE life_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'Must-Have', 'Good-to-Have'
  priority INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Financial Goals (Goal-Based Investing)
CREATE TABLE financial_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  horizon VARCHAR(50), -- '1 Year', '3 Years', '5 Years', '10+ Years'
  progress DECIMAL(5, 2) DEFAULT 0, -- 0-100
  is_financial BOOLEAN DEFAULT true,
  current_cost DECIMAL(12, 2),
  years_away INT,
  inflation_rate DECIMAL(5, 2) DEFAULT 5,
  future_value DECIMAL(12, 2) GENERATED ALWAYS AS (
    CASE 
      WHEN current_cost IS NOT NULL AND years_away IS NOT NULL 
      THEN current_cost * POWER(1 + inflation_rate/100, years_away)
      ELSE NULL 
    END
  ) STORED,
  required_sip DECIMAL(12, 2),
  tier VARCHAR(50), -- 'Freedom', 'Lifestyle'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- FINANCIAL PLANNING MODULE (Episode 12)
-- ============================================================================

-- Financial Audit Report
CREATE TABLE financial_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  monthly_income DECIMAL(12, 2) NOT NULL,
  monthly_expense DECIMAL(12, 2) NOT NULL,
  total_emi DECIMAL(12, 2),
  insurance_premium DECIMAL(12, 2),
  current_savings DECIMAL(12, 2),
  current_investments DECIMAL(12, 2),
  total_liabilities DECIMAL(12, 2),
  net_worth DECIMAL(12, 2) GENERATED ALWAYS AS (
    current_savings + current_investments - total_liabilities
  ) STORED,
  health_status VARCHAR(50), -- 'Green', 'Yellow', 'Red'
  audit_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Financial Plans (3-Phase Framework)
CREATE TABLE financial_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_type VARCHAR(100) NOT NULL, -- 'Today Safety', 'Future Goals', 'Lifestyle'
  status VARCHAR(50), -- 'Green', 'Yellow', 'Red'
  summary TEXT,
  action_items TEXT[], -- JSON array
  target_date DATE,
  progress_percentage DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, plan_type)
);

-- Risk Profile Assessment
CREATE TABLE risk_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INT, -- 0-30
  label VARCHAR(50), -- 'Conservative', 'Moderate', 'Aggressive'
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================================
-- ANALYTICS & REPORTING
-- ============================================================================

-- Monthly Financial Summary (For Dashboard)
CREATE TABLE monthly_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  year_month VARCHAR(7), -- 'YYYY-MM'
  total_income DECIMAL(12, 2),
  consumption_expense DECIMAL(12, 2),
  commitment_expense DECIMAL(12, 2),
  safety_expense DECIMAL(12, 2),
  growth_expense DECIMAL(12, 2),
  net_cashflow DECIMAL(12, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, year_month)
);

-- Health Report Cache
CREATE TABLE health_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  generated_date TIMESTAMP DEFAULT NOW(),
  emi_to_income_ratio DECIMAL(5, 2),
  savings_rate DECIMAL(5, 2),
  investment_rate DECIMAL(5, 2),
  emergency_fund_months DECIMAL(5, 2),
  debt_to_asset_ratio DECIMAL(5, 2),
  net_worth_trend DECIMAL(5, 2),
  recommendations TEXT[], -- JSON array
  red_flags TEXT[], -- JSON array
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- ROW-LEVEL SECURITY POLICIES (Multi-tenancy)
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE liabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_plans ENABLE ROW LEVEL SECURITY;

-- Example RLS Policy (repeat for all user_id tables)
-- CREATE POLICY "Users can only access their own data" 
-- ON transactions FOR ALL USING (user_id = current_user_id());

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Net Worth Summary
CREATE VIEW net_worth_summary AS
SELECT 
  u.id as user_id,
  COALESCE(SUM(CASE WHEN fa.type = 'Saving' THEN fa.value ELSE 0 END), 0) as total_savings,
  COALESCE(SUM(CASE WHEN fa.type = 'Investment' THEN fa.value ELSE 0 END), 0) + 
  COALESCE(SUM(CASE WHEN i.current_value IS NOT NULL THEN i.current_value ELSE 0 END), 0) as total_investments,
  COALESCE(SUM(l.total_amount - l.paid_amount), 0) as total_liabilities,
  COALESCE(SUM(CASE WHEN fa.type = 'Saving' THEN fa.value ELSE 0 END), 0) +
  COALESCE(SUM(CASE WHEN fa.type = 'Investment' THEN fa.value ELSE 0 END), 0) +
  COALESCE(SUM(CASE WHEN i.current_value IS NOT NULL THEN i.current_value ELSE 0 END), 0) -
  COALESCE(SUM(l.total_amount - l.paid_amount), 0) as net_worth
FROM users u
LEFT JOIN financial_assets fa ON u.id = fa.user_id
LEFT JOIN investments i ON u.id = i.user_id
LEFT JOIN liabilities l ON u.id = l.user_id
GROUP BY u.id;

-- Monthly Cash Flow
CREATE VIEW monthly_cashflow AS
SELECT 
  t.user_id,
  DATE_TRUNC('month', t.transaction_date) as month,
  t.master_category,
  SUM(CASE WHEN t.type = 'Income' THEN t.amount ELSE 0 END) as income,
  SUM(CASE WHEN t.type = 'Expense' THEN t.amount ELSE 0 END) as expense
FROM transactions t
GROUP BY t.user_id, DATE_TRUNC('month', t.transaction_date), t.master_category;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_transactions_master_category_date ON transactions(master_category, transaction_date);
CREATE INDEX idx_liabilities_user_status ON liabilities(user_id, start_date);
CREATE INDEX idx_insurance_user_type ON insurance_policies(user_id, type);
CREATE INDEX idx_investments_user_class ON investments(user_id, asset_class);
CREATE INDEX idx_financial_assets_user_type ON financial_assets(user_id, type);
CREATE INDEX idx_monthly_summaries_user_month ON monthly_summaries(user_id, year_month);
