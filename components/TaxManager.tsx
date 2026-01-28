import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { TaxRegime } from '../types';
import { 
  Calculator, Calendar, FileText, Landmark, 
  TrendingDown, TrendingUp, CheckCircle, AlertTriangle, 
  HelpCircle, ArrowRight, ShieldCheck, Download
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const TaxManager = () => {
  const { taxProfile, updateTaxProfile } = useData();
  const [activeTab, setActiveTab] = useState<'income' | 'regime' | 'calendar' | 'filing'>('regime');

  // --- CALCULATION LOGIC (FY 24-25) ---

  const calculateOldRegimeTax = () => {
      const grossIncome = taxProfile.salary + taxProfile.houseProperty + taxProfile.businessProfession + taxProfile.capitalGains + taxProfile.otherSources;
      let taxableIncome = grossIncome 
          - taxProfile.deduction80C 
          - taxProfile.deduction80D 
          - taxProfile.deduction80CCD 
          - taxProfile.hraExemption 
          - taxProfile.homeLoanInterest;
      
      // Standard Deduction (Salaried)
      if (taxProfile.salary > 0) taxableIncome -= 50000;

      if (taxableIncome <= 250000) return { tax: 0, taxableIncome };
      
      let tax = 0;
      // 2.5L - 5L @ 5%
      if (taxableIncome > 250000) tax += Math.min(taxableIncome - 250000, 250000) * 0.05;
      // 5L - 10L @ 20%
      if (taxableIncome > 500000) tax += Math.min(taxableIncome - 500000, 500000) * 0.20;
      // > 10L @ 30%
      if (taxableIncome > 1000000) tax += (taxableIncome - 1000000) * 0.30;

      // Rebate u/s 87A
      if (taxableIncome <= 500000) tax = 0;

      // Cess 4%
      tax = tax * 1.04;

      return { tax: Math.round(tax), taxableIncome: Math.max(0, taxableIncome) };
  };

  const calculateNewRegimeTax = () => {
      let grossIncome = taxProfile.salary + taxProfile.houseProperty + taxProfile.businessProfession + taxProfile.capitalGains + taxProfile.otherSources;
      
      // Standard Deduction (Salaried - Increased to 75k in FY24-25 budget proposals, using 75k as current safe bet for planning)
      if (taxProfile.salary > 0) grossIncome -= 75000;

      let taxableIncome = grossIncome; // Very few deductions allowed
      
      if (taxableIncome <= 300000) return { tax: 0, taxableIncome };

      let tax = 0;
      // 3-7L @ 5%
      if (taxableIncome > 300000) tax += Math.min(taxableIncome - 300000, 400000) * 0.05;
      // 7-10L @ 10%
      if (taxableIncome > 700000) tax += Math.min(taxableIncome - 700000, 300000) * 0.10;
      // 10-12L @ 15%
      if (taxableIncome > 1000000) tax += Math.min(taxableIncome - 1000000, 200000) * 0.15;
      // 12-15L @ 20%
      if (taxableIncome > 1200000) tax += Math.min(taxableIncome - 1200000, 300000) * 0.20;
      // > 15L @ 30%
      if (taxableIncome > 1500000) tax += (taxableIncome - 1500000) * 0.30;

      // Rebate u/s 87A (Limit 7L - Tax is zero if income <= 7L)
      if (taxableIncome <= 700000) tax = 0;

      // Cess 4%
      tax = tax * 1.04;

      return { tax: Math.round(tax), taxableIncome: Math.max(0, taxableIncome) };
  };

  const oldRes = calculateOldRegimeTax();
  const newRes = calculateNewRegimeTax();
  const savings = Math.abs(oldRes.tax - newRes.tax);
  const betterRegime = oldRes.tax < newRes.tax ? TaxRegime.OLD : TaxRegime.NEW;

  // --- COMPONENT RENDER ---

  return (
    <div className="space-y-6">
       {/* Navigation */}
       <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
        {[
          { id: 'income', label: '1. Income & Deductions', icon: Landmark },
          { id: 'regime', label: '2. Regime Referee', icon: Calculator },
          { id: 'calendar', label: '3. Compliance Calendar', icon: Calendar },
          { id: 'filing', label: '4. Filing Room', icon: FileText },
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

      {/* --- INCOME INPUTS --- */}
      {activeTab === 'income' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Landmark className="text-indigo-600" /> 5 Heads of Income
                </h3>
                <div className="space-y-3">
                    {[
                        { label: 'Income from Salary', key: 'salary' },
                        { label: 'House Property (Rent)', key: 'houseProperty' },
                        { label: 'Business / Profession', key: 'businessProfession' },
                        { label: 'Capital Gains', key: 'capitalGains' },
                        { label: 'Other Sources (Interest)', key: 'otherSources' },
                    ].map(field => (
                        <div key={field.key} className="flex justify-between items-center">
                            <label className="text-sm font-medium text-slate-600">{field.label}</label>
                            <div className="flex items-center gap-2 w-32">
                                <span className="text-slate-400 text-sm">₹</span>
                                <input 
                                    type="number" className="w-full border-b border-slate-200 focus:border-indigo-500 outline-none text-right font-bold text-slate-700"
                                    value={(taxProfile as any)[field.key]}
                                    onChange={e => updateTaxProfile({ [field.key]: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                    ))}
                    <div className="border-t border-slate-100 pt-3 flex justify-between font-bold text-slate-800">
                        <span>Total Gross Income</span>
                        <span>₹{(taxProfile.salary + taxProfile.houseProperty + taxProfile.businessProfession + taxProfile.capitalGains + taxProfile.otherSources).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <ShieldCheck className="text-emerald-600" /> Deductions (Old Regime)
                </h3>
                <div className="space-y-3">
                     {[
                        { label: '80C (LIC, PPF, ELSS)', key: 'deduction80C', max: 150000 },
                        { label: '80D (Health Ins.)', key: 'deduction80D', max: 75000 },
                        { label: '80CCD (NPS)', key: 'deduction80CCD', max: 50000 },
                        { label: 'HRA Exemption', key: 'hraExemption', max: null },
                        { label: 'Home Loan Interest', key: 'homeLoanInterest', max: 200000 },
                    ].map(field => (
                        <div key={field.key} className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-slate-600">{field.label}</label>
                                {field.max && <span className="text-[10px] text-slate-400">Max: ₹{field.max/1000}k</span>}
                            </div>
                            <div className="flex items-center gap-2 w-32">
                                <span className="text-slate-400 text-sm">₹</span>
                                <input 
                                    type="number" className="w-full border-b border-slate-200 focus:border-emerald-500 outline-none text-right font-bold text-slate-700"
                                    value={(taxProfile as any)[field.key]}
                                    onChange={e => updateTaxProfile({ [field.key]: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-6 bg-slate-50 p-4 rounded-lg">
                    <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                        <TrendingDown size={16} /> Tax Already Paid
                    </h4>
                     <div className="space-y-2">
                         <div className="flex justify-between items-center text-sm">
                            <label className="text-slate-600">TDS Deducted</label>
                            <input 
                                type="number" className="w-24 border rounded px-2 py-1 text-right text-xs"
                                value={taxProfile.tdsDeducted}
                                onChange={e => updateTaxProfile({ tdsDeducted: parseFloat(e.target.value) || 0 })}
                            />
                         </div>
                         <div className="flex justify-between items-center text-sm">
                            <label className="text-slate-600">Advance Tax Paid</label>
                            <input 
                                type="number" className="w-24 border rounded px-2 py-1 text-right text-xs"
                                value={taxProfile.advanceTaxPaid}
                                onChange={e => updateTaxProfile({ advanceTaxPaid: parseFloat(e.target.value) || 0 })}
                            />
                         </div>
                     </div>
                </div>
            </div>
        </div>
      )}

      {/* --- REGIME REFEREE --- */}
      {activeTab === 'regime' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-right">
              {/* Comparison Chart */}
              <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <Calculator className="text-indigo-600" /> Tax Liability Comparison
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-8 mb-8">
                      <div className={`p-6 rounded-xl border-2 text-center transition-all ${betterRegime === TaxRegime.OLD ? 'border-emerald-400 bg-emerald-50 scale-105 shadow-md' : 'border-slate-100 opacity-70'}`}>
                          <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Old Regime</div>
                          <div className="text-3xl font-black text-slate-800">₹{oldRes.tax.toLocaleString()}</div>
                          <div className="text-xs text-slate-500 mt-1">Taxable Income: ₹{oldRes.taxableIncome.toLocaleString()}</div>
                      </div>
                      <div className={`p-6 rounded-xl border-2 text-center transition-all ${betterRegime === TaxRegime.NEW ? 'border-emerald-400 bg-emerald-50 scale-105 shadow-md' : 'border-slate-100 opacity-70'}`}>
                          <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">New Regime</div>
                          <div className="text-3xl font-black text-slate-800">₹{newRes.tax.toLocaleString()}</div>
                          <div className="text-xs text-slate-500 mt-1">Taxable Income: ₹{newRes.taxableIncome.toLocaleString()}</div>
                      </div>
                  </div>

                  <div className="bg-slate-900 text-white p-6 rounded-xl flex items-center justify-between">
                      <div>
                          <div className="font-bold text-lg mb-1">Verdict: Choose {betterRegime}</div>
                          <div className="text-slate-400 text-sm">You save <span className="text-emerald-400 font-bold">₹{savings.toLocaleString()}</span> per year.</div>
                      </div>
                      <button 
                        onClick={() => updateTaxProfile({ selectedRegime: betterRegime })}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition"
                      >
                          Lock {betterRegime}
                      </button>
                  </div>
              </div>

              {/* Insights Panel */}
              <div className="space-y-4">
                  <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                      <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                          <HelpCircle size={18} /> Why this result?
                      </h4>
                      <p className="text-sm text-indigo-800 leading-relaxed mb-4">
                          {betterRegime === TaxRegime.NEW 
                            ? "The New Regime offers lower tax rates and a higher rebate limit (₹7L). Even with your deductions, the Old Regime slabs are too high."
                            : "Your deductions (80C, HRA, etc.) significantly lowered your taxable income in the Old Regime, beating the lower rates of the New Regime."}
                      </p>
                      
                      <div className="bg-white p-3 rounded-lg border border-indigo-200">
                          <div className="text-xs font-bold text-slate-400 uppercase">Effective Tax Rate</div>
                          <div className="text-2xl font-bold text-indigo-600">
                              {((Math.min(oldRes.tax, newRes.tax) / (taxProfile.salary + taxProfile.businessProfession + taxProfile.otherSources + taxProfile.capitalGains + taxProfile.houseProperty)) * 100).toFixed(1)}%
                          </div>
                      </div>
                  </div>

                  {taxProfile.tdsDeducted > Math.min(oldRes.tax, newRes.tax) && (
                      <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-start gap-3">
                          <TrendingDown className="text-emerald-600 shrink-0 mt-1" />
                          <div>
                              <h4 className="font-bold text-emerald-800 text-sm">Refund Alert!</h4>
                              <p className="text-xs text-emerald-700 mt-1">
                                  You have paid <strong>₹{(taxProfile.tdsDeducted - Math.min(oldRes.tax, newRes.tax)).toLocaleString()}</strong> extra in TDS. File ITR to claim refund.
                              </p>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* --- CALENDAR --- */}
      {activeTab === 'calendar' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <h3 className="font-bold text-slate-800 mb-6">Advance Tax Calendar</h3>
                  <div className="space-y-0 relative">
                      <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-200"></div>
                      {[
                          { date: 'Jun 15', pct: '15%', label: '1st Installment' },
                          { date: 'Sep 15', pct: '45%', label: '2nd Installment' },
                          { date: 'Dec 15', pct: '75%', label: '3rd Installment' },
                          { date: 'Mar 15', pct: '100%', label: 'Full Payment' },
                      ].map((item, idx) => {
                          const isPassed = new Date() > new Date(`${new Date().getFullYear()}-${item.date}`);
                          return (
                            <div key={idx} className="relative flex items-center gap-6 pl-10 py-4 group">
                                <div className={`absolute left-2.5 w-3 h-3 rounded-full border-2 z-10 ${isPassed ? 'bg-slate-300 border-slate-300' : 'bg-white border-indigo-600'}`}></div>
                                <div className="w-16 text-sm font-bold text-slate-500">{item.date}</div>
                                <div className={`flex-1 p-3 rounded-lg border ${isPassed ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-indigo-100 shadow-sm'}`}>
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-slate-800">{item.pct} Due</span>
                                        <span className="text-xs text-slate-400">{item.label}</span>
                                    </div>
                                    {!isPassed && (
                                        <div className="text-xs text-indigo-600 mt-1 font-medium">Upcoming Deadline</div>
                                    )}
                                </div>
                            </div>
                          )
                      })}
                  </div>
              </div>

              <div className="space-y-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                      <h3 className="font-bold text-slate-800 mb-4">Final Filing Date</h3>
                      <div className="text-center p-6 bg-rose-50 rounded-xl border border-rose-100">
                          <div className="text-4xl font-black text-rose-600 mb-1">JULY 31</div>
                          <div className="text-sm font-bold text-rose-800 uppercase tracking-widest">ITR Filing Deadline</div>
                          <p className="text-xs text-rose-600 mt-2">Penalty of ₹5,000 if missed.</p>
                      </div>
                  </div>

                  <div className="bg-slate-900 text-white p-6 rounded-xl">
                      <h4 className="font-bold mb-2 flex items-center gap-2">
                          <AlertTriangle className="text-yellow-400" size={18} /> Who pays Advance Tax?
                      </h4>
                      <p className="text-sm text-slate-300 leading-relaxed">
                          If your total tax liability (after TDS) is more than <strong>₹10,000</strong>, you must pay Advance Tax. 
                          Typically applies to Freelancers, Business Owners, and Salaried with high Capital Gains.
                      </p>
                  </div>
              </div>
          </div>
      )}

      {/* --- FILING ROOM --- */}
      {activeTab === 'filing' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <h3 className="font-bold text-slate-800 mb-4">Document Checklist</h3>
                  <div className="space-y-3">
                      {[
                          "Form 16 (From Employer)",
                          "Form 26AS (Tax Credit Statement)",
                          "AIS (Annual Information Statement)",
                          "Capital Gains Statement (From Broker)",
                          "Home Loan Certificate (Interest)",
                          "80C Investment Proofs"
                      ].map((item, i) => (
                          <label key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition">
                              <input type="checkbox" className="w-5 h-5 accent-indigo-600 rounded" />
                              <span className="text-slate-700 text-sm font-medium">{item}</span>
                          </label>
                      ))}
                  </div>
              </div>

              <div className="space-y-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                      <h3 className="font-bold text-slate-800 mb-4">Know Your Form</h3>
                      <div className="space-y-3 text-sm">
                          <div className="flex gap-3">
                              <div className="font-bold text-indigo-600 w-12">ITR-1</div>
                              <div className="text-slate-600">Salaried + 1 House Property + Interest Income (< 50L).</div>
                          </div>
                          <div className="flex gap-3">
                              <div className="font-bold text-indigo-600 w-12">ITR-2</div>
                              <div className="text-slate-600">Capital Gains (Stocks/MFs) + More than 1 House.</div>
                          </div>
                          <div className="flex gap-3">
                              <div className="font-bold text-indigo-600 w-12">ITR-3</div>
                              <div className="text-slate-600">Business Income / Intraday Trading.</div>
                          </div>
                          <div className="flex gap-3">
                              <div className="font-bold text-indigo-600 w-12">ITR-4</div>
                              <div className="text-slate-600">Presumptive Income (Freelancers/Small Biz).</div>
                          </div>
                      </div>
                  </div>

                  <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex gap-3 text-indigo-800 text-sm">
                      <Download size={20} className="shrink-0" />
                      <div>
                          <strong>Pro Tip:</strong> Always download your AIS (Annual Information Statement) before filing. It contains everything the Gov knows about your finances.
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default TaxManager;