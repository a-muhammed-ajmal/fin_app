
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { TransactionType, InsuranceType } from '../types';
import { 
  ClipboardCheck, ShieldCheck, Target, Rocket, 
  AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, 
  DollarSign, Lock, AlertOctagon, HelpCircle 
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const FinancialPlan = () => {
  const { 
    transactions, assets, liabilities, insurancePolicies, goals, savingsConfig 
  } = useData();

  const [activeTab, setActiveTab] = useState<'audit' | 'safety' | 'freedom' | 'lifestyle'>('audit');

  // --- DATA AGGREGATION ---
  const monthlyIncome = transactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, t) => acc + t.amount, 0);
  const monthlyExpenses = transactions.filter(t => t.type === TransactionType.EXPENSE && t.category !== 'Tax').reduce((acc, t) => acc + t.amount, 0);
  const totalEMI = liabilities.reduce((acc, l) => acc + l.monthlyPayment, 0);
  const monthlySurplus = Math.max(0, monthlyIncome - monthlyExpenses - totalEMI);

  const totalEmergencyFund = assets.filter(a => a.type === 'Saving').reduce((acc, a) => acc + a.value, 0);
  const requiredEmergencyFund = savingsConfig.targetAmount || (monthlyExpenses * 6);
  
  const termCover = insurancePolicies.filter(p => p.type === InsuranceType.TERM_LIFE).reduce((acc, p) => acc + p.sumAssured, 0);
  const requiredTermCover = monthlyIncome * 12 * 10; // 10x Income Rule

  const debtRatio = monthlyIncome > 0 ? (totalEMI / monthlyIncome) * 100 : 0;

  // --- STATUS CHECKS ---
  const checks = {
      emergency: totalEmergencyFund >= (requiredEmergencyFund * 0.8), // 80% tolerance
      insurance: termCover >= requiredTermCover,
      debt: debtRatio < 40,
      surplus: monthlySurplus > (monthlyIncome * 0.1) // Saving at least 10%
  };

  const isSafetySecure = checks.emergency && checks.insurance && checks.debt;

  // --- GOAL DATA ---
  const freedomGoals = goals.filter(g => g.tier === 'Freedom');
  const lifestyleGoals = goals.filter(g => g.tier === 'Lifestyle');

  const freedomSIP = freedomGoals.reduce((acc, g) => acc + (g.requiredSIP || 0), 0);
  const lifestyleSIP = lifestyleGoals.reduce((acc, g) => acc + (g.requiredSIP || 0), 0);

  // --- LIFESTYLE CALCULATOR ---
  // Target Income = (Living + FreedomSIP + LifestyleSIP) / 0.75 (Saving 25%)
  // Or simply: Living + EMI + Goals must fit in Income.
  // Prompt Logic: 75% for living (Consumption+Commitment), 25% for Safety/Growth.
  // So Needs + Wants + EMI should be <= 75% of Income.
  // Safety + FreedomSIP + LifestyleSIP should be >= 25% of Income.
  
  const targetMonthlyInvestments = freedomSIP + lifestyleSIP + (checks.emergency ? 0 : 500); // 500 min for emergency catchup
  const targetIncome = Math.round(targetMonthlyInvestments / 0.25); // If investments are 25%
  const incomeGap = targetIncome - monthlyIncome;

  return (
    <div className="space-y-6 animate-in fade-in">
        {/* Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
            {[
                { id: 'audit', label: '1. Health Audit', icon: ClipboardCheck },
                { id: 'safety', label: '2. Safety Plan', icon: ShieldCheck },
                { id: 'freedom', label: '3. Freedom Plan', icon: Target },
                { id: 'lifestyle', label: '4. Lifestyle Plan', icon: Rocket },
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

        {/* --- TAB 1: AUDIT --- */}
        {activeTab === 'audit' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <ClipboardCheck className="text-indigo-600" /> Financial Report Card
                    </h3>
                    
                    <div className="space-y-4">
                        <div className={`p-4 rounded-lg border-l-4 flex justify-between items-center ${checks.emergency ? 'bg-emerald-50 border-emerald-500' : 'bg-rose-50 border-rose-500'}`}>
                            <div className="flex items-center gap-3">
                                {checks.emergency ? <CheckCircle2 className="text-emerald-500" /> : <AlertTriangle className="text-rose-500" />}
                                <div>
                                    <div className="font-bold text-slate-700">Emergency Fund</div>
                                    <div className="text-xs text-slate-500">
                                        Has ${totalEmergencyFund.toLocaleString()} / Target ${requiredEmergencyFund.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <span className={`text-sm font-bold ${checks.emergency ? 'text-emerald-700' : 'text-rose-700'}`}>
                                {checks.emergency ? 'PASS' : 'FAIL'}
                            </span>
                        </div>

                        <div className={`p-4 rounded-lg border-l-4 flex justify-between items-center ${checks.insurance ? 'bg-emerald-50 border-emerald-500' : 'bg-rose-50 border-rose-500'}`}>
                            <div className="flex items-center gap-3">
                                {checks.insurance ? <CheckCircle2 className="text-emerald-500" /> : <ShieldCheck className="text-rose-500" />}
                                <div>
                                    <div className="font-bold text-slate-700">Life Insurance</div>
                                    <div className="text-xs text-slate-500">
                                        Cover ${termCover.toLocaleString()} / Need ${requiredTermCover.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <span className={`text-sm font-bold ${checks.insurance ? 'text-emerald-700' : 'text-rose-700'}`}>
                                {checks.insurance ? 'PASS' : 'FAIL'}
                            </span>
                        </div>

                        <div className={`p-4 rounded-lg border-l-4 flex justify-between items-center ${checks.debt ? 'bg-emerald-50 border-emerald-500' : 'bg-rose-50 border-rose-500'}`}>
                            <div className="flex items-center gap-3">
                                {checks.debt ? <CheckCircle2 className="text-emerald-500" /> : <TrendingDown className="text-rose-500" />}
                                <div>
                                    <div className="font-bold text-slate-700">Debt Pressure</div>
                                    <div className="text-xs text-slate-500">
                                        EMI Ratio: {debtRatio.toFixed(1)}% (Limit 40%)
                                    </div>
                                </div>
                            </div>
                            <span className={`text-sm font-bold ${checks.debt ? 'text-emerald-700' : 'text-rose-700'}`}>
                                {checks.debt ? 'PASS' : 'FAIL'}
                            </span>
                        </div>

                        <div className={`p-4 rounded-lg border-l-4 flex justify-between items-center ${checks.surplus ? 'bg-emerald-50 border-emerald-500' : 'bg-amber-50 border-amber-500'}`}>
                             <div className="flex items-center gap-3">
                                {checks.surplus ? <CheckCircle2 className="text-emerald-500" /> : <TrendingUp className="text-amber-500" />}
                                <div>
                                    <div className="font-bold text-slate-700">Cash Flow</div>
                                    <div className="text-xs text-slate-500">
                                        Surplus: ${monthlySurplus.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                             <span className={`text-sm font-bold ${checks.surplus ? 'text-emerald-700' : 'text-amber-700'}`}>
                                {checks.surplus ? 'HEALTHY' : 'TIGHT'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg flex-1 flex flex-col justify-center text-center">
                        <h4 className="text-slate-400 uppercase tracking-widest text-xs font-bold mb-2">Overall Verdict</h4>
                        <div className={`text-4xl font-black mb-4 ${isSafetySecure ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isSafetySecure ? 'GREEN LIGHT' : 'RED LIGHT'}
                        </div>
                        <p className="text-sm opacity-80 max-w-xs mx-auto">
                            {isSafetySecure 
                                ? "Your foundation is strong. Proceed to Freedom & Lifestyle planning." 
                                : "Your foundation is shaky. Focus ONLY on Plan 1 (Safety) for now."}
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex-1">
                        <div className="flex justify-between items-center mb-4">
                             <div className="font-bold text-slate-700">Money Flow</div>
                             <div className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">Monthly</div>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-emerald-600">Income</span>
                                <span className="font-bold">${monthlyIncome.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-rose-600">Living Exp.</span>
                                <span>- ${monthlyExpenses.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-rose-600">EMIs</span>
                                <span>- ${totalEMI.toLocaleString()}</span>
                            </div>
                            <div className="border-t pt-2 flex justify-between font-bold text-lg">
                                <span>Surplus</span>
                                <span className={monthlySurplus > 0 ? 'text-indigo-600' : 'text-rose-600'}>
                                    ${monthlySurplus.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- TAB 2: SAFETY PLAN --- */}
        {activeTab === 'safety' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-2">Plan 1: Secure the Fortress</h3>
                    <p className="text-sm text-slate-500 mb-6">Fix these issues before investing for goals.</p>

                    <div className="space-y-6">
                        {!checks.emergency && (
                            <div className="flex gap-4">
                                <div className="bg-rose-100 text-rose-600 w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">1</div>
                                <div>
                                    <h4 className="font-bold text-slate-800">Build Emergency Fund</h4>
                                    <p className="text-sm text-slate-600 mb-2">
                                        Shortfall: <span className="text-rose-600 font-bold">${(requiredEmergencyFund - totalEmergencyFund).toLocaleString()}</span>
                                    </p>
                                    <div className="text-xs bg-slate-50 p-2 rounded border border-slate-200">
                                        <strong>Action:</strong> Direct all surplus (${monthlySurplus.toLocaleString()}) here. Pause other investments.
                                    </div>
                                </div>
                            </div>
                        )}

                         {!checks.insurance && (
                            <div className="flex gap-4">
                                <div className="bg-rose-100 text-rose-600 w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">2</div>
                                <div>
                                    <h4 className="font-bold text-slate-800">Buy Term Insurance</h4>
                                    <p className="text-sm text-slate-600 mb-2">
                                        Gap: <span className="text-rose-600 font-bold">${(requiredTermCover - termCover).toLocaleString()}</span>
                                    </p>
                                    <div className="text-xs bg-slate-50 p-2 rounded border border-slate-200">
                                        <strong>Action:</strong> Purchase a pure Term Plan covering 10-15x income.
                                    </div>
                                </div>
                            </div>
                        )}

                        {!checks.debt && (
                            <div className="flex gap-4">
                                <div className="bg-rose-100 text-rose-600 w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">3</div>
                                <div>
                                    <h4 className="font-bold text-slate-800">Reduce Debt Load</h4>
                                    <p className="text-sm text-slate-600 mb-2">
                                        EMI is {debtRatio.toFixed(1)}% of income (Max 40%).
                                    </p>
                                    <div className="text-xs bg-slate-50 p-2 rounded border border-slate-200">
                                        <strong>Action:</strong> Use the "Debt Manager" module to prepay high-interest loans.
                                    </div>
                                </div>
                            </div>
                        )}

                        {isSafetySecure && (
                             <div className="flex flex-col items-center justify-center py-8 text-emerald-600">
                                 <CheckCircle2 size={48} className="mb-2" />
                                 <h4 className="font-bold text-lg">Safety Plan Complete!</h4>
                                 <p className="text-slate-500 text-sm">You are ready for wealth creation.</p>
                             </div>
                        )}
                    </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <HelpCircle size={18} /> Why this order?
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">
                        We prioritize safety because one emergency (job loss, hospital) can wipe out years of wealth. 
                        A pyramid built on sand will collapse.
                    </p>
                    <ul className="text-sm space-y-2 text-slate-600">
                        <li className="flex gap-2">
                            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                            <span><strong>Liquidity:</strong> Emergency Fund pays bills when income stops.</span>
                        </li>
                        <li className="flex gap-2">
                            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                            <span><strong>Protection:</strong> Insurance protects your savings from hospitals.</span>
                        </li>
                    </ul>
                </div>
            </div>
        )}

         {/* --- TAB 3: FREEDOM PLAN --- */}
         {activeTab === 'freedom' && (
            <div className="space-y-6 animate-in slide-in-from-right">
                {!isSafetySecure && (
                     <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-center gap-3 text-rose-800 mb-2">
                        <Lock size={20} />
                        <strong>Warning:</strong> Complete Plan 1 (Safety) before aggressively funding these goals.
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Goal List */}
                    <div className="md:col-span-2 space-y-4">
                        <h3 className="font-bold text-slate-800 text-lg">Mandatory Goals (Needs)</h3>
                        {freedomGoals.length === 0 && (
                            <div className="text-slate-400 p-8 border-2 border-dashed rounded-xl text-center">
                                No "Freedom" goals set. Go to Investing Tab {`>`} Add Goal (Tier: Freedom).
                            </div>
                        )}
                        {freedomGoals.map(g => (
                             <div key={g.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-slate-800">{g.title}</div>
                                    <div className="text-xs text-slate-500">Target: ${(g.futureValue || 0).toLocaleString()} • {g.yearsAway}y away</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-indigo-600">SIP: ${g.requiredSIP?.toLocaleString()}</div>
                                    <div className="text-[10px] text-slate-400">Required/mo</div>
                                </div>
                             </div>
                        ))}
                    </div>

                    {/* Funding Status */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-6">Funding Status</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Required Monthly</span>
                                <span className="font-bold">${freedomSIP.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Available Surplus</span>
                                <span className={`font-bold ${monthlySurplus >= freedomSIP ? 'text-emerald-600' : 'text-rose-600'}`}>${monthlySurplus.toLocaleString()}</span>
                            </div>
                            
                            <div className="pt-4 border-t">
                                {monthlySurplus >= freedomSIP ? (
                                    <div className="text-center text-emerald-600">
                                        <CheckCircle2 size={32} className="mx-auto mb-2" />
                                        <div className="font-bold">Fully Funded</div>
                                        <div className="text-xs">You can afford your freedom.</div>
                                    </div>
                                ) : (
                                    <div className="text-center text-rose-600">
                                        <AlertOctagon size={32} className="mx-auto mb-2" />
                                        <div className="font-bold">Deficit: ${Math.abs(monthlySurplus - freedomSIP).toLocaleString()}</div>
                                        <div className="text-xs">Reduce expenses or increase income.</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
         )}

        {/* --- TAB 4: LIFESTYLE PLAN --- */}
        {activeTab === 'lifestyle' && (
             <div className="space-y-6 animate-in slide-in-from-right">
                <div className="bg-indigo-900 text-white p-8 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                             <Rocket className="text-indigo-400" /> Target Income
                        </h3>
                        <p className="text-indigo-200 text-sm max-w-md">
                            To afford your "Dream Life" (Goals + Living) while maintaining a 25% savings rate, you need to earn:
                        </p>
                    </div>
                    <div className="text-right">
                         <div className="text-4xl font-black text-white">${targetIncome.toLocaleString()}<span className="text-xl font-normal text-indigo-400">/mo</span></div>
                         <div className={`text-sm font-bold mt-2 ${incomeGap <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                             {incomeGap <= 0 ? "You are there!" : `Gap: -$${incomeGap.toLocaleString()}`}
                         </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h4 className="font-bold text-slate-800 mb-4">Aspirational Goals (Wants)</h4>
                        <div className="space-y-3">
                            {lifestyleGoals.map(g => (
                                <div key={g.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                    <span className="font-medium text-slate-700">{g.title}</span>
                                    <span className="text-sm font-bold text-indigo-600">SIP: ${g.requiredSIP?.toLocaleString()}</span>
                                </div>
                            ))}
                            {lifestyleGoals.length === 0 && (
                                <div className="text-center text-slate-400 text-sm italic py-4">
                                    No lifestyle goals. Add a "Luxury Car" or "Villa" in Investing Tab (Tier: Lifestyle).
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h4 className="font-bold text-slate-800 mb-4">The Math (Reverse Calculation)</h4>
                        <div className="space-y-2 text-sm text-slate-600">
                             <div className="flex justify-between">
                                 <span>1. Living Expenses</span>
                                 <span>${(monthlyExpenses + totalEMI).toLocaleString()}</span>
                             </div>
                             <div className="flex justify-between">
                                 <span>2. Freedom Investments</span>
                                 <span>+ ${freedomSIP.toLocaleString()}</span>
                             </div>
                             <div className="flex justify-between font-bold text-indigo-700">
                                 <span>3. Lifestyle Cost</span>
                                 <span>+ ${lifestyleSIP.toLocaleString()}</span>
                             </div>
                             <div className="pt-2 border-t mt-2">
                                 <p className="text-xs mb-2">Rule: Total Investments (2+3) should be 25% of Income.</p>
                                 <div className="bg-slate-100 p-2 rounded text-center font-mono">
                                     Target = (${(freedomSIP + lifestyleSIP).toLocaleString()} / 0.25)
                                 </div>
                             </div>
                        </div>
                    </div>
                </div>
             </div>
        )}
    </div>
  );
};

export default FinancialPlan;
