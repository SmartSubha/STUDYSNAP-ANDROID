import { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';
import { AlertOctagon, ShieldAlert, KeyRound, Terminal, VolumeX, Volume2, ShieldX, CornerDownLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

// Web Audio API emergency siren sweep synthesizer
let sirenInterval: any = null;
let audioCtx: AudioContext | null = null;

const startSirenAudio = () => {
  if (sirenInterval) return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    audioCtx = new AudioContextClass();
    
    sirenInterval = setInterval(() => {
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      // Dual high-intensity warning tones (sawtooth and square combination)
      osc1.type = 'sawtooth';
      osc2.type = 'triangle';
      
      const now = audioCtx.currentTime;
      
      // Sweep sound oscillates rapidly between low and high alert frequencies (400Hz to 1200Hz)
      osc1.frequency.setValueAtTime(450, now);
      osc1.frequency.exponentialRampToValueAtTime(1100, now + 0.35);
      osc1.frequency.exponentialRampToValueAtTime(450, now + 0.7);
      
      osc2.frequency.setValueAtTime(500, now);
      osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.35);
      osc2.frequency.exponentialRampToValueAtTime(500, now + 0.7);
      
      gainNode.gain.setValueAtTime(0.35, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.65);
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc1.start(now);
      osc2.start(now);
      
      osc1.stop(now + 0.7);
      osc2.stop(now + 0.7);
    }, 750);
  } catch (err) {
    console.warn("AudioContext setup blocked by browser policy. Interacting with the screen will trigger it.", err);
  }
};

const stopSirenAudio = () => {
  if (sirenInterval) {
    clearInterval(sirenInterval);
    sirenInterval = null;
  }
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
  }
};

