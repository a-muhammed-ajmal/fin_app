
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { AssetClass, Investment, Goal, RiskProfile, LoanPurpose } from '../types';
import { 
  Lock, CheckCircle2, ShieldAlert, Target, Plus, 
  Trash2, TrendingUp, Activity, PieChart as PieIcon, 
  AlertTriangle, PlayCircle, Zap, Wallet, Calendar
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar 
} from 'recharts';

const InvestmentManager = () => {
  const { 
    investments, addInvestment, deleteInvestment, goals, addGoal, updateGoal, deleteGoal,
    savingsConfig, assets, liabilities, insurancePolicies, riskProfile, setRiskProfile 
  } = useData();

  const [activeTab, setActiveTab] = useState<'goals' | 'blueprint' | 'portfolio' | 'sip'>('goals');
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showRiskQuiz, setShowRiskQuiz] = useState(false);

  // --- HEALTH CHECK LOGIC ---
  const totalSavings = assets.filter(a => a.type === 'Saving').reduce((acc, c) => acc + c.value, 0);
  const emergencyCheck = savingsConfig.targetAmount > 0 && totalSavings >= (savingsConfig.targetAmount * 0.5); // At least 50% funded
  const insuranceCheck = insurancePolicies.length > 0;
  const debtCheck = !liabilities.some(l => l.interestRate > 12); // No high interest debt
  
  const isEligible = emergencyCheck && insuranceCheck && debtCheck;

  // --- RISK QUIZ ---
  const [quizScore, setQuizScore] = useState(0);
  const [quizStep, setQuizStep] = useState(0);
  const quizQuestions = [
      { q: "Market drops 20% in a month. You...", options: [{ t: "Panic Sell", s: 0 }, { t: "Wait it out", s: 5 }, { t: "Buy more", s: 10 }] },
      { q: "Investment Horizon?", options: [{ t: "< 3 Years", s: 0 }, { t: "3-7 Years", s: 5 }, { t: "> 10 Years", s: 10 }] },
      { q: "Goal Priority?", options: [{ t: "Safety First", s: 0 }, { t: "Beat Inflation", s: 5 }, { t: "Maximize Wealth", s: 10 }] }
  ];

  const handleQuizAnswer = (score: number) => {
      const newScore = quizScore + score;
      if (quizStep < quizQuestions.length - 1) {
          setQuizScore(newScore);
          setQuizStep(quizStep + 1);
      } else {
          let label: RiskProfile['label'] = 'Moderate';
          if (newScore <= 10) label = 'Conservative';
          else if (newScore >= 25) label = 'Aggressive';
          
          setRiskProfile({
              score: newScore,
              label,
              description: label === 'Aggressive' ? 'Heavy Equity focus.' : label === 'Conservative' ? 'Focus on Debt/Gold.' : 'Balanced approach.'
          });
          setShowRiskQuiz(false);
      }
  };

  // --- ADD GOAL ---
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
      title: '', currentCost: 0, yearsAway: 5, inflationRate: 6, isFinancial: true, tier: 'Freedom'
  });

  const calculateFutureValue = () => {
      const pv = newGoal.currentCost || 0;
      const r = (newGoal.inflationRate || 6) / 100;
      const n = newGoal.yearsAway || 1;
      return Math.round(pv * Math.pow(1 + r, n));
  };

  const calculateSIP = (fv: number) => {
      // Expected return based on years roughly
      const years = newGoal.yearsAway || 5;
      const expReturn = years < 3 ? 6 : years < 7 ? 10 : 12; 
      const r = expReturn / 12 / 100;
      const n = years * 12;
      return Math.round((fv * r) / (Math.pow(1 + r, n) - 1));
  };

  const handleSaveGoal = (e: React.FormEvent) => {
      e.preventDefault();
      const fv = calculateFutureValue();
      const sip = calculateSIP(fv);
      addGoal({
          ...newGoal as Goal,
          futureValue: fv,
          requiredSIP: sip,
          horizon: newGoal.yearsAway && newGoal.yearsAway > 7 ? '10+ Years' : newGoal.yearsAway && newGoal.yearsAway > 3 ? '5 Years' : '3 Years',
          progress: 0
      });
      setShowAddGoal(false);
      setNewGoal({ title: '', currentCost: 0, yearsAway: 5, inflationRate: 6, isFinancial: true, tier: 'Freedom' });
  };

  // --- LOCKED VIEW ---
  if (!isEligible) {
      return (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-100 rounded-xl border border-slate-200 text-center p-6">
              <Lock size={64} className="text-slate-400 mb-6" />
              <h2 className="text-3xl font-black text-slate-800 mb-2">Module Locked</h2>
              <p className="text-slate-500 max-w-md mb-8">
                  Investing without a foundation is gambling. Complete the Financial Health Check to unlock the Wealth Engine.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
                  <div className={`p-4 rounded-xl border-2 flex flex-col items-center ${emergencyCheck ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
                      {emergencyCheck ? <CheckCircle2 className="text-emerald-500 mb-2" /> : <ShieldAlert className="text-rose-500 mb-2" />}
                      <span className="font-bold text-sm">Emergency Fund</span>
                      <span className="text-xs mt-1">{emergencyCheck ? "Ready" : "Underfunded"}</span>
                  </div>
                  <div className={`p-4 rounded-xl border-2 flex flex-col items-center ${debtCheck ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
                      {debtCheck ? <CheckCircle2 className="text-emerald-500 mb-2" /> : <AlertTriangle className="text-rose-500 mb-2" />}
                      <span className="font-bold text-sm">High-Interest Debt</span>
                      <span className="text-xs mt-1">{debtCheck ? "Clear" : "Pending"}</span>
                  </div>
                  <div className={`p-4 rounded-xl border-2 flex flex-col items-center ${insuranceCheck ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
                      {insuranceCheck ? <CheckCircle2 className="text-emerald-500 mb-2" /> : <ShieldAlert className="text-rose-500 mb-2" />}
                      <span className="font-bold text-sm">Insurance</span>
                      <span className="text-xs mt-1">{insuranceCheck ? "Active" : "Missing"}</span>
                  </div>
              </div>
          </div>
      );
  }

  // --- UNLOCKED VIEW ---
  
  // Helpers
  const financialGoals = goals.filter(g => g.isFinancial);
  const totalTargetSIP = financialGoals.reduce((acc, g) => acc + (g.requiredSIP || 0), 0);
  const totalActualSIP = investments.filter(i => i.isSIP).reduce((acc, i) => acc + (i.monthlySIPAmount || 0), 0);
  
  // Chart Colors
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

  return (
    <div className="space-y-6">
        {/* Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
            {[
                { id: 'goals', label: '1. Goal Planner', icon: Target },
                { id: 'blueprint', label: '2. The Blueprint', icon: PieIcon },
                { id: 'portfolio', label: '3. Portfolio', icon: Wallet },
                { id: 'sip', label: '4. SIP Engine', icon: Activity },
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

        {/* --- GOAL PLANNER --- */}
        {activeTab === 'goals' && (
            <div className="space-y-6">
                {!riskProfile && (
                    <div className="bg-indigo-600 text-white p-6 rounded-xl shadow-lg flex justify-between items-center animate-in slide-in-from-top-4">
                        <div>
                            <h3 className="font-bold text-lg">Know Thyself</h3>
                            <p className="text-indigo-200 text-sm">Take the 30-second Risk Profiler to generate your investment blueprint.</p>
                        </div>
                        <button 
                            onClick={() => { setShowRiskQuiz(true); setQuizStep(0); setQuizScore(0); }}
                            className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-bold hover:bg-indigo-50"
                        >
                            Start Quiz
                        </button>
                    </div>
                )}

                {showRiskQuiz && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                            <h3 className="text-xl font-bold mb-4">Question {quizStep + 1}/3</h3>
                            <p className="text-lg mb-6">{quizQuestions[quizStep].q}</p>
                            <div className="space-y-3">
                                {quizQuestions[quizStep].options.map((opt, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => handleQuizAnswer(opt.s)}
                                        className="w-full text-left p-4 border rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition"
                                    >
                                        {opt.t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Add Goal Card */}
                    <button 
                        onClick={() => setShowAddGoal(true)}
                        className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition min-h-[200px]"
                    >
                        <Plus size={32} className="mb-2" />
                        <span className="font-bold">Add Financial Goal</span>
                    </button>

                    {/* Goal Cards */}
                    {financialGoals.map(goal => (
                        <div key={goal.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">{goal.title}</h3>
                                    <p className="text-xs text-slate-500">{goal.yearsAway} Years Away</p>
                                </div>
                                <div className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold">
                                    Target: ${(goal.futureValue || 0).toLocaleString()}
                                </div>
                            </div>
                            
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Inflation Impact</span>
                                    <span className="text-rose-500 font-medium">+{(goal.futureValue! - (goal.currentCost || 0)).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                    <span className="font-bold text-slate-700">Required SIP</span>
                                    <span className="text-emerald-600 font-bold text-lg">${(goal.requiredSIP || 0).toLocaleString()}/mo</span>
                                </div>
                                 <div className="flex justify-between items-center">
                                    <span className="text-slate-500 text-xs">Priority</span>
                                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${goal.tier === 'Freedom' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'}`}>{goal.tier}</span>
                                </div>
                            </div>

                            <button 
                                onClick={() => deleteGoal(goal.id)}
                                className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Add Goal Modal/Form */}
                {showAddGoal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl">
                            <h3 className="text-xl font-bold mb-4">Define Your Goal</h3>
                            <form onSubmit={handleSaveGoal} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Goal Name</label>
                                    <input 
                                        className="w-full border rounded p-2"
                                        placeholder="e.g. Daughter's Education"
                                        value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Priority Tier</label>
                                    <div className="flex gap-2">
                                        <button 
                                            type="button"
                                            className={`flex-1 py-2 rounded text-sm font-medium border ${newGoal.tier === 'Freedom' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-slate-200 text-slate-500'}`}
                                            onClick={() => setNewGoal({...newGoal, tier: 'Freedom'})}
                                        >
                                            Freedom (Must-Have)
                                        </button>
                                        <button 
                                            type="button"
                                            className={`flex-1 py-2 rounded text-sm font-medium border ${newGoal.tier === 'Lifestyle' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'border-slate-200 text-slate-500'}`}
                                            onClick={() => setNewGoal({...newGoal, tier: 'Lifestyle'})}
                                        >
                                            Lifestyle (Dream)
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Cost Today</label>
                                        <input 
                                            type="number" className="w-full border rounded p-2"
                                            value={newGoal.currentCost} onChange={e => setNewGoal({...newGoal, currentCost: parseFloat(e.target.value)})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Years Away</label>
                                        <input 
                                            type="number" className="w-full border rounded p-2"
                                            value={newGoal.yearsAway} onChange={e => setNewGoal({...newGoal, yearsAway: parseFloat(e.target.value)})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Expected Inflation (%)</label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="range" min="4" max="10" className="flex-1 accent-rose-500"
                                            value={newGoal.inflationRate} onChange={e => setNewGoal({...newGoal, inflationRate: parseInt(e.target.value)})}
                                        />
                                        <span className="font-bold text-rose-500">{newGoal.inflationRate}%</span>
                                    </div>
                                </div>
                                
                                <div className="bg-slate-50 p-4 rounded-xl text-center space-y-2">
                                    <div className="text-xs text-slate-500">Projected Future Cost</div>
                                    <div className="text-2xl font-bold text-indigo-700">${calculateFutureValue().toLocaleString()}</div>
                                    <div className="text-xs text-slate-400">You need to save ${calculateSIP(calculateFutureValue()).toLocaleString()}/mo</div>
                                </div>

                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setShowAddGoal(false)} className="flex-1 py-2 rounded text-slate-500 hover:bg-slate-100">Cancel</button>
                                    <button type="submit" className="flex-1 bg-slate-900 text-white py-2 rounded font-bold hover:bg-black">Save Goal</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* --- BLUEPRINT (ASSET ALLOCATION) --- */}
        {activeTab === 'blueprint' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Activity className="text-indigo-600" /> Recommended Allocation
                    </h3>
                    <div className="space-y-6">
                        {financialGoals.map(goal => {
                            let allocation = { equity: 0, debt: 0, gold: 0 };
                            // Allocation Logic based on Horizon + Risk
                            if ((goal.yearsAway || 0) < 3) {
                                allocation = { equity: 10, debt: 80, gold: 10 };
                            } else if ((goal.yearsAway || 0) < 7) {
                                allocation = { equity: 40, debt: 40, gold: 20 };
                            } else {
                                allocation = { equity: riskProfile?.label === 'Conservative' ? 60 : 80, debt: 10, gold: riskProfile?.label === 'Conservative' ? 30 : 10 };
                            }

                            return (
                                <div key={goal.id} className="bg-slate-50 p-4 rounded-lg">
                                    <div className="flex justify-between text-sm font-bold mb-2">
                                        <span>{goal.title}</span>
                                        <span className="text-slate-500">{goal.yearsAway}y Horizon</span>
                                    </div>
                                    <div className="flex h-4 rounded-full overflow-hidden">
                                        <div className="bg-emerald-500" style={{ width: `${allocation.equity}%` }} title={`Equity ${allocation.equity}%`}></div>
                                        <div className="bg-blue-500" style={{ width: `${allocation.debt}%` }} title={`Debt ${allocation.debt}%`}></div>
                                        <div className="bg-amber-400" style={{ width: `${allocation.gold}%` }} title={`Gold ${allocation.gold}%`}></div>
                                    </div>
                                    <div className="flex gap-4 mt-2 text-xs text-slate-500">
                                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Equity</span>
                                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Debt</span>
                                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400"></div> Gold</span>
                                    </div>
                                </div>
                            );
                        })}
                        {financialGoals.length === 0 && <div className="text-center text-slate-400">Add goals to see your blueprint.</div>}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Wallet className="text-emerald-600" /> Current Portfolio Check
                    </h3>
                    {/* Simplified Current Allocation View */}
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={[
                                        { name: 'Equity', value: investments.filter(i => i.assetClass === AssetClass.EQUITY).reduce((a,b) => a+b.currentValue, 0) },
                                        { name: 'Debt', value: investments.filter(i => i.assetClass === AssetClass.DEBT).reduce((a,b) => a+b.currentValue, 0) },
                                        { name: 'Gold', value: investments.filter(i => i.assetClass === AssetClass.COMMODITY).reduce((a,b) => a+b.currentValue, 0) },
                                    ]}
                                    cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                                >
                                    <Cell fill="#10b981" />
                                    <Cell fill="#3b82f6" />
                                    <Cell fill="#f59e0b" />
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-center text-xs text-slate-500 mt-2">Does this match your blueprint?</p>
                </div>
            </div>
        )}

        {/* --- PORTFOLIO (PRODUCT SELECTOR) --- */}
        {activeTab === 'portfolio' && (
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4">Product Selector</h3>
                    <p className="text-sm text-slate-500 mb-4">Map your investments to your goals. Every dollar must have a job.</p>
                    
                    <div className="grid gap-4">
                        {investments.map(inv => {
                            const linkedGoal = goals.find(g => g.id === inv.linkedGoalId);
                            return (
                                <div key={inv.id} className="flex justify-between items-center p-4 border rounded-xl hover:bg-slate-50">
                                    <div>
                                        <div className="font-bold text-slate-800">{inv.name}</div>
                                        <div className="text-xs text-slate-500 flex gap-2 mt-1">
                                            <span className="bg-slate-100 px-2 py-0.5 rounded">{inv.assetClass}</span>
                                            {linkedGoal ? (
                                                <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded flex items-center gap-1">
                                                    <Target size={10} /> {linkedGoal.title}
                                                </span>
                                            ) : (
                                                <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded flex items-center gap-1">
                                                    <AlertTriangle size={10} /> Unassigned
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold">${inv.currentValue.toLocaleString()}</div>
                                        <button 
                                            onClick={() => {
                                                const goalId = prompt("Enter Goal ID to link (or leave empty to unlink):", inv.linkedGoalId || "");
                                                // Simplified linking for UI
                                                // In real app, use a proper dropdown modal
                                            }}
                                            className="text-xs text-indigo-600 hover:underline mt-1"
                                        >
                                            {linkedGoal ? "Change Goal" : "Link to Goal"}
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                        <button className="py-3 border-2 border-dashed border-slate-200 text-slate-400 rounded-xl hover:border-indigo-300 hover:text-indigo-500 font-bold transition">
                            + Log New Investment
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- SIP ENGINE --- */}
        {activeTab === 'sip' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <TrendingUp className="text-indigo-600" /> Monthly SIP Tracker
                    </h3>
                    
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-slate-500 font-medium">Target SIP</span>
                                <span className="text-slate-800 font-bold">${totalTargetSIP.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                <div className="bg-indigo-200 h-full w-full"></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-slate-500 font-medium">Actual SIP</span>
                                <span className={`font-bold ${totalActualSIP >= totalTargetSIP ? 'text-emerald-600' : 'text-rose-500'}`}>${totalActualSIP.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full ${totalActualSIP >= totalTargetSIP ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                                    style={{ width: `${Math.min(100, (totalActualSIP / (totalTargetSIP || 1)) * 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        {totalActualSIP < totalTargetSIP && (
                            <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 flex gap-3 text-rose-800 text-sm">
                                <AlertTriangle className="shrink-0" />
                                <div>
                                    <strong>Deficit Alert:</strong> You are short by <strong>${(totalTargetSIP - totalActualSIP).toLocaleString()}</strong> monthly. 
                                    Consider a "Step-Up SIP" strategy (increase by 10% each year) to catch up.
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="font-bold text-lg mb-2">Panic Button Blocker</h3>
                        <p className="text-slate-400 text-sm mb-6">
                            Markets crashing? Red portfolio?
                        </p>
                        <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/10 mb-4">
                            <p className="font-serif italic text-lg leading-relaxed">
                                "Your goal is 15 years away. A 20% crash today is just a discount sale. Do NOT stop your SIPs."
                            </p>
                        </div>
                        <button className="w-full bg-rose-600 hover:bg-rose-700 py-2 rounded font-bold text-sm transition opacity-50 cursor-not-allowed" disabled>
                            Withdraw Funds (Locked)
                        </button>
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
                </div>
            </div>
        )}
    </div>
  );
};

export default InvestmentManager;
