import React, { useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Copy, Check, ExternalLink } from 'lucide-react';
import gsap from 'gsap';

export default function QrModal({ isOpen, onClose, url, shortCode }) {
  const modalRef = useRef(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(
        modalRef.current,
        { scale: 0.9, opacity: 0, y: 15 },
        { scale: 1, opacity: 1, y: 0, duration: 0.25, ease: 'back.out(1.5)' }
      );
    }
  }, [isOpen]);

  if (!isOpen || !url) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = 300;
      canvas.height = 300;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 20, 20, 260, 260);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `qrcode-${shortCode || 'link'}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        ref={modalRef}
        className="glass-panel w-full max-w-sm rounded-2xl p-6 shadow-2xl relative border border-white/10"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white text-center mb-1">
          Scan QR Code
        </h3>
        <p className="text-xs text-slate-400 text-center mb-6">
          Instant mobile redirect for your short link
        </p>

        {/* QR Code container */}
        <div className="p-4 bg-white rounded-xl flex items-center justify-center shadow-inner mx-auto w-56 h-56 mb-4">
          <QRCodeSVG
            id="qr-code-svg"
            value={url}
            size={190}
            level="H"
            includeMargin={false}
          />
        </div>

        {/* Short Code Display */}
        <div className="p-2.5 rounded-lg bg-slate-900/90 border border-white/5 flex items-center justify-between gap-2 mb-4">
          <span className="text-xs font-mono text-indigo-400 truncate">
            {url}
          </span>
          <button
            onClick={handleCopy}
            className="p-1 rounded text-slate-400 hover:text-white"
            title="Copy URL"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4" />
            Download PNG
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/10 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open Link
          </a>
        </div>
      </div>
    </div>
  );
}

