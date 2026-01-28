import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { TransactionType, MasterCategory, Necessity, Transaction } from '../types';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { 
  ShoppingCart, ShieldCheck, TrendingUp, Landmark, 
  Clock, CheckCircle, AlertTriangle, PlayCircle, Lock, PauseCircle
} from 'lucide-react';

const SpendingEngine = () => {
  const { 
    transactions, addTransaction, 
    wishlist, addWishlistItem, deleteWishlistItem,
    savingsConfig, assets 
  } = useData();

  const [activeTab, setActiveTab] = useState<'tracker' | 'allocator' | 'wishlist' | 'audit'>('tracker');

  // --- Tracker State ---
  const [txAmount, setTxAmount] = useState('');
  const [txDesc, setTxDesc] = useState('');
  const [txMasterCat, setTxMasterCat] = useState<MasterCategory>(MasterCategory.CONSUMPTION);
  const [txNecessity, setTxNecessity] = useState<Necessity>(Necessity.NEED);
  const [txSubCat, setTxSubCat] = useState('');

  // --- Allocator State ---
  const [incomeInput, setIncomeInput] = useState(5000);
  const [safetyPercent, setSafetyPercent] = useState(15);
  const [growthPercent, setGrowthPercent] = useState(10);

  // --- Wishlist State ---
  const [wishName, setWishName] = useState('');
  const [wishAmount, setWishAmount] = useState('');

  // --- Savings Alert Logic ---
  const totalSavings = assets.filter(a => a.type === 'Saving').reduce((acc, c) => acc + c.value, 0);
  const savingsProgress = savingsConfig.targetAmount > 0 ? (totalSavings / savingsConfig.targetAmount) * 100 : 0;
  const showPauseWants = savingsConfig.isConfigured && savingsProgress < 50;

  // --- Helpers ---
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txAmount || !txDesc) return;
    
    // Auto-determine transaction type. If it is Growth or Safety, it is technically an expense (money leaving hand)
    // to an asset account, but for cashflow tracking, we log it as Expense so it deducts from "Cash in Hand".
    addTransaction({
        amount: parseFloat(txAmount),
        description: txDesc,
        type: TransactionType.EXPENSE,
        category: txSubCat || 'General',
        masterCategory: txMasterCat,
        necessity: (txMasterCat === MasterCategory.CONSUMPTION || txMasterCat === MasterCategory.COMMITMENT) ? txNecessity : undefined,
        date: new Date().toISOString()
    });
    setTxAmount(''); setTxDesc(''); setTxSubCat('');
  };

  const handleAddWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishName || !wishAmount) return;
    addWishlistItem({
        name: wishName,
        amount: parseFloat(wishAmount),
        category: MasterCategory.CONSUMPTION // Default to consumption as usually these are wants
    });
    setWishName(''); setWishAmount('');
  };

  const convertWishToExpense = (id: string) => {
    const item = wishlist.find(w => w.id === id);
    if (!item) return;
    addTransaction({
        amount: item.amount,
        description: item.name,
        type: TransactionType.EXPENSE,
        category: 'Wishlist',
        masterCategory: item.category,
        necessity: Necessity.WANT,
        date: new Date().toISOString()
    });
    deleteWishlistItem(id);
  };

  // --- Analytics Data ---
  const currentMonth = new Date().getMonth();
  const monthlyTransactions = transactions.filter(t => 
    new Date(t.date).getMonth() === currentMonth && 
    t.type === TransactionType.EXPENSE
  );

  const totalSpent = monthlyTransactions.reduce((acc, t) => acc + t.amount, 0);
  
  const spendByMaster = monthlyTransactions.reduce((acc: { [key: string]: number }, t) => {
    const cat = t.masterCategory || MasterCategory.CONSUMPTION;
    acc[cat] = (acc[cat] || 0) + t.amount;
    return acc;
  }, {});

  const chartData = Object.keys(spendByMaster).map(k => ({ name: k.split(' ')[0], value: spendByMaster[k] }));

  // Need vs Want (Consumption only)
  const consumptionTx = monthlyTransactions.filter(t => t.masterCategory === MasterCategory.CONSUMPTION);
  const needsTotal = consumptionTx.filter(t => t.necessity === Necessity.NEED).reduce((acc, t) => acc + t.amount, 0);
  const wantsTotal = consumptionTx.filter(t => t.necessity === Necessity.WANT).reduce((acc, t) => acc + t.amount, 0);

  // Future vs Present
  const presentSpent = (spendByMaster[MasterCategory.CONSUMPTION] || 0) + (spendByMaster[MasterCategory.COMMITMENT] || 0);
  const futureSpent = (spendByMaster[MasterCategory.SAFETY] || 0) + (spendByMaster[MasterCategory.GROWTH] || 0);

  const COLORS = {
      [MasterCategory.CONSUMPTION]: '#ef4444',
      [MasterCategory.COMMITMENT]: '#f59e0b',
      [MasterCategory.SAFETY]: '#3b82f6',
      [MasterCategory.GROWTH]: '#10b981',
  };

  return (
    <div className="space-y-6">
      {/* Alert for Pause Wants */}
      {showPauseWants && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
            <PauseCircle className="text-rose-600 shrink-0 mt-0.5" />
            <div>
                <h4 className="font-bold text-rose-800">Pause Wants Mode Active</h4>
                <p className="text-sm text-rose-600 mt-1">Your Emergency Fund is below 50%. We strongly recommend pausing all non-essential spending until your safety net is rebuilt.</p>
            </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
        <button onClick={() => setActiveTab('tracker')} className={`px-4 py-2 rounded-t-lg text-sm font-medium ${activeTab === 'tracker' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Log Expense</button>
        <button onClick={() => setActiveTab('allocator')} className={`px-4 py-2 rounded-t-lg text-sm font-medium ${activeTab === 'allocator' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Allocator</button>
        <button onClick={() => setActiveTab('wishlist')} className={`px-4 py-2 rounded-t-lg text-sm font-medium ${activeTab === 'wishlist' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>24h Wishlist</button>
        <button onClick={() => setActiveTab('audit')} className={`px-4 py-2 rounded-t-lg text-sm font-medium ${activeTab === 'audit' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Audit & Trends</button>
      </div>

      {/* --- TRACKER --- */}
      {activeTab === 'tracker' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
               <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <ShoppingCart size={18} className="text-indigo-600" /> Expense Logger
               </h3>
               <form onSubmit={handleAddTransaction} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Master Category</label>
                          <select 
                            className="w-full border border-slate-200 rounded p-2 text-sm bg-slate-50"
                            value={txMasterCat}
                            onChange={e => setTxMasterCat(e.target.value as MasterCategory)}
                          >
                              {Object.values(MasterCategory).map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Amount</label>
                          <input 
                            type="number"
                            className="w-full border border-slate-200 rounded p-2 text-sm"
                            value={txAmount} onChange={e => setTxAmount(e.target.value)}
                          />
                      </div>
                  </div>

                  {(txMasterCat === MasterCategory.CONSUMPTION || txMasterCat === MasterCategory.COMMITMENT) && (
                      <div className="flex gap-4 p-3 bg-slate-50 rounded-lg">
                          <span className="text-sm font-medium text-slate-700 my-auto">Is this a...</span>
                          <button 
                            type="button"
                            onClick={() => setTxNecessity(Necessity.NEED)}
                            className={`flex-1 py-1 rounded text-sm transition-colors ${txNecessity === Necessity.NEED ? 'bg-emerald-500 text-white' : 'bg-white border text-slate-500'}`}
                          >
                              Need
                          </button>
                          <button 
                            type="button"
                            onClick={() => setTxNecessity(Necessity.WANT)}
                            className={`flex-1 py-1 rounded text-sm transition-colors ${txNecessity === Necessity.WANT ? 'bg-rose-500 text-white' : 'bg-white border text-slate-500'}`}
                          >
                              Want
                          </button>
                      </div>
                  )}

                  <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
                      <input 
                        className="w-full border border-slate-200 rounded p-2 text-sm"
                        placeholder="e.g. Dinner, Rent, SIP"
                        value={txDesc} onChange={e => setTxDesc(e.target.value)}
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Sub-Category (Optional)</label>
                      <input 
                        className="w-full border border-slate-200 rounded p-2 text-sm"
                        placeholder="e.g. Food, Housing"
                        value={txSubCat} onChange={e => setTxSubCat(e.target.value)}
                      />
                  </div>

                  <button type="submit" className="w-full bg-slate-800 text-white py-2 rounded text-sm font-medium hover:bg-slate-900">
                      Log Expense
                  </button>
               </form>
            </div>
            
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-sm text-indigo-800">
                <strong>💡 Ashan's Voice:</strong> "Are you logging your Savings as an Expense? Remember, money into your Emergency Fund is an expense for your 'Safety' bucket. It leaves your spending power."
            </div>
          </div>

          <div className="space-y-4">
             <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <h4 className="font-bold text-slate-800 mb-2">Monthly Breakdown</h4>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % 4]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-2">
                    {Object.entries(spendByMaster).map(([cat, val]) => (
                        <div key={cat} className="flex justify-between text-xs">
                            <span className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[cat as MasterCategory] }}></div>
                                {cat.split(' ')[0]}
                            </span>
                            <span className="font-bold">${val.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
             </div>
          </div>
        </div>
      )}

      {/* --- ALLOCATOR --- */}
      {activeTab === 'allocator' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-6">The Golden Formula</h3>
                <div className="bg-slate-50 p-4 rounded-lg text-center font-mono text-sm mb-6 border border-slate-200">
                    Income - (Safety + Growth) = Budget
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label className="block font-bold text-slate-700 mb-1">Monthly Income</label>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-slate-400">$</span>
                            <input 
                                type="number" 
                                className="w-full text-2xl font-bold border-b border-slate-200 focus:outline-none focus:border-indigo-500 py-2"
                                value={incomeInput} onChange={e => setIncomeInput(parseFloat(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-blue-600 font-bold">Safety (Insurance/Emergency)</span>
                                <span>{safetyPercent}%</span>
                            </div>
                            <input 
                                type="range" min="0" max="40" 
                                className="w-full accent-blue-600"
                                value={safetyPercent} onChange={e => setSafetyPercent(parseInt(e.target.value))}
                            />
                            <p className="text-right text-xs font-bold text-blue-600">${(incomeInput * safetyPercent / 100).toLocaleString()}</p>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-emerald-600 font-bold">Growth (Investing)</span>
                                <span>{growthPercent}%</span>
                            </div>
                            <input 
                                type="range" min="0" max="40" 
                                className="w-full accent-emerald-600"
                                value={growthPercent} onChange={e => setGrowthPercent(parseInt(e.target.value))}
                            />
                            <p className="text-right text-xs font-bold text-emerald-600">${(incomeInput * growthPercent / 100).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
             </div>

             <div className="flex flex-col justify-center space-y-6">
                <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl text-center">
                    <p className="text-slate-400 uppercase text-xs font-bold tracking-widest mb-2">Available to Spend</p>
                    <div className="text-5xl font-bold mb-2">
                        ${(incomeInput - (incomeInput * (safetyPercent + growthPercent) / 100)).toLocaleString()}
                    </div>
                    <p className="text-sm text-slate-400">For Consumption & Commitments</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-100">
                    <h4 className="font-bold text-slate-800 mb-2">Allocator Insight</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        You are saving <strong>{safetyPercent + growthPercent}%</strong> of your income before spending a dime. 
                        {safetyPercent + growthPercent < 20 
                            ? " Try to push this towards 20% for financial stability." 
                            : " Excellent! You are prioritizing your future self."}
                    </p>
                </div>
             </div>
        </div>
      )}

      {/* --- WISHLIST --- */}
      {activeTab === 'wishlist' && (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Clock className="text-indigo-600" /> The 24-Hour Pause
                </h3>
                <form onSubmit={handleAddWish} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-500 mb-1">Item Name</label>
                        <input 
                            className="w-full border border-slate-200 rounded p-2 text-sm"
                            placeholder="e.g. New Headphones"
                            value={wishName} onChange={e => setWishName(e.target.value)}
                        />
                    </div>
                    <div className="w-32">
                         <label className="block text-xs font-bold text-slate-500 mb-1">Cost</label>
                        <input 
                            type="number"
                            className="w-full border border-slate-200 rounded p-2 text-sm"
                            placeholder="$"
                            value={wishAmount} onChange={e => setWishAmount(e.target.value)}
                        />
                    </div>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-indigo-700 h-10">
                        Add to Pause
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {wishlist.map(item => {
                    const elapsed = Date.now() - new Date(item.createdAt).getTime();
                    const hoursLeft = Math.max(0, 24 - (elapsed / (1000 * 60 * 60)));
                    const canBuy = hoursLeft === 0;

                    return (
                        <div key={item.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-slate-800">{item.name}</h4>
                                <span className="font-bold text-indigo-600">${item.amount}</span>
                            </div>
                            
                            {canBuy ? (
                                <div className="mt-4">
                                    <div className="text-xs text-emerald-600 font-bold mb-2 flex items-center gap-1">
                                        <CheckCircle size={12}/> Ready to decide
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => convertWishToExpense(item.id)}
                                            className="flex-1 bg-slate-800 text-white py-1.5 rounded text-xs hover:bg-slate-900"
                                        >
                                            Buy It
                                        </button>
                                        <button 
                                            onClick={() => deleteWishlistItem(item.id)}
                                            className="flex-1 border border-rose-200 text-rose-600 py-1.5 rounded text-xs hover:bg-rose-50"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4">
                                    <div className="text-xs text-slate-400 font-medium mb-2 flex items-center gap-1">
                                        <Lock size={12}/> Unlocks in {hoursLeft.toFixed(1)}h
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-indigo-500 h-full" style={{ width: `${(1 - hoursLeft/24) * 100}%` }}></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            {wishlist.length === 0 && (
                <div className="text-center text-slate-400 py-8">No items in the cooling period.</div>
            )}
        </div>
      )}

      {/* --- AUDIT --- */}
      {activeTab === 'audit' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-rose-500" /> Need vs. Want Ratio
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={[
                             { name: 'Need', amount: needsTotal },
                             { name: 'Want', amount: wantsTotal }
                         ]}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} />
                             <XAxis dataKey="name" fontSize={12} />
                             <YAxis fontSize={12} />
                             <Tooltip formatter={(val: number) => `$${val}`} />
                             <Bar dataKey="amount" fill="#6366f1" radius={[4,4,0,0]}>
                                {
                                    [{name:'Need'}, {name:'Want'}].map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#ef4444'} />
                                    ))
                                }
                             </Bar>
                         </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="text-xs text-center mt-2 text-slate-500">
                    Are your wants exceeding your needs? (Only Consumption buckets)
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <PlayCircle size={18} className="text-blue-500" /> Future vs. Present Scale
                </h3>
                <div className="flex justify-center items-end h-40 gap-8 pb-4 border-b border-slate-100">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-16 bg-slate-200 rounded-t-lg relative group transition-all hover:bg-slate-300" style={{ height: `${Math.min(100, (presentSpent / (totalSpent || 1)) * 100)}%` }}>
                            <div className="absolute -top-6 w-full text-center font-bold text-slate-600">${presentSpent}</div>
                        </div>
                        <span className="text-xs font-bold text-slate-500 uppercase">Present</span>
                    </div>
                    
                    <div className="flex flex-col items-center gap-2">
                         <div className="w-16 bg-indigo-500 rounded-t-lg relative group transition-all hover:bg-indigo-600" style={{ height: `${Math.min(100, (futureSpent / (totalSpent || 1)) * 100)}%` }}>
                            <div className="absolute -top-6 w-full text-center font-bold text-indigo-600">${futureSpent}</div>
                         </div>
                         <span className="text-xs font-bold text-indigo-500 uppercase">Future</span>
                    </div>
                </div>
                <div className="mt-4 p-3 bg-indigo-50 rounded-lg text-sm text-indigo-800">
                    <strong>Trend Analysis:</strong> You are spending <strong>{Math.round((futureSpent / (totalSpent || 1)) * 100)}%</strong> of your outflow on your future self (Growth + Safety).
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default SpendingEngine;