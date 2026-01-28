import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { 
  CheckCircle, Circle, AlertCircle, Shield, CreditCard, 
  FileText, Database, Lock, Unlock, Eye, EyeOff, Save, Plus, TrendingUp 
} from 'lucide-react';
import { TaskCategory, Priority } from '../types';

const FinancialTools = () => {
  const { financialTools, updateFinancialTool, addTask } = useData();
  const [activeTab, setActiveTab] = useState<'audit' | 'allocator' | 'vault'>('audit');
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({});

  // --- Allocator State ---
  const [salaryInput, setSalaryInput] = useState(5000);
  const [allocations, setAllocations] = useState({ invest: 20, living: 70, income: 10 });

  // --- Helpers ---
  const toggleComplete = (id: string, currentStatus: string) => {
    updateFinancialTool(id, { 
        status: currentStatus === 'Complete' ? 'Incomplete' : 'Complete' 
    });
  };

  const updateField = (toolId: string, fieldName: string, value: string) => {
      const tool = financialTools.find(t => t.id === toolId);
      if (tool) {
          updateFinancialTool(toolId, {
              fields: { ...tool.fields, [fieldName]: value }
          });
      }
  };

  const createRepairTask = (toolTitle: string) => {
      addTask({
          title: `Setup/Fix ${toolTitle}`,
          category: TaskCategory.FINANCIAL,
          priority: Priority.P2,
          isTodayFocus: false,
          completed: false
      });
      alert(`Task added: Setup/Fix ${toolTitle}`);
  };

  // --- Scores ---
  const basicTools = financialTools.filter(t => t.isBasic);
  const advancedTools = financialTools.filter(t => !t.isBasic);
  
  const basicScore = Math.round((basicTools.filter(t => t.status === 'Complete').length / basicTools.length) * 100);
  const advancedScore = Math.round((advancedTools.filter(t => t.status === 'Complete').length / advancedTools.length) * 100);
  const totalScore = Math.round((financialTools.filter(t => t.status === 'Complete').length / financialTools.length) * 100);

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
        {[
          { id: 'audit', label: 'Setup Audit', icon: CheckCircle },
          { id: 'allocator', label: '3-Account Splitter', icon: CreditCard },
          { id: 'vault', label: 'Data Vault', icon: Database },
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

      {/* --- AUDIT TAB --- */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
            <div className="bg-indigo-900 text-white p-6 rounded-xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h3 className="text-xl font-bold mb-1">Financial Readiness Score</h3>
                    <p className="text-indigo-200 text-sm">Your infrastructure strength.</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-center">
                        <div className="text-3xl font-bold">{totalScore}%</div>
                        <div className="text-xs text-indigo-300">Total</div>
                    </div>
                    <div className="w-px h-10 bg-indigo-700"></div>
                    <div className="text-center opacity-80">
                        <div className="text-xl font-bold">{basicScore}%</div>
                        <div className="text-xs text-indigo-300">Basic</div>
                    </div>
                    <div className="text-center opacity-80">
                        <div className="text-xl font-bold">{advancedScore}%</div>
                        <div className="text-xs text-indigo-300">Advanced</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Tools */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                        <Shield className="text-blue-500" size={18} /> Basic Tools (Foundation)
                    </h4>
                    <div className="space-y-4">
                        {basicTools.map(tool => (
                            <div key={tool.id} className="flex items-start justify-between group">
                                <div className="flex items-start gap-3">
                                    <button onClick={() => toggleComplete(tool.id, tool.status)} className="mt-0.5">
                                        {tool.status === 'Complete' 
                                            ? <CheckCircle className="text-emerald-500" size={20} /> 
                                            : <Circle className="text-slate-300 hover:text-indigo-500" size={20} />
                                        }
                                    </button>
                                    <div>
                                        <div className={`font-medium ${tool.status === 'Complete' ? 'text-slate-800' : 'text-slate-500'}`}>{tool.title}</div>
                                        <div className="text-xs text-slate-400 mt-1">
                                            {Object.keys(tool.fields).join(', ')}
                                        </div>
                                    </div>
                                </div>
                                {tool.status !== 'Complete' && (
                                    <button 
                                        onClick={() => createRepairTask(tool.title)}
                                        className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        Fix This
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Advanced Tools */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                        <TrendingUp className="text-purple-500" size={18} /> Advanced Tools (Growth)
                    </h4>
                    <div className="space-y-4">
                        {advancedTools.map(tool => (
                            <div key={tool.id} className="flex items-start justify-between group">
                                <div className="flex items-start gap-3">
                                    <button onClick={() => toggleComplete(tool.id, tool.status)} className="mt-0.5">
                                        {tool.status === 'Complete' 
                                            ? <CheckCircle className="text-emerald-500" size={20} /> 
                                            : <Circle className="text-slate-300 hover:text-indigo-500" size={20} />
                                        }
                                    </button>
                                    <div>
                                        <div className={`font-medium ${tool.status === 'Complete' ? 'text-slate-800' : 'text-slate-500'}`}>{tool.title}</div>
                                        <div className="text-xs text-slate-400 mt-1">
                                            {Object.keys(tool.fields).join(', ')}
                                        </div>
                                    </div>
                                </div>
                                {tool.status !== 'Complete' && (
                                    <button 
                                        onClick={() => createRepairTask(tool.title)}
                                        className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        Fix This
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* --- ALLOCATOR TAB --- */}
      {activeTab === 'allocator' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-2">Salary Splitter</h3>
                <p className="text-sm text-slate-500 mb-6">Automate your cashflow on Day 1.</p>
                
                <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Net Monthly Salary</label>
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-slate-400">$</span>
                        <input 
                            type="number" 
                            className="w-full text-xl font-bold border-b border-slate-200 focus:outline-none focus:border-indigo-500 py-1"
                            value={salaryInput} onChange={e => setSalaryInput(parseFloat(e.target.value))}
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Invest */}
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-emerald-800">1. Investment Acct</span>
                            <span className="text-xs font-bold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">{allocations.invest}%</span>
                        </div>
                        <input 
                            type="range" min="0" max="100" className="w-full accent-emerald-600 mb-2"
                            value={allocations.invest} 
                            onChange={e => setAllocations({...allocations, invest: parseInt(e.target.value)})}
                        />
                        <div className="flex justify-between text-sm">
                            <span className="text-emerald-600">Transfer:</span>
                            <span className="font-bold text-emerald-800">${(salaryInput * allocations.invest / 100).toLocaleString()}</span>
                        </div>
                    </div>

                     {/* Living */}
                     <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-indigo-800">2. Living Acct</span>
                            <span className="text-xs font-bold bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full">{allocations.living}%</span>
                        </div>
                        <input 
                            type="range" min="0" max="100" className="w-full accent-indigo-600 mb-2"
                            value={allocations.living} 
                            onChange={e => setAllocations({...allocations, living: parseInt(e.target.value)})}
                        />
                        <div className="flex justify-between text-sm">
                            <span className="text-indigo-600">Transfer:</span>
                            <span className="font-bold text-indigo-800">${(salaryInput * allocations.living / 100).toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Income Remainder */}
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-slate-700">3. Income Acct (Remainder)</span>
                            <span className="text-xs font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                                {Math.max(0, 100 - allocations.invest - allocations.living)}%
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">For EMIs/Buffer:</span>
                            <span className="font-bold text-slate-800">
                                ${(salaryInput - (salaryInput * allocations.invest / 100) - (salaryInput * allocations.living / 100)).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <FileText size={18} className="text-slate-400" /> Transfer Instructions
                    </h4>
                    <ul className="space-y-4 text-sm text-slate-600 leading-relaxed">
                        <li className="flex gap-3">
                            <div className="bg-slate-100 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0">1</div>
                            <span>Receive Salary in <strong>Account A (Income)</strong>. Do NOT spend from here. Only EMIs get deducted here.</span>
                        </li>
                        <li className="flex gap-3">
                            <div className="bg-slate-100 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0">2</div>
                            <span>Immediately transfer <strong>${(salaryInput * allocations.invest / 100).toLocaleString()}</strong> to <strong>Account B (Investment)</strong>. This is for your SIPs and Emergency Fund.</span>
                        </li>
                        <li className="flex gap-3">
                            <div className="bg-slate-100 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0">3</div>
                            <span>Transfer <strong>${(salaryInput * allocations.living / 100).toLocaleString()}</strong> to <strong>Account C (Spend)</strong>. Use this debit card/UPI for everything else.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
      )}

      {/* --- VAULT TAB --- */}
      {activeTab === 'vault' && (
        <div className="space-y-6">
            {!vaultUnlocked ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-100 rounded-xl border border-slate-200">
                    <Lock size={48} className="text-slate-400 mb-4" />
                    <h3 className="text-xl font-bold text-slate-700 mb-2">Secure Vault Locked</h3>
                    <p className="text-slate-500 mb-6">Access your sensitive document details.</p>
                    <button 
                        onClick={() => setVaultUnlocked(true)}
                        className="bg-slate-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-900 transition flex items-center gap-2"
                    >
                        <Unlock size={18} /> Unlock Vault
                    </button>
                    <p className="text-xs text-slate-400 mt-4">(Simulation: Click to unlock)</p>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800 text-xl flex items-center gap-2">
                            <Database className="text-indigo-600" /> Data Vault
                        </h3>
                        <button 
                            onClick={() => setVaultUnlocked(false)}
                            className="text-sm text-slate-500 hover:text-rose-500 flex items-center gap-1"
                        >
                            <Lock size={14} /> Lock Vault
                        </button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {financialTools.map(tool => (
                            <div key={tool.id} className="border border-slate-200 rounded-lg p-4 hover:border-indigo-200 transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="font-bold text-slate-700">{tool.title}</div>
                                    <div className={`text-[10px] px-2 py-0.5 rounded-full ${tool.status === 'Complete' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                        {tool.status}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {Object.entries(tool.fields).map(([key, val]) => (
                                        <div key={key}>
                                            <label className="text-xs font-bold text-slate-400 uppercase">{key}</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <input 
                                                    type={showSensitive[`${tool.id}-${key}`] ? "text" : "password"}
                                                    className="w-full text-sm border border-slate-200 rounded px-2 py-1 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 transition-colors"
                                                    value={val as string}
                                                    onChange={(e) => updateField(tool.id, key, e.target.value)}
                                                />
                                                <button 
                                                    onClick={() => setShowSensitive(prev => ({ ...prev, [`${tool.id}-${key}`]: !prev[`${tool.id}-${key}`] }))}
                                                    className="text-slate-400 hover:text-slate-600"
                                                >
                                                    {showSensitive[`${tool.id}-${key}`] ? <EyeOff size={14} /> : <Eye size={14} />}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {/* Add Field Button (Simplified) */}
                                    <button 
                                        onClick={() => {
                                            const newField = prompt("Enter new field name (e.g., Expiry Date):");
                                            if (newField) updateField(tool.id, newField, "");
                                        }}
                                        className="text-xs text-indigo-600 hover:underline flex items-center gap-1 mt-2"
                                    >
                                        <Plus size={12} /> Add Field
                                    </button>
                                </div>
                            </div>
                        ))}
                     </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default FinancialTools;