import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Flame, Plus, CalendarCheck } from 'lucide-react';

const HabitTracker = () => {
  const { habits, addHabit, toggleHabit } = useData();
  const [newHabitName, setNewHabitName] = useState('');
  
  // Generate last 7 days for the view
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const handleAdd = (e: React.FormEvent) => {
      e.preventDefault();
      if(newHabitName) {
          addHabit({ title: newHabitName, category: 'Personal' });
          setNewHabitName('');
      }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">Habit Tracker</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Habit List & Grid */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-2">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                    <thead>
                        <tr>
                            <th className="text-left pb-4 text-slate-500 font-medium">Habit</th>
                            <th className="pb-4 text-slate-500 font-medium w-24">Streak</th>
                            {dates.map(d => (
                                <th key={d} className="pb-4 text-slate-500 font-normal text-xs w-12 text-center">
                                    {new Date(d).toLocaleDateString('en-US', { weekday: 'short' })}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {habits.map(habit => (
                            <tr key={habit.id} className="border-t border-slate-50">
                                <td className="py-4 font-medium text-slate-700">{habit.title}</td>
                                <td className="py-4 text-center">
                                    <div className="flex items-center justify-center gap-1 text-orange-500 font-bold bg-orange-50 rounded-full py-1 px-2 text-xs w-fit mx-auto">
                                        <Flame size={12} fill="currentColor" /> {habit.streak}
                                    </div>
                                </td>
                                {dates.map(date => (
                                    <td key={date} className="py-4 text-center">
                                        <button 
                                            onClick={() => toggleHabit(habit.id, date)}
                                            className={`w-8 h-8 rounded-lg transition-all ${
                                                habit.history[date] 
                                                ? 'bg-indigo-600 text-white shadow-indigo-200 shadow-md' 
                                                : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                                            }`}
                                        >
                                            <CalendarCheck size={16} className="mx-auto" />
                                        </button>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Habit */}
            <form onSubmit={handleAdd} className="mt-6 flex gap-4 max-w-md">
                <input 
                    type="text" 
                    placeholder="New habit name..." 
                    className="flex-1 border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                />
                <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900 flex items-center gap-2">
                    <Plus size={18} /> Add
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default HabitTracker;