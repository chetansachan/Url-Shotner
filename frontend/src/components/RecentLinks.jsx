import React, { useState } from 'react';
import { History, Search, ExternalLink, QrCode, BarChart3, Copy, Check, Trash2, Globe } from 'lucide-react';

export default function RecentLinks({ links, onSelectStats, onOpenQr, onDeleteLink }) {
  const [copiedId, setCopiedId] = useState(null);
  const [filter, setFilter] = useState('');

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredLinks = (links || []).filter((l) => {
    const term = filter.toLowerCase();
    return (
      l.short_code.toLowerCase().includes(term) ||
      (l.originalUrl && l.originalUrl.toLowerCase().includes(term))
    );
  });

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <History className="w-4 h-4" />
              <span>Link History</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Recently Generated Short Links
            </h2>
          </div>

          {links && links.length > 0 && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter links..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}
        </div>

        {/* Links List */}
        {!links || links.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-slate-900/40 border border-dashed border-white/10">
            <Globe className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">No links generated yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Shorten your first URL above to track and manage it here.
            </p>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No links match your filter.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLinks.map((item) => (
              <div
                key={item.short_code}
                className="glass-panel-interactive rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Info */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-mono text-indigo-400">
                      /r/{item.short_code}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate font-mono">
                    {item.originalUrl}
                  </p>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleCopy(item.short_code, item.short_url)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    title="Copy Short URL"
                  >
                    {copiedId === item.short_code ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => onOpenQr(item.short_url, item.short_code)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    title="QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onSelectStats(item.short_code)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    title="View Stats"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>

                  <a
                    href={item.short_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    title="Open Link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => onDeleteLink(item.short_code)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Remove from history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
