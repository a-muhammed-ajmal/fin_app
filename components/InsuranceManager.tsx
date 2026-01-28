import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { InsuranceType, InsurancePolicy } from '../types';
import { 
  Shield, AlertTriangle, Plus, FileText, Phone, Trash2, 
  Siren, HeartPulse, Building, Car, User, Share2, 
  AlertOctagon, CheckCircle, Calculator
} from 'lucide-react';

const InsuranceManager = () => {
  const { insurancePolicies, addInsurance, deleteInsurance, incomeTarget, liabilities } = useData();
  const [activeTab, setActiveTab] = useState<'vault' | 'gap-calc' | 'sos'>('vault');
  const [isNomineeMode, setIsNomineeMode] = useState(false);

  // --- SOS Mode ---
  const healthPolicies = insurancePolicies.filter(p => p.type === InsuranceType.HEALTH);

  // --- Add Policy Form ---
  const [newPolicy, setNewPolicy] = useState<Partial<InsurancePolicy>>({
    name: '', type: InsuranceType.HEALTH, insurer: '', policyNumber: '', 
    sumAssured: 500000, premium: 0, renewalDate: '', tpaContact: '', nominee: '', isCorporate: false
  });

  const handleAddPolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if(newPolicy.name && newPolicy.policyNumber) {
        addInsurance(newPolicy as InsurancePolicy);
        setNewPolicy({ 
            name: '', type: InsuranceType.HEALTH, insurer: '', policyNumber: '', 
            sumAssured: 500000, premium: 0, renewalDate: '', tpaContact: '', nominee: '', isCorporate: false 
        });
    }
  };

  // --- Gap Calculator Logic ---
  const annualIncome = (incomeTarget.needs + incomeTarget.wants + incomeTarget.savings + incomeTarget.investment + incomeTarget.insurance + incomeTarget.taxBuffer) * 12; // Approximation from target
  const totalDebt = liabilities.reduce((acc, l) => acc + (l.totalAmount - l.paidAmount), 0);
  const requiredLifeCover = (annualIncome * 10) + totalDebt;
  const currentLifeCover = insurancePolicies.filter(p => p.type === InsuranceType.TERM_LIFE).reduce((acc, p) => acc + p.sumAssured, 0);
  const lifeGap = requiredLifeCover - currentLifeCover;

  const [cityTier, setCityTier] = useState<'Tier 1' | 'Tier 2' | 'Tier 3'>('Tier 1');
  const recommendedHealthCover = cityTier === 'Tier 1' ? 1500000 : cityTier === 'Tier 2' ? 1000000 : 500000;
  const currentHealthCover = insurancePolicies.filter(p => p.type === InsuranceType.HEALTH).reduce((acc, p) => acc + p.sumAssured, 0);

  // --- Helpers ---
  const getDaysToRenewal = (dateStr: string) => {
      const diff = new Date(dateStr).getTime() - new Date().getTime();
      return Math.ceil(diff / (1000 * 3600 * 24));
  };

  return (
    <div className="space-y-6">
        {/* Top Actions */}
        <div className="flex justify-between items-center">
             <div className="flex gap-2">
                <button 
                    onClick={() => setActiveTab('vault')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'vault' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border'}`}
                >
                    Policy Vault
                </button>
                <button 
                    onClick={() => setActiveTab('gap-calc')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'gap-calc' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border'}`}
                >
                    Coverage Gap
                </button>
             </div>
             
             <div className="flex gap-2">
                <button 
                    onClick={() => setIsNomineeMode(!isNomineeMode)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border transition ${isNomineeMode ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-white text-slate-600'}`}
                >
                    <Share2 size={16} /> {isNomineeMode ? 'Nominee View' : 'Legacy Access'}
                </button>
                <button 
                    onClick={() => setActiveTab('sos')}
                    className="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-rose-700 shadow-lg shadow-rose-200 animate-pulse"
                >
                    <Siren size={18} /> SOS
                </button>
             </div>
        </div>

        {/* --- SOS MODE --- */}
        {activeTab === 'sos' && (
            <div className="bg-rose-50 border-2 border-rose-200 p-6 rounded-2xl animate-in zoom-in duration-200">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-black text-rose-700 mb-2">EMERGENCY MODE</h2>
                    <p className="text-rose-600">Show this screen to hospital staff or family.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {healthPolicies.length === 0 && (
                        <div className="col-span-2 text-center py-8 text-rose-400 font-medium">
                            No Health Insurance Policies Found! Add them in the Vault.
                        </div>
                    )}
                    {healthPolicies.map(p => (
                        <div key={p.id} className="bg-white p-6 rounded-xl border-l-8 border-rose-500 shadow-md">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Insurer</div>
                                    <div className="text-xl font-bold text-slate-800">{p.insurer}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Policy No.</div>
                                    <div className="text-xl font-mono font-bold text-slate-800">{p.policyNumber}</div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-slate-50 p-3 rounded-lg">
                                    <div className="text-xs text-slate-500 mb-1">TPA Contact</div>
                                    <div className="font-bold text-lg text-rose-600 flex items-center gap-2">
                                        <Phone size={16} /> {p.tpaContact || 'N/A'}
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg">
                                    <div className="text-xs text-slate-500 mb-1">Sum Assured</div>
                                    <div className="font-bold text-lg text-emerald-600">
                                        ${p.sumAssured.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <div className="text-xs text-slate-400 text-center">
                                Valid until: {p.renewalDate}
                            </div>
                        </div>
                    ))}
                </div>
                <button onClick={() => setActiveTab('vault')} className="mx-auto block mt-8 text-slate-500 hover:text-slate-800 underline">Exit Emergency Mode</button>
            </div>
        )}

        {/* --- CALCULATOR --- */}
        {activeTab === 'gap-calc' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Life Cover Calc */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <HeartPulse className="text-indigo-600" /> Life Insurance Check
                    </h3>
                    <div className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Est. Annual Income</span>
                                <span className="font-bold">${annualIncome.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Total Debt</span>
                                <span className="font-bold text-rose-500">+ ${totalDebt.toLocaleString()}</span>
                            </div>
                            <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-indigo-700">
                                <span>Required Cover (10x + Debt)</span>
                                <span>${requiredLifeCover.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Your Current Cover</div>
                            <div className={`text-3xl font-bold ${lifeGap > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                ${currentLifeCover.toLocaleString()}
                            </div>
                            {lifeGap > 0 && (
                                <div className="text-sm text-rose-600 mt-2 font-medium bg-rose-50 p-2 rounded">
                                    Gap: ${lifeGap.toLocaleString()} <br/>
                                    <span className="text-xs font-normal">Your family is vulnerable. Buy a Term Plan immediately.</span>
                                </div>
                            )}
                            {lifeGap <= 0 && (
                                <div className="text-sm text-emerald-600 mt-2 flex items-center justify-center gap-1">
                                    <CheckCircle size={14} /> You are fully protected.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Health Cover Calc */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Building className="text-emerald-600" /> Health Insurance Check
                    </h3>
                    
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-slate-500 mb-2">Select Your City Tier</label>
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            {['Tier 1', 'Tier 2', 'Tier 3'].map(t => (
                                <button 
                                    key={t}
                                    onClick={() => setCityTier(t as any)}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${cityTier === t ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg mb-4">
                        <div className="flex justify-between items-end mb-2">
                             <span className="text-sm text-slate-500">Recommended Cover</span>
                             <span className="text-xl font-bold text-indigo-700">${recommendedHealthCover.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-end">
                             <span className="text-sm text-slate-500">Current Cover</span>
                             <span className={`text-xl font-bold ${currentHealthCover < recommendedHealthCover ? 'text-rose-500' : 'text-emerald-500'}`}>${currentHealthCover.toLocaleString()}</span>
                        </div>
                    </div>
                    
                    {currentHealthCover < 500000 && (
                        <div className="flex items-start gap-2 text-sm text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-100">
                            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                            <span><strong>Critical:</strong> Your shield is too small for a major surgery. Consider a Super Top-up plan.</span>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* --- VAULT --- */}
        {activeTab === 'vault' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* List */}
                <div className="lg:col-span-2 space-y-4">
                    {isNomineeMode && (
                        <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg flex items-start gap-3 text-indigo-800 mb-4">
                             <User className="shrink-0 mt-1" />
                             <div>
                                <h4 className="font-bold">Nominee View Active</h4>
                                <p className="text-sm">This is what your family will see in case of emergency. Ensure all details are clear.</p>
                             </div>
                        </div>
                    )}

                    {insurancePolicies.map(p => {
                        const daysToRenew = getDaysToRenewal(p.renewalDate);
                        const isExpiring = daysToRenew < 30 && daysToRenew > 0;
                        const isLapsed = daysToRenew <= 0;

                        return (
                            <div key={p.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 group relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-lg ${
                                            p.type === InsuranceType.HEALTH ? 'bg-rose-100 text-rose-600' :
                                            p.type === InsuranceType.TERM_LIFE ? 'bg-indigo-100 text-indigo-600' :
                                            p.type === InsuranceType.MOTOR ? 'bg-amber-100 text-amber-600' :
                                            'bg-slate-100 text-slate-600'
                                        }`}>
                                            {p.type === InsuranceType.HEALTH ? <HeartPulse size={20} /> :
                                             p.type === InsuranceType.TERM_LIFE ? <Shield size={20} /> :
                                             p.type === InsuranceType.MOTOR ? <Car size={20} /> : <FileText size={20} />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">{p.name}</h3>
                                            <p className="text-xs text-slate-500">{p.insurer} • {p.policyNumber}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-slate-800">${p.sumAssured.toLocaleString()}</div>
                                        <div className="text-xs text-slate-400">Cover</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
                                    <div>
                                        <span className="block opacity-70">Premium</span>
                                        <span className="font-medium text-slate-800">${p.premium}/yr</span>
                                    </div>
                                    <div>
                                        <span className="block opacity-70">Renewal</span>
                                        <span className={`font-medium ${isExpiring ? 'text-amber-600 font-bold' : isLapsed ? 'text-rose-600 font-bold' : 'text-slate-800'}`}>
                                            {p.renewalDate} {isExpiring && '(Due Soon!)'} {isLapsed && '(LAPSED)'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block opacity-70">Nominee</span>
                                        <span className="font-medium text-slate-800">{p.nominee || 'Not Set'}</span>
                                    </div>
                                </div>

                                {p.isCorporate && (
                                    <div className="mt-2 text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded inline-block">
                                        Warning: Corporate Policy (Linked to Job)
                                    </div>
                                )}
                                {p.type === InsuranceType.ULIP_ENDOWMENT && (
                                    <div className="mt-2 text-[10px] text-rose-600 bg-rose-50 px-2 py-1 rounded inline-block flex items-center gap-1">
                                        <AlertOctagon size={10} /> Bad Policy: Mixes Insurance & Investment.
                                    </div>
                                )}

                                {!isNomineeMode && (
                                    <button 
                                        onClick={() => deleteInsurance(p.id)}
                                        className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Add Form */}
                {!isNomineeMode && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Plus size={18} className="text-indigo-600" /> Add to Vault
                        </h3>
                        <form onSubmit={handleAddPolicy} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Policy Type</label>
                                <select 
                                    className="w-full border rounded p-2 text-sm bg-slate-50"
                                    value={newPolicy.type}
                                    onChange={e => setNewPolicy({...newPolicy, type: e.target.value as InsuranceType})}
                                >
                                    {Object.values(InsuranceType).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                {newPolicy.type === InsuranceType.ULIP_ENDOWMENT && (
                                    <div className="text-xs text-rose-600 mt-1">Warning: Avoid ULIPs. Buy Pure Term Insurance instead.</div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <input 
                                    className="w-full border rounded p-2 text-sm" placeholder="Policy Name"
                                    value={newPolicy.name} onChange={e => setNewPolicy({...newPolicy, name: e.target.value})}
                                />
                                <input 
                                    className="w-full border rounded p-2 text-sm" placeholder="Insurer (e.g. LIC)"
                                    value={newPolicy.insurer} onChange={e => setNewPolicy({...newPolicy, insurer: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <input 
                                    className="w-full border rounded p-2 text-sm" placeholder="Policy Number"
                                    value={newPolicy.policyNumber} onChange={e => setNewPolicy({...newPolicy, policyNumber: e.target.value})}
                                />
                                <input 
                                    className="w-full border rounded p-2 text-sm" placeholder="Nominee"
                                    value={newPolicy.nominee} onChange={e => setNewPolicy({...newPolicy, nominee: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1">Sum Assured</label>
                                    <input 
                                        type="number" className="w-full border rounded p-2 text-sm"
                                        value={newPolicy.sumAssured} onChange={e => setNewPolicy({...newPolicy, sumAssured: parseFloat(e.target.value)})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1">Annual Premium</label>
                                    <input 
                                        type="number" className="w-full border rounded p-2 text-sm"
                                        value={newPolicy.premium} onChange={e => setNewPolicy({...newPolicy, premium: parseFloat(e.target.value)})}
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                     <label className="block text-xs font-bold text-slate-400 mb-1">Renewal Date</label>
                                     <input 
                                        type="date" className="w-full border rounded p-2 text-sm"
                                        value={newPolicy.renewalDate} onChange={e => setNewPolicy({...newPolicy, renewalDate: e.target.value})}
                                     />
                                </div>
                                <div>
                                     <label className="block text-xs font-bold text-slate-400 mb-1">TPA / Emergency #</label>
                                     <input 
                                        type="text" className="w-full border rounded p-2 text-sm"
                                        value={newPolicy.tpaContact} onChange={e => setNewPolicy({...newPolicy, tpaContact: e.target.value})}
                                     />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" id="isCorp" className="w-4 h-4 accent-indigo-600"
                                    checked={newPolicy.isCorporate} onChange={e => setNewPolicy({...newPolicy, isCorporate: e.target.checked})}
                                />
                                <label htmlFor="isCorp" className="text-xs text-slate-600">This is a Corporate/Office Policy</label>
                            </div>
                            {newPolicy.isCorporate && (
                                <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">Warning: Is this your only insurance? That's risky. Add a personal policy.</p>
                            )}

                            <button className="w-full bg-slate-800 text-white py-2 rounded font-medium hover:bg-slate-900">
                                Save to Vault
                            </button>
                        </form>
                    </div>
                )}
            </div>
        )}
    </div>
  );
};

export default InsuranceManager;