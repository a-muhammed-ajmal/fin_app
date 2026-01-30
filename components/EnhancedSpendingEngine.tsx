import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { TransactionType, MasterCategory, Necessity } from '../types';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { 
  ShoppingCart, AlertTriangle, Clock, Trash2, Plus, TrendingUp
} from 'lucide-react';

const EnhancedSpendingEngine = () => {
  const { transactions, addTransaction, wishlist, addWishlistItem, deleteWishlistItem } = useData();
  const [activeTab, setActiveTab] = useState<'allocator' | 'tracker' | 'wishlist' | 'analysis'>('allocator');

  // Monthly data
  const currentMonth = new Date().toISOString().substring(0, 7);
  const monthTransactions = transactions.filter(t => t.date.substring(0, 7) === currentMonth);

  const monthlyIncome = monthTransactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, t) => acc + t.amount, 0) || 5000; // Default for demo

  // Master category expenses
  const consumption = monthTransactions
    .filter(t => t.masterCategory === MasterCategory.CONSUMPTION)
    .reduce((acc, t) => acc + t.amount, 0);
  const commitment = monthTransactions
    .filter(t => t.masterCategory === MasterCategory.COMMITMENT)
    .reduce((acc, t) => acc + t.amount, 0);
  const safety = monthTransactions
    .filter(t => t.masterCategory === MasterCategory.SAFETY)
    .reduce((acc, t) => acc + t.amount, 0);
  const growth = monthTransactions
    .filter(t => t.masterCategory === MasterCategory.GROWTH)
    .reduce((acc, t) => acc + t.amount, 0);

  // Allocator state
  const [allocSafety, setAllocSafety] = useState(15);
  const [allocGrowth, setAllocGrowth] = useState(10);

  const allocSpending = 100 - allocSafety - allocGrowth;
  const amountSafety = Math.round(monthlyIncome * (allocSafety / 100));
  const amountGrowth = Math.round(monthlyIncome * (allocGrowth / 100));
  const amountSpending = monthlyIncome - amountSafety - amountGrowth;

  // Tracker state
  const [txAmount, setTxAmount] = useState('');
  const [txDesc, setTxDesc] = useState('');
  const [txMasterCat, setTxMasterCat] = useState<MasterCategory>(MasterCategory.CONSUMPTION);
  const [txSubCat, setTxSubCat] = useState('');
  const [txNecessity, setTxNecessity] = useState<Necessity>(Necessity.NEED);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txAmount || !txDesc) return;

    addTransaction({
      amount: parseFloat(txAmount),
      description: txDesc,
      type: TransactionType.EXPENSE,
      category: txSubCat || txMasterCat,
      masterCategory: txMasterCat,
      necessity: txMasterCat === MasterCategory.CONSUMPTION ? txNecessity : undefined,
      date: new Date().toISOString()
    });

    setTxAmount('');
    setTxDesc('');
    setTxSubCat('');
  };

  // Wishlist
  const [wishName, setWishName] = useState('');
  const [wishAmount, setWishAmount] = useState('');
  const [wishDeadline, setWishDeadline] = useState('');

  const handleAddWishlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishName || !wishAmount) return;

    addWishlistItem({
      name: wishName,
      amount: parseFloat(wishAmount),
      category: MasterCategory.CONSUMPTION,
      createdAt: new Date().toISOString(),
      note: wishDeadline ? `Deadline: ${new Date(wishDeadline).toLocaleDateString()}` : ''
    });

    setWishName('');
    setWishAmount('');
    setWishDeadline('');
  };

  // Analysis
  const consumptionNeeds = monthTransactions
    .filter(t => t.masterCategory === MasterCategory.CONSUMPTION && t.necessity === Necessity.NEED)
    .reduce((acc, t) => acc + t.amount, 0);
  const consumptionWants = consumption - consumptionNeeds;

  const bucketData = [
    { name: 'Consumption', value: consumption, color: '#3b82f6' },
    { name: 'Commitment', value: commitment, color: '#ef4444' },
    { name: 'Safety', value: safety, color: '#f59e0b' },
    { name: 'Growth', value: growth, color: '#10b981' }
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        {[
          { id: 'allocator', label: '💰 Pay Yourself First', icon: TrendingUp },
          { id: 'tracker', label: '📝 Log Expense', icon: ShoppingCart },
          { id: 'wishlist', label: '⏰ 24-Hour Pause', icon: Clock },
          { id: 'analysis', label: '📊 Spending Analysis', icon: AlertTriangle },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-indigo-600 text-indigo-700'
                : 'border-b-2 border-transparent text-slate-600 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- ALLOCATOR TAB --- */}
      {activeTab === 'allocator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Allocation Controls */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">Monthly Income Allocation</h3>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">Monthly Income</label>
                <div className="text-3xl font-bold text-indigo-600">${monthlyIncome.toLocaleString()}</div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-amber-600">Safety & Protection</label>
                  <span className="text-sm font-bold">{allocSafety}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={allocSafety}
                  onChange={(e) => setAllocSafety(Math.min(parseInt(e.target.value), 100 - allocGrowth))}
                  className="w-full h-2 bg-amber-100 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-right text-sm text-amber-600 font-mono mt-1">${amountSafety.toLocaleString()}</div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-emerald-600">Growth & Investment</label>
                  <span className="text-sm font-bold">{allocGrowth}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={allocGrowth}
                  onChange={(e) => setAllocGrowth(Math.min(parseInt(e.target.value), 100 - allocSafety))}
                  className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-right text-sm text-emerald-600 font-mono mt-1">${amountGrowth.toLocaleString()}</div>
              </div>

              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-indigo-700">Spending Budget (Remainder)</label>
                  <span className="text-sm font-bold">{allocSpending}%</span>
                </div>
                <div className="text-2xl font-bold text-indigo-600">${amountSpending.toLocaleString()}</div>
                <p className="text-xs text-indigo-600 mt-2">This is your maximum for Consumption + Commitment.</p>
              </div>
            </div>
          </div>

          {/* Visualization */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-2">
            <h3 className="font-bold text-slate-800 mb-4">The Golden Formula</h3>
            <div className="space-y-6">
              {/* Pie Chart */}
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Safety', value: allocSafety },
                        { name: 'Growth', value: allocGrowth },
                        { name: 'Spending', value: allocSpending }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      dataKey="value"
                    >
                      <Cell fill="#f59e0b" />
                      <Cell fill="#10b981" />
                      <Cell fill="#3b82f6" />
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Formula */}
              <div className="space-y-2 text-sm">
                <div className="p-3 bg-slate-50 rounded border border-slate-200 font-mono">
                  <div className="text-indigo-600 font-bold">Income:</div>
                  <div className="text-slate-700">${monthlyIncome.toLocaleString()}</div>
                </div>
                <div className="text-center text-slate-400">−</div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200 font-mono">
                  <div className="text-amber-600 font-bold">Safety:</div>
                  <div className="text-slate-700">${amountSafety.toLocaleString()}</div>
                  <div className="text-emerald-600 font-bold mt-1">Growth:</div>
                  <div className="text-slate-700">${amountGrowth.toLocaleString()}</div>
                </div>
                <div className="text-center text-slate-400">=</div>
                <div className="p-3 bg-indigo-50 rounded border border-indigo-200 font-mono">
                  <div className="text-indigo-600 font-bold">Allowable Spending:</div>
                  <div className="text-indigo-900 text-lg">${amountSpending.toLocaleString()}</div>
                </div>
              </div>

              <p className="text-xs text-slate-500 italic p-3 bg-blue-50 rounded">
                ✅ <strong>Remember:</strong> This is your budget for both Consumption (living) and Commitment (debt payments). Don't spend beyond this!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- TRACKER TAB --- */}
      {activeTab === 'tracker' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Expense Form */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Plus size={16} className="text-indigo-600" /> Add Expense
            </h3>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Amount</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Description</label>
                <input
                  type="text"
                  placeholder="e.g., Grocery shopping"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Master Category</label>
                <select
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  value={txMasterCat}
                  onChange={(e) => setTxMasterCat(e.target.value as MasterCategory)}
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
                  placeholder="e.g., Groceries, Utilities"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  value={txSubCat}
                  onChange={(e) => setTxSubCat(e.target.value)}
                />
              </div>

              {txMasterCat === MasterCategory.CONSUMPTION && (
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Type</label>
                  <select
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    value={txNecessity}
                    onChange={(e) => setTxNecessity(e.target.value as Necessity)}
                  >
                    <option value={Necessity.NEED}>Need (Essential)</option>
                    <option value={Necessity.WANT}>Want (Optional)</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
              >
                Record Expense
              </button>
            </form>
          </div>

          {/* Recent Expenses */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">Recent Expenses</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {monthTransactions
                .filter(t => t.type === TransactionType.EXPENSE)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 10)
                .map(t => (
                  <div key={t.id} className="flex justify-between items-start p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-slate-800">{t.description}</div>
                      <div className="text-xs text-slate-500 flex gap-2 flex-wrap mt-1">
                        <span>{new Date(t.date).toLocaleDateString()}</span>
                        {t.masterCategory && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-100 text-indigo-700">
                            {t.masterCategory}
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
                    <span className="font-bold text-slate-700">−${t.amount.toLocaleString()}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* --- WISHLIST TAB (24-Hour Pause) --- */}
      {activeTab === 'wishlist' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Clock size={18} className="text-amber-600" /> Add to Wishlist
            </h3>
            <p className="text-xs text-slate-500 mb-4">Pause before buying "Wants". Wait 24 hours to reconsider.</p>
            
            <form onSubmit={handleAddWishlist} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Item Name</label>
                <input
                  type="text"
                  placeholder="e.g., New Laptop"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  value={wishName}
                  onChange={(e) => setWishName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Amount</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  value={wishAmount}
                  onChange={(e) => setWishAmount(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">24-Hour Deadline</label>
                <input
                  type="date"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  value={wishDeadline}
                  onChange={(e) => setWishDeadline(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition"
              >
                Add to Holding Area
              </button>
            </form>
          </div>

          <div className="lg:col-span-2">
            <h3 className="font-bold text-slate-800 mb-4">Wishlist (Items on Hold)</h3>
            {wishlist.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wishlist.map(item => {
                  const createdDate = new Date(item.createdAt);
                  const deadlineDate = new Date(createdDate.getTime() + 24 * 60 * 60 * 1000);
                  const hoursLeft = Math.max(0, Math.round((deadlineDate.getTime() - new Date().getTime()) / (1000 * 60 * 60)));
                  const isExpired = hoursLeft === 0;

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-lg border ${
                        isExpired ? 'bg-slate-50 border-slate-200' : 'bg-amber-50 border-amber-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-800">{item.name}</h4>
                        <button
                          onClick={() => deleteWishlistItem(item.id)}
                          className="text-rose-400 hover:text-rose-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="text-2xl font-bold text-slate-800 mb-2">${item.amount.toLocaleString()}</div>

                      {!isExpired ? (
                        <div className="bg-white rounded p-2 text-center">
                          <div className="text-xs text-amber-600 font-bold uppercase">{hoursLeft}h Left</div>
                          <div className="text-xs text-amber-600">Think before buying...</div>
                        </div>
                      ) : (
                        <div className="bg-slate-100 rounded p-2 text-center">
                          <div className="text-xs text-slate-600 font-bold">24 Hours Passed</div>
                          <div className="text-xs text-slate-600">Still want it?</div>
                        </div>
                      )}

                      {item.note && (
                        <p className="text-xs text-slate-500 mt-2 italic">{item.note}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <Clock size={32} className="mx-auto mb-2 opacity-50" />
                <p>No items on hold. Great impulse control!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- ANALYSIS TAB --- */}
      {activeTab === 'analysis' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 4-Bucket Breakdown */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">Monthly 4-Bucket Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bucketData.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {bucketData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Need vs Want Analysis */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">Consumption: Need vs Want</h3>
            {consumption > 0 ? (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Needs</span>
                    <span className="text-sm font-bold text-emerald-600">
                      {Math.round((consumptionNeeds / consumption) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${(consumptionNeeds / consumption) * 100}%` }}
                    />
                  </div>
                  <div className="text-right text-sm text-emerald-600 font-mono mt-1">
                    ${consumptionNeeds.toLocaleString()}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Wants</span>
                    <span className="text-sm font-bold text-rose-600">
                      {Math.round((consumptionWants / consumption) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all"
                      style={{ width: `${(consumptionWants / consumption) * 100}%` }}
                    />
                  </div>
                  <div className="text-right text-sm text-rose-600 font-mono mt-1">
                    ${consumptionWants.toLocaleString()}
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">
                  <strong>Insight:</strong> Your consumption is {Math.round((consumptionWants / consumption) * 100)}% "Wants". Consider redirecting this to Safety or Growth.
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>No consumption expenses yet.</p>
              </div>
            )}
          </div>

          {/* Bucket Details */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Consumption (Living)', value: consumption, color: 'blue' },
              { label: 'Commitment (Debt)', value: commitment, color: 'red' },
              { label: 'Safety (Protection)', value: safety, color: 'amber' },
              { label: 'Growth (Investing)', value: growth, color: 'emerald' }
            ].map(bucket => (
              <div key={bucket.label} className={`bg-${bucket.color}-50 p-4 rounded-lg border border-${bucket.color}-100`}>
                <div className={`text-xs font-bold text-${bucket.color}-600 uppercase mb-1`}>{bucket.label}</div>
                <div className={`text-2xl font-bold text-${bucket.color}-900`}>${bucket.value.toLocaleString()}</div>
                <div className={`text-xs text-${bucket.color}-600 mt-1`}>
                  {monthlyIncome > 0 ? Math.round((bucket.value / monthlyIncome) * 100) : 0}% of income
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedSpendingEngine;
