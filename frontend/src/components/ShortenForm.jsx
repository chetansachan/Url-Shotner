import React, { useState, useRef } from 'react';
import { Link, ArrowRight, Clipboard, Check, QrCode, ExternalLink, BarChart3, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import gsap from 'gsap';
import { shortenUrl } from '../api';

export default function ShortenForm({ onLinkCreated, onSelectStats, onOpenQr }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [latestResult, setLatestResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const resultCardRef = useRef(null);
  const buttonRef = useRef(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        setError('');
      }
    } catch {
      // ignore clipboard permission error
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please provide a URL to shorten.');
      return;
    }

    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    try {
      setLoading(true);
      setError('');

      const result = await shortenUrl(formattedUrl);
      setLatestResult({
        ...result,
        originalUrl: formattedUrl,
        createdAt: new Date().toISOString(),
      });

      // Notify parent to store in recent links
      onLinkCreated({
        ...result,
        originalUrl: formattedUrl,
        createdAt: new Date().toISOString(),
      });

      // Confetti effect!
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#6366f1', '#a855f7', '#06b6d4'],
      });

      // Animate result card entry with GSAP
      setTimeout(() => {
        if (resultCardRef.current) {
          gsap.fromTo(
            resultCardRef.current,
            { y: 20, opacity: 0, scale: 0.98 },
            { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: 'power3.out' }
          );
        }
      }, 50);
    } catch (err) {
      setError(err.message || 'Failed to shorten URL');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!latestResult) return;
    navigator.clipboard.writeText(latestResult.short_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      {/* Input Form Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 relative glow-indigo shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="relative flex items-center">
              <div className="absolute left-4 text-slate-500 pointer-events-none">
                <Link className="w-5 h-5 text-indigo-400" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Paste your long link here (e.g. https://example.com/very/long/path)..."
                className="w-full pl-12 pr-28 py-4 bg-slate-900/90 rounded-2xl border border-white/10 text-white placeholder-slate-500 text-sm sm:text-base focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
              />
              <button
                type="button"
                onClick={handlePaste}
                className="absolute right-3 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-1.5"
              >
                <Clipboard className="w-3.5 h-3.5" />
                Paste
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-400 pl-2 animate-in fade-in duration-200">
              {error}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Base62 encoded &bull; Instant Redis cache warm-up</span>
            </p>

            <button
              ref={buttonRef}
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Shortening...</span>
                </>
              ) : (
                <>
                  <span>Shorten URL</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Result Card */}
      {latestResult && (
        <div
          ref={resultCardRef}
          className="mt-6 glass-panel-interactive rounded-2xl p-5 sm:p-6 border border-indigo-500/30 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Link info */}
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Ready
                </span>
                <span className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md font-mono">
                  {latestResult.originalUrl}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={latestResult.short_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg sm:text-xl font-bold font-mono text-indigo-400 hover:text-indigo-300 transition-colors truncate"
                >
                  {latestResult.short_url}
                </a>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/20"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Clipboard className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>

              <button
                onClick={() => onOpenQr(latestResult.short_url, latestResult.short_code)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
                title="View QR Code"
              >
                <QrCode className="w-4 h-4" />
              </button>

              <button
                onClick={() => onSelectStats(latestResult.short_code)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
                title="View Analytics"
              >
                <BarChart3 className="w-4 h-4" />
              </button>

              <a
                href={latestResult.short_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
                title="Open Link"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

