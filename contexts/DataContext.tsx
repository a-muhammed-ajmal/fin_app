
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  AppData, Task, Habit, Transaction, Contact, Goal, Priority, TaskCategory, 
  LeadStage, TransactionType, LifeGoal, FinancialAsset, Liability, InsurancePolicy,
  IncomeTarget, IncomeOpportunity, GrowthStrategy, ESBICategory, WishlistItem, FinancialTool, SavingsConfig,
  LoanPurpose, LoanCollateral, LoanStructure, InterestCalculation, InterestRateType, LoanType, InsuranceType,
  Investment, AssetClass, RiskProfile, TaxProfile, TaxRegime
} from '../types';
import { useSupabaseSyncWithLocalStorage } from '../services/useSupabaseSync';

interface DataContextType extends AppData {
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  addHabit: (habit: Omit<Habit, 'id' | 'streak' | 'history'>) => void;
  toggleHabit: (id: string, date: string) => void;
  
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  
  addWishlistItem: (item: Omit<WishlistItem, 'id' | 'createdAt'>) => void;
  deleteWishlistItem: (id: string) => void;

  addAsset: (asset: Omit<FinancialAsset, 'id'>) => void;
  addLiability: (liability: Omit<Liability, 'id'>) => void;
  updateLiability: (id: string, paidAmount: number) => void;
  deleteLiability: (id: string) => void; 
  addInsurance: (policy: Omit<InsurancePolicy, 'id'>) => void;
  deleteInsurance: (id: string) => void;

  // Investments
  addInvestment: (inv: Omit<Investment, 'id'>) => void;
  deleteInvestment: (id: string) => void;

  // Financial Tools
  updateFinancialTool: (id: string, updates: Partial<FinancialTool>) => void;

  // Savings Engine
  updateSavingsConfig: (config: SavingsConfig) => void;

  // Income Engine
  updateIncomeTarget: (target: IncomeTarget) => void;
  addIncomeOpportunity: (opp: Omit<IncomeOpportunity, 'id' | 'score'>) => void;
  deleteIncomeOpportunity: (id: string) => void;
  updateGrowthStrategy: (updates: Partial<GrowthStrategy>) => void;

  addContact: (contact: Omit<Contact, 'id'>) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  
  updateMission: (text: string) => void;
  
  // Goals & Risk
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  setLifeGoals: (goals: LifeGoal[]) => void;
  setRiskProfile: (profile: RiskProfile) => void;

  // Tax
  updateTaxProfile: (profile: Partial<TaxProfile>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY = 'life-os-data-v1';

const INITIAL_FINANCIAL_TOOLS: FinancialTool[] = [];

const INITIAL_DATA: AppData = {
  tasks: [],
  habits: [],
  transactions: [],
  transactionLogs: [],
  wishlist: [],
  assets: [],
  liabilities: [],
  insurancePolicies: [],
  investments: [],
  financialTools: INITIAL_FINANCIAL_TOOLS,
  financialDocuments: [],
  savingsConfig: {
    monthlyExpense: 0,
    isJobStable: true,
    hasDependents: false,
    monthsMultiplier: 6,
    targetAmount: 0,
    isConfigured: false
  },
  incomeTarget: {
    needs: 0,
    wants: 0,
    savings: 0,
    insurance: 0,
    investment: 0,
    taxBuffer: 0,
  },
  incomeSources: [],
  incomeOpportunities: [],
  growthStrategy: {
    unfairAdvantage: "",
    skillsToAcquire: [],
    networkNotes: "",
    leverageAudit: [],
    geographyPlan: ""
  },
  contacts: [],
  goals: [],
  lifeGoals: [],
  missionStatement: "",
  riskProfile: undefined,
  taxProfile: {
      salary: 0,
      houseProperty: 0,
      businessProfession: 0,
      capitalGains: 0,
      otherSources: 0,
      deduction80C: 0,
      deduction80D: 0,
      deduction80CCD: 0,
      hraExemption: 0,
      homeLoanInterest: 0,
      tdsDeducted: 0,
      advanceTaxPaid: 0,
      selectedRegime: TaxRegime.NEW
  }
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [loaded, setLoaded] = useState(false);
  const { loadFromSupabase, syncToSupabase } = useSupabaseSyncWithLocalStorage(data, setData);

  useEffect(() => {
    // Try to load from Supabase first, then fallback to localStorage
    const loadData = async () => {
      const supabaseData = await loadFromSupabase();
      
      if (supabaseData) {
        setData(supabaseData);
        setLoaded(true);
        return;
      }

      // Fallback to localStorage
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const mergedData = { ...INITIAL_DATA, ...parsed };
          
          // Fix for investments (ensure monthlySIPAmount exists)
          if (mergedData.investments) {
              mergedData.investments = mergedData.investments.map((i: any) => ({
                  ...i,
                  monthlySIPAmount: i.monthlySIPAmount || 0
              }));
          }

          // Fix for goals (ensure new financial fields exist)
          if (mergedData.goals) {
              mergedData.goals = mergedData.goals.map((g: any) => ({
                  ...g,
                  isFinancial: g.isFinancial !== undefined ? g.isFinancial : false,
                  currentCost: g.currentCost || 0,
                  yearsAway: g.yearsAway || 1,
                  inflationRate: g.inflationRate || 6,
                  futureValue: g.futureValue || 0,
                  requiredSIP: g.requiredSIP || 0,
                  tier: g.tier || 'Freedom' // Default to Freedom/Must-Have
              }));
          }

          if(!mergedData.taxProfile) {
              mergedData.taxProfile = INITIAL_DATA.taxProfile;
          }

          setData(mergedData);
        } catch (e) {
          console.error("Failed to load data", e);
        }
      }
      setLoaded(true);
    };

    loadData();
  }, []);

