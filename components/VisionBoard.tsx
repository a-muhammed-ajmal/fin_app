import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Target, Flag, Compass, Heart, ArrowUp, ArrowDown, ShieldCheck, HelpCircle } from 'lucide-react';
import { LifeGoal } from '../types';

const VisionBoard = () => {
  const { missionStatement, updateMission, goals, lifeGoals, setLifeGoals } = useData();
  const [isEditingWhy, setIsEditingWhy] = useState(lifeGoals.length === 0);
  
  // Temporary state for the "Why Check" wizard
  const [tempGoals, setTempGoals] = useState<LifeGoal[]>(
    lifeGoals.length > 0 
    ? lifeGoals 
    : [
        { id: '1', title: '', type: 'Must-Have' },
        { id: '2', title: '', type: 'Must-Have' },
        { id: '3', title: '', type: 'Good-to-Have' },
      ]
  );

  const handleGoalChange = (id: string, field: keyof LifeGoal, value: string) => {
    setTempGoals(prev => prev.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  const moveGoal = (index: number, direction: 'up' | 'down') => {
    const newGoals = [...tempGoals];
    if (direction === 'up' && index > 0) {
      [newGoals[index], newGoals[index - 1]] = [newGoals[index - 1], newGoals[index]];
    } else if (direction === 'down' && index < newGoals.length - 1) {
      [newGoals[index], newGoals[index + 1]] = [newGoals[index + 1], newGoals[index]];
    }
    setTempGoals(newGoals);
  };

  const saveWhyCheck = () => {
    // Filter out empty goals
    const validGoals = tempGoals.filter(g => g.title.trim() !== '');
    if (validGoals.length === 0) return;
    setLifeGoals(validGoals);
    setIsEditingWhy(false);
  };

  const mustHaves = lifeGoals.filter(g => g.type === 'Must-Have');
  const goodToHaves = lifeGoals.filter(g => g.type === 'Good-to-Have');

  return (
    <div className="space-y-8 animate-in fade-in">
        <div className="flex justify-between items-center">
             <h2 className="text-2xl font-bold text-slate-800">Vision & Goals</h2>
        </div>

        {/* The 'Why' Check Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-800 p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <ShieldCheck size={28} className="text-indigo-400" />
                    <div>
                        <h3 className="font-bold text-xl">The "Why" Check</h3>
                        <p className="text-slate-400 text-sm">Your psychological anchor for difficult days.</p>
                    </div>
                </div>
                {!isEditingWhy && (
                    <button 
                        onClick={() => { setTempGoals(lifeGoals); setIsEditingWhy(true); }}
                        className="text-sm bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded transition"
                    >
                        Edit
                    </button>
                )}
            </div>
            
            <div className="p-6">
                {isEditingWhy ? (
                    <div className="space-y-6">
                        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg flex gap-3 text-indigo-800 text-sm">
                            <HelpCircle className="shrink-0" size={20} />
                            <p><strong>Psychological Check:</strong> What are your non-negotiable life goals? List 3 distinct outcomes you are striving for. Separate true "Must-Haves" from "Good-to-Haves" to filter out social envy.</p>
                        </div>
                        
                        <div className="space-y-3">
                            {tempGoals.map((goal, index) => (
                                <div key={goal.id} className="flex gap-2 items-center group">
                                    <div className="flex flex-col gap-1 text-slate-400">
                                        <button 
                                            onClick={() => moveGoal(index, 'up')}
                                            disabled={index === 0}
                                            className="hover:text-indigo-600 disabled:opacity-30"
                                        >
                                            <ArrowUp size={16} />
                                        </button>
                                        <button 
                                            onClick={() => moveGoal(index, 'down')}
                                            disabled={index === tempGoals.length - 1}
                                            className="hover:text-indigo-600 disabled:opacity-30"
                                        >
                                            <ArrowDown size={16} />
                                        </button>
                                    </div>
                                    <div className="flex-1 flex flex-col md:flex-row gap-2">
                                        <input 
                                            type="text" 
                                            placeholder={`Goal #${index + 1}`}
                                            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                            value={goal.title}
                                            onChange={(e) => handleGoalChange(goal.id, 'title', e.target.value)}
                                        />
                                        <select 
                                            className={`border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium ${
                                                goal.type === 'Must-Have' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                            }`}
                                            value={goal.type}
                                            onChange={(e) => handleGoalChange(goal.id, 'type', e.target.value as any)}
                                        >
                                            <option value="Must-Have">Must-Have (Non-Negotiable)</option>
                                            <option value="Good-to-Have">Good-to-Have (Bonus)</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end pt-4 border-t border-slate-100">
                             <button 
                                onClick={saveWhyCheck}
                                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2"
                             >
                                Confirm & Generate Tasks
                             </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h4 className="font-bold text-rose-700 uppercase tracking-wider text-xs flex items-center gap-2 border-b border-rose-100 pb-2">
                                <Heart size={14} fill="currentColor" /> Must-Haves
                            </h4>
                            {mustHaves.length > 0 ? (
                                <ul className="space-y-3">
                                    {mustHaves.map((g, i) => (
                                        <li key={i} className="flex items-start gap-3 text-slate-700 font-medium">
                                            <span className="bg-rose-100 text-rose-600 w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">{i+1}</span>
                                            {g.title}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-slate-400 italic text-sm">No non-negotiables defined.</p>
                            )}
                        </div>
                        
                        <div className="space-y-4">
                             <h4 className="font-bold text-emerald-600 uppercase tracking-wider text-xs flex items-center gap-2 border-b border-emerald-100 pb-2">
                                <Target size={14} /> Good-to-Haves
                            </h4>
                            {goodToHaves.length > 0 ? (
                                <ul className="space-y-3">
                                    {goodToHaves.map((g, i) => (
                                        <li key={i} className="flex items-start gap-3 text-slate-600">
                                            <span className="bg-emerald-100 text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">{i+1}</span>
                                            {g.title}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-slate-400 italic text-sm">No nice-to-haves defined.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>

        <div className="bg-indigo-900 text-white p-8 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-4 text-indigo-300">
                <Compass size={24} />
                <h3 className="uppercase tracking-widest text-sm font-bold">Personal Mission Statement</h3>
            </div>
            <textarea 
                className="w-full bg-transparent text-2xl md:text-3xl font-serif text-white placeholder-indigo-400 focus:outline-none resize-none text-center leading-relaxed"
                value={missionStatement}
                onChange={(e) => updateMission(e.target.value)}
                rows={3}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Target className="text-indigo-600" />
                    Strategic Goals (1-5 Years)
                </h3>
                <div className="space-y-6">
                    {goals.map(goal => (
                        <div key={goal.id}>
                            <div className="flex justify-between text-sm font-medium mb-1">
                                <span className="text-slate-700">{goal.title}</span>
                                <span className="text-slate-400">{goal.horizon}</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${goal.progress}%` }}></div>
                            </div>
                        </div>
                    ))}
                    <button className="w-full py-2 border border-dashed border-slate-300 text-slate-400 rounded-lg hover:border-indigo-400 hover:text-indigo-500 text-sm transition">
                        + Add Strategic Goal
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Flag className="text-rose-500" />
                    Core Values
                </h3>
                <div className="flex flex-wrap gap-2">
                    {["Integrity", "Growth", "Family First", "Financial Freedom", "Creativity"].map(val => (
                        <span key={val} className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-slate-600 text-sm">
                            {val}
                        </span>
                    ))}
                    <button className="px-3 py-1 border border-dashed border-slate-300 rounded-full text-slate-400 text-sm hover:border-slate-400 hover:text-slate-600">
                        +
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default VisionBoard;