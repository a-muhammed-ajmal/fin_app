import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { TaskCategory, Priority, Task } from '../types';
import { Plus, Check, Filter, Trash2, Calendar } from 'lucide-react';

const TaskManager = () => {
  const { tasks, addTask, updateTask, deleteTask } = useData();
  const [filter, setFilter] = useState<TaskCategory | 'All'>('All');
  const [showAdd, setShowAdd] = useState(false);

  // New task state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>(TaskCategory.INBOX);
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>(Priority.P4);

  const filteredTasks = tasks.filter(t => 
    !t.completed && (filter === 'All' || t.category === filter)
  );

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask({
        title: newTaskTitle,
        category: newTaskCategory,
        priority: newTaskPriority,
        completed: false,
        isTodayFocus: false,
    });
    setNewTaskTitle('');
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">Tasks & Projects</h2>
            <button 
                onClick={() => setShowAdd(!showAdd)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
            >
                <Plus size={18} /> Add Task
            </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button 
                onClick={() => setFilter('All')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${filter === 'All' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
            >
                All
            </button>
            {Object.values(TaskCategory).map(cat => (
                <button 
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${filter === cat ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
                >
                    {cat}
                </button>
            ))}
        </div>

        {/* Add Task Form */}
        {showAdd && (
            <form onSubmit={handleAddTask} className="bg-white p-4 rounded-xl shadow-md border border-indigo-100 animate-in fade-in slide-in-from-top-4">
                <input 
                    type="text" 
                    placeholder="What needs to be done?" 
                    className="w-full text-lg border-b border-slate-200 pb-2 mb-4 focus:outline-none focus:border-indigo-500"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    autoFocus
                />
                <div className="flex gap-4">
                    <select 
                        value={newTaskCategory}
                        onChange={(e) => setNewTaskCategory(e.target.value as TaskCategory)}
                        className="text-sm border border-slate-200 rounded px-2 py-1"
                    >
                        {Object.values(TaskCategory).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select 
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                        className="text-sm border border-slate-200 rounded px-2 py-1"
                    >
                        {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <button type="submit" className="ml-auto bg-indigo-600 text-white px-4 py-1 rounded text-sm">Save</button>
                </div>
            </form>
        )}

        {/* Task List */}
        <div className="grid gap-3">
            {filteredTasks.length === 0 && (
                <div className="text-center py-10 text-slate-400">No active tasks in this view.</div>
            )}
            {filteredTasks.map(task => (
                <div key={task.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 group hover:shadow-md transition-all">
                    <button 
                        onClick={() => updateTask(task.id, { completed: true })}
                        className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 transition-colors flex items-center justify-center"
                    >
                        <Check size={12} className="text-emerald-500 opacity-0 hover:opacity-100" />
                    </button>
                    
                    <div className="flex-1">
                        <div className="font-medium text-slate-800">{task.title}</div>
                        <div className="text-xs text-slate-500 flex gap-2 mt-1">
                            <span className="bg-slate-100 px-2 py-0.5 rounded">{task.category}</span>
                            {task.dueDate && <span className="flex items-center gap-1"><Calendar size={10} /> {task.dueDate}</span>}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                         <button 
                            onClick={() => updateTask(task.id, { isTodayFocus: !task.isTodayFocus })}
                            className={`p-1.5 rounded-full transition-colors ${task.isTodayFocus ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-amber-500'}`}
                            title="Toggle Today's Focus"
                        >
                            <div className="w-2 h-2 bg-current rounded-full" />
                        </button>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                            task.priority === 'P1' ? 'bg-red-100 text-red-600' : 
                            task.priority === 'P2' ? 'bg-orange-100 text-orange-600' :
                            'bg-slate-100 text-slate-500'
                        }`}>{task.priority}</span>
                        
                        <button 
                            onClick={() => deleteTask(task.id)}
                            className="text-slate-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default TaskManager;