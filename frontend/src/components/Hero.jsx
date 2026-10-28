import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Zap, ShieldCheck, Database, HardDriveDownload } from 'lucide-react';

export default function Hero() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-elem', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="text-center pt-10 pb-6 px-4">
      {/* Pill Badge */}
      <div className="hero-elem inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300 mb-6">
        <Zap className="w-3.5 h-3.5 text-indigo-400" />
        High-Concurrency Go Engine &bull; Sub-millisecond Redis Cache
      </div>

      {/* Main Title */}
      <h1 className="hero-elem text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.15]">
        Shorten links with{' '}
        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          lightning speed
        </span>{' '}
        & persistent power.
      </h1>

      {/* Subtext */}
      <p className="hero-elem mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
        Engineered with a relational PostgreSQL source-of-truth, Redis write-behind click counter buffer, and Singleflight stampede defense.
      </p>

      {/* Micro Feature badges */}
      <div className="hero-elem flex flex-wrap items-center justify-center gap-4 mt-6 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/60 border border-white/5">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span>PostgreSQL 16 Durability</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/60 border border-white/5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Redis Write-Behind Buffer</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/60 border border-white/5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Singleflight Stampede Guard</span>
        </div>
      </div>
    </div>
  );
}
