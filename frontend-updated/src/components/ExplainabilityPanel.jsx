import React, { useEffect, useRef } from 'react';
import { BarChart3, BookmarkCheck, ExternalLink, X } from 'lucide-react';
import gsap from 'gsap';

export default function ExplainabilityPanel({ analysis, isOpen, setIsOpen }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      gsap.to(panelRef.current, { x: 0, opacity: 1, duration: 0.4, ease: 'power3.out' });
      gsap.fromTo('.metric-bar', 
        { width: '0%' }, 
        { width: (i, el) => el.getAttribute('data-target-width'), duration: 0.6, delay: 0.2, stagger: 0.1 }
      );
    } else {
      gsap.to(panelRef.current, { x: '100%', opacity: 0, duration: 0.3, ease: 'power3.in' });
    }
  }, [isOpen, analysis]); // Triggers smoothly every time a different message analysis is selected

  const featureImportance = analysis?.feature_importance || {};
  const verifiableSources = analysis?.verifiable_sources || [];

  return (
    <div 
      ref={panelRef}
      style={{ transform: 'translateX(100%)', opacity: 0 }}
      className={`fixed top-[73px] right-0 bottom-0 w-full sm:w-85 bg-white border-l border-slate-200 z-30 shadow-2xl flex flex-col p-5 space-y-6 overflow-y-auto`}
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            <span>Inspection Engine</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Isolated lineage for selected query entry</p>
        </div>
        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Feature Importance Metric Layout */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Decision Weights</h4>
        <div className="space-y-3">
          {Object.keys(featureImportance).length > 0 ? (
            Object.entries(featureImportance).map(([feature, weight]) => (
              <div key={feature} className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-600">
                  <span className="truncate max-w-[80%] capitalize">{feature.replace(/_/g, ' ')}</span>
                  <span className="font-bold text-blue-600">{(weight * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="metric-bar bg-blue-600 h-full rounded-full" 
                    data-target-width={`${weight * 100}%`}
                  ></div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs text-slate-400 italic py-2">No clinical metric allocations recorded for this query.</div>
          )}
        </div>
      </div>

      {verifiableSources.length > 0 && (
        <>
          <hr className="border-slate-100" />
          {/* Clinical Reference / Citation Layout */}
          <div className="space-y-3 flex-1">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <BookmarkCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Clinical Citations</span>
            </h4>
            <div className="space-y-3">
              {verifiableSources.map((src, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span className="truncate max-w-[85%]">{src.source_name}</span>
                    {src.url && (
                      <a href={src.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 transition">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  {src.exact_quote && (
                    <blockquote className="text-[11px] leading-relaxed text-slate-500 italic bg-white p-2 rounded border border-slate-100">
                      "{src.exact_quote}"
                    </blockquote>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}