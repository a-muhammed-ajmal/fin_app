
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { TransactionType, ESBICategory } from '../types';
import { 
    ArrowUpRight, ArrowDownLeft, Plus, Wallet, 
    PiggyBank, LineChart, Shield, Banknote, Building, Landmark,
    Briefcase, FileText
} from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import IncomeEngine from './IncomeEngine';
import SpendingEngine from './SpendingEngine';
import FinancialTools from './FinancialTools';
import SavingsEngine from './SavingsEngine';
import LoanManager from './LoanManager';
import InsuranceManager from './InsuranceManager';
import InvestmentManager from './InvestmentManager';
import TaxManager from './TaxManager';
import FinancialPlan from './FinancialPlan';
import CashFlowTracker from './CashFlowTracker';
import EnhancedSpendingEngine from './EnhancedSpendingEngine';
import FinancialMasterPlan from './FinancialMasterPlan';
import FinancialDocuments from './FinancialDocuments';

const FinanceManager = () => {
  const { 
    transactions, addTransaction, 
    assets, addAsset, 
    liabilities, 
    insurancePolicies,
    investments
  } = useData();

  const [activeTab, setActiveTab] = useState<'income' | 'spending' | 'savings' | 'debt' | 'tools' | 'cashflow' | 'balance' | 'protection' | 'investing' | 'tax' | 'plan'>('plan');

  // Transaction Form State
  const [txAmount, setTxAmount] = useState('');
  const [txDesc, setTxDesc] = useState('');
  const [txType, setTxType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [txCategory, setTxCategory] = useState('');
  const [esbiType, setEsbiType] = useState<ESBICategory>(ESBICategory.EMPLOYEE);

  // Asset Form State
  const [assetName, setAssetName] = useState('');
  const [assetValue, setAssetValue] = useState('');
  const [assetType, setAssetType] = useState<'Saving' | 'Investment'>('Saving');

  // Calculations
  const totalIncome = transactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, c) => acc + c.amount, 0);
  const totalExpense = transactions.filter(t => t.type === TransactionType.EXPENSE && t.category !== 'Tax').reduce((acc, c) => acc + c.amount, 0);
  const totalTax = transactions.filter(t => t.type === TransactionType.EXPENSE && t.category === 'Tax').reduce((acc, c) => acc + c.amount, 0);
  
  const totalSavings = assets.filter(a => a.type === 'Saving').reduce((acc, c) => acc + c.value, 0);
  const simpleInvestments = assets.filter(a => a.type === 'Investment').reduce((acc, c) => acc + c.value, 0);
  const detailedInvestments = investments ? investments.reduce((acc, c) => acc + c.currentValue, 0) : 0;
  const totalInvestments = simpleInvestments + detailedInvestments;

  const totalLiabilities = liabilities.reduce((acc, c) => acc + (c.totalAmount - c.paidAmount), 0);
  
  const netWorth = (totalSavings + totalInvestments) - totalLiabilities;

  // Handlers
  const handleAddTransaction = (e: React.FormEvent) => {
      e.preventDefault();
      if (!txAmount || !txDesc) return;
      addTransaction({
          amount: parseFloat(txAmount),
          description: txDesc,
          type: txType,
          category: txCategory || (txType === TransactionType.INCOME ? 'Salary' : 'General'),
          esbiCategory: txType === TransactionType.INCOME ? esbiType : undefined,
          date: new Date().toISOString()
      });
      setTxAmount(''); setTxDesc(''); setTxCategory('');
  };

  const handleAddAsset = (e: React.FormEvent) => {
      e.preventDefault();
      if (!assetName || !assetValue) return;
      addAsset({
          name: assetName,
          value: parseFloat(assetValue),
          type: assetType,
          target: 0
      });
      setAssetName(''); setAssetValue('');
  };

  // Chart Data
  const monthlyData = transactions.reduce((acc, curr) => {
     // Mocking monthly aggregation for demo
     const month = new Date(curr.date).toLocaleString('default', { month: 'short' });
     const existing = acc.find(item => item.name === month) || { name: month, Income: 0, Expense: 0 };
     if (curr.type === TransactionType.INCOME) existing.Income += curr.amount;
     else existing.Expense += curr.amount;
     
     if (!acc.find(item => item.name === month)) acc.push(existing);
     return acc;
  }, [] as any[]).slice(-6); 

  if (monthlyData.length === 0) {
      monthlyData.push({ name: 'Current', Income: totalIncome, Expense: totalExpense + totalTax });
  }

  return (
    <div className="space-y-6 animate-in fade-in">
        <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Finance Strategy</h2>
                <p className="text-slate-500 text-sm">7 Pillars of Financial Health</p>
            </div>
            <div className="bg-slate-900 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-4">
                <div>
                    <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Net Worth</div>
                    <div className="text-2xl font-bold">${netWorth.toLocaleString()}</div>
                </div>
                <div className={`text-sm flex items-center ${netWorth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {netWorth >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                </div>
            </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-200 overflow-x-auto no-scrollbar">
            <button 
                onClick={() => setActiveTab('plan')}
                className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'plan' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                🚀 10. Master Plan
            </button>
             <button 
                onClick={() => setActiveTab('income')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'income' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                1. Income Engine
            </button>
             <button 
                onClick={() => setActiveTab('spending')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'spending' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                2. Spending Strategy
            </button>
            <button 
                onClick={() => setActiveTab('savings')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'savings' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                3. Savings (Shock Absorber)
            </button>
             <button 
                onClick={() => setActiveTab('debt')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'debt' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                4. Debt Manager
            </button>
            <button 
                onClick={() => setActiveTab('tools')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'tools' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                5. Tools & Setup
            </button>
            <button 
                onClick={() => setActiveTab('cashflow')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'cashflow' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                6. Cash Flow (Tracking)
            </button>
            <button 
                onClick={() => setActiveTab('investing')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'investing' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                7. Wealth Creation
            </button>
            <button 
                onClick={() => setActiveTab('protection')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'protection' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                8. Protection (Insurance)
            </button>
            <button 
                onClick={() => setActiveTab('tax')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'tax' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                9. Tax Planning
            </button>
        </div>

        {/* --- FINANCIAL MASTER PLAN (New) --- */}
        {activeTab === 'plan' && <FinancialMasterPlan />}

        {/* --- INCOME ENGINE TAB --- */}
        {activeTab === 'income' && <IncomeEngine />}
        
        {/* --- SPENDING ENGINE TAB --- */}
        {activeTab === 'spending' && <EnhancedSpendingEngine />}

        {/* --- SAVINGS ENGINE TAB --- */}
        {activeTab === 'savings' && <SavingsEngine />}

        {/* --- DEBT MANAGER TAB --- */}
        {activeTab === 'debt' && <LoanManager />}

        {/* --- TOOLS & SETUP TAB --- */}
        {activeTab === 'tools' && <FinancialTools />}

        {/* --- CASH FLOW TAB --- */}
        {activeTab === 'cashflow' && <CashFlowTracker />}

        {/* --- WEALTH TAB (Simple View) --- */}
        {activeTab === 'balance' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* SAVING */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col">
                    <div className="p-5 border-b border-slate-50 bg-indigo-50/50">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><PiggyBank size={20} /></div>
                            <span className="text-2xl font-bold text-slate-800">${totalSavings.toLocaleString()}</span>
                        </div>
                        <h3 className="font-bold text-slate-800">Saving</h3>
                        <p className="text-xs text-slate-500">Strategy: Future Needs (Liquid)</p>
                    </div>
                    <div className="p-5 flex-1 space-y-4">
                        <ul className="space-y-3">
                            {assets.filter(a => a.type === 'Saving').map(a => (
                                <li key={a.id} className="flex justify-between text-sm">
                                    <span className="text-slate-600">{a.name}</span>
                                    <span className="font-medium text-slate-900">${a.value.toLocaleString()}</span>
                                </li>
                            ))}
                        </ul>
                        <form onSubmit={handleAddAsset} className="pt-4 border-t border-slate-100 mt-auto">
                            <div className="text-xs font-bold text-slate-400 uppercase mb-2">Add Fund</div>
                            <input 
                                className="w-full border rounded p-2 text-sm mb-2" 
                                placeholder="Name (e.g. Emergency)"
                                value={assetName} onChange={(e) => { setAssetName(e.target.value); setAssetType('Saving'); }}
                            />
                            <div className="flex gap-2">
                                <input 
                                    type="number" className="w-full border rounded p-2 text-sm" 
                                    placeholder="$ Value"
                                    value={assetValue} onChange={e => setAssetValue(e.target.value)}
                                />
                                <button className="bg-indigo-600 text-white px-3 rounded text-sm hover:bg-indigo-700"><Plus size={16}/></button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* INVESTING (Simple View) */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col">
                    <div className="p-5 border-b border-slate-50 bg-emerald-50/50">
                         <div className="flex justify-between items-start mb-2">
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><LineChart size={20} /></div>
                            <span className="text-2xl font-bold text-slate-800">${totalInvestments.toLocaleString()}</span>
                        </div>
                        <h3 className="font-bold text-slate-800">Investing (Total)</h3>
                        <p className="text-xs text-slate-500">Includes Detailed Portfolio</p>
                    </div>
                    <div className="p-5 flex-1 space-y-4">
                         <ul className="space-y-3">
                            {assets.filter(a => a.type === 'Investment').map(a => (
                                <li key={a.id} className="flex justify-between text-sm">
                                    <span className="text-slate-600">{a.name}</span>
                                    <span className="font-medium text-slate-900">${a.value.toLocaleString()}</span>
                                </li>
                            ))}
                        </ul>
                         <div className="mt-4 p-3 bg-slate-50 rounded text-xs text-slate-500 text-center">
                             Go to <strong>Wealth Creation</strong> tab for detailed portfolio management.
                         </div>
                    </div>
                </div>

                {/* LOANS */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col">
                    <div className="p-5 border-b border-slate-50 bg-rose-50/50">
                         <div className="flex justify-between items-start mb-2">
                            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg"><Landmark size={20} /></div>
                            <span className="text-2xl font-bold text-slate-800">${totalLiabilities.toLocaleString()}</span>
                        </div>
                        <h3 className="font-bold text-slate-800">Loans</h3>
                        <p className="text-xs text-slate-500">Strategy: Repay & Leverage</p>
                    </div>
                    <div className="p-5 flex-1 space-y-4">
                        <ul className="space-y-4">
                            {liabilities.map(l => (
                                <li key={l.id} className="space-y-1">
                                    <div className="flex justify-between text-sm font-medium text-slate-700">
                                        <span>{l.name}</span>
                                        <span>${(l.totalAmount - l.paidAmount).toLocaleString()} left</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-rose-500" style={{ width: `${(l.paidAmount / l.totalAmount) * 100}%` }}></div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        )}

        {/* --- INVESTING TAB (New) --- */}
        {activeTab === 'investing' && <InvestmentManager />}

        {/* --- PROTECTION TAB --- */}
        {activeTab === 'protection' && <InsuranceManager />}

        {/* --- TAX TAB (New) --- */}
        {activeTab === 'tax' && <TaxManager />}
    </div>
  );
};

export default FinanceManager;
