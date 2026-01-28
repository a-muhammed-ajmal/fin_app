import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { 
  LoanPurpose, LoanCollateral, LoanStructure, InterestCalculation, InterestRateType, Liability, TransactionType, LoanType 
} from '../types';
import { 
  AlertTriangle, Calculator, Search, ShieldCheck, 
  TrendingDown, TrendingUp, HelpCircle, AlertOctagon,
  Trash2, Plus, CreditCard, ThumbsUp, ThumbsDown,
  BarChart2, Zap, ArrowRight, Gauge
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const LoanManager = () => {
  const { liabilities, addLiability, deleteLiability, transactions, assets } = useData();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'wizard' | 'strategist' | 'auditor'>('dashboard');

  // --- Helpers ---
  const calculateEMI = (principal: number, rate: number, months: number, type: InterestCalculation) => {
      if (type === InterestCalculation.FLAT) {
          const annualInterest = principal * (rate / 100);
          const totalInterest = annualInterest * (months / 12);
          return (principal + totalInterest) / months;
      } else {
          const r = rate / 12 / 100;
          if (r === 0) return principal / months;
          const emi = principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
          return emi;
      }
  };

  const totalIncome = transactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, c) => acc + c.amount, 0);
  const totalMonthlyEMI = liabilities.reduce((acc, l) => acc + l.monthlyPayment, 0);
  const emiToIncomeRatio = totalIncome > 0 ? (totalMonthlyEMI / totalIncome) * 100 : 0;
  
  const goodDebt = liabilities.filter(l => l.purpose === LoanPurpose.PRODUCTIVE).reduce((acc, l) => acc + (l.totalAmount - l.paidAmount), 0);
  const badDebt = liabilities.filter(l => l.purpose === LoanPurpose.CONSUMPTION).reduce((acc, l) => acc + (l.totalAmount - l.paidAmount), 0);

  // --- Wizard State ---
  const [wizardStep, setWizardStep] = useState(1);
  const [wizAmount, setWizAmount] = useState(0);
  const [wizRate, setWizRate] = useState(10);
  const [wizTenure, setWizTenure] = useState(12);
  const [wizStable, setWizStable] = useState(true);
  const [wizEmergency, setWizEmergency] = useState(true);
  const [wizNeed, setWizNeed] = useState(true);
  const [wizAppreciate, setWizAppreciate] = useState(true);

  // --- Strategist State ---
  const [stratType, setStratType] = useState<'avalanche' | 'snowball'>('avalanche');
  const [selectedLoanId, setSelectedLoanId] = useState<string>('');
  const [extraPayment, setExtraPayment] = useState(500);

  // --- Auditor (New Loan) State ---
  const [newLoan, setNewLoan] = useState<Partial<Liability>>({
    name: '',
    totalAmount: 0,
    paidAmount: 0,
    monthlyPayment: 0,
    interestRate: 10,
    tenureMonths: 12,
    purpose: LoanPurpose.PRODUCTIVE,
    collateral: LoanCollateral.SECURED,
    structure: LoanStructure.TERM,
    calculationMethod: InterestCalculation.REDUCING,
    rateType: InterestRateType.FIXED,
    loanType: LoanType.PERSONAL
  });

  const handleAddLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoan.name || !newLoan.totalAmount) return;
    
    let emi = newLoan.monthlyPayment || 0;
    if (emi === 0 && newLoan.totalAmount && newLoan.interestRate && newLoan.tenureMonths && newLoan.calculationMethod) {
        emi = calculateEMI(newLoan.totalAmount, newLoan.interestRate, newLoan.tenureMonths, newLoan.calculationMethod);
    }

    addLiability({
        ...newLoan as Liability,
        monthlyPayment: emi,
        startDate: new Date().toISOString()
    });
    setNewLoan({ name: '', totalAmount: 0, paidAmount: 0, monthlyPayment: 0, interestRate: 10, tenureMonths: 12, loanType: LoanType.PERSONAL });
    setActiveTab('dashboard');
  };

  // --- Derived Data for Strategist ---
  const sortedLiabilities = [...liabilities].sort((a, b) => {
      if (stratType === 'avalanche') return b.interestRate - a.interestRate;
      return (a.totalAmount - a.paidAmount) - (b.totalAmount - b.paidAmount);
  });

  const selectedLoan = liabilities.find(l => l.id === selectedLoanId);
  const simOriginalInterest = selectedLoan ? (selectedLoan.monthlyPayment * selectedLoan.tenureMonths) - selectedLoan.totalAmount : 0;
  
  // Rough Calculation for Prepayment (Simplified)
  // Assuming remaining tenure ~ total tenure for demo or linear reduction
  const simNewEMI = selectedLoan ? selectedLoan.monthlyPayment + extraPayment : 0;
  // This is a complex calc in reality, for demo we estimate:
  // New Months = (Outstanding * (1+r)^n) logic. Simplified:
  const outstanding = selectedLoan ? selectedLoan.totalAmount - selectedLoan.paidAmount : 0;
  const simNewMonths = selectedLoan && simNewEMI > 0 ? outstanding / (simNewEMI - (outstanding * (selectedLoan.interestRate/1200))) : 0;
  const simSavedInterest = selectedLoan ? Math.max(0, (selectedLoan.monthlyPayment * (selectedLoan.tenureMonths - (selectedLoan.paidAmount/selectedLoan.monthlyPayment))) - (simNewEMI * simNewMonths)) : 0;

  return (
    <div className="space-y-6">
       {/* Navigation */}
       <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
        {[
          { id: 'dashboard', label: 'Debt Dashboard', icon: TrendingDown },
          { id: 'wizard', label: 'Decision Wizard', icon: HelpCircle },
          { id: 'strategist', label: 'Repay Strategist', icon: Zap },
          { id: 'auditor', label: 'Loan Auditor (Add)', icon: Search },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              activeTab === tab.id 
                ? 'bg-slate-800 text-white' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- DASHBOARD --- */}
      {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Health Score Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                  <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                      <Gauge size={20} /> EMI to Income Ratio
                  </h3>
                  <div className={`text-5xl font-black mb-2 ${emiToIncomeRatio > 40 ? 'text-rose-600' : emiToIncomeRatio > 30 ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {emiToIncomeRatio.toFixed(1)}%
                  </div>
                  <p className="text-xs text-slate-500 max-w-xs">
                      {emiToIncomeRatio > 40 
                        ? "DANGER: You are over-leveraged (>40%). Initiate Debt Rebalancing immediately." 
                        : "Healthy: Keep this under 30% for financial freedom."}
                  </p>
              </div>

              {/* Credit Card Alert Block */}
              {liabilities.some(l => l.loanType === LoanType.CREDIT_CARD) && (
                  <div className="bg-rose-50 p-6 rounded-xl border border-rose-100">
                      <h3 className="font-bold text-rose-800 mb-3 flex items-center gap-2">
                          <CreditCard size={20} /> Credit Card Monitor
                      </h3>
                      <div className="space-y-3">
                          {liabilities.filter(l => l.loanType === LoanType.CREDIT_CARD).map(cc => {
                              const utilization = cc.creditLimit ? ((cc.totalAmount - cc.paidAmount) / cc.creditLimit) * 100 : 0;
                              return (
                                  <div key={cc.id} className="bg-white p-3 rounded-lg border border-rose-100">
                                      <div className="flex justify-between text-sm font-bold text-slate-700 mb-1">
                                          <span>{cc.name}</span>
                                          <span className={utilization > 30 ? 'text-rose-600' : 'text-emerald-600'}>{utilization.toFixed(0)}% Used</span>
                                      </div>
                                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                          <div className={`h-full ${utilization > 30 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, utilization)}%` }}></div>
                                      </div>
                                      {utilization > 30 && <div className="text-[10px] text-rose-500 mt-1">Alert: Stop spending on this card to protect credit score.</div>}
                                  </div>
                              )
                          })}
                          <div className="text-xs text-rose-700 font-bold flex items-center gap-1 mt-2">
                              <AlertOctagon size={12} /> Never Withdraw Cash from Credit Card!
                          </div>
                      </div>
                  </div>
              )}

              {/* Good vs Bad Debt */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 md:col-span-2">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-slate-700 flex items-center gap-2">
                          <ShieldCheck size={18} /> Debt Quality Analysis
                      </h3>
                      <div className="text-sm text-slate-500">
                          Total Debt: <span className="font-bold text-slate-800">${(goodDebt + badDebt).toLocaleString()}</span>
                      </div>
                  </div>
                  
                  <div className="flex gap-4 items-center">
                      <div className="w-1/3 h-32">
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie data={[{name: 'Good', value: goodDebt}, {name: 'Bad', value: badDebt}]} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value">
                                      <Cell fill="#10b981" />
                                      <Cell fill="#f43f5e" />
                                  </Pie>
                                  <Tooltip />
                              </PieChart>
                          </ResponsiveContainer>
                      </div>
                      <div className="flex-1 space-y-4">
                          <div>
                              <div className="flex justify-between text-sm mb-1">
                                  <span className="text-emerald-700 font-bold flex items-center gap-1"><TrendingUp size={14}/> Good Debt (Assets)</span>
                                  <span className="font-bold">${goodDebt.toLocaleString()}</span>
                              </div>
                              <p className="text-xs text-slate-400">Home Loans, Education Loans</p>
                          </div>
                          <div>
                              <div className="flex justify-between text-sm mb-1">
                                  <span className="text-rose-700 font-bold flex items-center gap-1"><TrendingDown size={14}/> Bad Debt (Lifestyle)</span>
                                  <span className="font-bold">${badDebt.toLocaleString()}</span>
                              </div>
                              <p className="text-xs text-slate-400">Personal Loans, Credit Cards, Luxury Cars</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* --- WIZARD --- */}
      {activeTab === 'wizard' && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-slate-100">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Should I Take This Loan?</h3>
              <p className="text-slate-500 mb-8">The 3-Step Affordability & Purpose Test</p>

              {wizardStep === 1 && (
                  <div className="space-y-6 animate-in slide-in-from-right">
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Loan Amount</label>
                          <input type="number" className="w-full border rounded p-3 text-lg" value={wizAmount} onChange={e => setWizAmount(parseFloat(e.target.value))} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-1">Interest (%)</label>
                              <input type="number" className="w-full border rounded p-3" value={wizRate} onChange={e => setWizRate(parseFloat(e.target.value))} />
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-1">Tenure (Months)</label>
                              <input type="number" className="w-full border rounded p-3" value={wizTenure} onChange={e => setWizTenure(parseFloat(e.target.value))} />
                          </div>
                      </div>
                      <div className="bg-indigo-50 p-4 rounded-lg text-indigo-900 font-bold text-center">
                          Estimated EMI: ${calculateEMI(wizAmount, wizRate, wizTenure, InterestCalculation.REDUCING).toFixed(0)}
                      </div>
                      <button onClick={() => setWizardStep(2)} className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-black transition">
                          Next: Affordability Check
                      </button>
                  </div>
              )}

              {wizardStep === 2 && (
                  <div className="space-y-6 animate-in slide-in-from-right">
                      <div className="space-y-4">
                          <label className="flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:bg-slate-50">
                              <span className="font-bold text-slate-700">Is your income stable?</span>
                              <input type="checkbox" checked={wizStable} onChange={e => setWizStable(e.target.checked)} className="w-5 h-5 accent-indigo-600" />
                          </label>
                          <label className="flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:bg-slate-50">
                              <span className="font-bold text-slate-700">Do you have 6 months Emergency Fund?</span>
                              <input type="checkbox" checked={wizEmergency} onChange={e => setWizEmergency(e.target.checked)} className="w-5 h-5 accent-indigo-600" />
                          </label>
                      </div>
                      <div className="bg-slate-100 p-4 rounded-lg text-sm text-slate-600">
                          We will also check if this new EMI pushes your total debt ratio above 40%.
                      </div>
                      <div className="flex gap-4">
                          <button onClick={() => setWizardStep(1)} className="flex-1 border border-slate-300 py-3 rounded-lg font-bold text-slate-600">Back</button>
                          <button onClick={() => setWizardStep(3)} className="flex-1 bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-black transition">Next: Purpose Test</button>
                      </div>
                  </div>
              )}

              {wizardStep === 3 && (
                  <div className="space-y-6 animate-in slide-in-from-right">
                      <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                              <button onClick={() => setWizNeed(true)} className={`p-4 rounded-xl border-2 font-bold ${wizNeed ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500'}`}>It's a NEED</button>
                              <button onClick={() => setWizNeed(false)} className={`p-4 rounded-xl border-2 font-bold ${!wizNeed ? 'border-rose-600 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-500'}`}>It's a WANT</button>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <button onClick={() => setWizAppreciate(true)} className={`p-4 rounded-xl border-2 font-bold ${wizAppreciate ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500'}`}>Asset Appreciates</button>
                              <button onClick={() => setWizAppreciate(false)} className={`p-4 rounded-xl border-2 font-bold ${!wizAppreciate ? 'border-rose-600 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-500'}`}>Asset Depreciates</button>
                          </div>
                      </div>
                      <div className="flex gap-4">
                          <button onClick={() => setWizardStep(2)} className="flex-1 border border-slate-300 py-3 rounded-lg font-bold text-slate-600">Back</button>
                          <button onClick={() => setWizardStep(4)} className="flex-1 bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-black transition">Get Verdict</button>
                      </div>
                  </div>
              )}

              {wizardStep === 4 && (
                  <div className="text-center animate-in zoom-in">
                      {(() => {
                          const newEMI = calculateEMI(wizAmount, wizRate, wizTenure, InterestCalculation.REDUCING);
                          const newRatio = totalIncome > 0 ? ((totalMonthlyEMI + newEMI) / totalIncome) * 100 : 0;
                          const isSafe = wizStable && wizEmergency && newRatio < 40 && (wizNeed || wizAppreciate);
                          
                          return (
                              <div>
                                  <div className={`inline-block p-6 rounded-full mb-4 ${isSafe ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                      {isSafe ? <ThumbsUp size={48} /> : <ThumbsDown size={48} />}
                                  </div>
                                  <h2 className={`text-3xl font-black mb-2 ${isSafe ? 'text-emerald-600' : 'text-rose-600'}`}>
                                      {isSafe ? "GREEN LIGHT" : "RED LIGHT"}
                                  </h2>
                                  <p className="text-lg text-slate-600 mb-6">
                                      {isSafe 
                                        ? "This loan appears safe. Your finances can handle it." 
                                        : "This loan carries significant risk of a Debt Trap."}
                                  </p>
                                  
                                  {!isSafe && (
                                      <div className="bg-rose-50 text-left p-4 rounded-xl space-y-2 text-sm text-rose-800">
                                          {!wizStable && <li>Income is unstable.</li>}
                                          {!wizEmergency && <li>No backup fund.</li>}
                                          {newRatio > 40 && <li>Total EMI will exceed 40% of income ({newRatio.toFixed(1)}%).</li>}
                                          {!wizNeed && <li>It is a Want, not a Need.</li>}
                                          {!wizAppreciate && <li>Asset value depreciates.</li>}
                                      </div>
                                  )}
                                  
                                  <button onClick={() => setWizardStep(1)} className="mt-8 text-slate-500 hover:text-slate-800 underline">Start Over</button>
                              </div>
                          );
                      })()}
                  </div>
              )}
          </div>
      )}

      {/* --- STRATEGIST --- */}
      {activeTab === 'strategist' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Zap size={18} className="text-amber-500" /> Repayment Velocity
                  </h3>
                  <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
                      <button 
                        onClick={() => setStratType('avalanche')}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition ${stratType === 'avalanche' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
                      >
                          Avalanche (High Interest)
                      </button>
                      <button 
                        onClick={() => setStratType('snowball')}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition ${stratType === 'snowball' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
                      >
                          Snowball (Small Balance)
                      </button>
                  </div>

                  <div className="space-y-3">
                      {sortedLiabilities.map((l, idx) => (
                          <div 
                            key={l.id} 
                            onClick={() => setSelectedLoanId(l.id)}
                            className={`p-3 rounded-lg border cursor-pointer transition ${selectedLoanId === l.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'}`}
                          >
                              <div className="flex justify-between items-center mb-1">
                                  <div className="flex items-center gap-2">
                                      <div className="bg-slate-200 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">{idx + 1}</div>
                                      <span className="font-bold text-slate-700">{l.name}</span>
                                  </div>
                                  <span className="text-xs font-bold bg-slate-200 px-2 py-1 rounded text-slate-600">{l.interestRate}%</span>
                              </div>
                              <div className="flex justify-between text-xs text-slate-500 pl-8">
                                  <span>Outstanding: ${(l.totalAmount - l.paidAmount).toLocaleString()}</span>
                                  <span>EMI: ${l.monthlyPayment}</span>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
                  {selectedLoan ? (
                      <div className="h-full flex flex-col">
                          <h3 className="text-lg font-bold mb-1">Prepayment Simulator</h3>
                          <p className="text-slate-400 text-sm mb-6">Targeting: {selectedLoan.name}</p>
                          
                          <div className="mb-8">
                              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Extra Monthly Payment</label>
                              <div className="flex items-center gap-4">
                                  <input 
                                    type="range" min="0" max="5000" step="100"
                                    className="flex-1 accent-emerald-500"
                                    value={extraPayment} onChange={e => setExtraPayment(parseInt(e.target.value))}
                                  />
                                  <span className="text-2xl font-bold text-emerald-400">${extraPayment}</span>
                              </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-6">
                              <div className="bg-slate-800 p-4 rounded-xl">
                                  <div className="text-xs text-slate-400">Interest Saved</div>
                                  <div className="text-xl font-bold text-emerald-400">${simSavedInterest.toFixed(0)}</div>
                              </div>
                              <div className="bg-slate-800 p-4 rounded-xl">
                                  <div className="text-xs text-slate-400">Time Saved</div>
                                  <div className="text-xl font-bold text-white">{(simNewMonths ? (selectedLoan.tenureMonths - selectedLoan.paidAmount/selectedLoan.monthlyPayment - simNewMonths) : 0).toFixed(1)} Mo</div>
                              </div>
                          </div>

                          <div className="mt-auto bg-slate-800/50 p-4 rounded-lg text-sm text-slate-300 leading-relaxed border border-slate-700">
                              <Zap size={16} className="inline mr-2 text-yellow-400" />
                              Paying an extra <strong>${extraPayment}</strong>/mo on this loan will save you huge interest. 
                              Use your bonus or surplus income here!
                          </div>
                      </div>
                  ) : (
                      <div className="h-full flex items-center justify-center text-slate-500">
                          Select a loan to simulate.
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* --- AUDITOR (ADD LOAN) --- */}
      {activeTab === 'auditor' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Search size={18} className="text-indigo-600" /> Loan Auditor (5-Lens Framework)
                  </h3>
                  <form onSubmit={handleAddLoan} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">Loan Name</label>
                              <input 
                                className="w-full border border-slate-200 rounded p-2 text-sm"
                                placeholder="e.g. Home Loan"
                                value={newLoan.name} onChange={e => setNewLoan({...newLoan, name: e.target.value})}
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">Type</label>
                              <select 
                                className="w-full border border-slate-200 rounded p-2 text-sm bg-slate-50"
                                value={newLoan.loanType}
                                onChange={e => setNewLoan({...newLoan, loanType: e.target.value as LoanType})}
                              >
                                  {Object.values(LoanType).map(v => <option key={v} value={v}>{v}</option>)}
                              </select>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">Principal Amount</label>
                              <input 
                                type="number"
                                className="w-full border border-slate-200 rounded p-2 text-sm"
                                value={newLoan.totalAmount} onChange={e => setNewLoan({...newLoan, totalAmount: parseFloat(e.target.value)})}
                              />
                          </div>
                          {newLoan.loanType === LoanType.CREDIT_CARD && (
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 mb-1">Credit Limit</label>
                                  <input 
                                    type="number"
                                    className="w-full border border-slate-200 rounded p-2 text-sm"
                                    value={newLoan.creditLimit || ''} onChange={e => setNewLoan({...newLoan, creditLimit: parseFloat(e.target.value)})}
                                  />
                              </div>
                          )}
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">Interest Rate (%)</label>
                              <input 
                                type="number"
                                className="w-full border border-slate-200 rounded p-2 text-sm"
                                value={newLoan.interestRate} onChange={e => setNewLoan({...newLoan, interestRate: parseFloat(e.target.value)})}
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">Tenure (Months)</label>
                              <input 
                                type="number"
                                className="w-full border border-slate-200 rounded p-2 text-sm"
                                value={newLoan.tenureMonths} onChange={e => setNewLoan({...newLoan, tenureMonths: parseFloat(e.target.value)})}
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">Monthly EMI</label>
                              <input 
                                type="number"
                                className="w-full border border-slate-200 rounded p-2 text-sm"
                                placeholder="Auto-calc"
                                value={newLoan.monthlyPayment} onChange={e => setNewLoan({...newLoan, monthlyPayment: parseFloat(e.target.value)})}
                              />
                          </div>
                      </div>

                      <div className="border-t border-slate-100 pt-4 space-y-4">
                          <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">The 5 Lenses</h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 mb-1">1. Purpose</label>
                                  <select className="w-full border p-2 text-sm bg-slate-50 rounded" value={newLoan.purpose} onChange={e => setNewLoan({...newLoan, purpose: e.target.value as LoanPurpose})}>
                                      {Object.values(LoanPurpose).map(v => <option key={v} value={v}>{v}</option>)}
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 mb-1">2. Collateral</label>
                                  <select className="w-full border p-2 text-sm bg-slate-50 rounded" value={newLoan.collateral} onChange={e => setNewLoan({...newLoan, collateral: e.target.value as LoanCollateral})}>
                                      {Object.values(LoanCollateral).map(v => <option key={v} value={v}>{v}</option>)}
                                  </select>
                              </div>
                               <div>
                                  <label className="block text-xs font-bold text-slate-500 mb-1">3. Structure</label>
                                  <select className="w-full border p-2 text-sm bg-slate-50 rounded" value={newLoan.structure} onChange={e => setNewLoan({...newLoan, structure: e.target.value as LoanStructure})}>
                                      {Object.values(LoanStructure).map(v => <option key={v} value={v}>{v}</option>)}
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 mb-1">4. Calculation</label>
                                  <select className="w-full border p-2 text-sm bg-slate-50 rounded" value={newLoan.calculationMethod} onChange={e => setNewLoan({...newLoan, calculationMethod: e.target.value as InterestCalculation})}>
                                      {Object.values(InterestCalculation).map(v => <option key={v} value={v}>{v}</option>)}
                                  </select>
                              </div>
                               <div>
                                  <label className="block text-xs font-bold text-slate-500 mb-1">5. Rate Type</label>
                                  <select className="w-full border p-2 text-sm bg-slate-50 rounded" value={newLoan.rateType} onChange={e => setNewLoan({...newLoan, rateType: e.target.value as InterestRateType})}>
                                      {Object.values(InterestRateType).map(v => <option key={v} value={v}>{v}</option>)}
                                  </select>
                              </div>
                          </div>
                      </div>

                      <button type="submit" className="w-full bg-slate-800 text-white py-2 rounded-lg font-medium hover:bg-slate-900 flex justify-center items-center gap-2">
                          <Plus size={18} /> Log Loan Card
                      </button>
                  </form>
              </div>

              {/* Dynamic Warning Panel */}
              <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                      <h4 className="font-bold text-amber-800 flex items-center gap-2 mb-2">
                          <AlertTriangle size={18} /> Analysis
                      </h4>
                      <ul className="space-y-2 text-sm text-amber-900">
                          {newLoan.purpose === LoanPurpose.CONSUMPTION && (
                              <li className="flex gap-2">
                                  <AlertOctagon size={16} className="text-rose-600 shrink-0 mt-0.5" />
                                  <span><strong>Bad Debt Alert:</strong> Consumption loans deplete future wealth.</span>
                              </li>
                          )}
                          {newLoan.calculationMethod === InterestCalculation.FLAT && (
                              <li className="flex gap-2">
                                  <AlertOctagon size={16} className="text-rose-600 shrink-0 mt-0.5" />
                                  <span><strong>Cost Alert:</strong> Flat Rate interest is misleading. Effective rate is ~1.8x higher!</span>
                              </li>
                          )}
                          {newLoan.collateral === LoanCollateral.UNSECURED && (
                               <li className="flex gap-2">
                                  <HelpCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                                  <span>Unsecured loans usually carry much higher interest rates.</span>
                               </li>
                          )}
                      </ul>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default LoanManager;