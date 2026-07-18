import React, { useState, useRef, useEffect } from 'react';
import { Stethoscope, Send, ShieldCheck, BarChart3 } from 'lucide-react';
import gsap from 'gsap';

export default function ChatArea({ setActiveAnalysis, setIsInspectorOpen }) {
  const [input, setInput] = useState('');
  const chatContainerRef = useRef(null);
  const welcomeRef = useRef(null);
  
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Welcome to MedPulse AI. To begin your clinical profiling, please provide your current symptoms along with any known metrics such as **Blood Pressure (BP)**, **Sugar Levels**, or heart rate.',
      analysis: { feature_importance: {}, verifiable_sources: [] }
    }
  ]);

  useEffect(() => {
    if (welcomeRef.current) {
      gsap.fromTo(welcomeRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
    }
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    const updatedMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(updatedMessages);
    setInput('');

    setTimeout(() => {
      if (chatContainerRef.current) {
        gsap.to(chatContainerRef.current, { scrollTop: chatContainerRef.current.scrollHeight, duration: 0.3 });
      }
    }, 50);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) throw new Error('Server network connection failure.');
      const data = await response.json();

      const recommendationText = data.recommendation_text || data.recommendation || "";
      const attachedAnalysis = {
        feature_importance: data.feature_importance || {},
        verifiable_sources: data.verifiable_sources || [],
      };

      // 1. Pack the analysis variables permanently INTO this specific message block
      setMessages([...updatedMessages, { 
        role: 'assistant', 
        content: recommendationText,
        analysis: attachedAnalysis
      }]);

      // 2. Set the global view target explicitly to this newly created bundle
      setActiveAnalysis(attachedAnalysis);
      setIsInspectorOpen(true);

    } catch (error) {
      console.error('Connection error linking backend:', error);
      setMessages([...updatedMessages, { 
        role: 'assistant', 
        content: 'Unable to synchronize with the diagnostic core. Please ensure the backend server is listening.' 
      }]);
    }

    setTimeout(() => {
      if (chatContainerRef.current) {
        gsap.to(chatContainerRef.current, { scrollTop: chatContainerRef.current.scrollHeight, duration: 0.4 });
      }
    }, 100);
  };

  return (
    <div className="flex-1 flex flex-col bg-white h-full relative">
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-3xl mx-auto w-full flex flex-col justify-start">
        
        <div ref={welcomeRef} className="text-center space-y-3 pt-6 pb-4 border-b border-slate-100 w-full">
          <div className="inline-flex p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Stethoscope className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Clinical Intake Portal</h2>
          <p className="text-xs text-slate-400">Metric-guided diagnostic reasoning engine.</p>
        </div>

        <div className="space-y-4 w-full mt-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 sm:gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role !== 'user' && (
                <div className="h-8 w-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                  M
                </div>
              )}
              <div className={`p-4 rounded-2xl max-w-[85%] sm:max-w-xl text-sm leading-relaxed border shadow-sm ${
                msg.role === 'user' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-800 border-slate-100'
              }`}>
                <div className="whitespace-pre-line">{msg.content}</div>
                {msg.role !== 'user' && msg.analysis && (
                  <button 
                    onClick={() => {
                      // Explicitly load ONLY this specific item's dictionary keys into the display panel view
                      setActiveAnalysis(msg.analysis);
                      setIsInspectorOpen(true);
                    }}
                    className="mt-3 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition pt-2 border-t border-slate-200/60 w-full"
                  >
                    <BarChart3 className="h-3 w-3" />
                    <span>Inspect Lineage & Metric Weights</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 bg-white z-10">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto flex items-center gap-2 border border-slate-200 rounded-xl p-2 bg-slate-50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter BP, Sugar level, or current symptoms..." 
            className="flex-1 bg-transparent border-none outline-none text-sm px-2 text-slate-800 placeholder-slate-400"
          />
          <button type="submit" className="p-2.5 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition shadow-sm">
            <Send className="h-4 w-4" />
          </button>
        </form>
        <div className="max-w-3xl mx-auto flex justify-between items-center text-[10px] sm:text-[11px] text-slate-400 mt-2 px-1">
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span>Intake Active</span>
          </div>
          <div className="flex items-center gap-1 font-medium text-slate-500">
            <ShieldCheck className="h-3 w-3 text-blue-600" />
            <span>Clinical Precision Mode Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}