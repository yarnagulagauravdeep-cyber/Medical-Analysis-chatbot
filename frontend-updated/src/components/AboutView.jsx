import React, { useEffect, useRef } from 'react';
import { ShieldAlert, Cpu, HeartPulse } from 'lucide-react';
import gsap from 'gsap';

export default function AboutView() {
  const containerRef = useRef(null);
  const pulseRingRef = useRef(null);
  const statusDotRef = useRef(null);

  useEffect(() => {
    // 1. Entrance Stagger Animation (Existing)
    gsap.fromTo(containerRef.current.children, 
      { opacity: 0, y: 15 }, 
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
    );

    // 2. Continuous Medical Heartbeat Radar Loop Animation
    const pulseTimeline = gsap.timeline({ repeat: -1 });
    pulseTimeline
      .fromTo(pulseRingRef.current,
        { scale: 0.8, opacity: 0.5 },
        { scale: 2.2, opacity: 0, duration: 1.4, ease: 'quad.out' }
      );

    gsap.fromTo(statusDotRef.current,
      { opacity: 0.4 },
      { opacity: 1, duration: 0.7, yoyo: true, repeat: -1, ease: 'sine.inOut' }
    );

    return () => {
      pulseTimeline.kill();
    };
  }, []);

  return (
    <div ref={containerRef} className="max-w-3xl mx-auto px-6 py-12 space-y-8 h-full overflow-y-auto">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">About MedPulse AI</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          An explainable health navigation assistant engineered to surface clinical trust parameters directly to non-technical end users.
        </p>
      </div>

      {/* Developers Section */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-lg font-bold text-slate-700 tracking-tight">Project Developers</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Your Profile */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800">Gaurav Deep Yarnagula</h4>
            <a 
              href="https://github.com/yarnagulagauravdeep-cyber" 
              target="_blank" 
              rel="noreferrer" 
              className="inline-block text-xs text-blue-600 hover:underline pt-1 font-medium"
            >
              GitHub Profile ↗
            </a>
          </div>

          {/* Partner Profile */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800">Srivignesh.s</h4>
            <a 
              href="https://github.com/Srivignesh-1302" 
              target="_blank" 
              rel="noreferrer" 
              className="inline-block text-xs text-blue-600 hover:underline pt-1 font-medium"
            >
              GitHub Profile ↗
            </a>
          </div>

        </div>
      </div>

      {/* Animated Core Status Dashboard UI */}
      <div className="pt-6 border-t border-slate-100">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl relative overflow-hidden shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          
          <div className="space-y-2 relative z-10 text-center sm:text-left">
            <h4 className="text-base font-bold text-slate-800">Explainability Engine Active</h4>
            <p className="text-xs text-slate-400 max-w-sm">
              Listening for inbound pipeline diagnostic matrices. Metric tracing loops verified via structural schema bindings.
            </p>
          </div>

          {/* Animated Wave Indicator Container */}
          <div className="relative flex items-center justify-center w-20 h-20 flex-shrink-0">
            {/* Pulsing Outer Radar Ring */}
            <div 
              ref={pulseRingRef} 
              className="absolute w-10 h-10 bg-blue-500/20 rounded-full pointer-events-none"
            />
            {/* Steady Glowing Target Core Center */}
            <div 
              ref={statusDotRef}
              className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-md shadow-blue-500/30 z-10"
            >
              <HeartPulse className="h-5 w-5 text-white animate-pulse" />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}