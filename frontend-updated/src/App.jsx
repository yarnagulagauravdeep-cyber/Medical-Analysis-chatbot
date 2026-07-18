import React, { useState } from 'react';
import Navbar from './components/Navbar';
import ChatArea from './components/ChatArea';
import ExplainabilityPanel from './components/ExplainabilityPanel';
import AboutView from './components/AboutView';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState('home');
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  
  // Clean initialization with no hardcoded placeholder data
  const [activeAnalysis, setActiveAnalysis] = useState({
    feature_importance: {},
    verifiable_sources: []
  });

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <Navbar currentRoute={currentRoute} setCurrentRoute={setCurrentRoute} />
      
      <div className="flex-1 relative overflow-hidden">
        {currentRoute === 'home' ? (
          <div className="w-full h-full flex justify-center">
            <div className="w-full max-w-5xl h-full flex relative">
              <ChatArea 
                setActiveAnalysis={setActiveAnalysis} 
                setIsInspectorOpen={setIsInspectorOpen} 
              />
              <ExplainabilityPanel 
                analysis={activeAnalysis} 
                isOpen={isInspectorOpen} 
                setIsOpen={setIsInspectorOpen} 
              />
            </div>
          </div>
        ) : (
          <AboutView />
        )}
      </div>
    </div>
  );
}