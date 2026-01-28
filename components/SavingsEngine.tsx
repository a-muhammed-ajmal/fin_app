import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { ShieldAlert, Umbrella, TrendingUp, AlertTriangle, CheckCircle, Calculator, Wallet } from 'lucide-react';

const SavingsEngine = () => {
  const { savingsConfig, updateSavingsConfig, assets, incomeTarget } = useData();
  const [activeTab, setActiveTab] = useState<'calculator' | 'dashboard'>('dashboard');

  // Calculator State
  const [monthlyExp, setMonthlyExp] = useState(savingsConfig.monthlyExpense || incomeTarget.needs || 0);
  const [jobStable, setJobStable] = useState(savingsConfig.isJobStable);
  const [hasDependents, setHasDependents] = useState(savingsConfig.hasDependents);

  // Derived Values
  const totalSavings = assets.filter(a => a.type === 'Saving').reduce((acc, c) => acc + c.value, 0);
  const progress = savingsConfig.targetAmount > 0 ? Math.min(100, Math.round((totalSavings / savingsConfig.targetAmount) * 100)) : 0;
  
  // Logic: 
  // Stable + No Deps = 3x
  // Unstable OR Deps = 6x (Wait, strict logic check: Unstable AND Deps = 12x, else if either is true = 6x)
  // Let's implement exact logic from prompt
  const calculateMultiplier = (stable: boolean, deps: boolean) => {
      if (stable && !deps) return 3;
      if (!stable && deps) return 12;
      return 6;
  };

  const calculatedMultiplier = calculateMultiplier(jobStable, hasDependents);
  const calculatedTarget = monthlyExp * calculatedMultiplier;

  useEffect(() => {
    // If not configured, default to calculator
    if (!savingsConfig.isConfigured) {
        setActiveTab('calculator');
    }
  }, [savingsConfig.isConfigured]);

  const saveConfiguration = () => {
      updateSavingsConfig({
          monthlyExpense: monthlyExp,
          isJobStable: jobStable,
          hasDependents: hasDependents,
          monthsMultiplier: calculatedMultiplier,
          targetAmount: calculatedTarget,
          isConfigured: true
      });
      setActiveTab('dashboard');
  };

  const getStatusColor = () => {
      if (progress < 50) return 'text-rose-600 bg-rose-50 border-rose-200';
      if (progress < 100) return 'text-amber-600 bg-amber-50 border-amber-200';
      return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  };

  const getStatusText = () => {
      if (progress < 50) return { label: 'Vulnerable', desc: 'Your safety net is weak. Focus on saving.' };
      if (progress < 100) return { label: 'Building Safety', desc: 'You are getting there. Keep going.' };
      return { label: 'Secure', desc: 'Stop saving, start investing!' };
  };

  const status = getStatusText();

  // Time to Goal
  const monthlySavingsRate = incomeTarget.savings || 1; // Avoid divide by zero
  const monthsToGoal = Math.max(0, Math.ceil((savingsConfig.targetAmount - totalSavings) / monthlySavingsRate));

  return (
    <div className="space-y-6">
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
            <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                activeTab === 'dashboard' 
                    ? 'bg-slate-800 text-white' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
                <Umbrella size={16} />
                Shock Absorber
            </button>
            <button
                onClick={() => setActiveTab('calculator')}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                activeTab === 'calculator' 
                    ? 'bg-slate-800 text-white' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
                <Calculator size={16} />
                Re-Calculate
            </button>
        </div>

        {activeTab === 'calculator' && (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 max-w-2xl mx-auto">
                <h3 className="text-xl font-bold text-slate-800 mb-2">Emergency Fund Calculator</h3>
                <p className="text-slate-500 mb-6 text-sm">How big should your safety net be? Let's calculate based on your risk profile.</p>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">1. Monthly Essential Expenses</label>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-slate-400">$</span>
                            <input 
                                type="number" 
                                className="w-full text-lg border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={monthlyExp}
                                onChange={e => setMonthlyExp(parseFloat(e.target.value))}
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Rent, Food, Utilities, EMIs only.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-4 border rounded-xl hover:border-indigo-200 transition cursor-pointer" onClick={() => setJobStable(!jobStable)}>
                             <label className="block text-sm font-bold text-slate-700 mb-2">2. Job Stability</label>
                             <div className="flex gap-2">
                                <button 
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium border ${jobStable ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}
                                    onClick={(e) => { e.stopPropagation(); setJobStable(true); }}
                                >
                                    Stable
                                </button>
                                <button 
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium border ${!jobStable ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}
                                    onClick={(e) => { e.stopPropagation(); setJobStable(false); }}
                                >
                                    Unstable
                                </button>
                             </div>
                        </div>

                        <div className="p-4 border rounded-xl hover:border-indigo-200 transition cursor-pointer" onClick={() => setHasDependents(!hasDependents)}>
                             <label className="block text-sm font-bold text-slate-700 mb-2">3. Dependents?</label>
                             <div className="flex gap-2">
                                <button 
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium border ${hasDependents ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}
                                    onClick={(e) => { e.stopPropagation(); setHasDependents(true); }}
                                >
                                    Yes
                                </button>
                                <button 
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium border ${!hasDependents ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}
                                    onClick={(e) => { e.stopPropagation(); setHasDependents(false); }}
                                >
                                    No
                                </button>
                             </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-xl text-center border border-slate-200">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Your Target Multiplier</div>
                        <div className="text-3xl font-bold text-indigo-600 mb-4">{calculatedMultiplier} Months</div>
                        <div className="text-sm text-slate-500 mb-2">Target Emergency Fund</div>
                        <div className="text-4xl font-bold text-slate-800">${calculatedTarget.toLocaleString()}</div>
                    </div>

                    <button 
                        onClick={saveConfiguration}
                        className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-black transition"
                    >
                        Set This Goal
                    </button>
                </div>
            </div>
        )}

        {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-6 rounded-xl border-2 flex flex-col justify-between ${getStatusColor()}`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <ShieldAlert size={20} /> Safety Net Status
                            </h3>
                            <p className="text-sm opacity-80 mt-1">{status.desc}</p>
                        </div>
                        <div className="bg-white/50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                            {status.label}
                        </div>
                    </div>
                    
                    <div className="mt-8">
                        <div className="flex justify-between text-sm font-bold mb-2">
                            <span>${totalSavings.toLocaleString()} Saved</span>
                            <span>Target: ${savingsConfig.targetAmount.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-black/10 h-3 rounded-full overflow-hidden">
                            <div className="h-full bg-current transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="mt-2 text-xs opacity-75 text-right">
                            {progress}% Complete
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <div className="text-sm text-slate-500">Projected Completion</div>
                            <div className="text-xl font-bold text-slate-800">
                                {monthsToGoal > 0 ? `${monthsToGoal} Months` : 'Goal Reached!'}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-600 leading-relaxed">
                        {progress < 50 ? (
                            <div className="flex items-start gap-2 text-rose-600">
                                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                                <span><strong>Warning:</strong> Your fund is below 50%. We have activated "Pause Wants" mode. Avoid non-essential spending.</span>
                            </div>
                        ) : progress >= 100 ? (
                            <div className="flex items-start gap-2 text-emerald-600">
                                <CheckCircle size={16} className="shrink-0 mt-0.5" />
                                <span><strong>Congratulations!</strong> Your shock absorber is fully inflated. Redirect all future savings into Investments for growth.</span>
                            </div>
                        ) : (
                            <div className="flex items-start gap-2 text-amber-600">
                                <TrendingUp size={16} className="shrink-0 mt-0.5" />
                                <span><strong>Building Phase:</strong> Keep adding ${monthlySavingsRate}/mo. Any bonuses should go here first.</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 md:col-span-2">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Wallet size={18} className="text-slate-400" /> Fund Allocation (Where is the money?)
                    </h3>
                    <div className="space-y-3">
                         {assets.filter(a => a.type === 'Saving').length === 0 && (
                             <p className="text-slate-400 text-sm italic">No 'Saving' assets found. Go to Wealth tab and add Liquid Funds/Savings Accounts.</p>
                         )}
                         {assets.filter(a => a.type === 'Saving').map(asset => (
                             <div key={asset.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg hover:bg-slate-50">
                                 <div className="font-medium text-slate-700">{asset.name}</div>
                                 <div className="font-bold text-emerald-600">${asset.value.toLocaleString()}</div>
                             </div>
                         ))}
                         <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border-t border-slate-200 mt-2">
                             <div className="font-bold text-slate-800">Total Liquid Savings</div>
                             <div className="font-bold text-slate-900 text-lg">${totalSavings.toLocaleString()}</div>
                         </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default SavingsEngine;