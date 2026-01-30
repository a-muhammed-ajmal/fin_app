import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { TransactionType, MasterCategory, Necessity } from '../types';
import { 
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Plus, Calendar } from 'lucide-react';

const CashFlowTracker = () => {
  const { transactions, addTransaction } = useData();
  const [txAmount, setTxAmount] = useState('');
  const [txDesc, setTxDesc] = useState('');
  const [txType, setTxType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [masterCategory, setMasterCategory] = useState<MasterCategory>(MasterCategory.CONSUMPTION);
  const [subCategory, setSubCategory] = useState('');
  const [necessity, setNecessity] = useState<Necessity>(Necessity.NEED);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().substring(0, 7));

  // Calculations
  const monthTransactions = transactions.filter(t => t.date.substring(0, 7) === filterMonth);
  const monthlyIncome = monthTransactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, t) => acc + t.amount, 0);

  const consumptionExpense = monthTransactions
    .filter(t => t.type === TransactionType.EXPENSE && t.masterCategory === MasterCategory.CONSUMPTION)
    .reduce((acc, t) => acc + t.amount, 0);

  const commitmentExpense = monthTransactions
    .filter(t => t.type === TransactionType.EXPENSE && t.masterCategory === MasterCategory.COMMITMENT)
    .reduce((acc, t) => acc + t.amount, 0);

  const safetyExpense = monthTransactions
    .filter(t => t.type === TransactionType.EXPENSE && t.masterCategory === MasterCategory.SAFETY)
    .reduce((acc, t) => acc + t.amount, 0);

  const growthExpense = monthTransactions
    .filter(t => t.type === TransactionType.EXPENSE && t.masterCategory === MasterCategory.GROWTH)
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = consumptionExpense + commitmentExpense + safetyExpense + growthExpense;
  const cashLeft = monthlyIncome - totalExpense;

  // Get Need vs Want breakdown for Consumption
  const consumptionNeeds = monthTransactions
    .filter(t => 
      t.type === TransactionType.EXPENSE && 
      t.masterCategory === MasterCategory.CONSUMPTION && 
      t.necessity === Necessity.NEED
    )
    .reduce((acc, t) => acc + t.amount, 0);

  const consumptionWants = consumptionExpense - consumptionNeeds;

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txAmount || !txDesc) return;

    addTransaction({
      amount: parseFloat(txAmount),
      description: txDesc,
      type: txType,
      category: subCategory || masterCategory,
      masterCategory: txType === TransactionType.EXPENSE ? masterCategory : undefined,
      necessity: txType === TransactionType.EXPENSE ? necessity : undefined,
      date: new Date().toISOString()
    });

    setTxAmount('');
    setTxDesc('');
    setSubCategory('');
  };

  // Chart Data - Monthly Breakdown
  const monthlyBreakdown = [
    { name: 'Consumption', value: consumptionExpense, color: '#3b82f6' },
    { name: 'Commitment', value: commitmentExpense, color: '#ef4444' },
    { name: 'Safety', value: safetyExpense, color: '#f59e0b' },
    { name: 'Growth', value: growthExpense, color: '#10b981' }
  ];

  // Chart Data - Income vs Outflow
  const incomeVsOutflow = [
    { name: 'Income', value: monthlyIncome },
    { name: 'Expense', value: totalExpense },
    { name: 'Balance', value: Math.max(0, cashLeft) }
  ];

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
          <div className="text-xs text-emerald-600 uppercase font-bold tracking-wider mb-1">Income</div>
          <div className="text-2xl font-bold text-emerald-900">${monthlyIncome.toLocaleString()}</div>
          <div className="text-xs text-emerald-600 mt-1">Earned this month</div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <div className="text-xs text-red-600 uppercase font-bold tracking-wider mb-1">Expenses</div>
          <div className="text-2xl font-bold text-red-900">${totalExpense.toLocaleString()}</div>
          <div className="text-xs text-red-600 mt-1">Total outflow</div>
        </div>

        <div className={`${cashLeft >= 0 ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'} p-4 rounded-lg border`}>
          <div className={`text-xs ${cashLeft >= 0 ? 'text-green-600' : 'text-orange-600'} uppercase font-bold tracking-wider mb-1`}>
            {cashLeft >= 0 ? 'Cash Left' : 'Deficit'}
          </div>
          <div className={`text-2xl font-bold ${cashLeft >= 0 ? 'text-green-900' : 'text-orange-900'}`}>
            ${Math.abs(cashLeft).toLocaleString()}
          </div>
          <div className={`text-xs ${cashLeft >= 0 ? 'text-green-600' : 'text-orange-600'} mt-1`}>
            {cashLeft >= 0 ? 'Available' : 'Over budget'}
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="text-xs text-blue-600 uppercase font-bold tracking-wider mb-1">Savings Rate</div>
          <div className="text-2xl font-bold text-blue-900">
            {monthlyIncome > 0 ? Math.round((safetyExpense / monthlyIncome) * 100) : 0}%
          </div>
          <div className="text-xs text-blue-600 mt-1">Of income saved</div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div className="text-xs text-purple-600 uppercase font-bold tracking-wider mb-1">Investment Rate</div>
          <div className="text-2xl font-bold text-purple-900">
            {monthlyIncome > 0 ? Math.round((growthExpense / monthlyIncome) * 100) : 0}%
          </div>
          <div className="text-xs text-purple-600 mt-1">Of income invested</div>
        </div>
      </div>

      {/* Add Transaction & Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Transaction Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Plus size={16} className="text-indigo-600" /> Log Transaction
          </h3>
          <form onSubmit={handleAddTransaction} className="space-y-3">
            {/* Type */}
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">Type</label>
              <select
                className="w-full text-sm border border-slate-200 rounded p-2"
                value={txType}
                onChange={(e) => setTxType(e.target.value as TransactionType)}
              >
                <option value={TransactionType.INCOME}>Income</option>
                <option value={TransactionType.EXPENSE}>Expense</option>
              </select>
            </div>

            {/* Amount & Description */}
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">Amount</label>
              <input
                type="number"
                placeholder="0.00"
                className="w-full border border-slate-200 rounded p-2 text-sm"
                value={txAmount}
                onChange={(e) => setTxAmount(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">Description</label>
              <input
                type="text"
                placeholder="e.g., Grocery shopping"
                className="w-full border border-slate-200 rounded p-2 text-sm"
                value={txDesc}
                onChange={(e) => setTxDesc(e.target.value)}
              />
            </div>

            {/* Category Selection */}
            {txType === TransactionType.EXPENSE && (
              <>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Master Category</label>
                  <select
                    className="w-full text-sm border border-slate-200 rounded p-2"
                    value={masterCategory}
                    onChange={(e) => setMasterCategory(e.target.value as MasterCategory)}
                  >
                    {Object.values(MasterCategory).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Sub-Category</label>
                  <input
                    type="text"
                    placeholder="e.g., Groceries, Rent, Insurance"
                    className="w-full border border-slate-200 rounded p-2 text-sm"
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                  />
                </div>

                {/* Need vs Want for Consumption */}
                {masterCategory === MasterCategory.CONSUMPTION && (
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1 block">Type</label>
                    <select
                      className="w-full text-sm border border-slate-200 rounded p-2"
                      value={necessity}
                      onChange={(e) => setNecessity(e.target.value as Necessity)}
                    >
                      <option value={Necessity.NEED}>Need</option>
                      <option value={Necessity.WANT}>Want</option>
                    </select>
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded text-sm font-medium hover:bg-indigo-700 transition"
            >
              Add Entry
            </button>
          </form>
        </div>

        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* 4-Bucket Breakdown */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">4-Bucket Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={monthlyBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {monthlyBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Income vs Expense */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">Income vs Expense</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeVsOutflow}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Consumption Need vs Want Analysis */}
      {consumptionExpense > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">Need vs Want (Consumption)</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-sm text-slate-600 mb-1">Needs</div>
                  <div className="text-2xl font-bold text-emerald-600">${consumptionNeeds.toLocaleString()}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {consumptionExpense > 0 ? Math.round((consumptionNeeds / consumptionExpense) * 100) : 0}% of consumption
                  </div>
                </div>
                <div className="h-32 bg-emerald-100 rounded w-12" style={{ height: `${(consumptionNeeds / Math.max(consumptionNeeds, consumptionWants, 1)) * 128}px` }}></div>
              </div>

              <div className="h-px bg-slate-100"></div>

              <div className="flex justify-between items-end">
                <div>
                  <div className="text-sm text-slate-600 mb-1">Wants</div>
                  <div className="text-2xl font-bold text-rose-600">${consumptionWants.toLocaleString()}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {consumptionExpense > 0 ? Math.round((consumptionWants / consumptionExpense) * 100) : 0}% of consumption
                  </div>
                </div>
                <div className="h-32 bg-rose-100 rounded w-12" style={{ height: `${(consumptionWants / Math.max(consumptionNeeds, consumptionWants, 1)) * 128}px` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">The Golden Formula</h3>
            <div className="space-y-4 text-sm">
              <div className="p-3 bg-blue-50 rounded border border-blue-100">
                <div className="font-mono text-slate-700">
                  Monthly Income: <span className="font-bold text-emerald-600">${monthlyIncome.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-center text-slate-400">−</div>

              <div className="space-y-2 p-3 bg-indigo-50 rounded border border-indigo-100">
                <div className="font-mono text-slate-700">
                  Safety: <span className="font-bold text-amber-600">${safetyExpense.toLocaleString()}</span>
                </div>
                <div className="font-mono text-slate-700">
                  Growth: <span className="font-bold text-purple-600">${growthExpense.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-center text-slate-400">=</div>

              <div className="p-3 bg-emerald-50 rounded border border-emerald-100">
                <div className="font-mono text-slate-700">
                  Allowable Spending: <span className="font-bold text-emerald-600">${(monthlyIncome - safetyExpense - growthExpense).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-slate-700 bg-slate-50 flex justify-between items-center">
          <span>Recent Transactions</span>
          <select
            className="text-sm border border-slate-200 rounded px-2 py-1 bg-white"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            {[...Array(6)].map((_, i) => {
              const date = new Date();
              date.setMonth(date.getMonth() - i);
              const month = date.toISOString().substring(0, 7);
              return (
                <option key={month} value={month}>
                  {date.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                </option>
              );
            })}
          </select>
        </div>
        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
          {monthTransactions.length > 0 ? (
            monthTransactions.map(t => (
              <div key={t.id} className="flex justify-between items-start p-4 hover:bg-slate-50 transition">
                <div className="flex-1">
                  <div className="font-medium text-slate-800">{t.description}</div>
                  <div className="text-xs text-slate-500 flex gap-2 flex-wrap mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {new Date(t.date).toLocaleDateString()}
                    </span>
                    {t.masterCategory && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100">
                        {t.masterCategory}
                      </span>
                    )}
                    {t.category && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-100 text-indigo-700">
                        {t.category}
                      </span>
                    )}
                    {t.necessity && (
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        t.necessity === Necessity.NEED ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {t.necessity}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`font-bold whitespace-nowrap ml-4 ${
                  t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-600'
                }`}>
                  {t.type === TransactionType.INCOME ? '+' : '-'}${t.amount.toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500 text-sm">
              No transactions for {new Date(filterMonth + '-01').toLocaleDateString('default', { month: 'long', year: 'numeric' })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CashFlowTracker;
