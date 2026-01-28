import React, { useState, useRef, useEffect } from 'react';
import { chatWithAssistant } from '../services/geminiService';
import { Send, Bot, User } from 'lucide-react';

interface Message {
    role: 'user' | 'system' | 'assistant';
    content: string;
}

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
      { role: 'assistant', content: 'Hello! I am your Life OS Assistant. How can I help you organize your life today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    // Prepare history string
    const history = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`);
    
    const response = await chatWithAssistant(history, userMsg);
    
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
            <Bot className="text-indigo-600" />
            <h2 className="font-bold text-slate-800">Life OS Assistant</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 ${
                        msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-slate-100 text-slate-800 rounded-bl-none'
                    }`}>
                        <div className="flex items-center gap-2 mb-1 text-xs opacity-70">
                            {msg.role === 'user' ? <User size={12}/> : <Bot size={12}/>}
                            {msg.role === 'user' ? 'You' : 'Assistant'}
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                    </div>
                </div>
            ))}
            {loading && (
                <div className="flex justify-start">
                    <div className="bg-slate-100 p-4 rounded-2xl rounded-bl-none">
                        <div className="flex gap-1">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75" />
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150" />
                        </div>
                    </div>
                </div>
            )}
        </div>

        <div className="p-4 border-t border-slate-100">
            <form onSubmit={handleSend} className="flex gap-2">
                <input 
                    type="text" 
                    className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                    placeholder="Ask for advice, plan a project, or reflect on your day..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={loading}
                />
                <button 
                    type="submit" 
                    disabled={loading || !input.trim()}
                    className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    </div>
  );
};

export default AIAssistant;