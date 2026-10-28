import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle2, AlertCircle, Link2, Layers, ExternalLink } from 'lucide-react';
import { checkHealth } from '../api';

export default function Navbar({ onOpenArchitecture }) {
  const [health, setHealth] = useState({ status: 'checking' });

  useEffect(() => {
    let mounted = true;
    const verifyHealth = async () => {
      const res = await checkHealth();
      if (mounted) setHealth(res);
    };

    verifyHealth();
    const interval = setInterval(verifyHealth, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#090b10]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-[#090b10] rounded-[11px] flex items-center justify-center">
              <Link2 className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                LinkPulse
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Ultra-low latency URL engine
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Health status pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-white/5 text-xs font-medium">
            {health.status === 'checking' && (
              <>
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="text-slate-400">Pinging Core...</span>
              </>
            )}
            {health.status === 'healthy' && (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 font-medium">System Online</span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400 text-[11px]">DB + Redis OK</span>
              </>
            )}
            {health.status === 'degraded' && (
              <>
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-rose-400">Offline</span>
              </>
            )}
          </div>

          {/* Architecture Modal Button */}
          <button
            onClick={onOpenArchitecture}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            Architecture
          </button>
        </div>
      </div>
    </header>
  );
}
