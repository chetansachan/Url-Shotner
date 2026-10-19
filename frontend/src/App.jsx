import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Link2, BarChart3, History } from 'lucide-react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ShortenForm from './components/ShortenForm';
import StatsInspector from './components/StatsInspector';
import RecentLinks from './components/RecentLinks';
import QrModal from './components/QrModal';
import ArchitectureDrawer from './components/ArchitectureDrawer';
import Footer from './components/Footer';

const STORAGE_KEY = 'linkpulse_recent_links';

export default function App() {
  const [activeTab, setActiveTab] = useState('shorten'); // 'shorten' | 'stats' | 'history'
  const [recentLinks, setRecentLinks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [prefillStatsCode, setPrefillStatsCode] = useState('');
  const [qrModal, setQrModal] = useState({ isOpen: false, url: '', shortCode: '' });
  const [archModalOpen, setArchModalOpen] = useState(false);

  // Background floating orbs ref
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const orb3Ref = useRef(null);
  const tabContentRef = useRef(null);

  // Save recent links to localStorage
  const handleLinkCreated = (newLink) => {
    setRecentLinks((prev) => {
      const updated = [newLink, ...prev.filter((item) => item.short_code !== newLink.short_code)].slice(0, 25);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleDeleteLink = (code) => {
    setRecentLinks((prev) => {
      const updated = prev.filter((item) => item.short_code !== code);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleSelectStats = (code) => {
    setPrefillStatsCode(code);
    setActiveTab('stats');
  };

  const handleOpenQr = (url, shortCode) => {
    setQrModal({ isOpen: true, url, shortCode });
  };

  // GSAP background floating animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Floating ambient lighting
      gsap.to(orb1Ref.current, {
        x: '+=60',
        y: '+=40',
        duration: 7,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
      gsap.to(orb2Ref.current, {
        x: '-=50',
        y: '+=50',
        duration: 9,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
      gsap.to(orb3Ref.current, {
        x: '+=40',
        y: '-=60',
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    });

    return () => ctx.revert();
  }, []);

  // Animate tab content switch with GSAP
  useEffect(() => {
    if (tabContentRef.current) {
      gsap.fromTo(
        tabContentRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      );
    }
  }, [activeTab]);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#090b10] text-slate-100 overflow-hidden bg-grid-pattern">
      {/* Background glowing animated ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div
          ref={orb1Ref}
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-600/15 blur-[120px]"
        />
        <div
          ref={orb2Ref}
          className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] rounded-full bg-purple-600/15 blur-[140px]"
        />
        <div
          ref={orb3Ref}
          className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-cyan-600/15 blur-[120px]"
        />
      </div>

      {/* Navigation */}
      <Navbar onOpenArchitecture={() => setArchModalOpen(true)} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto pb-16">
        <Hero />

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8 px-4">
          <div className="glass-panel p-1.5 rounded-2xl flex items-center gap-1 shadow-lg border border-white/10">
            <button
              onClick={() => setActiveTab('shorten')}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'shorten'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Link2 className="w-4 h-4" />
              <span>Shorten URL</span>
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'stats'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics & Lookup</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <History className="w-4 h-4" />
              <span>History ({recentLinks.length})</span>
            </button>
          </div>
        </div>

        {/* Active Tab Content with GSAP Transition */}
        <div ref={tabContentRef}>
          {activeTab === 'shorten' && (
            <ShortenForm
              onLinkCreated={handleLinkCreated}
              onSelectStats={handleSelectStats}
              onOpenQr={handleOpenQr}
            />
          )}

          {activeTab === 'stats' && (
            <StatsInspector
              prefillCode={prefillStatsCode}
              onSelectCode={setPrefillStatsCode}
            />
          )}

          {activeTab === 'history' && (
            <RecentLinks
              links={recentLinks}
              onSelectStats={handleSelectStats}
              onOpenQr={handleOpenQr}
              onDeleteLink={handleDeleteLink}
            />
          )}
        </div>
      </main>

      {/* Architecture Modal */}
      <ArchitectureDrawer
        isOpen={archModalOpen}
        onClose={() => setArchModalOpen(false)}
      />

      {/* QR Code Modal */}
      <QrModal
        isOpen={qrModal.isOpen}
        onClose={() => setQrModal({ isOpen: false, url: '', shortCode: '' })}
        url={qrModal.url}
        shortCode={qrModal.shortCode}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
