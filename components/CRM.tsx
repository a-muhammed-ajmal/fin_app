import React from 'react';
import { useData } from '../contexts/DataContext';
import { LeadStage } from '../types';
import { User, Briefcase, Mail, Phone, MoreHorizontal } from 'lucide-react';

const CRM = () => {
  const { contacts } = useData();

  const getStageColor = (stage: LeadStage) => {
      switch(stage) {
          case LeadStage.WON: return 'bg-emerald-100 text-emerald-700';
          case LeadStage.LOST: return 'bg-slate-100 text-slate-500';
          case LeadStage.PROCESSING: return 'bg-indigo-100 text-indigo-700';
          default: return 'bg-amber-100 text-amber-700';
      }
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
             <h2 className="text-2xl font-bold text-slate-800">CRM & Network</h2>
             <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Add Contact</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.map(contact => (
                <div key={contact.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                            <User size={24} />
                        </div>
                        <button className="text-slate-400 hover:text-slate-600">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>
                    
                    <h3 className="font-bold text-lg text-slate-800">{contact.name}</h3>
                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
                        <Briefcase size={14} /> {contact.company || 'No Company'}
                    </div>

                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${getStageColor(contact.stage)}`}>
                        {contact.stage}
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-slate-50">
                        <button className="flex-1 py-1.5 flex items-center justify-center gap-2 text-sm bg-slate-50 hover:bg-slate-100 rounded text-slate-600">
                            <Mail size={14} /> Email
                        </button>
                         <button className="flex-1 py-1.5 flex items-center justify-center gap-2 text-sm bg-slate-50 hover:bg-slate-100 rounded text-slate-600">
                            <Phone size={14} /> Call
                        </button>
                    </div>
                </div>
            ))}
            
            {/* Add Card Placeholder */}
            <div className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 p-8 min-h-[200px] hover:border-indigo-300 hover:text-indigo-500 cursor-pointer transition">
                <User size={32} className="mb-2" />
                <span className="font-medium">Add New Lead</span>
            </div>
        </div>
    </div>
  );
};

export default CRM;