export function LockoutScreen({ profile }: { profile: UserProfile }) {
  const [passwordInput, setPasswordInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioActive, setAudioActive] = useState(false);

  const isPermanentSiren = profile.lockoutPermanentSiren === true;

  // Real-time automatic siren activation
  useEffect(() => {
    // If permanent siren is on, force-enable sound sweeps
    if (isPermanentSiren) {
      triggerSoundSiren();
    }

    const handleInteraction = () => {
      triggerSoundSiren();
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return () => {
      stopSirenAudio();
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [isPermanentSiren]);

  const triggerSoundSiren = () => {
    startSirenAudio();
    setAudioActive(true);
  };

  const handleMuteBtn = () => {
    if (audioActive) {
      stopSirenAudio();
      setAudioActive(false);
    } else {
      triggerSoundSiren();
    }
  };

  const handleVerifyRecoveryKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      toast.error('Please enter the security recovery key.');
      return;
    }
    setLoading(true);

    try {
      const correctPassword = profile.lockoutPassword || '';
      
      if (passwordInput.trim() === correctPassword) {
        // Unlock user system completely!
        await setDoc(doc(db, 'users', profile.uid), {
          lockoutEnabled: false,
          lockoutPermanentSiren: false,
          lockoutAttemptsCount: 0
        }, { merge: true });
        
        stopSirenAudio();
        toast.success('System unlocked and fully restored! Welcome back!');
      } else {
        // Only 1 attempt allowed. Immediately deploy the permanent scream override!
        await setDoc(doc(db, 'users', profile.uid), {
          lockoutAttemptsCount: 1,
          lockoutPermanentSiren: true
        }, { merge: true });

        triggerSoundSiren();
        toast.error('INVALID RECOVERY OVERRIDE PHRASE! ACCESS PERMANENTLY SUSPENDED!');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Authentication communication fault: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] bg-[#030308] select-none flex flex-col justify-between p-6 sm:p-12 text-white font-sans overflow-y-auto">
      {/* Intense Glowing Crimson Strobe Pulse */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.12)_0%,transparent_70%)] pointer-events-none animate-pulse" />
      <div className="absolute inset-0 bg-[#ea580c]/5 pointer-events-none mix-blend-overlay opacity-30 animate-[pulse_4s_infinite]" />
      
      {/* Decorative cybertech layout grids */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/20 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/20 to-transparent pointer-events-none" />

      {/* Header Info */}
      <div className="flex justify-between items-center z-10 w-full max-w-5xl mx-auto">
        <div className="flex items-center gap-2 border border-red-500/30 bg-red-950/20 px-3 py-1.5 rounded-full">
          <Terminal size={14} className="text-red-500 animate-pulse" />
          <span className="text-[9px] font-mono font-black uppercase tracking-widest text-red-500">
            TERMINAL DETACHED • OVERRIDE RED
          </span>
        </div>
        
        <button 
          onClick={handleMuteBtn}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
            audioActive 
              ? 'border-red-500/50 bg-red-500/10 text-red-400 font-extrabold animate-pulse' 
              : 'border-slate-800 bg-slate-900/40 text-slate-400'
          }`}
        >
          {audioActive ? <Volume2 size={14} /> : <VolumeX size={14} />}
          <span className="text-[9px] font-mono font-bold tracking-wider">
            {audioActive ? 'SIREN ACTIVE (CLICK TO MUTE)' : 'ACTIVATE SIREN MONITOR'}
          </span>
        </button>
      </div>

      {/* Center Alert Panel */}
      <div className="my-auto py-12 flex flex-col items-center text-center z-10 w-full max-w-lg mx-auto space-y-8">
        <motion.div
          animate={{ scale: [1, 1.05, 1], rotate: isPermanentSiren ? [0, -2, 2, -2, 0] : 0 }}
          transition={{ duration: isPermanentSiren ? 0.3 : 1.5, repeat: Infinity }}
          className="p-6 rounded-[2.5rem] bg-red-950/40 border border-red-500/40 shadow-2xl shadow-red-950/20 flex items-center justify-center text-red-500"
        >
          {isPermanentSiren ? (
            <ShieldX size={72} className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]" />
          ) : (
            <AlertOctagon size={72} className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]" />
          )}
        </motion.div>

        <div className="space-y-3">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white uppercase text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.3)]"
          >
            YOU SYSTEM IS HACKED BY SOMEONE ELSE
          </motion.h1>
          <p className="text-red-200/60 font-medium text-xs max-w-sm mx-auto leading-relaxed">
            Suspicious device telemetry detected. Access has been completely frozen for your security to protect the integrity of the educational resources and syllabus documents.
          </p>
        </div>

        {/* Input Phase depending on Attempt State */}
        <AnimatePresence mode="wait">
          {isPermanentSiren ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full bg-red-950/30 border border-red-500/30 rounded-3xl p-6 space-y-4 max-w-sm mx-auto"
            >
              <div className="flex justify-center flex-col items-center">
                <ShieldAlert className="text-red-500 animate-bounce" size={32} />
                <h4 className="text-xs font-black text-red-500 uppercase tracking-widest mt-2 animate-pulse">
                  SYSTEM LOCKDOWN PERMANENT
                </h4>
              </div>
              <p className="text-[10px] text-red-100/50 leading-relaxed font-semibold uppercase tracking-wider text-center">
                Zero attempts remaining. Continuous emergency frequency triggered. Access will remain revoked on all refreshes. Contact authority immediately.
              </p>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleVerifyRecoveryKey}
              className="w-full max-w-sm space-y-4"
            >
              <div className="space-y-1.5 text-left">
                <label htmlFor="recoveryKeyInp" className="text-[10px] text-red-400 font-extrabold uppercase tracking-widest ml-1 block">
                  1 Life-Attempt Authentication Lock:
                </label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400" />
                  <input
                    id="recoveryKeyInp"
                    type="password"
                    placeholder="ENTER THE PASSWORD FOR RECOVERY SYSTEM"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    disabled={loading}
                    className="w-full h-12 bg-red-950/10 border border-red-500/20 rounded-2xl pl-12 pr-4 text-center font-mono font-black text-xs text-white placeholder:text-red-500/30 focus:border-red-500 focus:outline-none transition-all focus:ring-1 focus:ring-red-500/40 uppercase tracking-widest"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-red-950/50 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                RESTORE AUTHORIZED SECURE ACCESS
                <CornerDownLeft size={14} />
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Footer System Status */}
      <div className="mt-auto text-center z-10 w-full max-w-md mx-auto">
        <div className="text-[10px] font-mono font-bold text-slate-500 space-x-2">
          <span>HOST: STUDY_NODE</span>
          <span>•</span>
          <span>SYSTEM PROTECTION: ACTIVE</span>
          <span>•</span>
          <span>UUID: {profile.uid.substring(0, 10)}...</span>
        </div>
      </div>
    </div>
  );
}
