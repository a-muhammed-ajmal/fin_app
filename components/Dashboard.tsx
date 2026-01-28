import React, { useEffect, useState } from 'react';
import { useData } from '../contexts/DataContext';
import { CheckCircle2, TrendingUp, DollarSign, BrainCircuit, Sparkles } from 'lucide-react';
import { generateLifeInsights } from '../services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TaskCategory } from '../types';

const Dashboard = () => {
  const data = useData();
  const [insight, setInsight] = useState<string>("Generatng insights...");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initial load insight
    const loadInsight = async () => {
        setLoading(true);
        const txt = await generateLifeInsights(data);
        setInsight(txt);
        setLoading(false);
    };
    loadInsight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const todayTasks = data.tasks.filter(t => t.isTodayFocus && !t.completed);
  const completedToday = data.tasks.filter(t => t.completed).length; // Simplified for demo
  const totalBalance = data.transactions.reduce((acc, curr) => curr.type === 'Income' ? acc + curr.amount : acc - curr.amount, 0);

  const taskStats = Object.values(TaskCategory).map(cat => ({
    name: cat,
    value: data.tasks.filter(t => t.category === cat && !t.completed).length
  })).filter(i => i.value > 0);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#64748b'];

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">Good Morning</h1>
            <p className="text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full font-medium flex items-center gap-2">
            <Sparkles size={18} />
            <span>Score: 85/100</span>
        </div>
      </header>

      {/* AI Insight */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 font-semibold text-indigo-100">
                <BrainCircuit size={20} />
                <span>Life OS Assistant</span>
            </div>
            <p className="text-lg leading-relaxed opacity-95">
                {loading ? "Analyzing your second brain..." : insight}
            </p>
        </div>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Focus */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 col-span-1 md:col-span-2">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500" />
                Today's Focus
            </h2>
            <div className="space-y-3">
                {todayTasks.length === 0 ? (
                    <div className="text-slate-400 text-center py-8">All focus tasks completed! Great job.</div>
                ) : (
                    todayTasks.map(task => (
                        <div key={task.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg group hover:bg-slate-100 transition-colors">
                            <button 
                                onClick={() => data.updateTask(task.id, { completed: true })}
                                className="w-6 h-6 rounded-full border-2 border-slate-300 hover:border-emerald-500 transition-colors"
                            />
                            <span className="font-medium text-slate-700">{task.title}</span>
                            <span className={`text-xs px-2 py-1 rounded ml-auto ${task.priority === 'P1' ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-600'}`}>
                                {task.priority}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-rows-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-center">
                <h3 className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-2">
                    <DollarSign size={16} /> Net Worth Trend
                </h3>
                <div className="text-3xl font-bold text-slate-800">${totalBalance.toLocaleString()}</div>
                <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center">
                    <TrendingUp size={12} className="mr-1" /> +12% this month
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                 <h3 className="text-sm font-medium text-slate-500 mb-2">Task Distribution</h3>
                 <div className="h-24 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={taskStats}
                                cx="50%"
                                cy="50%"
                                innerRadius={25}
                                outerRadius={40}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {taskStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;