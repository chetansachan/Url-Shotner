import React from 'react';
import { Terminal, Shield, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/5 py-8 px-4 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <span>Go 1.26 &bull; PostgreSQL 16 &bull; Redis 7 &bull; GSAP</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for ultra-high throughput
          </span>
        </div>
      </div>
    </footer>
  );
}

