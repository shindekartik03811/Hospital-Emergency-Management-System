import React from 'react';
import { 
  Activity, 
  Volume2, 
  VolumeX, 
  PlusCircle, 
  Layers, 
  Bed, 
  FileText, 
  GitCommitHorizontal, 
  Sparkles
} from 'lucide-react';
import { getAudioMuted, setAudioMuted } from '../utils/audioAlerts';

export type ActiveTab = 'queue' | 'bays' | 'register' | 'linkedlist' | 'records';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  waitingCount: number;
  emergencyCount: number;
  onOpenSimModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  waitingCount,
  emergencyCount,
  onOpenSimModal,
}) => {
  const [muted, setMuted] = React.useState<boolean>(getAudioMuted());

  const toggleSound = () => {
    const next = !muted;
    setAudioMuted(next);
    setMuted(next);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark in display face */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <a 
              href="#dashboard" 
              onClick={(e) => { e.preventDefault(); onTabChange('queue'); }} 
              className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap"
            >
              AuraER Hospital Emergency
            </a>
          </div>

          {/* Zone 2: Navigation Links (single-line, whitespace-nowrap) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => onTabChange('queue')}
              className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activeTab === 'queue'
                  ? 'border-rose-600 text-rose-700 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Priority Queue</span>
              {waitingCount > 0 && (
                <span className="font-mono text-xs tabular-nums px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                  {waitingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange('bays')}
              className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activeTab === 'bays'
                  ? 'border-rose-600 text-rose-700 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <Bed className="w-4 h-4" />
              <span>Treatment Bays</span>
            </button>

            <button
              onClick={() => onTabChange('register')}
              className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activeTab === 'register'
                  ? 'border-rose-600 text-rose-700 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Triage Registration</span>
            </button>

            <button
              onClick={() => onTabChange('linkedlist')}
              className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activeTab === 'linkedlist'
                  ? 'border-rose-600 text-rose-700 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <GitCommitHorizontal className="w-4 h-4" />
              <span>Linked List Inspector</span>
            </button>

            <button
              onClick={() => onTabChange('records')}
              className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activeTab === 'records'
                  ? 'border-rose-600 text-rose-700 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Patient Records</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action & Controls */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={toggleSound}
              title={muted ? 'Enable Clinical Audio Alerts' : 'Mute Clinical Audio Alerts'}
              aria-label={muted ? 'Enable Clinical Audio Alerts' : 'Mute Clinical Audio Alerts'}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-rose-600" />}
            </button>

            <button
              onClick={onOpenSimModal}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
              title="Fast patient generator for emergency testing"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Simulate Case</span>
            </button>

            <button
              onClick={() => onTabChange('register')}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Patient Triage</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center justify-between overflow-x-auto py-2 border-t border-slate-100 text-xs gap-3">
          <button
            onClick={() => onTabChange('queue')}
            className={`whitespace-nowrap px-2.5 py-1 rounded-md font-medium ${
              activeTab === 'queue' ? 'bg-rose-100 text-rose-800' : 'text-slate-600'
            }`}
          >
            Queue ({waitingCount})
          </button>
          <button
            onClick={() => onTabChange('bays')}
            className={`whitespace-nowrap px-2.5 py-1 rounded-md font-medium ${
              activeTab === 'bays' ? 'bg-rose-100 text-rose-800' : 'text-slate-600'
            }`}
          >
            Treatment Bays
          </button>
          <button
            onClick={() => onTabChange('register')}
            className={`whitespace-nowrap px-2.5 py-1 rounded-md font-medium ${
              activeTab === 'register' ? 'bg-rose-100 text-rose-800' : 'text-slate-600'
            }`}
          >
            Register
          </button>
          <button
            onClick={() => onTabChange('linkedlist')}
            className={`whitespace-nowrap px-2.5 py-1 rounded-md font-medium ${
              activeTab === 'linkedlist' ? 'bg-rose-100 text-rose-800' : 'text-slate-600'
            }`}
          >
            Linked List
          </button>
          <button
            onClick={() => onTabChange('records')}
            className={`whitespace-nowrap px-2.5 py-1 rounded-md font-medium ${
              activeTab === 'records' ? 'bg-rose-100 text-rose-800' : 'text-slate-600'
            }`}
          >
            Records
          </button>
        </div>
      </div>
    </header>
  );
};
