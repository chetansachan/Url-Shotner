import React from 'react';
import { X, Server, Database, Zap, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ArchitectureDrawer({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-white/10">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-2">
          <Server className="w-4 h-4" />
          <span>System Blueprint & Data Flow</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Architecture & Concurrency Design
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          High-throughput URL shortener with sub-millisecond read latency and write-behind durability.
        </p>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/20">
            <Zap className="w-5 h-5 text-indigo-400 mb-2" />
            <h4 className="text-sm font-bold text-white">Redis Cache & Buffer</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Dual-role in-memory tier: URL cache with TTL + atomic INCR click buffer with periodic worker flush.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/20">
            <Database className="w-5 h-5 text-cyan-400 mb-2" />
            <h4 className="text-sm font-bold text-white">PostgreSQL 16</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Indexed persistent store. Even if Redis restarts, all links and aggregate counts remain intact.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/20">
            <Shield className="w-5 h-5 text-purple-400 mb-2" />
            <h4 className="text-sm font-bold text-white">Stampede Defense</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Singleflight deduplicates concurrent cache misses, guarding DB from viral link request floods.
            </p>
          </div>
        </div>

        {/* Workflow list */}
        <div className="space-y-3 p-4 rounded-2xl bg-slate-900/60 border border-white/5 text-xs text-slate-300">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Creation Path:</strong> Base62 code generated &bull; Inserted into Postgres &bull; Pre-warmed into Redis with 1h TTL.
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Redirect Path:</strong> Redis GET lookup (sub-millisecond) &bull; If hit, returns 302 &bull; Increments buffered click counter non-blockingly.
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Write-Behind Flusher:</strong> Background Go worker periodically drains dirty counters via atomic swaps into PostgreSQL batch updates.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

