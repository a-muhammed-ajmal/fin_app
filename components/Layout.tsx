import React, { useState } from 'react';
import { LayoutDashboard, CheckSquare, Calendar, Wallet, Users, Mountain, Menu, X, Bot, Settings } from 'lucide-react';
import Dashboard from './Dashboard';
import TaskManager from './TaskManager';
import HabitTracker from './HabitTracker';
import FinanceManager from './FinanceManager';
import CRM from './CRM';
import VisionBoard from './VisionBoard';
import AIAssistant from './AIAssistant';
import DataManager from './DataManager';

const Layout = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'habits', label: 'Habits', icon: Calendar },
    { id: 'finance', label: 'Finance', icon: Wallet },
    { id: 'crm', label: 'CRM', icon: Users },
    { id: 'vision', label: 'Vision', icon: Mountain },
    { id: 'ai', label: 'AI Assistant', icon: Bot },
    { id: 'data', label: 'Data Manager', icon: Settings },
  ];

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'tasks': return <TaskManager />;
      case 'habits': return <HabitTracker />;
      case 'finance': return <FinanceManager />;
      case 'crm': return <CRM />;
      case 'vision': return <VisionBoard />;
      case 'ai': return <AIAssistant />;
      case 'data': return <DataManager />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200">
        <div className="p-6 border-b border-slate-50">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Life OS
            </h1>
            <p className="text-xs text-slate-400 mt-1">v1.0.0 • Offline Active</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === item.id 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                    <item.icon size={20} className={activeTab === item.id ? 'text-indigo-600' : 'text-slate-400'} />
                    {item.label}
                </button>
            ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center z-20">
             <h1 className="text-xl font-bold text-indigo-700">Life OS</h1>
             <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X /> : <Menu />}
             </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
            <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-200 z-10 shadow-xl animate-in slide-in-from-top-2">
                <nav className="p-4 space-y-1">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                            activeTab === item.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
                        }`}
                    >
                        <item.icon size={20} />
                        {item.label}
                    </button>
                ))}
                </nav>
            </div>
        )}

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
            <div className="max-w-6xl mx-auto">
                {renderContent()}
            </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;