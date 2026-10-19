import React, { useState, useEffect, useRef } from 'react';
import { Search, BarChart3, RefreshCw, MousePointerClick, Calendar, ArrowUpRight, Check, Copy } from 'lucide-react';
import gsap from 'gsap';
import { getUrlStats } from '../api';

export default function StatsInspector({ prefillCode, onSelectCode }) {
  const [code, setCode] = useState(prefillCode || '');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const countRef = useRef(null);
  const cardRef = useRef(null);

  const fetchStats = async (targetCode) => {
    const query = (targetCode || code).trim();
    if (!query) return;

    try {
      setLoading(true);
      setError('');
      const data = await getUrlStats(query);
      setStats(data);

      // Animate card entrance
      setTimeout(() => {
        if (cardRef.current) {
          gsap.fromTo(
            cardRef.current,
            { y: 15, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }
          );
        }
        // Animate counter
        if (countRef.current) {
          const target = data.click_count || 0;
          gsap.fromTo(
            countRef.current,
            { innerText: 0 },
            {
              innerText: target,
              duration: 1,
              snap: { innerText: 1 },
              ease: 'power2.out',
            }
          );
        }
      }, 50);
    } catch (err) {
      setError(err.message);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (prefillCode) {
      setCode(prefillCode);
      fetchStats(prefillCode);
    }
  }, [prefillCode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchStats();
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      {/* Search Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 glow-purple shadow-xl">
        <div className="flex items-center gap-2 mb-4 text-purple-400 font-semibold text-xs tracking-wider uppercase">
          <BarChart3 className="w-4 h-4" />
          <span>Real-Time Analytics Inspector</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
          Inspect Any Short Link
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mb-6">
          Track verified relational click counts and timestamp data directly from the persistent store.
        </p>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter short code (e.g. 66xdtZj) or full short URL..."
              className="w-full pl-11 pr-4 py-3 bg-slate-900/90 rounded-2xl border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Lookup'}
          </button>
        </form>

        {error && (
          <p className="mt-3 text-xs text-rose-400">
            {error}
          </p>
        )}
      </div>

      {/* Stats Display Card */}
      {stats && (
        <div
          ref={cardRef}
          className="mt-6 glass-panel rounded-2xl p-6 border border-purple-500/30 relative overflow-hidden shadow-2xl"
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-xl border border-purple-500/20">
                /r/{stats.short_code}
              </span>
              <span className="text-xs text-slate-400">
                Created: {new Date(stats.created_at).toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => fetchStats(stats.short_code)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Refresh Stats"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Click Count Metric */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                  <MousePointerClick className="w-3.5 h-3.5 text-cyan-400" />
                  Total Registered Clicks
                </p>
                <div className="text-3xl font-extrabold font-mono text-white flex items-baseline gap-1">
                  <span ref={countRef}>{stats.click_count || 0}</span>
                  <span className="text-xs font-normal text-slate-500">hits</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <MousePointerClick className="w-5 h-5 text-cyan-400" />
              </div>
            </div>

            {/* Created Timestamp Metric */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  Origin Timestamp
                </p>
                <p className="text-sm font-semibold text-slate-200">
                  {new Date(stats.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
                <p className="text-xs font-mono text-slate-400">
                  {new Date(stats.created_at).toLocaleTimeString()}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </div>

          {/* Original URL Preview */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-white/5 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Destination URL
            </span>
            <div className="flex items-center justify-between gap-3">
              <a
                href={stats.original_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm font-mono text-indigo-400 hover:underline truncate"
              >
                {stats.original_url}
              </a>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleCopy(stats.original_url)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                  title="Copy Original URL"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <a
                  href={`/r/${stats.short_code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  Test Click
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