  const addTask = (task: Omit<Task, 'id'>) => {
    setData(prev => ({
      ...prev,
      tasks: [...prev.tasks, { ...task, id: crypto.randomUUID() }]
    }));
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
    }));
  };

  const deleteTask = (id: string) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id)
    }));
  };

  const addHabit = (habit: Omit<Habit, 'id' | 'streak' | 'history'>) => {
    setData(prev => ({
      ...prev,
      habits: [...prev.habits, { ...habit, id: crypto.randomUUID(), streak: 0, history: {} }]
    }));
  };

  const toggleHabit = (id: string, date: string) => {
    setData(prev => ({
      ...prev,
      habits: prev.habits.map(h => {
        if (h.id !== id) return h;
        const newHistory = { ...h.history, [date]: !h.history[date] };
        const streak = newHistory[date] ? h.streak + 1 : Math.max(0, h.streak - 1);
        return { ...h, history: newHistory, streak };
      })
    }));
  };

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    setData(prev => ({
      ...prev,
      transactions: [ { ...tx, id: crypto.randomUUID() }, ...prev.transactions]
    }));
  };

  const addWishlistItem = (item: Omit<WishlistItem, 'id' | 'createdAt'>) => {
    setData(prev => ({
      ...prev,
      wishlist: [...prev.wishlist, { ...item, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]
    }));
  };

  const deleteWishlistItem = (id: string) => {
    setData(prev => ({
      ...prev,
      wishlist: prev.wishlist.filter(w => w.id !== id)
    }));
  };

  const addAsset = (asset: Omit<FinancialAsset, 'id'>) => {
    setData(prev => ({ ...prev, assets: [...(prev.assets || []), { ...asset, id: crypto.randomUUID() }] }));
  };

  const addLiability = (liability: Omit<Liability, 'id'>) => {
    setData(prev => ({ ...prev, liabilities: [...(prev.liabilities || []), { ...liability, id: crypto.randomUUID() }] }));
  };

  const updateLiability = (id: string, paidAmount: number) => {
    setData(prev => ({
        ...prev,
        liabilities: prev.liabilities.map(l => l.id === id ? { ...l, paidAmount } : l)
    }));
  };

  const deleteLiability = (id: string) => {
    setData(prev => ({
      ...prev,
      liabilities: prev.liabilities.filter(l => l.id !== id)
    }));
  };

  const addInsurance = (policy: Omit<InsurancePolicy, 'id'>) => {
    setData(prev => ({ ...prev, insurancePolicies: [...(prev.insurancePolicies || []), { ...policy, id: crypto.randomUUID() }] }));
  };

  const deleteInsurance = (id: string) => {
    setData(prev => ({
      ...prev,
      insurancePolicies: prev.insurancePolicies.filter(p => p.id !== id)
    }));
  };

  const addInvestment = (inv: Omit<Investment, 'id'>) => {
    setData(prev => ({
        ...prev,
        investments: [...(prev.investments || []), { ...inv, id: crypto.randomUUID() }]
    }));
  };

  const deleteInvestment = (id: string) => {
    setData(prev => ({
        ...prev,
        investments: prev.investments.filter(i => i.id !== id)
    }));
  };

  const updateFinancialTool = (id: string, updates: Partial<FinancialTool>) => {
    setData(prev => ({
        ...prev,
        financialTools: prev.financialTools.map(t => t.id === id ? { ...t, ...updates, lastUpdated: new Date().toISOString() } : t)
    }));
  };

  const updateSavingsConfig = (config: SavingsConfig) => {
    setData(prev => ({
      ...prev,
      savingsConfig: config
    }));
  };

  const updateIncomeTarget = (target: IncomeTarget) => {
    setData(prev => ({ ...prev, incomeTarget: target }));
  };

  const addIncomeOpportunity = (opp: Omit<IncomeOpportunity, 'id' | 'score'>) => {
    const score = opp.interest + opp.capability + opp.effortlessness + opp.returnPotential;
    setData(prev => ({
      ...prev,
      incomeOpportunities: [...(prev.incomeOpportunities || []), { ...opp, id: crypto.randomUUID(), score }]
    }));
  };

  const deleteIncomeOpportunity = (id: string) => {
    setData(prev => ({
      ...prev,
      incomeOpportunities: prev.incomeOpportunities.filter(o => o.id !== id)
    }));
  };

  const updateGrowthStrategy = (updates: Partial<GrowthStrategy>) => {
    setData(prev => ({
      ...prev,
      growthStrategy: { ...prev.growthStrategy, ...updates }
    }));
  };

  const addContact = (contact: Omit<Contact, 'id'>) => {
    setData(prev => ({
      ...prev,
      contacts: [...prev.contacts, { ...contact, id: crypto.randomUUID() }]
    }));
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setData(prev => ({
      ...prev,
      contacts: prev.contacts.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
  };

  const updateMission = (text: string) => {
    setData(prev => ({ ...prev, missionStatement: text }));
  };

  const addGoal = (goal: Omit<Goal, 'id'>) => {
    setData(prev => ({
        ...prev,
        goals: [...prev.goals, { ...goal, id: crypto.randomUUID() }]
    }));
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setData(prev => ({
        ...prev,
        goals: prev.goals.map(g => g.id === id ? { ...g, ...updates } : g)
    }));
  };

  const deleteGoal = (id: string) => {
    setData(prev => ({
        ...prev,
        goals: prev.goals.filter(g => g.id !== id)
    }));
  };

  const setLifeGoals = (goals: LifeGoal[]) => {
    const shouldGenerateTasks = data.lifeGoals.length === 0 && goals.length > 0;
    setData(prev => {
        let newTasks = [...prev.tasks];
        if (shouldGenerateTasks) {
            goals.forEach(g => {
                newTasks.push({
                    id: crypto.randomUUID(),
                    title: `Plan strategy for: ${g.title}`,
                    category: TaskCategory.VISION,
                    priority: g.type === 'Must-Have' ? Priority.P1 : Priority.P3,
                    completed: false,
                    isTodayFocus: false,
                });
            });
        }
        return { ...prev, lifeGoals: goals, tasks: newTasks };
    });
  };

  const setRiskProfile = (profile: RiskProfile) => {
      setData(prev => ({ ...prev, riskProfile: profile }));
  };

  const updateTaxProfile = (profile: Partial<TaxProfile>) => {
      setData(prev => ({ ...prev, taxProfile: { ...prev.taxProfile, ...profile } }));
  };

  return (
    <DataContext.Provider value={{
      ...data,
      addTask, updateTask, deleteTask,
      addHabit, toggleHabit,
      addTransaction,
      addWishlistItem, deleteWishlistItem,
      addAsset, addLiability, updateLiability, deleteLiability, addInsurance, deleteInsurance,
      addInvestment, deleteInvestment,
      updateFinancialTool, updateSavingsConfig,
      updateIncomeTarget, addIncomeOpportunity, deleteIncomeOpportunity, updateGrowthStrategy,
      addContact, updateContact,
      updateMission, addGoal, updateGoal, deleteGoal,
      setLifeGoals, setRiskProfile, updateTaxProfile
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
};
