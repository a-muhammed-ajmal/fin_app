import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { TransactionType, ESBICategory, IncomeOpportunity, Transaction } from '../types';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Briefcase, Zap, Globe, Users, Target, Rocket, 
  HelpCircle, Check, Trash2, TrendingUp, Cpu
} from 'lucide-react';

const IncomeEngine = () => {
  const { 
    transactions, incomeTarget, updateIncomeTarget, 
    growthStrategy, updateGrowthStrategy,
    incomeOpportunities, addIncomeOpportunity, deleteIncomeOpportunity
  } = useData();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'target' | 'growth' | 'validator'>('dashboard');

  // Dashboard Logic
  const incomeTransactions = transactions.filter(t => t.type === TransactionType.INCOME);
  const totalIncome = incomeTransactions.reduce((acc: number, curr: Transaction) => acc + curr.amount, 0);

  // Group by ESBI
  const esbiData: Record<string, number> = incomeTransactions.reduce((acc: Record<string, number>, curr: Transaction) => {
    const cat = curr.esbiCategory || ESBICategory.EMPLOYEE;
    const key = cat as string;
    const currentVal = acc[key] || 0;
    acc[key] = currentVal + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(esbiData).map(k => ({ name: k, value: esbiData[k] || 0 }));
  
  const activeIncome = (esbiData[ESBICategory.EMPLOYEE] || 0) + (esbiData[ESBICategory.SELF_EMPLOYED] || 0);
  const passiveIncome = (esbiData[ESBICategory.BUSINESS] || 0) + (esbiData[ESBICategory.INVESTOR] || 0);
  const passivePercent = totalIncome > 0 ? Math.round((passiveIncome / totalIncome) * 100) : 0;

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];

  // Target Calculator Logic
  const targetTotal = (Object.values(incomeTarget) as number[]).reduce((a: number, b: number) => a + b, 0);
  const incomeGap = totalIncome - targetTotal;

  // Validator Logic (New Opportunity)
  const [newOpp, setNewOpp] = useState<Partial<IncomeOpportunity>>({ 
    name: '', interest: 3, capability: 3, effortlessness: 3, returnPotential: 3 
  });

  const handleAddOpp = (e: React.FormEvent) => {
    e.preventDefault();
    if(newOpp.name) {
      addIncomeOpportunity(newOpp as any);
      setNewOpp({ name: '', interest: 3, capability: 3, effortlessness: 3, returnPotential: 3 });
    }
  };

  // Growth Strategy Inputs
  const [skillInput, setSkillInput] = useState('');
  const [leverageInput, setLeverageInput] = useState('');

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
        {[
          { id: 'dashboard', label: 'Cashflow Quadrant', icon: TrendingUp },
          { id: 'target', label: 'Freedom Number', icon: Target },
          { id: 'growth', label: 'Growth Strategy (SNLG)', icon: Rocket },
          { id: 'validator', label: 'Idea Validator (ICER)', icon: Zap },
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

      {/* --- DASHBOARD (ESBI) --- */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">The Cashflow Quadrant</h3>
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-3xl font-bold text-slate-800">${totalIncome.toLocaleString()}</span>
                <span className="text-xs text-slate-500">Total Income</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {chartData.map((entry, index) => (
                <div key={index} className="flex items-center gap-1 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Cpu size={18} /> Leverage Meter
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">Active (Labor)</span>
                    <span className="text-slate-300">Passive (Capital/Systems)</span>
                  </div>
                  <div className="h-4 bg-slate-700 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-indigo-500 h-full transition-all duration-1000" 
                      style={{ width: `${100 - passivePercent}%` }} 
                    />
                    <div 
                      className="bg-emerald-400 h-full transition-all duration-1000" 
                      style={{ width: `${passivePercent}%` }} 
                    />
                  </div>
                  <div className="text-center mt-2 font-mono text-sm">
                    {passivePercent}% Passive
                  </div>
                </div>
                <div className="p-3 bg-slate-800 rounded-lg text-xs leading-relaxed text-slate-300">
                  <span className="text-emerald-400 font-bold">Goal:</span> Shift weight to the right. 
                  Use your active income to buy assets (I) or build systems (B) that pay you while you sleep.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <div className="text-indigo-600 font-bold text-lg">E & S</div>
                <div className="text-xs text-indigo-400">Limited by Time</div>
                <div className="text-xl font-bold mt-1 text-slate-800">${activeIncome.toLocaleString()}</div>
              </div>
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <div className="text-emerald-600 font-bold text-lg">B & I</div>
                <div className="text-xs text-emerald-400">Scalable Wealth</div>
                <div className="text-xl font-bold mt-1 text-slate-800">${passiveIncome.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TARGET CALCULATOR --- */}
      {activeTab === 'target' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-6">Reverse Engineering Freedom</h3>
            <div className="space-y-4">
              {Object.entries(incomeTarget).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between group">
                  <label className="text-sm font-medium text-slate-600 capitalize w-32">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-slate-400 text-sm">$</span>
                    <input 
                      type="number" 
                      value={val}
                      onChange={(e) => updateIncomeTarget({ ...incomeTarget, [key]: parseFloat(e.target.value) || 0 })}
                      className="w-full border-b border-slate-200 focus:border-indigo-500 outline-none py-1 text-slate-800 font-medium bg-transparent"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex justify-between items-end">
                <span className="text-slate-500 font-medium">Target Income</span>
                <span className="text-3xl font-bold text-indigo-600">${targetTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-6">
            <div className={`p-6 rounded-xl text-center border ${incomeGap >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
              <h4 className="text-sm uppercase tracking-wide font-bold mb-2 text-slate-500">Gap Analysis</h4>
              <div className={`text-4xl font-bold ${incomeGap >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {incomeGap >= 0 ? '+' : ''}{incomeGap.toLocaleString()}
              </div>
              <p className="text-sm text-slate-500 mt-2">
                {incomeGap >= 0 
                  ? "You are living within your freedom number. Invest the surplus." 
                  : "You need to bridge this gap using the Growth Strategy tab."}
              </p>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><HelpCircle size={16}/> The Logic</h4>
              <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
                <li><strong>Needs:</strong> Survival (Rent, Food).</li>
                <li><strong>Wants:</strong> Joy (Travel, Hobbies).</li>
                <li><strong>Savings:</strong> Buying back time.</li>
                <li><strong>Tax Buffer:</strong> Paying your dues.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* --- GROWTH STRATEGY (SNLG) --- */}
      {activeTab === 'growth' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Skills */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4 text-indigo-600">
              <Briefcase size={20} />
              <h3 className="font-bold text-lg">Skills (S)</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Unfair Advantage</label>
                <textarea 
                  placeholder="What feels effortless to you but looks like hard work to others?"
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm mt-1 focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                  value={growthStrategy.unfairAdvantage}
                  onChange={(e) => updateGrowthStrategy({ unfairAdvantage: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Skills to Acquire</label>
                <div className="flex gap-2 mt-1">
                  <input 
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    placeholder="Add a skill..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && skillInput) {
                        updateGrowthStrategy({ skillsToAcquire: [...growthStrategy.skillsToAcquire, skillInput] });
                        setSkillInput('');
                      }
                    }}
                  />
                  <button 
                    onClick={() => {
                      if (skillInput) {
                        updateGrowthStrategy({ skillsToAcquire: [...growthStrategy.skillsToAcquire, skillInput] });
                        setSkillInput('');
                      }
                    }}
                    className="bg-indigo-600 text-white p-2 rounded-lg"
                  ><Check size={16}/></button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {growthStrategy.skillsToAcquire.map((s, i) => (
                    <span key={i} className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs flex items-center gap-1">
                      {s} <button onClick={() => updateGrowthStrategy({ skillsToAcquire: growthStrategy.skillsToAcquire.filter((_, idx) => idx !== i) })}>&times;</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Network */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4 text-emerald-600">
              <Users size={20} />
              <h3 className="font-bold text-lg">Network (N)</h3>
            </div>
             <label className="text-xs font-bold text-slate-400 uppercase">CRM Strategy</label>
             <textarea 
                  placeholder="Who can accelerate your growth? List mentors, partners, or clients to follow up with."
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm mt-1 focus:ring-2 focus:ring-emerald-500 outline-none h-40 resize-none"
                  value={growthStrategy.networkNotes}
                  onChange={(e) => updateGrowthStrategy({ networkNotes: e.target.value })}
              />
          </div>

          {/* Leverage */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4 text-rose-600">
              <Cpu size={20} />
              <h3 className="font-bold text-lg">Leverage (L)</h3>
            </div>
            <label className="text-xs font-bold text-slate-400 uppercase">Efficiency Audit</label>
            <div className="flex gap-2 mt-1 mb-2">
                  <input 
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    placeholder="Task to automate/delegate..."
                    value={leverageInput}
                    onChange={(e) => setLeverageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && leverageInput) {
                        updateGrowthStrategy({ leverageAudit: [...growthStrategy.leverageAudit, leverageInput] });
                        setLeverageInput('');
                      }
                    }}
                  />
                  <button 
                    onClick={() => {
                      if (leverageInput) {
                         updateGrowthStrategy({ leverageAudit: [...growthStrategy.leverageAudit, leverageInput] });
                        setLeverageInput('');
                      }
                    }}
                    className="bg-rose-600 text-white p-2 rounded-lg"
                  ><Check size={16}/></button>
            </div>
            <ul className="space-y-1">
                {growthStrategy.leverageAudit.map((item, i) => (
                    <li key={i} className="flex justify-between items-center text-sm p-2 bg-rose-50 rounded text-rose-800">
                        {item}
                        <button onClick={() => updateGrowthStrategy({ leverageAudit: growthStrategy.leverageAudit.filter((_, idx) => idx !== i) })}>
                            <Trash2 size={14} className="text-rose-400 hover:text-rose-600" />
                        </button>
                    </li>
                ))}
            </ul>
          </div>

          {/* Geography */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4 text-amber-600">
              <Globe size={20} />
              <h3 className="font-bold text-lg">Geography (G)</h3>
            </div>
            <label className="text-xs font-bold text-slate-400 uppercase">Opportunity Mapping</label>
            <textarea 
                  placeholder="If I move to X or work remotely for Y, how does my income potential change?"
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm mt-1 focus:ring-2 focus:ring-amber-500 outline-none h-40 resize-none"
                  value={growthStrategy.geographyPlan}
                  onChange={(e) => updateGrowthStrategy({ geographyPlan: e.target.value })}
              />
          </div>
        </div>
      )}

      {/* --- VALIDATOR (ICER) --- */}
      {activeTab === 'validator' && (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4">New Opportunity Scorer (ICER)</h3>
                <form onSubmit={handleAddOpp} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 mb-1">Idea Name</label>
                        <input 
                            className="w-full border border-slate-200 rounded px-3 py-2 text-sm"
                            placeholder="e.g. Start a Bakery"
                            value={newOpp.name}
                            onChange={e => setNewOpp({...newOpp, name: e.target.value})}
                        />
                    </div>
                    {[
                        { key: 'interest', label: 'Interest' },
                        { key: 'capability', label: 'Capability' },
                        { key: 'effortlessness', label: 'Effortless' },
                        { key: 'returnPotential', label: 'Return' },
                    ].map(field => (
                        <div key={field.key}>
                            <label className="block text-xs font-bold text-slate-500 mb-1">{field.label} (1-5)</label>
                            <input 
                                type="number" min="1" max="5"
                                className="w-full border border-slate-200 rounded px-3 py-2 text-sm"
                                value={(newOpp as any)[field.key]}
                                onChange={e => setNewOpp({...newOpp, [field.key]: parseInt(e.target.value)})}
                            />
                        </div>
                    ))}
                    <button className="bg-slate-800 text-white px-4 py-2 rounded text-sm font-medium hover:bg-slate-900 h-10">
                        Score
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {incomeOpportunities.sort((a,b) => b.score - a.score).map((opp, idx) => (
                    <div key={opp.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 relative group">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-lg text-slate-800">{opp.name}</h4>
                            <div className={`text-xl font-bold ${idx === 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {opp.score}/20
                            </div>
                        </div>
                        {idx === 0 && (
                            <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                                WINNER
                            </div>
                        )}
                        <div className="grid grid-cols-4 gap-1 mt-4 text-center text-xs">
                            <div className="bg-slate-50 p-1 rounded">
                                <div className="text-slate-400">I</div>
                                <div className="font-bold">{opp.interest}</div>
                            </div>
                            <div className="bg-slate-50 p-1 rounded">
                                <div className="text-slate-400">C</div>
                                <div className="font-bold">{opp.capability}</div>
                            </div>
                            <div className="bg-slate-50 p-1 rounded">
                                <div className="text-slate-400">E</div>
                                <div className="font-bold">{opp.effortlessness}</div>
                            </div>
                            <div className="bg-slate-50 p-1 rounded">
                                <div className="text-slate-400">R</div>
                                <div className="font-bold">{opp.returnPotential}</div>
                            </div>
                        </div>
                        <button 
                            onClick={() => deleteIncomeOpportunity(opp.id)}
                            className="absolute top-4 right-4 text-rose-400 opacity-0 group-hover:opacity-100 hover:text-rose-600 transition-opacity"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default IncomeEngine;