import React from 'react';
import {
  X,
  Smartphone,
  Download,
  Share2,
  PlusSquare,
  CheckCircle2,
  Sparkles,
  Info,
  HelpCircle,
  TrendingUp,
  CloudLightning
} from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onTriggerInstall: () => void;
}

export default function InstallModal({
  isOpen,
  onClose,
  deferredPrompt,
  onTriggerInstall
}: InstallModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Modal Container */}
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
        id="install-modal"
      >
        {/* Decorative Top Accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-3xl" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
              <Smartphone className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-mono uppercase tracking-wide text-slate-100 flex items-center gap-1.5">
                Install Mobile App
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-mono px-1.5 py-0.5 rounded-full font-bold">PWA</span>
              </h3>
              <p className="text-[10px] text-slate-400">Add 3D Home Builder Studio directly to your device</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto">
          {/* Quick Stats banner */}
          <div className="grid grid-cols-3 gap-2 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/60 text-center">
            <div className="flex flex-col gap-0.5">
              <span className="text-slate-400 text-[9px] uppercase tracking-wider font-mono">Offline Mode</span>
              <span className="text-emerald-400 text-[10px] font-bold flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /> Supported
              </span>
            </div>
            <div className="flex flex-col gap-0.5 border-x border-slate-800">
              <span className="text-slate-400 text-[9px] uppercase tracking-wider font-mono">Download Size</span>
              <span className="text-slate-200 text-[10px] font-bold">&lt; 1.5 MB</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-slate-400 text-[9px] uppercase tracking-wider font-mono">App Platform</span>
              <span className="text-indigo-400 text-[10px] font-bold">Android & iOS</span>
            </div>
          </div>

          {/* Prompt Native Install if Available */}
          {deferredPrompt ? (
            <div className="bg-gradient-to-br from-indigo-950/40 to-slate-950/20 p-4 rounded-2xl border border-indigo-500/30 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <CloudLightning className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-slate-100">Instant One-Click Download</h4>
                  <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
                    Your web browser fully supports immediate installation. Click below to add the app to your Home Screen.
                  </p>
                </div>
              </div>
              <button
                onClick={onTriggerInstall}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold py-2.5 px-4 rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer select-none"
              >
                <Download className="w-4 h-4" />
                INSTALL NOW
              </button>
            </div>
          ) : null}

          {/* Android Steps */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-wider font-mono">
              <span className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">Option A</span>
              <span>Android (Google Chrome)</span>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850/80 flex flex-col gap-3">
              <div className="flex gap-3">
                <span className="w-5 h-5 bg-indigo-500/10 text-indigo-400 font-mono text-[10px] font-black rounded-lg border border-indigo-500/20 flex items-center justify-center shrink-0">1</span>
                <p className="text-[10.5px] text-slate-300 leading-relaxed">
                  Open the shared application link in your mobile **Google Chrome** browser.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="w-5 h-5 bg-indigo-500/10 text-indigo-400 font-mono text-[10px] font-black rounded-lg border border-indigo-500/20 flex items-center justify-center shrink-0">2</span>
                <p className="text-[10.5px] text-slate-300 leading-relaxed">
                  Tap the **three dots menu (⋮)** in the top right corner of the browser.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="w-5 h-5 bg-indigo-500/10 text-indigo-400 font-mono text-[10px] font-black rounded-lg border border-indigo-500/20 flex items-center justify-center shrink-0">3</span>
                <p className="text-[10.5px] text-slate-300 leading-relaxed">
                  Select **"Install app"** or **"Add to Home Screen"** to place the launcher on your home screen.
                </p>
              </div>
            </div>
          </div>

          {/* iOS Steps */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-wider font-mono">
              <span className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">Option B</span>
              <span>Apple iOS (Safari Browser)</span>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850/80 flex flex-col gap-3">
              <div className="flex gap-3">
                <span className="w-5 h-5 bg-purple-500/10 text-purple-400 font-mono text-[10px] font-black rounded-lg border border-purple-500/20 flex items-center justify-center shrink-0">1</span>
                <p className="text-[10.5px] text-slate-300 leading-relaxed">
                  Navigate to this page inside Apple's native **Safari** browser on your iPhone/iPad.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="w-5 h-5 bg-purple-500/10 text-purple-400 font-mono text-[10px] font-black rounded-lg border border-purple-500/20 flex items-center justify-center shrink-0">2</span>
                <div className="flex-1 text-[10.5px] text-slate-300 leading-relaxed flex items-center gap-1.5 flex-wrap">
                  Tap the Apple **Share icon**
                  <span className="inline-flex items-center justify-center bg-slate-800 border border-slate-700 p-1 rounded-md text-indigo-400">
                    <Share2 className="w-3 h-3 text-indigo-400" />
                  </span>
                  located at the bottom navigation bar.
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-5 h-5 bg-purple-500/10 text-purple-400 font-mono text-[10px] font-black rounded-lg border border-purple-500/20 flex items-center justify-center shrink-0">3</span>
                <div className="flex-1 text-[10.5px] text-slate-300 leading-relaxed flex items-center gap-1.5 flex-wrap">
                  Scroll down the share sheet and tap **"Add to Home Screen"**
                  <span className="inline-flex items-center justify-center bg-slate-800 border border-slate-700 p-1 rounded-md text-purple-400">
                    <PlusSquare className="w-3 h-3 text-purple-400" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Footer Info */}
          <div className="bg-indigo-950/20 p-3.5 rounded-2xl border border-indigo-950/80 flex gap-2.5 items-start">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-indigo-300 font-mono uppercase tracking-wider">Why use a Web App (PWA)?</span>
              <p className="text-[9px] text-slate-400 leading-relaxed">
                PWAs deliver identical functionality as native Store apps but update automatically, run offline, conserve storage, and preserve your device performance without battery-draining background trackers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
