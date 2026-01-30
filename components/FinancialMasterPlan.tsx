import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { TransactionType, FinancialPlan } from '../types';
import { AlertCircle, CheckCircle2, AlertTriangle, TrendingUp, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FinancialMasterPlan = () => {
  const { 
    transactions, liabilities, investments, assets, 
    insurancePolicies, goals 
  } = useData();
  const [activePhase, setActivePhase] = useState<'audit' | 'plan1' | 'plan2' | 'plan3'>('audit');

  // Calculate monthly metrics
  const currentMonth = new Date().toISOString().substring(0, 7);
  const monthTransactions = transactions.filter(t => t.date.substring(0, 7) === currentMonth);
  
  const monthlyIncome = monthTransactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, t) => acc + t.amount, 0) || 5000;

  const monthlyExpense = monthTransactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, t) => acc + t.amount, 0);

  const totalEMI = liabilities.reduce((acc, l) => acc + l.monthlyPayment, 0);
  const totalInsurancePremium = insurancePolicies.reduce((acc, p) => acc + (p.premium / 12), 0);

  const totalSavings = assets.filter(a => a.type === 'Saving').reduce((acc, a) => acc + a.value, 0);
  const totalInvestments = assets.filter(a => a.type === 'Investment').reduce((acc, a) => acc + a.value, 0) +
    (investments ? investments.reduce((acc, i) => acc + i.currentValue, 0) : 0);
  const totalLiabilities = liabilities.reduce((acc, l) => acc + (l.totalAmount - l.paidAmount), 0);
  
  const netWorth = totalSavings + totalInvestments - totalLiabilities;

  // KPIs
  const emiToIncomeRatio = monthlyIncome > 0 ? (totalEMI / monthlyIncome) * 100 : 0;
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100 : 0;
  const hasEmergencyFund = totalSavings > monthlyExpense * 3;
  const hasProperInsurance = insurancePolicies.length >= 2; // At least Health + Life

  const getHealthStatus = (): 'Green' | 'Yellow' | 'Red' => {
    if (emiToIncomeRatio > 50) return 'Red';
    if (emiToIncomeRatio > 40 || !hasEmergencyFund) return 'Yellow';
    if (totalLiabilities > 0 && totalInvestments === 0) return 'Yellow';
    return 'Green';
  };

  const healthStatus = getHealthStatus();
  const healthColor = healthStatus === 'Green' ? 'emerald' : healthStatus === 'Yellow' ? 'amber' : 'rose';

  const redFlags = useMemo(() => {
    const flags: string[] = [];
    if (emiToIncomeRatio > 40) flags.push(`EMI burden is ${emiToIncomeRatio.toFixed(1)}% (Safe: <40%)`);
    if (!hasEmergencyFund) flags.push('Emergency fund below 3 months of expenses');
    if (!hasProperInsurance) flags.push('Missing critical insurance (Health/Life)');
    if (totalLiabilities > netWorth) flags.push('Debt exceeds assets');
    if (savingsRate < 10) flags.push('Savings rate below 10% target');
    return flags;
  }, [emiToIncomeRatio, hasEmergencyFund, hasProperInsurance, totalLiabilities, netWorth, savingsRate]);

  // Plan 1: Today's Safety Plan
  const plan1Status = !hasEmergencyFund || !hasProperInsurance ? 'Red' : 'Green';
  const plan1Actions = [];
  if (!hasEmergencyFund) plan1Actions.push(`Build emergency fund to $${(monthlyExpense * 6).toLocaleString()}`);
  if (!hasProperInsurance) plan1Actions.push('Secure Health Insurance + Term Life Insurance');
  if (emiToIncomeRatio > 40) plan1Actions.push('Focus on EMI reduction before investing');

  // Plan 2: Future Goals Plan
  const totalGoalCost = goals.reduce((acc, g) => acc + (g.futureValue || 0), 0);
  const totalGoalInvested = totalInvestments;
  const plan2Progress = totalGoalCost > 0 ? (totalGoalInvested / totalGoalCost) * 100 : 0;
  const plan2Status = plan2Progress >= 50 ? 'Green' : plan2Progress >= 25 ? 'Yellow' : 'Red';

  // Plan 3: Lifestyle Goals Plan
  const monthlyNetWorthGrowth = savingsRate > 0 ? (monthlyIncome * (savingsRate / 100)) : 0;
  const plan3CanStart = healthStatus === 'Green' && plan2Progress >= 50;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 text-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold mb-2">Financial Master Plan</h2>
        <p className="text-indigo-200">3-Phase Framework: Safety → Goals → Dreams</p>
      </div>

      {/* Phase Navigation */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-1 mb-6">
        {[
          { id: 'audit', label: 'Financial Audit', icon: AlertCircle },
          { id: 'plan1', label: 'Phase 1: Safety', icon: Target },
          { id: 'plan2', label: 'Phase 2: Goals', icon: TrendingUp },
          { id: 'plan3', label: 'Phase 3: Lifestyle', icon: '✨' },
        ].map(phase => (
          <button
            key={phase.id}
            onClick={() => setActivePhase(phase.id as any)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
              activePhase === phase.id
                ? 'border-b-2 border-indigo-600 text-indigo-700'
                : 'border-b-2 border-transparent text-slate-600 hover:text-slate-800'
            }`}
          >
            {typeof phase.icon === 'string' ? phase.icon : <phase.icon size={16} />}
            {phase.label}
          </button>
        ))}
      </div>

      {/* --- AUDIT TAB --- */}
      {activePhase === 'audit' && (
        <div className="space-y-6">
          {/* Health Status Card */}
          <div className={`bg-${healthColor}-50 border-2 border-${healthColor}-200 p-8 rounded-2xl`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className={`text-2xl font-bold text-${healthColor}-900 mb-2`}>
                  Financial Health: {healthStatus}
                </h3>
                <p className={`text-${healthColor}-700`}>
                  {healthStatus === 'Green' && 'Your financial foundation is solid. Ready to focus on growth.'}
                  {healthStatus === 'Yellow' && 'Good progress, but address these concerns before investing heavily.'}
                  {healthStatus === 'Red' && 'Critical issues detected. Focus on safety and stability first.'}
                </p>
              </div>
              <div className={`text-5xl font-bold text-${healthColor}-600`}>
                {healthStatus === 'Green' ? '✅' : healthStatus === 'Yellow' ? '⚠️' : '🚨'}
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-slate-100">
              <div className="text-xs text-slate-500 uppercase font-bold mb-1">EMI/Income Ratio</div>
              <div className={`text-3xl font-bold ${emiToIncomeRatio > 40 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {emiToIncomeRatio.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-500 mt-1">Safe: &lt;40%</div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-100">
              <div className="text-xs text-slate-500 uppercase font-bold mb-1">Savings Rate</div>
              <div className={`text-3xl font-bold ${savingsRate < 10 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {savingsRate.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-500 mt-1">Target: 15%+</div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-100">
              <div className="text-xs text-slate-500 uppercase font-bold mb-1">Emergency Fund</div>
              <div className={`text-3xl font-bold ${hasEmergencyFund ? 'text-emerald-600' : 'text-rose-600'}`}>
                {(totalSavings / monthlyExpense).toFixed(1)}mo
              </div>
              <div className="text-xs text-slate-500 mt-1">Target: 6mo</div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-100">
              <div className="text-xs text-slate-500 uppercase font-bold mb-1">Net Worth</div>
              <div className={`text-3xl font-bold ${netWorth > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                ${(netWorth / 1000).toFixed(0)}k
              </div>
              <div className="text-xs text-slate-500 mt-1">Assets - Liabilities</div>
            </div>
          </div>

          {/* Red Flags */}
          {redFlags.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-6">
              <h4 className="font-bold text-rose-900 mb-3 flex items-center gap-2">
                <AlertTriangle size={20} /> Areas of Concern
              </h4>
              <ul className="space-y-2">
                {redFlags.map((flag, i) => (
                  <li key={i} className="text-rose-800 text-sm flex items-start gap-2">
                    <span className="text-rose-600 font-bold mt-0.5">•</span>
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Financial Overview Chart */}
          <div className="bg-white p-6 rounded-lg border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">Income vs Outflow</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      name: 'Monthly',
                      Income: monthlyIncome,
                      'Total Expense': monthlyExpense,
                      'EMI': totalEMI
                    }
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="Income" fill="#10b981" />
                  <Bar dataKey="Total Expense" fill="#ef4444" />
                  <Bar dataKey="EMI" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* --- PLAN 1: TODAY'S SAFETY --- */}
      {activePhase === 'plan1' && (
        <div className="space-y-6">
          <div className={`bg-${plan1Status === 'Green' ? 'emerald' : 'rose'}-50 border border-${plan1Status === 'Green' ? 'emerald' : 'rose'}-200 p-6 rounded-lg`}>
            <h3 className={`text-xl font-bold text-${plan1Status === 'Green' ? 'emerald' : 'rose'}-900 mb-2`}>
              Phase 1: Today's Safety Plan
            </h3>
            <p className={`text-${plan1Status === 'Green' ? 'emerald' : 'rose'}-800`}>
              Fix immediate vulnerabilities. Build your safety net before pursuing growth.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Action Items */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-slate-100">
              <h4 className="font-bold text-slate-800 mb-4">Priority Actions</h4>
              <div className="space-y-3">
                {plan1Actions.length > 0 ? (
                  plan1Actions.map((action, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-200 text-rose-700 flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </div>
                      <span className="text-slate-700">{action}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-emerald-50 rounded-lg text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 size={20} /> All safety criteria met!
                  </div>
                )}
              </div>
            </div>

            {/* Status Summary */}
            <div className="space-y-4">
              <div className={`bg-${plan1Status === 'Green' ? 'emerald' : 'rose'}-50 p-4 rounded-lg border border-${plan1Status === 'Green' ? 'emerald' : 'rose'}-200`}>
                <div className={`text-sm font-bold text-${plan1Status === 'Green' ? 'emerald' : 'rose'}-900 mb-2`}>
                  Status: {plan1Status}
                </div>
                {plan1Status === 'Green' && (
                  <p className="text-sm text-emerald-800">✅ Your safety foundation is secure. Move to Phase 2.</p>
                )}
                {plan1Status === 'Red' && (
                  <p className="text-sm text-rose-800">⚠️ Address these items before moving forward.</p>
                )}
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-100">
                <div className="text-xs font-bold text-slate-500 uppercase mb-2">Emergency Fund Target</div>
                <div className="text-2xl font-bold text-slate-800">${(monthlyExpense * 6).toLocaleString()}</div>
                <div className="w-full h-2 bg-slate-100 rounded-full mt-2">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (totalSavings / (monthlyExpense * 6)) * 100)}%` }}
                  />
                </div>
                <div className="text-xs text-slate-600 mt-1">${totalSavings.toLocaleString()} saved</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- PLAN 2: FUTURE GOALS --- */}
      {activePhase === 'plan2' && (
        <div className="space-y-6">
          <div className={`bg-${plan2Status === 'Green' ? 'emerald' : plan2Status === 'Yellow' ? 'amber' : 'rose'}-50 border border-${plan2Status === 'Green' ? 'emerald' : plan2Status === 'Yellow' ? 'amber' : 'rose'}-200 p-6 rounded-lg`}>
            <h3 className={`text-xl font-bold text-${plan2Status === 'Green' ? 'emerald' : plan2Status === 'Yellow' ? 'amber' : 'rose'}-900 mb-2`}>
              Phase 2: Future Goals Plan
            </h3>
            <p className={`text-${plan2Status === 'Green' ? 'emerald' : plan2Status === 'Yellow' ? 'amber' : 'rose'}-800`}>
              Secure long-term must-haves: Retirement, Education, Health.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {goals.length > 0 ? (
                goals.map(goal => (
                  <div key={goal.id} className="bg-white p-4 rounded-lg border border-slate-100">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-slate-800">{goal.title}</h4>
                        <p className="text-xs text-slate-500">{goal.horizon} | Future Value: ${goal.futureValue?.toLocaleString()}</p>
                      </div>
                      <div className={`font-bold ${goal.progress >= 75 ? 'text-emerald-600' : goal.progress >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                        {goal.progress}%
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-slate-50 rounded-lg text-slate-600">
                  No goals defined. Create your first goal to get started.
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-100">
              <div className="text-xs font-bold text-slate-500 uppercase mb-2">Overall Progress</div>
              <div className="text-3xl font-bold text-indigo-600">{plan2Progress.toFixed(0)}%</div>
              <div className="w-full h-2 bg-slate-100 rounded-full mt-2">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${plan2Progress}%` }}
                />
              </div>
              <div className="text-xs text-slate-600 mt-2">
                ${totalGoalInvested.toLocaleString()} / ${totalGoalCost.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- PLAN 3: LIFESTYLE DREAMS --- */}
      {activePhase === 'plan3' && (
        <div className="space-y-6">
          <div className={`${plan3CanStart ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'} border p-6 rounded-lg`}>
            <h3 className="text-xl font-bold mb-2">Phase 3: Lifestyle & Dreams</h3>
            <p className={plan3CanStart ? 'text-emerald-800' : 'text-slate-600'}>
              {plan3CanStart
                ? '🎉 You\'ve built a solid foundation! Now plan for your dream lifestyle.'
                : '⏳ Complete Phases 1 & 2 first before focusing on aspirational goals.'}
            </p>
          </div>

          {plan3CanStart ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg border border-slate-100">
                <h4 className="font-bold text-slate-800 mb-4">Monthly Wealth Growth</h4>
                <div className="text-3xl font-bold text-emerald-600">${monthlyNetWorthGrowth.toLocaleString()}</div>
                <p className="text-sm text-slate-600 mt-2">
                  At this rate, you'll have ${(monthlyNetWorthGrowth * 12 * 5).toLocaleString()} in 5 years.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-slate-100">
                <h4 className="font-bold text-slate-800 mb-4">Recommended Lifestyle Budget</h4>
                <div className="text-3xl font-bold text-indigo-600">
                  ${Math.round(monthlyIncome * 0.75).toLocaleString()}/month
                </div>
                <p className="text-sm text-slate-600 mt-2">
                  Keeping safety & growth allocations, you have this to spend freely.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg">
              <h4 className="font-bold text-amber-900 mb-3">Path to Phase 3:</h4>
              <ul className="space-y-2 text-amber-800 text-sm">
                {healthStatus !== 'Green' && <li>✓ Achieve "Green" health status in Phase 1</li>}
                {plan2Progress < 50 && <li>✓ Reach 50% of financial goals in Phase 2</li>}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FinancialMasterPlan;
