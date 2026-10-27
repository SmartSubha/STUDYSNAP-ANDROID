/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { auth, db, googleProvider } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, User, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { doc, getDoc, getDocs, setDoc, onSnapshot, collection, query, orderBy, limit, deleteDoc, addDoc, where } from 'firebase/firestore';
import { Toaster, toast } from 'sonner';
import html2canvas from 'html2canvas';
import { 
  Home, 
  Users, 
  CreditCard, 
  Settings, 
  BookOpen, 
  BrainCircuit, 
  Trophy, 
  ShieldCheck,
  ShieldAlert,
  LogOut,
  Plus,
  Trash2,
  ExternalLink,
  Clock,
  Bell,
  MessageSquare,
  HelpCircle,
  Moon,
  Sun,
  UserCircle,
  Globe,
  Calculator,
  X,
  Check,
  Battery,
  MapPin,
  Camera,
  Smartphone,
  CheckCircle2,
  XCircle,
  Send,
  Lock,
  AlertTriangle,
  LogOut as LogOutIcon,
  Terminal,
  Activity,
  Monitor,
  Eye,
  Search,
  Volume2,
  RefreshCcw,
  Video,
  FileCode,
  FileText,
  Megaphone,
  Languages,
  Download,
  Unlock,
  Calendar,
  Sparkles,
  Bookmark,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  FileImage,
  PlusCircle,
  Info,
  Zap,
  Palette,
  Image as ImageIcon,
  Star,
  Navigation2,
  Navigation,
  UserCheck
} from 'lucide-react';
import { Compass, Pause, Play, VideoOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI, Type } from "@google/genai";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserProfile, UserRole, Note, Quiz, LeaderboardEntry, Message, Notice, AppConfig, CalendarEvent, QRScan } from './types';
import { LockoutScreen } from './components/LockoutScreen';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import html2pdf from 'html2pdf.js';

// --- Components ---

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

const formatTimeAgo = (dateString?: string) => {
  if (!dateString) return 'NEVER';
  const now = new Date();
  const past = new Date(dateString);
  const diffInMs = now.getTime() - past.getTime();
  const diffInMins = Math.floor(diffInMs / 60000);
  
  if (diffInMins < 1) return 'JUST NOW';
  if (diffInMins < 60) return `${diffInMins}M AGO`;
  const diffInHours = Math.floor(diffInMins / 60);
  if (diffInHours < 24) return `${diffInHours}H AGO`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}D AGO`;
};

 interface Question {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  text: string;
  answer?: string;
  createdAt: any;
  status: 'pending' | 'answered';
}

interface Feedback {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  text: string;
  timestamp: string;
}

const PortfolioLink = ({ className, variant = 'default' }: { className?: string, variant?: 'default' | 'large' | 'glow' }) => {
  const portfolioUrl = typeof window !== 'undefined' ? `${window.location.origin}/portfolio.html` : '/portfolio.html';
  return (
    <motion.a
      href={portfolioUrl}
      target="_blank"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center gap-2 font-black italic tracking-tighter uppercase cursor-pointer rounded-2xl transition-all ${
        variant === 'large' 
          ? 'w-full p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/30 text-lg sm:text-xl justify-center mb-6' 
          : variant === 'glow'
          ? 'px-6 py-3 bg-white dark:bg-slate-900 text-blue-600 border-2 border-blue-600 animate-pulse-shadow shadow-[0_0_15px_rgba(37,99,235,0.4)] text-xs'
          : 'px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px]'
      } ${className}`}
    >
      <Globe size={variant === 'large' ? 24 : 14} style={{ color: '#1a476e' }} />
      <span style={{ color: '#ad6b6b' }}>View Smart Subha Portfolio</span>
      <ExternalLink size={variant === 'large' ? 20 : 12} className="opacity-50" />
    </motion.a>
  );
};

const TypewriterBanner = () => {
  const phrases = [
    "SMART SUBHA",
    "SUBHAJIT SANPUI",
    "Future Cardiac Surgeon",
    "Full-Stack Developer",
    "Founder of StudySnap"
  ];
  const [currentPhraseIdx, setCurrentPhraseIdx] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: any;
    const currentFull = phrases[currentPhraseIdx];
    
    const typingSpeed = isDeleting ? 30 : 80;
    const delayAfterType = 2000;
    const delayAfterDelete = 500;

    if (!isDeleting && currentText === currentFull) {
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, delayAfterType);
    } else if (isDeleting && currentText === "") {
      setIsDeleting(false);
      setCurrentPhraseIdx((prev) => (prev + 1) % phrases.length);
    } else {
      timer = setTimeout(() => {
        setCurrentText((prev) => {
          if (isDeleting) {
            return currentFull.substring(0, prev.length - 1);
          } else {
            return currentFull.substring(0, prev.length + 1);
          }
        });
      }, typingSpeed);
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentPhraseIdx]);

  return (
    <div className="bg-slate-900 dark:bg-black text-[9px] sm:text-xs font-mono font-bold tracking-widest text-emerald-400 py-1 border-b border-slate-800 dark:border-slate-900 shadow-inner flex items-center justify-center gap-1.5 overflow-hidden h-7 shrink-0 w-full">
      <div className="flex items-center gap-1 sm:gap-2 opacity-95">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
        <span className="text-slate-400">ITZ SUBHA • ORGANISATION :</span>
        <span className="text-emerald-300 font-extrabold flex items-center">
          <span>{currentText}</span>
          <span className="w-1 h-3.5 bg-emerald-400 ml-0.5 animate-pulse"></span>
        </span>
      </div>
    </div>
  );
};

const logoSvgDataUri = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><rect width='100' height='100' rx='20' fill='%232563eb'/><path d='M25 35h18a12 12 0 0 1 12 12v38a9 9 0 0 0-9-9H25z' fill='none' stroke='white' stroke-width='8' stroke-linecap='round' stroke-linejoin='round'/><path d='M75 35H57a12 12 0 0 0-12 12v38a9 9 0 0 1 9-9h19z' fill='none' stroke='white' stroke-width='8' stroke-linecap='round' stroke-linejoin='round'/></svg>";

const downloadQRCode = () => {
  const svgElement = document.getElementById("studysnap-qr-svg");
  if (!svgElement) return;

  const svgString = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  
  const img = new Image();
  const url = URL.createObjectURL(svgBlob);
  
  img.onload = () => {
    const canvas = document.createElement("canvas");
    const size = 300;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = "StudySnap_QR.png";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };
  img.src = url;
};

const ImageModal = ({ src, onClose }: { src: string, onClose: () => void }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4"
    onClick={onClose}
  >
    <motion.button 
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClose}
      className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-xl border border-white/20"
    >
      <X size={24} />
    </motion.button>
    <motion.img 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      src={src} 
      alt="Full view" 
      className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain"
      onClick={(e) => e.stopPropagation()}
    />
  </motion.div>
);

const LocationBlocker = ({ onRetry, onLogout }: { onRetry: () => void, onLogout: () => void }) => {
  const [checking, setChecking] = useState(false);

  const handleCheck = async () => {
    setChecking(true);
    onRetry();
    // Re-check state after a delay
    setTimeout(() => {
      setChecking(false);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-8 text-center bg-white/90 backdrop-blur-xl">
      <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-[2.5rem] flex items-center justify-center text-red-600 mb-8 animate-pulse shadow-xl shadow-red-200 dark:shadow-none">
        <Navigation size={48} />
      </div>
      <h1 className="text-3xl font-black italic mb-4 tracking-tighter uppercase text-slate-900 dark:text-white">Location Access Required</h1>
      <p className="text-sm text-slate-500 font-bold mb-8 max-w-xs leading-relaxed uppercase tracking-widest">
        This app requires live location access to function correctly. Please enable location in your browser settings.
      </p>
      
      <div className="space-y-4 w-full max-w-xs">
        <Button 
          onClick={handleCheck} 
          disabled={checking}
          className="w-full bg-navy-900 text-white h-16 rounded-3xl font-black italic tracking-widest text-lg shadow-2xl active:scale-95 transition-all flex items-center justify-center border-none"
        >
          {checking ? (
            <RefreshCcw className="animate-spin mr-2" size={20} />
          ) : (
            <>ALLOW LOCATION NOW <ChevronRight size={20} className="ml-2" /></>
          )}
        </Button>

        <Button 
          onClick={onLogout} 
          variant="outline"
          className="w-full h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest border-2 border-slate-200"
        >
          <LogOut size={14} className="mr-2" />
          Logout from Account
        </Button>

        <div className="pt-4 space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">1. Click Allow in the browser popup</p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">2. If it persists, check site settings</p>
        </div>
      </div>
    </div>
  );
};

const AskAdminSection = ({ profile, isAdmin }: { profile: UserProfile, isAdmin: boolean }) => {
  const [question, setQuestion] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [respondingId, setRespondingId] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.uid) return;

    let q = isAdmin 
      ? query(collection(db, 'questions'), orderBy('createdAt', 'desc'), limit(50))
      : query(collection(db, 'questions'), where('userId', '==', profile.uid), orderBy('createdAt', 'desc'), limit(20));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Question));
      // Sort pinned to top
      const sorted = docs.sort((a, b) => {
        if (a.status === 'answered' && b.status !== 'answered') return 1;
        if (a.status !== 'answered' && b.status === 'answered') return -1;
        return 0;
      });
      setQuestions(sorted);
    }, (e) => {
      handleFirestoreError(e, OperationType.LIST, 'questions');
    });

    return () => unsubscribe();
  }, [isAdmin, profile.uid]);

  const handleSubmit = async () => {
    if (!question.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'questions'), {
        userId: profile.uid,
        userName: profile.name,
        userEmail: profile.email,
        text: question,
        createdAt: new Date().toISOString(),
        status: 'pending'
      });
      setQuestion("");
      toast.success("Question sent to Admin!");
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (id: string) => {
    if (!answerText.trim()) return;
    try {
      await setDoc(doc(db, 'questions', id), { 
        answer: answerText, 
        status: 'answered' 
      }, { merge: true });
      setAnswerText("");
      setRespondingId(null);
      toast.success("Response sent!");
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `questions/${id}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      console.log(`Attempting to delete question: ${id}`);
      await deleteDoc(doc(db, 'questions', id));
      toast.success("Question deleted successfully");
    } catch (e: any) {
      console.error("Delete question error:", e);
      handleFirestoreError(e, OperationType.DELETE, `questions/${id}`);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      <Card className="p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 text-white border-none shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white/20 backdrop-blur-xl rounded-2xl">
              <MessageSquare size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-black uppercase tracking-tighter text-2xl">Ask Admin Anything</h3>
              <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest opacity-70">Direct bridge between students & Smart Subha</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What's on your mind? (doubts, feedback, ideas)"
              className="flex-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4 text-sm font-bold placeholder:text-white/40 focus:ring-2 focus:ring-white/50 outline-none transition-all"
            />
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              className="bg-white text-indigo-600 hover:bg-white/90 h-auto py-4 px-8 font-black rounded-2xl shadow-xl active:scale-95 transition-all text-xs"
            >
              {loading ? <RefreshCcw className="animate-spin" size={18} /> : "SUBMIT QUESTION"}
            </Button>
          </div>
        </div>
        <div className="absolute top-[-30%] right-[-10%] w-96 h-96 bg-white/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-indigo-400/10 rounded-full blur-[80px]" />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {questions.length === 0 && (
          <div className="col-span-full text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
            <HelpCircle className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-400 font-black italic text-xs uppercase tracking-widest">No queries active right now</p>
          </div>
        )}
        {questions.map(q => (
          <motion.div key={q.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} layout>
            <Card className="p-6 rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-xl border-slate-100 dark:border-slate-800 flex flex-col h-full group hover:border-blue-500/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                      {isAdmin ? q.userName : 'My Query'}
                    </span>
                    <Badge className={`text-[8px] font-black rounded-full uppercase border-none ${q.status === 'answered' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                      {q.status}
                    </Badge>
                  </div>
                  <div className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{formatTimeAgo(q.createdAt)}</div>
                </div>
                {(isAdmin || q.userId === profile.uid) && (
                  <button 
                    onClick={() => handleDelete(q.id)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              
              <div className="flex-1">
                <p className="text-[13px] text-slate-700 dark:text-slate-200 font-bold leading-relaxed mb-4">{q.text}</p>
                
                {q.answer && (
                  <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border-l-4 border-blue-600 shadow-inner">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 bg-blue-600 rounded-lg flex items-center justify-center">
                        <UserCheck size={12} className="text-white" />
                      </div>
                      <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Smart Subha Response</span>
                    </div>
                    <p className="text-[11px] text-slate-700 dark:text-slate-200 font-black leading-relaxed">{q.answer}</p>
                  </div>
                )}
              </div>

              {isAdmin && !q.answer && (
                <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800">
                  {respondingId === q.id ? (
                    <div className="flex flex-col gap-2">
                      <textarea 
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="Write your guide for the student..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                      />
                      <div className="flex gap-2">
                        <Button onClick={() => handleAnswer(q.id)} className="flex-1 bg-blue-600 rounded-xl h-10 font-black text-[10px] tracking-widest">SEND ANSWER</Button>
                        <Button onClick={() => setRespondingId(null)} variant="outline" className="rounded-xl h-10 font-black text-[10px] tracking-widest">CANCEL</Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => setRespondingId(q.id)} 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20"
                    >
                      Answer Now
                    </Button>
                  )}
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const handleFirestoreError = (error: any, operation: OperationType, path: string) => {
  console.error(`Firestore Error [${operation}] on ${path}:`, error);
  const msg = error.message || String(error);
  
  if (msg.toLowerCase().includes('quota') || error.code === 'resource-exhausted') {
    toast.error("Daily Limit Reached", {
      description: "You've used all free database reads for today. High-priority items are being shown from cache. Limits will reset tomorrow.",
      id: "quota-limit-toast",
      duration: 8000
    });
    return true;
  }
  
  if (error.code === 'permission-denied') {
    // Permission errors should generally be logged, but the user wants many things "fixed"
    console.warn(`Permission Denied on ${path}`);
    toast.error("Access Denied", {
       description: "You don't have permission to perform this action. If you're a student, ensure you're logged in correctly.",
       duration: 5000
    });
  }
  return false;
};

const saveToCache = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e: any) {
    console.warn(`LocalStorage quota exceeded for ${key}:`, e);
    if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22) {
      // If it's a note cache, try saving a stripped version
      if (key === 'cached_notes' && Array.isArray(data)) {
        try {
          const stripped = data.map(n => ({
            id: n.id,
            title: n.title,
            subject: n.subject,
            type: n.type,
            createdAt: n.createdAt,
            authorId: n.authorId
            // Stripping content and images
          }));
          localStorage.setItem(key, JSON.stringify(stripped));
          console.log("Saved stripped version of notes to cache.");
        } catch (innerE) {
          localStorage.removeItem(key); // Just clear it if it still fails
        }
      } else {
        // For other keys, just ignore or clear old ones
        // localStorage.removeItem(key); 
      }
    }
  }
};

const ShareNoteDialog = ({ note, isOpen, onOpenChange, currentUser }: { note: Note, isOpen: boolean, onOpenChange: (open: boolean) => void, currentUser: UserProfile }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchUsersForSharing = async () => {
        try {
          const q = query(collection(db, 'users'), limit(30));
          const snapshot = await getDocs(q);
          setUsers(snapshot.docs.map(d => d.data() as UserProfile).filter(u => u.uid !== currentUser.uid));
        } catch (e) {
          handleFirestoreError(e, OperationType.LIST, 'users_share');
        }
      };
      fetchUsersForSharing();
    }
  }, [isOpen, currentUser.uid]);

  const handleShare = async (targetUser: UserProfile) => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'messages'), {
        senderId: currentUser.uid,
        senderName: currentUser.name,
        receiverId: targetUser.uid,
        text: `Shared a note with you: "${note.title}"`,
        timestamp: new Date().toISOString(),
        sharedNoteId: note.id
      });
      toast.success(`Note shared with ${targetUser.name}`);
      onOpenChange(false);
    } catch (e) {
      toast.error("Failed to share note");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.school?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white dark:bg-slate-950 rounded-[2rem] border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-navy-900 dark:text-white">
            <Send className="text-blue-500" size={20} />
            Share Note
          </DialogTitle>
          <CardDescription>Share "{note.title}" with your classmates</CardDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input 
              placeholder="Search by name or school..." 
              className="pl-10 rounded-xl"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <ScrollArea className="h-64 rounded-2xl border border-slate-100 dark:border-slate-800 p-2">
            <div className="space-y-1">
              {filteredUsers.map(u => (
                <div key={u.uid} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-all group">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border-2 border-white dark:border-slate-800 shadow-sm">
                      <AvatarFallback className="text-xs bg-blue-100 text-blue-600 font-bold">{u.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="max-w-[180px]">
                      <div className="text-sm font-bold truncate text-slate-900 dark:text-white">{u.email === 'sanpuianup88@gmail.com' ? 'STUDYPOINT' : u.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{u.school} • Class {u.class}</div>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="rounded-full bg-navy-900 text-white h-9 px-5 font-bold hover:scale-105 transition-transform"
                    onClick={() => handleShare(u)}
                    disabled={loading}
                  >
                    Share
                  </Button>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-sm italic font-medium">No one found matching that name</div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const StudySnapLogo = ({ className = "w-20 h-20", iconSize = 40 }: { className?: string, iconSize?: number }) => (
  <div className={`${className} bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden group`}>
    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="relative flex items-center justify-center">
      <BookOpen size={iconSize} className="text-white" />
      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
        <Camera size={iconSize * 0.4} className="text-blue-600" />
      </div>
    </div>
  </div>
);

const LoginScreen = ({ onLogin, onRedirectLogin }: { onLogin: () => void, onRedirectLogin: () => void }) => {
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [captchaAction, setCaptchaAction] = useState<'popup' | 'redirect'>('popup');
  const [isCaptchaRotating, setIsCaptchaRotating] = useState(false);

  // Portal Flow State
  const [portalStep, setPortalStep] = useState<'role-select' | 'teacher-pass' | 'admin-pass' | 'auth-select'>('role-select');
  const [portalPassword, setPortalPassword] = useState('');
  const [portalError, setPortalError] = useState('');

  // Characters excluding ambiguous ones like O, 0, I, l, 1
  const generateNewCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  useEffect(() => {
    setCaptchaText(generateNewCaptcha());
  }, []);

  const handleRefreshCaptcha = () => {
    setIsCaptchaRotating(true);
    setCaptchaText(generateNewCaptcha());
    setUserInput('');
    setTimeout(() => setIsCaptchaRotating(false), 500);
  };

  const handleTriggerLogin = (type: 'popup' | 'redirect') => {
    setCaptchaAction(type);
    setCaptchaText(generateNewCaptcha());
    setUserInput('');
    setShowCaptcha(true);
  };

  const handleVerifyAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput) {
      toast.error("Please enter the verification CAPTCHA characters.");
      return;
    }

    if (userInput.trim().toLowerCase() === captchaText.toLowerCase()) {
      toast.success("Security verification passed! Continuing to Google Authentication...");
      setShowCaptcha(false);
      setUserInput('');
      
      // Execute respective Google Sign-In hook
      if (captchaAction === 'popup') {
        onLogin();
      } else {
        onRedirectLogin();
      }
    } else {
      toast.error("Incorrect security CAPTCHA code. Please try again.", {
        description: "Be careful with uppercase and lowercase letters.",
      });
      setCaptchaText(generateNewCaptcha());
      setUserInput('');
    }
  };

  const handleSelectStudent = () => {
    localStorage.setItem('temp_login_role', 'student');
    setPortalStep('auth-select');
  };

  const handleVerifyTeacherPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (portalPassword.trim() === "TEACHER XP") {
      localStorage.setItem('temp_login_role', 'teacher');
      toast.success("Educator credentials successfully approved!");
      setPortalStep('auth-select');
      setPortalPassword('');
      setPortalError('');
    } else {
      setPortalError("Accreditation code incorrect. Educator access suspended.");
      toast.error("Access Code Denied");
    }
  };

  const handleVerifyAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (portalPassword.trim() === "SUBHA ADMIN 420") {
      localStorage.setItem('temp_login_role', 'admin');
      toast.success("Admin mode override approved! Welcome, BOSS!");
      setPortalStep('auth-select');
      setPortalPassword('');
      setPortalError('');
    } else {
      setPortalError("Signature verification failed. Secure response logged.");
      toast.error("Master Key Refused");
    }
  };

  // Pre-calculated styling slots for CAPTCHA code
  const getStyleSlots = (text: string) => {
    if (!text) return [];
    return text.split('').map((char, index) => {
      const code = char.charCodeAt(0);
      const rotations = ['-rotate-12', '-rotate-6', 'rotate-0', 'rotate-6', 'rotate-12', '-rotate-3', 'rotate-3'];
      const skews = ['skew-x-6', '-skew-x-6', 'skew-x-12', '-skew-x-12', 'skew-all-none', ''];
      const sizes = ['text-2xl', 'text-3xl', 'text-4xl'];
      const weights = ['font-black', 'font-extrabold', 'font-bold'];
      const colors = [
        'text-blue-600 dark:text-blue-400',
        'text-indigo-600 dark:text-indigo-400',
        'text-violet-600 dark:text-violet-400',
        'text-purple-600 dark:text-purple-400',
        'text-emerald-600 dark:text-emerald-400',
        'text-rose-600 dark:text-rose-400',
        'text-amber-600 dark:text-amber-400',
        'text-cyan-600 dark:text-cyan-400'
      ];
      return {
        rotation: rotations[code % rotations.length],
        skew: skews[(code + index) % skews.length],
        size: sizes[(code + index * 2) % sizes.length],
        weight: weights[(code + index * 3) % weights.length],
        color: colors[(code + index * 7) % colors.length],
        offsetY: (code % 10) - 5
      };
    });
  };

  const slots = getStyleSlots(captchaText);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors">
      <AnimatePresence mode="wait">
        {showCaptcha ? (
          <motion.div 
            key="captcha-step"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-6 sm:p-8 text-center space-y-6 border border-slate-100 dark:border-slate-800"
          >
            {/* Captcha Header */}
            <div className="space-y-2">
              <div className="mx-auto w-12 h-12 bg-blue-50 dark:bg-blue-950/40 rounded-2xl flex items-center justify-center border border-blue-100 dark:border-blue-900/50 text-blue-600 dark:text-blue-400">
                <ShieldCheck size={24} className="animate-pulse" />
              </div>
              <h2 className="text-xl font-black text-navy-900 dark:text-white tracking-tight">Security Checkpoint</h2>
              <p className="text-slate-400 dark:text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                Anti-Bot Human Verification
              </p>
            </div>

            <form onSubmit={handleVerifyAndSubmit} className="space-y-5">
              <div className="space-y-2 text-left">
                <Label className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider block pl-1">
                  Verification Code
                </Label>
                
                <div className="relative flex items-center justify-between rounded-2xl bg-slate-100 dark:bg-slate-800/80 p-4 border border-dashed border-slate-300 dark:border-slate-700 min-h-[84px] overflow-hidden select-none">
                  <div className="absolute inset-0 pointer-events-none opacity-10 flex flex-col justify-between p-2">
                    <div className="h-[2px] bg-sky-900 dark:bg-sky-100 w-full rotate-2 transform scale-110" />
                    <div className="h-[2px] bg-indigo-900 dark:bg-indigo-100 w-[80%] -rotate-3 pl-8" />
                    <div className="h-[2px] bg-rose-900 dark:bg-rose-100 w-full rotate-1" />
                  </div>

                  <div className="flex-1 flex justify-center items-center gap-3.5 tracking-wider font-mono select-none pl-3 z-10 transition-all">
                    {slots.map((st, i) => (
                      <span 
                        key={i}
                        style={{ transform: `translateY(${st.offsetY}px)` }}
                        className={`inline-block select-none transform transition-all ${st.color} ${st.size} ${st.rotation} ${st.skew} ${st.weight}`}
                      >
                        {captchaText[i]}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleRefreshCaptcha}
                    className="shrink-0 p-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all border border-slate-200/50 dark:border-slate-800 shadow-sm"
                    title="Change verification code"
                  >
                    <RefreshCcw size={16} className={isCaptchaRotating ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-left">
                <Label htmlFor="captchaInput" className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider block pl-1">
                  Type characters above
                </Label>
                <Input
                  id="captchaInput"
                  type="text"
                  placeholder="Enter 5-character code"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 text-center font-extrabold tracking-widest text-lg focus-visible:ring-2 focus-visible:ring-blue-500 text-slate-800 dark:text-white uppercase"
                  required
                  autoFocus
                  autoComplete="off"
                />
              </div>

              <div className="space-y-3 pt-2">
                <Button 
                  type="submit"
                  className="w-full h-13 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center gap-2.5 text-base font-black uppercase tracking-wider transition-all shadow-lg hover:scale-[1.01] active:scale-[0.99]"
                >
                  <ShieldCheck size={18} />
                  Verify & Proceed
                </Button>

                <button 
                  type="button"
                  onClick={() => {
                    setShowCaptcha(false);
                    setUserInput('');
                  }}
                  className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-bold tracking-widest uppercase block mx-auto py-1"
                >
                  ← Go Back
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            key={portalStep}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-8 sm:p-10 text-center space-y-8 border border-slate-100 dark:border-slate-800"
          >
            {/* Common Header */}
            <div className="flex flex-col items-center gap-3">
              <StudySnapLogo className="w-16 h-16 sm:w-20 sm:h-20" iconSize={38} />
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-black text-navy-900 dark:text-white tracking-tighter leading-none">
                  StudySnap<span className="text-xs align-top ml-0.5 opacity-40 text-blue-500 font-bold">TM</span>
                </h1>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.25em]">© Smart Subha</p>
              </div>
            </div>

            {/* Portal Step 1: Selection Cards */}
            {portalStep === 'role-select' && (
              <div className="space-y-6 text-left">
                <div className="text-center">
                  <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight leading-none mb-1">Select Access Portal</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Choose your role in StudySnap</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {/* Student portal */}
                  <button 
                    onClick={handleSelectStudent}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-blue-50 dark:border-slate-850 hover:bg-blue-50/50 dark:hover:bg-slate-850/60 transition-all hover:scale-[1.01] active:scale-[0.99] group bg-blue-50/20 dark:bg-slate-900/40 shadow-sm w-full"
                  >
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white shadow-md group-hover:scale-110 transition-transform flex items-center justify-center shrink-0">
                      <Users size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        Student Portal
                      </h4>
                      <p className="text-slate-400 leading-normal text-[11px] font-medium mt-0.5">Explore syllabus notes, complete live assessments & track points.</p>
                    </div>
                  </button>

                  {/* Teacher portal */}
                  <button 
                    type="button"
                    onClick={() => {
                      setPortalStep('teacher-pass');
                      setPortalPassword('');
                      setPortalError('');
                    }}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-emerald-50 dark:border-slate-850 hover:bg-emerald-50/30 dark:hover:bg-slate-850/60 transition-all hover:scale-[1.01] active:scale-[0.99] group bg-emerald-50/10 dark:bg-slate-900/40 shadow-sm w-full"
                  >
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl text-white shadow-md group-hover:scale-110 transition-transform flex items-center justify-center shrink-0">
                      <BookOpen size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Teacher Portal</h4>
                      <p className="text-slate-400 leading-normal text-[11px] font-medium mt-0.5">Publish lecture notes, monitor engagement, and customize motivation links.</p>
                    </div>
                  </button>

                  {/* Admin portal */}
                  <button 
                    type="button"
                    onClick={() => {
                      setPortalStep('admin-pass');
                      setPortalPassword('');
                      setPortalError('');
                    }}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-rose-50 dark:border-slate-850 hover:bg-rose-50/30 dark:hover:bg-slate-850/60 transition-all hover:scale-[1.01] active:scale-[0.99] group bg-rose-50/10 dark:bg-slate-900/40 shadow-sm w-full"
                  >
                    <div className="p-3 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl text-white shadow-md group-hover:scale-110 transition-transform flex items-center justify-center shrink-0">
                      <ShieldCheck size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Admin Portal</h4>
                      <p className="text-slate-400 leading-normal text-[11px] font-medium mt-0.5">Full configuration toggles, remote intervention keys & analysis base.</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Portal Step 2a: Teacher Password Form */}
            {portalStep === 'teacher-pass' && (
              <form onSubmit={handleVerifyTeacherPassword} className="space-y-6 font-sans text-left">
                <div className="text-center">
                  <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight leading-none mb-1">Verify Educator Key</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Enter authorized educator code to proceed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teacherPass">Accreditation Access Code</Label>
                  <Input 
                    id="teacherPass"
                    type="password"
                    placeholder="Enter accreditation code"
                    value={portalPassword}
                    onChange={e => setPortalPassword(e.target.value)}
                    className="w-full h-12 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-center font-bold text-sm tracking-widest rounded-xl focus:border-emerald-500"
                    required
                    autoFocus
                  />
                  {portalError && <p className="text-[11px] text-red-500 mt-1.5 font-bold leading-normal">{portalError}</p>}
                </div>

                <div className="space-y-2">
                  <Button 
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99]"
                  >
                    Authorize Teacher Role
                  </Button>
                  <Button 
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setPortalStep('role-select');
                      setPortalPassword('');
                      setPortalError('');
                    }}
                    className="w-full text-xs text-slate-400 hover:text-slate-600"
                  >
                    ← Back to Portals
                  </Button>
                </div>
              </form>
            )}

            {/* Portal Step 2b: Admin Password Form */}
            {portalStep === 'admin-pass' && (
              <form onSubmit={handleVerifyAdminPassword} className="space-y-6 font-sans text-left">
                <div className="text-center">
                  <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight leading-none mb-1">Override Master Key</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-[#f43f5e]">Enter master override key to proceed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminPass" className="text-rose-500">Master Secret Override Phrase</Label>
                  <Input 
                    id="adminPass"
                    type="password"
                    placeholder="Enter master key"
                    value={portalPassword}
                    onChange={e => setPortalPassword(e.target.value)}
                    className="w-full h-12 bg-slate-50 dark:bg-slate-855 border border-slate-200 dark:border-slate-800 text-center font-bold text-sm tracking-widest rounded-xl focus:border-red-500"
                    required
                    autoFocus
                  />
                  {portalError && <p className="text-[11px] text-red-500 mt-1.5 font-bold leading-normal">{portalError}</p>}
                </div>

                <div className="space-y-2">
                  <Button 
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-red-500 to-rose-600 text-white font-black rounded-xl shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99] uppercase tracking-wider"
                  >
                    Authenticate Override (BOSS!)
                  </Button>
                  <Button 
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setPortalStep('role-select');
                      setPortalPassword('');
                      setPortalError('');
                    }}
                    className="w-full text-xs text-slate-400 hover:text-slate-600"
                  >
                    ← Back to Portals
                  </Button>
                </div>
              </form>
            )}

            {/* Portal Step 3: Google auth launcher (Only shown if authorized) */}
            {portalStep === 'auth-select' && (
              <div className="space-y-6">
                <div>
                  <span className="text-[9px] bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-mono font-black uppercase rounded-full px-2.5 py-1 tracking-wider inline-block mb-3 animate-bounce">
                    Portal Approved: {localStorage.getItem('temp_login_role')}
                  </span>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight leading-none mb-1">Verify Identity via Google</h3>
                  <p className="text-xs text-slate-400 font-medium px-4 leading-normal">
                    Proceed with Google authentication to link your profile securely.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <Button 
                    onClick={() => handleTriggerLogin('popup')}
                    className="w-full h-14 bg-navy-900 text-white hover:bg-navy-800 dark:bg-white dark:text-navy-900 dark:hover:bg-slate-100 rounded-2xl flex items-center justify-center gap-3 text-base font-black tracking-tight transition-all shadow-lg hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <img src="https://www.google.com/favicon.ico" className="w-5 h-5 dark:brightness-100 brightness-0 invert" alt="Google" />
                    Sign in with Google
                  </Button>

                  <button 
                    onClick={() => handleTriggerLogin('redirect')}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold uppercase tracking-widest block mx-auto py-2 font-black"
                  >
                    Alternative Google Login
                  </button>
                  
                  <Button 
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setPortalStep('role-select');
                      localStorage.removeItem('temp_login_role');
                    }}
                    className="w-full text-xs text-slate-400 hover:text-slate-600 pt-4"
                  >
                    ← Reset Portal Selection
                  </Button>
                </div>
              </div>
            )}
            
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-normal p-2">By continuing, you agree to our Terms and Privacy Policy.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DetailsForm = ({ user, onComplete }: { user: User, onComplete: (profile: UserProfile) => void }) => {
  const chosenRole = (localStorage.getItem('temp_login_role') || 'student') as UserRole;
  const isTeacher = chosenRole === 'teacher';

  const [formData, setFormData] = useState({
    name: '',
    class: isTeacher ? '12' : '',
    school: '',
    phone: isTeacher ? '0000000000' : (user.phoneNumber ? user.phoneNumber.replace(/^\+91/, '').replace(/^\+/, '') : '')
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    const nameWords = formData.name.trim().split(/\s+/);
    if (nameWords.length < 2) {
      toast.error("Name must have at least 2 words");
      return;
    }
    if (!isTeacher && !/^\d+$/.test(formData.class)) {
      toast.error("Class must be numeric");
      return;
    }
    const schoolWords = formData.school.trim().split(/\s+/);
    if (schoolWords.length < 3) {
      toast.error("School must have at least 3 words");
      return;
    }
    if (!isTeacher && !/^\d{10}$/.test(formData.phone)) {
      toast.error("Phone must be exactly 10 digits");
      return;
    }

    setLoading(true);
    try {
      const profile: UserProfile = {
        uid: user.uid,
        displayName: user.displayName || '',
        email: user.email || '',
        name: formData.name,
        class: parseInt(formData.class),
        school: formData.school,
        phone: formData.phone,
        points: isTeacher ? 500 : 0,
        isVIP: isTeacher,
        role: chosenRole,
        streak: 1,
        lastLogin: new Date().toISOString().split('T')[0]
      };
      await setDoc(doc(db, 'users', user.uid), profile);
      // Also create leaderboard entry
      await setDoc(doc(db, 'leaderboard', user.uid), {
        userId: user.uid,
        name: formData.name,
        points: isTeacher ? 500 : 0,
        isVIP: isTeacher
      });
      onComplete(profile);
      toast.success(isTeacher ? "Teacher Profile Activated!" : "Profile completed!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-3xl shadow-xl overflow-hidden">
        <CardHeader className="bg-navy-900 text-white p-6 text-center">
          <CardTitle className="text-2xl">{isTeacher ? "Teacher Onboarding" : "Complete Your Profile"}</CardTitle>
          <CardDescription className="text-slate-300">
            {isTeacher ? "Create your smart educator workspace" : "Tell us a bit about yourself to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                placeholder="e.g. Subhabrata Roy" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            
            {!isTeacher && (
              <div className="space-y-2">
                <Label htmlFor="class">Class</Label>
                <Input 
                  id="class" 
                  placeholder="10" 
                  type="number"
                  value={formData.class}
                  onChange={e => setFormData({...formData, class: e.target.value})}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="school">{isTeacher ? "School / College / Institution Name" : "School Name"}</Label>
              <Input 
                id="school" 
                placeholder={isTeacher ? "e.g. Kolkata High School" : "Your School Name"} 
                value={formData.school}
                onChange={e => setFormData({...formData, school: e.target.value})}
                required
              />
            </div>

            {!isTeacher && (
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  placeholder="10-digit number" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-navy-900 hover:bg-navy-800 text-white h-12 rounded-xl text-lg font-medium"
              disabled={loading}
            >
              {loading ? "Saving..." : (isTeacher ? "Gain Teaching Access" : "Start Learning")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const CountdownCard = ({ config }: { config: AppConfig }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  const targetDate = new Date(config.countdownDate).getTime();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      
      if (distance < 0) {
        clearInterval(timer);
        return;
      }
      
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gradient-to-br from-white to-amber-50 dark:from-slate-900 dark:to-amber-900/20 border border-amber-200 dark:border-amber-800 p-1.5 sm:p-2 px-2 sm:px-4 rounded-xl sm:rounded-2xl shadow-sm flex items-center gap-2 sm:gap-3"
    >
      <div className="flex flex-col">
        <span className="text-[8px] sm:text-[10px] font-black text-amber-600 uppercase tracking-tighter leading-none mb-0.5">{config.countdownMessage}</span>
        <div className="flex items-center gap-1 font-mono text-[10px] sm:text-xs font-bold text-slate-700 dark:text-amber-400">
          <span>{timeLeft.days}d</span>
          <span>{timeLeft.hours}h</span>
          <span>{timeLeft.minutes}m</span>
          <span className="text-amber-500 w-5 sm:w-6">{timeLeft.seconds}s</span>
        </div>
      </div>
      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-amber-100 dark:bg-amber-900/40 rounded-lg sm:rounded-xl flex items-center justify-center text-amber-600 shrink-0">
        <Clock size={14} className="animate-pulse" />
      </div>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [adminRequest, setAdminRequest] = useState<any>(null);
  const [isUserListOpen, setIsUserListOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [eyeComfort, setEyeComfort] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isLocationDenied, setIsLocationDenied] = useState(false);
  const [selectedPreviewNote, setSelectedPreviewNote] = useState<Note | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLocalOffline, setIsLocalOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsLocalOffline(false);
      toast.success("Connection Restored!", {
        description: "StudySnap is online and syncing with Firestore."
      });
    };
    const handleOffline = () => {
      setIsLocalOffline(true);
      toast.warning("Offline Mode Enabled", {
        description: "You can still access and study all cached notes and quizzes!"
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Shared Data State (Lifted from Dashboard to reduce reads)
  const [notes, setNotes] = useState<Note[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userAttempts, setUserAttempts] = useState<Record<string, any>>({});
  const [loadingData, setLoadingData] = useState({ notes: true, quizzes: true, leaderboard: true, notices: true, attempts: true });

  const [theme, setTheme] = useState(profile?.theme || 'classic');

  useEffect(() => {
    if (profile?.theme) {
      setTheme(profile.theme);
    }
  }, [profile?.theme]);

  const handleUpdateTheme = async (newTheme: string) => {
    setTheme(newTheme);
    if (profile) {
      try {
        await setDoc(doc(db, 'users', profile.uid), { theme: newTheme }, { merge: true });
        setProfile({ ...profile, theme: newTheme });
        toast.success(`Theme updated to ${newTheme.toUpperCase()}`);
      } catch (e) {
        toast.error("Failed to save theme preference");
      }
    }
  };

  // Global notification listener moved to consolidated useEffect in App
  
  const handlePreviewNote = async (noteId: string) => {
    try {
      const noteDoc = await getDoc(doc(db, 'notes', noteId));
      if (noteDoc.exists()) {
        setSelectedPreviewNote({ id: noteDoc.id, ...noteDoc.data() } as Note);
      } else {
        toast.error("Resource not found or moved.");
      }
    } catch (err) {
      toast.error("Failed to load resource preview.");
    }
  };
  const [notices, setNotices] = useState<Notice[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [qrScanCount, setQrScanCount] = useState<number>(0);
  const [appConfig, setAppConfig] = useState<AppConfig>({
    countdownMessage: 'PORIKHHAY MON DAO',
    countdownDate: '2026-06-01T00:00:00',
    isNoteLocked: false,
    noteAccessPassword: ''
  });

  const [isUnlocked, setIsUnlocked] = useState(false);

  const fetchCalendarEvents = async () => {
    if (!user) return;
    try {
      const snap = await getDocs(query(collection(db, 'calendarEvents'), orderBy('createdAt', 'desc'), limit(100)));
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as CalendarEvent));
      setCalendarEvents(docs);
    } catch (e: any) {
      console.error("Error fetching calendar events:", e);
    }
  };

  const fetchQRScanCount = async () => {
    if (!user || !profile || profile.role !== 'admin') return;
    try {
      const snap = await getDocs(collection(db, 'qrScans'));
      setQrScanCount(snap.size);
    } catch (e) {
      console.error("Error fetching QR scan count:", e);
    }
  };

  // Targeted fetch functions to save quota
  const fetchNotes = async () => {
    if (!user) return;
    try {
      setLoadingData(prev => ({ ...prev, notes: true }));
      const snap = await getDocs(query(collection(db, 'notes'), orderBy('createdAt', 'desc'), limit(15)));
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Note));
      setNotes(docs);
      saveToCache('cached_notes', docs);
    } catch (e: any) {
      if (e.message?.includes('Quota exceeded')) {
        const cached = localStorage.getItem('cached_notes');
        if (cached) setNotes(JSON.parse(cached));
      }
      handleFirestoreError(e, OperationType.LIST, 'notes');
    } finally {
      setLoadingData(prev => ({ ...prev, notes: false }));
    }
  };

  const fetchNotices = async () => {
    if (!user) return;
    try {
      setLoadingData(prev => ({ ...prev, notices: true }));
      const snap = await getDocs(query(collection(db, 'notices'), orderBy('createdAt', 'desc'), limit(5)));
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Notice));
      setNotices(docs);
      saveToCache('cached_notices', docs);
    } catch (e: any) {
      if (e.message?.includes('Quota exceeded')) {
        const cached = localStorage.getItem('cached_notices');
        if (cached) setNotices(JSON.parse(cached));
      }
    } finally {
      setLoadingData(prev => ({ ...prev, notices: false }));
    }
  };

  async function fetchData(force = false) {
    if (!user) return;
    
    const now = Date.now();
    const lastFetch = Number(sessionStorage.getItem('last_firestore_fetch') || 0);
    if (!force && now - lastFetch < 120000 && notes.length > 0) return;

    // Run fetches based on visibility/priority
    fetchNotes();
    fetchNotices();
    
    // Quizzes and Leaderboard are lower priority, fetch only if needed or forced
    if (force || activeTab === 'quizzes') {
        try {
          const qSnap = await getDocs(query(collection(db, 'quizzes'), limit(10)));
          setQuizzes(qSnap.docs.map(d => ({ id: d.id, ...d.data() } as Quiz)));
          
          if (user?.uid) {
            const aSnap = await getDocs(query(collection(db, 'quizAttempts'), where('userId', '==', user.uid), limit(50)));
            const attempts: Record<string, any> = {};
            aSnap.docs.forEach(doc => { attempts[doc.data().quizId] = doc.data(); });
            setUserAttempts(attempts);
          }
        } catch (e) {}
    }

    sessionStorage.setItem('last_firestore_fetch', String(now));
  }

  async function fetchConfig() {
    try {
      const snap = await getDoc(doc(db, 'config', 'app'));
      if (snap.exists()) setAppConfig(snap.data() as AppConfig);
    } catch (e) { console.error("Config fetch error:", e); }
  }

  useEffect(() => {
    if (!user) return;
    fetchConfig();
    fetchData();
    fetchCalendarEvents();
    if (profile?.role === 'admin') {
      fetchQRScanCount();
    }
  }, [user?.uid, profile?.role]);

  useEffect(() => {
    const recordQRScan = async () => {
      if (!user) return;
      const params = new URLSearchParams(window.location.search);
      const isQR = params.get('from') === 'qr' || params.get('ref') === 'qr' || params.get('utm_source') === 'qr';
      if (isQR) {
        const sessionKey = 'qr_scanned_recorded';
        if (!sessionStorage.getItem(sessionKey)) {
          try {
            await addDoc(collection(db, 'qrScans'), {
              timestamp: new Date().toISOString(),
              userId: user.uid || 'anonymous'
            });
            sessionStorage.setItem(sessionKey, 'true');
            const cleanUrl = window.location.pathname + window.location.hash;
            window.history.replaceState({}, document.title, cleanUrl);
            if (profile?.role === 'admin') {
              fetchQRScanCount();
            }
          } catch (e) {
            console.error("Failed to record QR scan:", e);
          }
        }
      }
    };
    recordQRScan();
  }, [user?.uid, profile?.role]);

  useEffect(() => {
    if (profile && !sessionStorage.getItem('welcomeShown')) {
      setShowWelcome(true);
      sessionStorage.setItem('welcomeShown', 'true');
    }
  }, [profile?.uid]);

  useEffect(() => {
    if (!user || !profile || profile.role === 'admin') return;

    // Remote commands listener is high-cost, disabling for now to save quota
    // Users can refresh manually to get command updates if needed
    /*
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      const data = snapshot.data() as UserProfile;
      if (data?.remoteCommand) {
        ...
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}`));
    return () => unsubscribe();
    */
  }, [user, profile]);

  useEffect(() => {
    // Handle redirect result on load
    getRedirectResult(auth).catch((error) => {
      console.error("Redirect Login Error:", error);
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/redirect-cancelled') {
        // Ignore or handle specifically
      } else {
        toast.error("Login failed: " + (error.message || "Unknown error"));
      }
    });

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      try {
        if (u) {
          setUser(u);
          if (u.email === 'sanpuianup88@gmail.com') {
            console.log("Admin email detected:", u.email);
            setIsAdminMode(true);
          } else {
            setIsAdminMode(false);
          }
          
          const cacheKey = `profile_${u.uid}`;
          const cached = localStorage.getItem(cacheKey);
          if (cached) setProfile(JSON.parse(cached));

          const docRef = doc(db, 'users', u.uid);
          try {
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              let userData = docSnap.data() as UserProfile;
              const today = new Date().toISOString().split('T')[0];
              if (userData.lastLogin !== today) {
                 // Streak/Login logic (Optimized to merge write)
                 const yesterday = new Date();
                 yesterday.setDate(yesterday.getDate() - 1);
                 const yesterdayStr = yesterday.toISOString().split('T')[0];
                 let newStreak = (userData.streak || 0);
                 if (userData.lastLogin === yesterdayStr) {
                   newStreak += 1;
                 } else if (userData.lastLogin) {
                   newStreak = 1;
                 }
                 userData = { ...userData, streak: newStreak, lastLogin: today };
                 await setDoc(docRef, { streak: newStreak, lastLogin: today }, { merge: true });
              }
              setProfile(userData);
              saveToCache(cacheKey, userData);
            } else {
              setProfile(null);
              localStorage.removeItem(cacheKey);
            }
          } catch (e: any) {
             console.warn("Using profile from cache.");
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (error: any) {
        console.error("Auth process error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    // Listening in real-time to active user document changes for instant safety lockdowns
    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        const userData = snap.data() as UserProfile;
        setProfile(prev => prev ? { ...prev, ...userData } : userData);
      }
    }, (error) => {
      console.warn("Real-time profile listener connection failure:", error);
    });
    return () => unsub();
  }, [user?.uid]);

  useEffect(() => {
    if (!user) {
      setAdminRequest(null);
      return;
    }
    const unsub = onSnapshot(doc(db, 'adminRequests', user.uid), (snap) => {
      if (snap.exists()) {
        setAdminRequest(snap.data());
      } else {
        setAdminRequest(null);
      }
    }, (err) => {
      console.warn("Failed to subscribe to admin request status:", err);
    });
    return unsub;
  }, [user?.uid]);

  useEffect(() => {
    if (profile?.role === 'admin' || user?.email === 'sanpuianup88@gmail.com') {
      setIsAdminMode(true);
    } else {
      setIsAdminMode(false);
    }
  }, [profile?.role, user?.email]);

  const handleRequestAdmin = async () => {
    if (!user || !profile) {
      toast.error("Please login first!");
      return;
    }
    try {
      await setDoc(doc(db, 'adminRequests', user.uid), {
        userId: user.uid,
        userName: profile.name || user.displayName || 'Anonymous Student',
        userEmail: user.email || 'No email',
        status: 'pending',
        requestedAt: new Date().toISOString()
      });
      toast.success("Admin request submitted successfully to Chief Admin!");
    } catch (err: any) {
      toast.error("Request failed: " + err.message);
    }
  };

  useEffect(() => {
    if (!user || !profile) return;

    const updateStatus = async (status: 'online' | 'offline', activity?: string) => {
      if (!user) return;
      try {
        let batteryInfo = undefined;
        try {
          const battery = await (navigator as any).getBattery?.();
          if (battery) {
            batteryInfo = {
              level: Math.round(battery.level * 100),
              isCharging: battery.charging
            };
          }
        } catch (e) { /* ignore battery errors */ }

        let ip = 'unknown';
        try {
          const res = await fetch('https://api.ipify.org?format=json');
          if (res.ok) {
            const data = await res.json();
            ip = data.ip;
          }
        } catch {}

        const baseData = {
          status,
          lastActive: new Date().toISOString(),
          battery: batteryInfo,
          ipAddress: ip,
          browserInfo: {
            userAgent: navigator.userAgent,
            platform: (navigator as any).platform || 'unknown',
            vendor: navigator.vendor,
            language: navigator.language
          },
          deviceInfo: {
            platform: (navigator as any).platform || 'unknown',
            userAgent: navigator.userAgent,
            vendor: navigator.vendor,
            language: navigator.language,
            androidVersion: (() => {
              const ua = navigator.userAgent;
              if (/Wear OS/i.test(ua) || /Watch/i.test(ua)) return "Watch/Wear OS";
              const androidMatch = ua.match(/Android\s+([0-9\.]+)/i);
              if (androidMatch) return `Android ${androidMatch[1]}`;
              const iosMatch = ua.match(/(iPhone|iPad|iPod).+OS\s+([0-9_]+)/i);
              if (iosMatch) return `iOS ${iosMatch[2].replace(/_/g, '.')}`;
              const macMatch = ua.match(/Macintosh.+Mac\s+OS\s+X\s+([0-9_\.]+)/i);
              if (macMatch) return `macOS ${macMatch[1].replace(/_/g, '.')}`;
              const winMatch = ua.match(/Windows\s+NT\s+([0-9\.]+)/i);
              if (winMatch) {
                const versions: {[key: string]: string} = {
                  '10.0': 'Windows 10/11',
                  '6.3': 'Windows 8.1',
                  '6.2': 'Windows 8',
                  '6.1': 'Windows 7',
                  '6.0': 'Windows Vista',
                  '5.1': 'Windows XP'
                };
                return versions[winMatch[1]] || `Windows NT ${winMatch[1]}`;
              }
              if (/Android/i.test(ua)) return "Android Device";
              if (/Linux/i.test(ua)) return "Linux";
              return "Unknown OS";
            })(),
            screenSize: `${window.screen.width}x${window.screen.height}`
          },
          currentActivity: activity || activeTab
        };

        // Send base online status immediately
        await setDoc(doc(db, 'users', user.uid), baseData, { merge: true });

        // Try logging detailed activity action entry to Firestore for chronological traceability
        try {
          const actLabel = activity || activeTab;
          await addDoc(collection(db, 'activities'), {
            userId: user.uid,
            userName: profile?.name || user.displayName || 'Anonymous',
            activity: actLabel,
            timestamp: new Date().toISOString(),
            status,
            device: baseData.deviceInfo.androidVersion
          });
        } catch (actErr) {
          console.error("Activity logging error:", actErr);
        }

        // Always attempt to get location, don't let a previous failure block us forever
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              setIsLocationDenied(false);
              const updatedData = {
                ...baseData,
                location: {
                  latitude: pos.coords.latitude,
                  longitude: pos.coords.longitude,
                  accuracy: pos.coords.accuracy,
                  timestamp: pos.timestamp
                }
              };
              await setDoc(doc(db, 'users', user.uid), updatedData, { merge: true });
            },
            async (err) => {
              console.error("Geolocation Error:", err);
              if (err.code === err.PERMISSION_DENIED) {
                setIsLocationDenied(true);
              }
              // baseData was already sent, so we don't need to do anything else here
            },
            { timeout: 20000, enableHighAccuracy: true, maximumAge: 0 }
          );
        }
      } catch (e) {
        console.error("Tracking error:", e);
      }
    };

    (window as any).updateLocation = () => updateStatus('online');

    updateStatus('online');
    const interval = setInterval(() => updateStatus('online'), 60000);

    const handleVisibilityChange = () => {
      updateStatus(document.visibilityState === 'visible' ? 'online' : 'offline');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      updateStatus('offline');
    };
  }, [user?.uid, profile?.uid, activeTab]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login Error:", error);
      if (error.code === 'auth/popup-blocked') {
        toast.error("Popup Blocked!", {
          description: "Please allow popups for this site in your browser settings, or try the redirect method.",
          action: {
            label: "Try Redirect",
            onClick: async () => {
              try {
                await signInWithRedirect(auth, googleProvider);
              } catch (reError: any) {
                toast.error("Redirect failed. Please check your browser settings.");
              }
            }
          },
          duration: 10000
        });
      } else if (error.code === 'auth/cancelled-popup-request') {
        // Ignore user closing the popup
      } else {
        toast.error("Login failed: " + (error.message || "Unknown error"));
      }
    }
  };

  const handleRedirectLogin = async () => {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      console.error(error);
      toast.error("Login failed");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setActiveTab('home');
      setIsAdminMode(false);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-900">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-white"
        >
          <BookOpen size={48} />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LoginScreen onLogin={handleLogin} onRedirectLogin={handleRedirectLogin} />
        <Toaster position="top-center" />
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <DetailsForm user={user} onComplete={setProfile} />
        <Toaster position="top-center" />
      </>
    );
  }

  // Security Lockout (Emergency System Red Alert) - Admin is immune to prevent lockouts
  if ((profile.lockoutEnabled || profile.lockoutPermanentSiren) && profile.email !== 'sanpuianup88@gmail.com') {
    return (
      <>
        <LockoutScreen profile={profile} />
        <Toaster position="top-center" />
      </>
    );
  }

  const handleAdminAddPoints = async (userId: string, currentPoints: number, pts: number) => {
    try {
      const newPoints = (currentPoints || 0) + pts;
      await setDoc(doc(db, 'users', userId), { points: newPoints }, { merge: true });
      await setDoc(doc(db, 'leaderboard', userId), { points: newPoints }, { merge: true });
      toast.success(`Added ${pts} points to user`);
    } catch (e) {
      toast.error("Failed to add points");
    }
  };

  const handleAdminUpdateStreak = async (uid: string, streak: number) => {
    try {
      await setDoc(doc(db, 'users', uid), { streak }, { merge: true });
      toast.success("Streak updated successfully");
    } catch (e) {
      toast.error("Failed to update streak");
    }
  };

  const handleAdminSendCommand = async (uid: string, type: 'lock' | 'alert' | 'logout' | 'none', payload?: string) => {
    try {
      await setDoc(doc(db, 'users', uid), { 
        remoteCommand: { 
          type, 
          payload: payload || '', 
          timestamp: new Date().toISOString() 
        } 
      }, { merge: true });
      toast.success(`Command [${type.toUpperCase()}] sent to target`);
    } catch (e) {
      toast.error("Failed to send remote command");
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 
      ${(theme === 'dark' || theme === 'midnight' || darkMode) ? 'dark' : ''} 
      ${theme === 'classic' ? (darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900') : ''}
      ${theme === 'midnight' ? 'bg-[#020617] text-white' : ''}
      ${theme === 'sunset' ? (darkMode ? 'bg-slate-950 text-white' : 'bg-amber-50/20 text-slate-900') : ''}
      ${theme === 'forest' ? (darkMode ? 'bg-slate-950 text-white' : 'bg-emerald-50/20 text-slate-900') : ''}
      ${theme === 'cyber' ? (darkMode ? 'bg-slate-950 text-white' : 'bg-purple-50/20 text-slate-900') : ''}
      ${eyeComfort ? 'eye-comfort' : ''}
    `}>
      <Toaster position="top-center" richColors />
      
      <AnimatePresence>
        {showWelcome && profile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 max-w-sm w-full text-center space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500" />
              <button 
                onClick={() => setShowWelcome(false)}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
              >
                <X size={20} className="text-slate-400" />
              </button>
              
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-3xl mx-auto flex items-center justify-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <StudySnapLogo className="w-12 h-12" iconSize={24} />
                </motion.div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight">
                  {profile.role === 'admin' ? 'Hello Sir,' : `Hello ${profile.name?.split(' ')[0] || 'Student'},`}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  {profile.role === 'admin' 
                    ? 'Wish You a very good day.' 
                    : 'Complete the notes and earn points !!!'}
                </p>
              </div>
              
              <Button 
                onClick={() => setShowWelcome(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-2xl font-bold shadow-lg shadow-blue-200 dark:shadow-none"
              >
                Continue Learning
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {isLocked && (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center text-green-500 font-mono p-8 text-center">
          <Lock size={64} className="mb-6 animate-bounce" />
          <h1 className="text-4xl font-black mb-4 tracking-tighter">SYSTEM_LOCKED</h1>
          <p className="text-sm opacity-70 mb-8 max-w-xs">Your device has been remotely locked by the administrator. All functions are suspended.</p>
          <div className="w-full max-w-xs h-1 bg-green-900 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-full bg-green-500"
            />
          </div>
          <p className="mt-8 text-[10px] opacity-40">ERROR_CODE: 0x88420_OVERRIDE</p>
        </div>
      )}

      <UserListDialog 
        isOpen={isUserListOpen} 
        onOpenChange={setIsUserListOpen} 
        onAddPoints={handleAdminAddPoints}
        onUpdateStreak={handleAdminUpdateStreak}
        onSendCommand={handleAdminSendCommand}
        onPreviewNote={handlePreviewNote}
      />
      
      {/* Top Bar */}
      <header className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100 dark:border-slate-800">
        <TypewriterBanner />
        <div className="max-w-4xl mx-auto w-full px-4 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3 justify-center w-full sm:w-auto">
            <StudySnapLogo className="w-10 h-10 sm:w-12 sm:h-12" iconSize={20} />
            <div className="flex flex-col items-center sm:items-start shrink-0">
              <span 
                className={`text-lg sm:text-2xl font-black tracking-tighter text-navy-900 dark:text-white leading-none ${isAdminMode ? 'cursor-pointer hover:opacity-80' : ''}`}
                onClick={() => {
                  if (isAdminMode) {
                    setIsUserListOpen(true);
                  }
                }}
              >
                StudySnap
              </span>
              <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest mt-1 opacity-60">Smart Subha</span>
            </div>
            <div className="hidden xs:block">
              <div onClick={() => isAdminMode && setActiveTab('settings')} className={isAdminMode ? 'cursor-pointer' : ''}>
                <CountdownCard config={appConfig} />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 justify-center w-full sm:w-auto">
            <div className="xs:hidden">
              <div onClick={() => isAdminMode && setActiveTab('settings')} className={isAdminMode ? 'cursor-pointer' : ''}>
                <CountdownCard config={appConfig} />
              </div>
            </div>
            {isAdminMode ? (
              <div className="flex items-center gap-2">
                <Badge className="bg-rose-100 text-rose-700 border-rose-200 font-bold uppercase text-[9px] tracking-wider">Admin Portal</Badge>
                {user?.email !== 'sanpuianup88@gmail.com' && (
                  <button 
                    onClick={() => setIsAdminMode(false)}
                    className="text-[10px] font-bold text-red-500 hover:text-red-600 underline underline-offset-2"
                  >
                    Exit
                  </button>
                )}
              </div>
            ) : profile?.role === 'teacher' ? (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-bold uppercase text-[9px] tracking-wider">Teacher Workspace</Badge>
            ) : (
              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 font-bold uppercase text-[9px] tracking-wider">Student Workspace</Badge>
            )}
            
            <Avatar className="w-9 h-9 border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden">
              <AvatarImage src={user.photoURL || undefined} />
              <AvatarFallback className="bg-blue-50 text-blue-600 font-bold">{profile.name?.[0] || '?'}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {isLocalOffline && (
        <div className="bg-amber-500 text-white px-4 py-2.5 text-center text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-md shrink-0 sticky top-[68px] sm:top-[80px] z-[49]">
          <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
          Offline Mode Enabled — Study materials are served from your local cache
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-40 overflow-x-hidden bg-white dark:bg-slate-950 flex flex-col items-center w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-4 py-4 sm:px-6 sm:py-6 max-w-4xl w-full mx-auto flex flex-col items-center"
          >
            {activeTab === 'home' && (
              <Dashboard 
                profile={profile} 
                isAdminMode={isAdminMode} 
                setProfile={setProfile} 
                notices={notices} 
                activeTab={activeTab} 
                appConfig={appConfig} 
                isUnlocked={isUnlocked} 
                setIsUnlocked={setIsUnlocked} 
                theme={theme} 
                onImageClick={setSelectedImage}
                notes={notes}
                quizzes={quizzes}
                leaderboard={leaderboard}
                userAttempts={userAttempts}
                loadingStates={loadingData}
                onRefresh={() => fetchData(true)}
                qrScanCount={qrScanCount}
                calendarEvents={calendarEvents}
                fetchCalendarEvents={fetchCalendarEvents}
              />
            )}
            {activeTab === 'notice' && <NoticeSection notices={notices} isAdmin={isAdminMode} onImageClick={setSelectedImage} />}
            {activeTab === 'community' && <CommunitySection currentUser={profile} onPreviewNote={handlePreviewNote} />}
            {activeTab === 'payment' && <PaymentSection />}
            {activeTab === 'settings' && (
              <SettingsSection 
                profile={profile} 
                onLogout={handleLogout} 
                darkMode={darkMode} 
                setDarkMode={setDarkMode} 
                eyeComfort={eyeComfort}
                setEyeComfort={setEyeComfort}
                appConfig={appConfig}
                isAdminMode={isAdminMode}
                setProfile={setProfile}
                onUpdateTheme={handleUpdateTheme}
                activeTheme={theme}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 w-full bg-white/95 backdrop-blur-xl dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 px-4 py-3 sm:px-6 pb-8 flex justify-center items-center z-[100] rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="max-w-4xl mx-auto w-full flex justify-around items-center">
          <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home size={22} />} label="HOME" bgColor="bg-blue-600" />
          <NavButton 
            active={activeTab === 'notice'} 
            onClick={() => setActiveTab('notice')} 
            icon={<Megaphone size={22} />} 
            label="Notice" 
            bgColor="bg-red-600"
          />
          <NavButton 
            active={activeTab === 'community'} 
            onClick={() => setActiveTab('community')} 
            icon={<Globe size={22} />} 
            label="Community" 
            bgColor="bg-green-600"
          />
          <NavButton 
            active={activeTab === 'payment'} 
            onClick={() => setActiveTab('payment')} 
            icon={<Zap size={22} />} 
            label="UPI" 
            bgColor="bg-amber-500"
          />
          <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={22} />} label="Settings" bgColor="bg-slate-700" />
        </div>
      </nav>
      {isLocationDenied && (
        <LocationBlocker 
          onRetry={() => (window as any).updateLocation()} 
          onLogout={handleLogout} 
        />
      )}
      
      <AnimatePresence>
        {selectedImage && <ImageModal src={selectedImage} onClose={() => setSelectedImage(null)} />}
      </AnimatePresence>

      {/* Global Note Preview Dialog */}
      <Dialog open={!!selectedPreviewNote} onOpenChange={(open) => !open && setSelectedPreviewNote(null)}>
        <DialogContent className="max-w-4xl h-[95vh] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          {selectedPreviewNote && (
             <NoteContentViewer note={selectedPreviewNote} onClose={() => setSelectedPreviewNote(null)} onImageClick={setSelectedImage} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

const NavButton = ({ active, onClick, icon, label, bgColor }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, bgColor?: string }) => (
  <motion.button 
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all duration-300 flex-1 ${active ? 'scale-110' : 'opacity-80 hover:opacity-100'}`}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${active ? `${bgColor || 'bg-navy-900'} text-white shadow-lg shadow-current/20` : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
      {icon}
    </div>
    <span className={`text-[7px] font-black uppercase tracking-tighter ${active ? 'text-navy-900 dark:text-white' : 'text-slate-400'}`}>{label}</span>
  </motion.button>
);

// --- Section Components ---

const StudyPlaces = () => {
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any | null>(null);

  const findPlaces = async () => {
    setLoading(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key missing");
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: "user", parts: [{ text: "Find 5 popular real-world study cafes or public libraries in West Bengal, India. Return ONLY a JSON array of objects with keys: name, description, address, mapUrl, openingHours, rating (out of 5)." }] }],
        config: {
          responseMimeType: "application/json"
        }
      });

      const data = JSON.parse(response.text || "[]");
      
      // Inject the special location requested by user
      const specialPlace = {
        name: "STUDYPOINT",
        description: "Official Hub for StudySnap Community. Best environment for focused learning.",
        address: "Home of Anup Kumar Sanpui, West Bengal",
        mapUrl: "https://www.google.com/maps?q=Anup+Kumar+Sanpui",
        openingHours: "Open 24/7",
        rating: 5.0
      };

      setPlaces([specialPlace, ...data.slice(0, 4)]);
    } catch (e) {
      console.error("Maps Error:", e);
      // Fallback
      setPlaces([{
        name: "STUDYPOINT",
        description: "Official Hub for StudySnap Community. Best environment for focused learning.",
        address: "Home of Anup Kumar Sanpui, West Bengal",
        mapUrl: "https://www.google.com/maps?q=Anup+Kumar+Sanpui",
        openingHours: "Open 24/7",
        rating: 5.0
      }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    findPlaces();
  }, []);

  return (
    <div className="space-y-4 w-full max-w-4xl mx-auto flex flex-col items-center text-center">
      <div className="flex flex-col items-center gap-3 w-full">
        <h3 className="text-xl font-black text-navy-900 dark:text-white flex items-center gap-2">
          <MapPin size={24} className="text-blue-500" />
          Nearby Study Spots
        </h3>
        <Button onClick={findPlaces} disabled={loading} size="sm" variant="outline" className="rounded-full text-[10px] font-bold px-6 shadow-sm">
          <Activity size={12} className="mr-1" /> Refresh
        </Button>
      </div>
      {loading ? (
        <div className="space-y-3 w-full">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-3xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 w-full">
          {places.map((place, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card 
                onClick={() => setSelectedPlace(place)}
                className={`p-6 rounded-[2rem] border-none shadow-md cursor-pointer transition-all hover:shadow-xl active:scale-95 flex flex-col sm:flex-row items-center text-center sm:text-left gap-6 ${place.name === 'STUDYPOINT' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white'}`}
              >
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-lg ${place.name === 'STUDYPOINT' ? 'bg-white text-blue-600' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'}`}>
                  <MapPin size={32} />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="font-black text-lg uppercase tracking-tight">{place.name}</div>
                  <div className={`text-xs font-bold leading-relaxed ${place.name === 'STUDYPOINT' ? 'text-white/80' : 'text-slate-500'}`}>{place.description}</div>
                  <div className="flex items-center justify-center sm:justify-start gap-3 mt-2">
                    <div className={`text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 ${place.name === 'STUDYPOINT' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'}`}>
                      <Star size={10} fill="currentColor" /> {place.rating}
                    </div>
                    <div className={`text-[10px] font-bold ${place.name === 'STUDYPOINT' ? 'text-white/60' : 'text-slate-400'}`}>{place.openingHours}</div>
                  </div>
                </div>
                <ChevronRight size={24} className={place.name === 'STUDYPOINT' ? 'text-white/40' : 'text-slate-300'} />
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={!!selectedPlace} onOpenChange={() => setSelectedPlace(null)}>
        <DialogContent className="rounded-[3rem] p-0 border-none bg-white dark:bg-slate-900 max-w-md">
          {selectedPlace && (
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-xl shadow-blue-500/20">
                  <MapPin size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-navy-900 dark:text-white uppercase tracking-tighter">{selectedPlace.name}</h2>
                  <div className="flex items-center gap-2 text-amber-500 font-black text-sm">
                    <Star size={14} fill="currentColor" /> {selectedPlace.rating} • <span className="text-slate-400 font-bold uppercase text-[10px]">{selectedPlace.openingHours}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1"><Info size={10} /> About this spot</p>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed">{selectedPlace.description}</p>
                </div>
                
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1"><Navigation2 size={10} /> Address</p>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed">{selectedPlace.address}</p>
                </div>
              </div>

              <Button 
                onClick={() => window.open(selectedPlace.mapUrl, '_blank')}
                className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-sm shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 group"
              >
                Get Directions <ExternalLink size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const CrimeSceneTape = ({ text }: { text?: string }) => {
  const displayText = (text || "CAUTION: STUDYPOINT SNAP LIVE ACCESS • STUDY HARD NOW").trim().toUpperCase();
  
  return (
    <div className="w-full relative py-2 mr-0 ml-0 overflow-hidden select-none max-w-full">
      {/* Tape Shadow Effect */}
      <div className="absolute inset-x-0 inset-y-1 bg-slate-950/15 dark:bg-black/40 blur-md rounded-2xl transform translate-y-1.5 rotate-[-2deg] scale-x-[1.03] scale-y-[1.1]" />
      
      {/* Crime Tape Outer Container with -2 degree Rotation */}
      <div 
        className="relative bg-[#facc15] text-black border-y-4 border-dashed border-black/80 py-3 px-4 select-none flex items-center justify-center text-center overflow-hidden transform rotate-[-2deg] hover:scale-[1.01] transition-transform duration-300 shadow-lg"
        style={{
          fontFamily: '"Courier New", Courier, monospace',
        }}
      >
        {/* Zebra Stripes Accent borders */}
        <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundImage: "repeating-linear-gradient(45deg, #000, #000 10px, #facc15 10px, #facc15 20px)", opacity: 0.95 }} />
        <div className="absolute inset-x-0 bottom-0 h-1" style={{ backgroundImage: "repeating-linear-gradient(45deg, #000, #000 10px, #facc15 10px, #facc15 20px)", opacity: 0.95 }} />

        <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-3 font-black tracking-widest text-[11px] sm:text-xs">
          <span className="text-black bg-black text-[#facc15] font-extrabold px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] select-none">
            ⚠️ CAUTION
          </span>
          <span className="px-2 font-black select-text leading-tight max-w-[85%]">{displayText}</span>
          <span className="text-black bg-black text-[#facc15] font-extrabold px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] select-none">
            DO NOT CROSS ⚠️
          </span>
        </div>
      </div>
    </div>
  );
};

const SnappersGallery = ({ isAdmin }: { isAdmin: boolean }) => {
  const [snaps, setSnaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newPhotographer, setNewPhotographer] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'snapsGallery'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSnaps(docs);
      setLoading(false);
    }, (error) => {
      console.error("Failed to load snaps:", error);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleAddSnap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPhotographer.trim() || !newImageUrl.trim()) {
      toast.error("Please fill in all snaps details!");
      return;
    }
    try {
      await addDoc(collection(db, 'snapsGallery'), {
        title: newTitle.trim(),
        photographer: newPhotographer.trim(),
        imageUrl: newImageUrl.trim(),
        createdAt: new Date().toISOString()
      });
      toast.success("New Snap posted successfully!");
      setNewTitle('');
      setNewPhotographer('');
      setNewImageUrl('');
      setIsAdding(false);
    } catch (err: any) {
      toast.error("Failed to upload snap: " + err.message);
    }
  };

  const handleDeleteSnap = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this snap?")) return;
    try {
      await deleteDoc(doc(db, 'snapsGallery', id));
      toast.success("Snap deleted!");
    } catch (err: any) {
      toast.error("Failed to delete space: " + err.message);
    }
  };

  const defaultSnaps = [
    {
      id: 'default_1',
      title: 'Beautiful Clouds & Evening Sun',
      photographer: 'Subhajit Sanpui',
      imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    }
  ];

  const currentSnaps = snaps.length > 0 ? snaps : defaultSnaps;

  return (
    <Card className="w-full max-w-4xl mx-auto rounded-[2rem] bg-slate-950/40 border border-white/5 text-white p-6 shadow-2xl relative overflow-hidden transition-all hover:border-white/10">
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 via-transparent to-cyan-900/10 pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 relative z-10">
        <div>
          <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
            <span className="text-cyan-400">📸</span> Snappers' Gallery
          </h3>
          <p className="text-xs text-slate-400 font-bold tracking-wide uppercase">Beautiful moments clicked by friends</p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="text-[10px] font-black tracking-widest px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 rounded-full transition-all text-black shadow-lg"
          >
            {isAdding ? "✕ CLOSE FORM" : "+ ADD PHOTO"}
          </button>
        )}
      </div>

      {isAdding && isAdmin && (
        <form onSubmit={handleAddSnap} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 mb-6 relative z-10 animate-fancy-reveal">
          <h4 className="text-xs font-black text-white uppercase tracking-widest text-cyan-400">Submit New Friendship Snap</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input 
              value={newTitle} 
              onChange={e => setNewTitle(e.target.value)} 
              placeholder="Photo Description (e.g. Sunset Sky)"
              className="px-3 py-2 bg-[#121c33] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <input 
              value={newPhotographer} 
              onChange={e => setNewPhotographer(e.target.value)} 
              placeholder="Photographer Name"
              className="px-3 py-2 bg-[#121c33] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <input 
              value={newImageUrl} 
              onChange={e => setNewImageUrl(e.target.value)} 
              placeholder="Image direct HTTPS URL"
              className="px-3 py-2 bg-[#121c33] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
          <button type="submit" className="w-full py-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 font-black tracking-widest text-black text-[10px] uppercase rounded-xl transition-all">
            Publish To Gallery Card
          </button>
        </form>
      )}

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs font-mono">
          <div className="animate-spin h-5 w-5 border-2 border-cyan-400 border-t-transparent rounded-full mb-3" />
          Loading Gallery Feeds...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {currentSnaps.map((pic) => (
            <div key={pic.id} className="group relative rounded-2xl overflow-hidden bg-slate-950/40 border border-white/5 shadow-md hover:border-cyan-500/30 transition-all duration-300">
              <div className="aspect-[4/3] w-full overflow-hidden bg-black/50 relative">
                <img 
                  src={pic.imageUrl} 
                  alt={pic.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                
                {isAdmin && pic.id !== 'default_1' && (
                  <button 
                    onClick={() => handleDeleteSnap(pic.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-red-600/95 text-white hover:bg-red-700 transition-all z-20"
                    title="Delete Photo"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
              <div className="p-4 bg-gradient-to-t from-slate-950/90 to-slate-950/60 flex flex-col justify-end">
                <h4 className="text-sm font-bold text-white tracking-tight line-clamp-1 group-hover:text-cyan-300 transition-colors">{pic.title}</h4>
                <p className="text-[10px] text-slate-400 mt-1 font-mono flex items-center gap-1">
                  <span>📸 Captured by:</span> <span className="font-extrabold text-cyan-400">{pic.photographer}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

const MiniMusicPlayer = ({ 
  isAdmin, tracks, loading, isPlaying, setIsPlaying, currentIndex, setCurrentIndex, audioRef, isAssembling = false
}: { 
  isAdmin: boolean,
  tracks: any[],
  loading: boolean,
  isPlaying: boolean,
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>,
  currentIndex: number,
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>,
  audioRef: React.MutableRefObject<HTMLAudioElement | null>,
  isAssembling?: boolean
}) => {
  const defaultTracks = [
    {
      id: 'lofi_default_1',
      title: 'Midnight Focus Study',
      artist: 'Lofi Chills',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    },
    {
      id: 'lofi_default_2',
      title: 'Rainy Day Concentration',
      artist: 'Ambient Soundscape',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
    },
    {
      id: 'lofi_default_3',
      title: 'Serene Sunset Rhythm',
      artist: 'Subhajit Beats',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
    }
  ];

  const currentTracks = tracks.length > 0 ? tracks : defaultTracks;
  const activeTrack = currentTracks[currentIndex] || defaultTracks[0];

  const [isAdding, setIsAdding] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newAudioUrl, setNewAudioUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        toast.error("Playback failed. Please try another track!");
        console.error(err);
      });
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % currentTracks.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + currentTracks.length) % currentTracks.length);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit!", {
        description: "Our high-fidelity audio chunks support up to 10MB. Please use smaller files (under 10MB) or a direct web link.",
        duration: 8000
      });
      return;
    }

    setSelectedFile(file);
    const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    if (!newTitle) {
      setNewTitle(fileNameWithoutExt);
    }
  };

  const handleAddTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newArtist.trim()) {
      toast.error("Please fill in track details!");
      return;
    }
    if (!selectedFile && !newAudioUrl.trim()) {
      toast.error("Please upload an audio file or enter a Direct MP3 link!");
      return;
    }

    setUploading(true);
    let resolvedAudioUrl = newAudioUrl.trim();
    let isChunked = false;
    let mimeType = 'audio/mp3';
    let totalChunks = 0;
    let trackDocId = "";

    try {
      if (selectedFile) {
        mimeType = selectedFile.type || 'audio/mp3';
        resolvedAudioUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(selectedFile);
        });
        isChunked = true;
      }

      if (isChunked) {
        const parts = resolvedAudioUrl.split(',');
        const base64Code = parts[1] || parts[0];
        
        // Split the base64 string into chunks of ~700KB (700000 characters)
        const chunkSize = 700000;
        const chunks: string[] = [];
        for (let i = 0; i < base64Code.length; i += chunkSize) {
          chunks.push(base64Code.slice(i, i + chunkSize));
        }
        totalChunks = chunks.length;

        // Create parent lofi track document
        const trackDocRef = await addDoc(collection(db, 'lofiTracks'), {
          title: newTitle.trim(),
          artist: newArtist.trim(),
          isChunked: true,
          totalChunks: totalChunks,
          mimeType: mimeType,
          audioUrl: '', // blank to keep main catalog document lightweight
          createdAt: new Date().toISOString()
        });
        trackDocId = trackDocRef.id;

        // Sync and save chunks to Firestore subcollection in parallel
        const chunkPromises = chunks.map((chunkStr, idx) => {
          const chunkRef = doc(db, 'lofiTracks', trackDocId, 'chunks', `chunk_${idx}`);
          return setDoc(chunkRef, { index: idx, chunkData: chunkStr });
        });
        await Promise.all(chunkPromises);
      } else {
        await addDoc(collection(db, 'lofiTracks'), {
          title: newTitle.trim(),
          artist: newArtist.trim(),
          isChunked: false,
          audioUrl: resolvedAudioUrl,
          createdAt: new Date().toISOString()
        });
      }

      toast.success("New track added & synced successfully!");
      setNewTitle('');
      setNewArtist('');
      setNewAudioUrl('');
      setSelectedFile(null);
      setIsAdding(false);
    } catch (err: any) {
      toast.error("Failed to add track: " + err.message);
      // Clean up orphaned document if chunk uploads failed
      if (isChunked && trackDocId) {
        try {
          await deleteDoc(doc(db, 'lofiTracks', trackDocId));
        } catch (_) {}
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteTrack = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Delete this track?")) return;
    try {
      // First query and delete nested chunks to avoid garbage references
      const chunksSnap = await getDocs(collection(db, 'lofiTracks', id, 'chunks'));
      const deletePromises = chunksSnap.docs.map(chnkObj => deleteDoc(chnkObj.ref));
      await Promise.all(deletePromises);
      
      await deleteDoc(doc(db, 'lofiTracks', id));
      toast.success("Track deleted!");
      setCurrentIndex(0);
    } catch (err: any) {
      toast.error("Failed to delete track: " + err.message);
    }
  };

  return (
    <div className="relative z-40 flex flex-col items-start gap-1 w-full max-w-sm self-start animate-fade-in">
      {/* Sleek compact controller bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-md text-navy-900 dark:text-white transition-all hover:bg-white dark:hover:bg-slate-900">
        <div className="flex items-center gap-0.5 sm:gap-1 text-slate-500 dark:text-slate-400">
          <button 
            type="button"
            onClick={handlePrev}
            className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-all"
            title="Previous Track"
            disabled={isAssembling}
          >
            <ChevronLeft size={14} className={isAssembling ? "opacity-50" : ""} />
          </button>
          
          <button 
            type="button"
            onClick={handlePlayPause}
            className="p-1.5 rounded-full bg-blue-600 hover:bg-blue-500 hover:scale-105 active:scale-95 text-white transition-all shadow-sm flex items-center justify-center"
            title={isPlaying ? "Pause" : "Play"}
            disabled={isAssembling}
          >
            {isAssembling ? (
              <RefreshCcw size={10} className="animate-spin text-white" />
            ) : isPlaying ? (
              <Pause size={10} className="fill-white text-white" />
            ) : (
              <Play size={10} className="fill-white text-white translate-x-[0.5px]" />
            )}
          </button>
          
          <button 
            type="button"
            onClick={handleNext}
            className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-all"
            title="Next Track"
            disabled={isAssembling}
          >
            <ChevronRight size={14} className={isAssembling ? "opacity-50" : ""} />
          </button>
        </div>

        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700" />

        <div 
          onClick={() => !isAssembling && setShowPlaylist(!showPlaylist)}
          className={`flex items-center gap-2 px-2 py-0.5 rounded-lg max-w-[150px] sm:max-w-[200px] ${isAssembling ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5'}`}
        >
          {/* Wave animation indicator or spinner */}
          <div className="flex items-center gap-[2px] h-3 w-4 shrink-0">
            {isAssembling ? (
              <span className="w-2.5 h-2.5 border border-blue-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              Array(4).fill(0).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-[2px] bg-blue-500 rounded-full transition-all duration-300 ${isPlaying ? 'animate-pulse' : 'opacity-40'}`} 
                  style={{ 
                    animationDelay: `${i * 0.15}s`,
                    height: isPlaying ? '100%' : '25%',
                    animationDuration: '0.6s'
                  }} 
                />
              ))
            )}
          </div>

          <div className="overflow-hidden min-w-0">
            <p className="text-[10px] font-black tracking-tight truncate uppercase leading-tight text-navy-900 dark:text-white">
              {isAssembling ? "Assembling Track..." : activeTrack.title}
            </p>
            <p className="text-[8px] text-slate-400 tracking-wide truncate mt-[1px] leading-none">
              {isAssembling ? "Fetching streaming chunks" : activeTrack.artist}
            </p>
          </div>
          <ChevronDown size={10} className={`text-slate-400 shrink-0 transition-transform ${showPlaylist ? 'rotate-180' : ''}`} />
        </div>

        {isAdmin && (
          <>
            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700" />
            <button 
              type="button"
              onClick={() => setIsAdding(!isAdding)}
              className={`p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-all shrink-0 ${isAdding ? 'text-blue-500' : 'text-slate-400 hover:text-navy-900 dark:hover:text-white'}`}
              title="Add / Upload Custom Track"
              disabled={uploading}
            >
              {uploading ? (
                <RefreshCcw size={12} className="animate-spin text-blue-500" />
              ) : (
                <Plus size={12} />
              )}
            </button>
          </>
        )}
      </div>

      {/* Track Playlist Selector Dropdown */}
      {showPlaylist && !isAssembling && (
        <div className="absolute top-9 left-0 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-h-48 overflow-y-auto z-50 p-1.5">
          <div className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider px-2 py-1 mb-1 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <span>Focus Beats Playlist</span>
            <span className="font-mono text-blue-500">{currentTracks.length} tracks</span>
          </div>
          {currentTracks.map((track, idx) => (
            <div 
              key={track.id} 
              onClick={() => {
                setCurrentIndex(idx);
                setShowPlaylist(false);
              }}
              className={`flex items-center justify-between p-1.5 rounded-xl text-[10px] cursor-pointer transition-all ${idx === currentIndex ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300'}`}
            >
              <div className="flex items-center gap-2 text-left truncate flex-1 min-w-0">
                <span className="font-mono text-[8px] opacity-65">0{idx + 1}.</span>
                <span className="truncate">{track.title} <span className="opacity-60 text-[8px] font-normal">• {track.artist}</span></span>
              </div>
              {isAdmin && track.id !== 'lofi_default_1' && track.id !== 'lofi_default_2' && track.id !== 'lofi_default_3' && (
                <button 
                  type="button"
                  onClick={(e) => handleDeleteTrack(track.id, e)}
                  className="text-red-500 hover:text-red-650 dark:hover:text-red-400 p-1 transition-colors ml-1 shrink-0"
                  title="Remove Custom Track"
                >
                  <Trash2 size={10} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload/Add Popup form for Admin */}
      {isAdding && isAdmin && (
        <div className="absolute top-9 left-0 w-72 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-4 text-navy-900 dark:text-white">
          <div className="flex justify-between items-center mb-2.5">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Add / Upload Track</h4>
            <button 
              type="button"
              onClick={() => setIsAdding(false)} 
              className="text-slate-400 hover:text-slate-650 dark:hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleAddTrack} className="space-y-2.5 text-xs">
            <div>
              <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Track Title</label>
              <input 
                required
                value={newTitle} 
                onChange={e => setNewTitle(e.target.value)} 
                placeholder="Focus Study Beat"
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] text-navy-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 mt-1"
              />
            </div>
            
            <div>
              <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Artist / Genre</label>
              <input 
                required
                value={newArtist} 
                onChange={e => setNewArtist(e.target.value)} 
                placeholder="Ambient Lofi"
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] text-navy-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 mt-1"
              />
            </div>

            <div className="pt-1">
              <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Direct Upload from Device</label>
              <input 
                type="file" 
                accept="audio/*" 
                onChange={handleFileChange} 
                className="w-full text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[9px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
              {selectedFile && (
                <p className="text-[9px] text-green-500 mt-1">✔ Selected: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              )}
              <p className="text-[8px] text-slate-500 font-bold mt-1 uppercase tracking-wider leading-normal">
                Files up to 10MB are automatically chunked & optimized for fast streaming.
              </p>
            </div>

            <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-1" />

            <div>
              <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Or Paste MP3 URL</label>
              <input 
                value={newAudioUrl} 
                onChange={e => {
                  setNewAudioUrl(e.target.value);
                  if (e.target.value) setSelectedFile(null); // Clear file selection if link entered
                }} 
                placeholder="https://example.com/audio.mp3"
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] text-navy-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 mt-1"
                disabled={!!selectedFile}
              />
            </div>

            <button 
              type="submit" 
              disabled={uploading}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold tracking-widest text-[9px] uppercase rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 mt-1"
            >
              {uploading ? (
                <>
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Syncing...</span>
                </>
              ) : (
                "Save & Sync Track"
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

interface MindRelaxerProps {
  isAdmin: boolean;
  tracks: any[];
  loading: boolean;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
}

const MindRelaxer = ({ 
  isAdmin, tracks, loading, isPlaying, setIsPlaying, currentIndex, setCurrentIndex, audioRef 
}: MindRelaxerProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newAudioUrl, setNewAudioUrl] = useState('');

  const defaultTracks = [
    {
      id: 'lofi_default_1',
      title: 'Midnight Focus Study',
      artist: 'Lofi Chills',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    },
    {
      id: 'lofi_default_2',
      title: 'Rainy Day Concentration',
      artist: 'Ambient Soundscape',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
    },
    {
      id: 'lofi_default_3',
      title: 'Serene Sunset Rhythm',
      artist: 'Subhajit Beats',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
    }
  ];

  const currentTracks = tracks.length > 0 ? tracks : defaultTracks;
  const activeTrack = currentTracks[currentIndex] || defaultTracks[0];

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        toast.error("Playback failed. Please try another link!");
        console.error(err);
      });
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % currentTracks.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + currentTracks.length) % currentTracks.length);
  };

  const handleAddTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newArtist.trim() || !newAudioUrl.trim()) {
      toast.error("Please fill in track details!");
      return;
    }
    try {
      await addDoc(collection(db, 'lofiTracks'), {
        title: newTitle.trim(),
        artist: newArtist.trim(),
        audioUrl: newAudioUrl.trim(),
        createdAt: new Date().toISOString()
      });
      toast.success("New track added to focus playlist!");
      setNewTitle('');
      setNewArtist('');
      setNewAudioUrl('');
      setIsAdding(false);
    } catch (err: any) {
      toast.error("Failed to add track: " + err.message);
    }
  };

  const handleDeleteTrack = async (id: string) => {
    if (!window.confirm("Delete this track?")) return;
    try {
      await deleteDoc(doc(db, 'lofiTracks', id));
      toast.success("Track deleted!");
      setCurrentIndex(0);
    } catch (err: any) {
      toast.error("Failed to delete track: " + err.message);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto rounded-[2rem] bg-slate-950/40 border border-blue-500/10 text-white p-6 shadow-2xl relative overflow-hidden transition-all hover:border-blue-500/20">
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 relative z-10">
        <div>
          <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
            <span className="text-cyan-400">🧘‍♂️</span> The Mind Relaxer
          </h3>
          <p className="text-xs text-slate-400 font-bold tracking-wide uppercase">Relaxing Lo-Fi beats & focus audio</p>
        </div>
        {isAdmin && (
          <button 
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="text-[10px] font-black tracking-widest px-3 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-full transition-all text-white shadow-lg"
          >
            {isAdding ? "✕ CLOSE FORM" : "+ ADD TRACK"}
          </button>
        )}
      </div>

      {isAdding && isAdmin && (
        <form onSubmit={handleAddTrack} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 mb-6 relative z-10">
          <h4 className="text-xs font-black text-white uppercase tracking-widest text-cyan-400">Add Custom Audio Segment</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input 
              value={newTitle} 
              onChange={e => setNewTitle(e.target.value)} 
              placeholder="Track Title (e.g. Focus Chill)"
              className="px-3 py-2 bg-[#121c33] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <input 
              value={newArtist} 
              onChange={e => setNewArtist(e.target.value)} 
              placeholder="Artist/Genre Name"
              className="px-3 py-2 bg-[#121c33] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <input 
              value={newAudioUrl} 
              onChange={e => setNewAudioUrl(e.target.value)} 
              placeholder="Direct MP3 Link (e.g. https://...mp3)"
              className="px-3 py-2 bg-[#121c33] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="text-center font-bold text-[9px] text-slate-500 py-1 flex items-center justify-center gap-3">
            <span className="h-[1px] bg-white/10 flex-1"></span>
            OR UPLOAD DEVICE AUDIO
            <span className="h-[1px] bg-white/10 flex-1"></span>
          </div>

          <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-4 bg-[#121c33]/50">
            <input 
              type="file" 
              accept="audio/*" 
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                
                if (file.size > 1048576) {
                  toast.error("File size exceeds 1MB limit!", {
                    description: "Firestore individual document limit is 1MB. Please upload a smaller audio file (under 1MB) or use a direct web link."
                  });
                  return;
                }

                const loadingId = toast.loading("Processing device audio upload...");
                const reader = new FileReader();

                reader.onloadend = async () => {
                  try {
                    const base64Data = reader.result as string;
                    await addDoc(collection(db, 'lofiTracks'), {
                      title: file.name.replace(/\.[^/.]+$/, ""),
                      artist: "Device Upload",
                      audioUrl: base64Data,
                      createdAt: new Date().toISOString()
                    });
                    toast.success("Sound track uploaded directly and saved to Firebase!", { id: loadingId });
                    setIsAdding(false);
                  } catch (err: any) {
                    toast.error("Upload failed: " + err.message, { id: loadingId });
                  }
                };

                reader.readAsDataURL(file);
              }}
              className="text-[10px] text-slate-400 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
            />
            <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-wide">Audio files under 1MB are supported natively (e.g. short Loops / MP3s)</p>
          </div>

          <button type="submit" className="w-full py-2 bg-gradient-to-r from-blue-400 to-indigo-500 font-black tracking-widest text-white text-[10px] uppercase rounded-xl transition-all">
            Save Track To Firebase
          </button>
        </form>
      )}

      <div className="flex flex-col md:flex-row items-center gap-6 relative z-10 bg-slate-950/30 rounded-2xl p-5 border border-white/5">
        <div className="relative">
          <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg relative p-1 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }}>
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
              <Compass size={32} className="text-cyan-400 opacity-80" />
            </div>
            <div className="absolute inset-1/2 -ml-2 -mt-2 w-4 h-4 bg-cyan-400 rounded-full border-4 border-slate-950" />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left space-y-3 w-full">
          <div>
            <h4 className="text-md sm:text-lg font-black tracking-tight line-clamp-1">{activeTrack.title}</h4>
            <p className="text-xs text-slate-400 font-medium">{activeTrack.artist}</p>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-[3px] h-6">
            {Array(18).fill(0).map((_, i) => {
              const pulse = isPlaying ? 'animate-pulse' : 'opacity-40';
              return (
                <div 
                  key={i} 
                  className={`w-[3px] bg-cyan-400 rounded-full transition-all duration-300 ${pulse}`} 
                  style={{ 
                    animationDelay: `${i * 0.1}s`,
                    height: isPlaying ? '14px' : '6px'
                  }} 
                />
              );
            })}
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4 pt-1">
            <button 
              onClick={handlePrev}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all border border-white/5"
              title="Previous Track"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={handlePlayPause}
              className="p-3.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:scale-105 active:scale-95 text-slate-950 transition-all font-bold shadow-lg shadow-cyan-500/20"
              title={isPlaying ? "Pause Session" : "Play Session"}
            >
              {isPlaying ? <Pause size={20} className="fill-black text-black" /> : <Play size={20} className="fill-black text-black ml-0.5" />}
            </button>
            <button 
              onClick={handleNext}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all border border-white/5"
              title="Skip Next Track"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 max-h-40 overflow-y-auto space-y-1 pr-1 border-t border-slate-500/10 pt-4">
        {currentTracks.map((track, idx) => (
          <div 
            key={track.id} 
            className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all ${idx === currentIndex ? 'bg-cyan-500/10 text-cyan-400 font-bold' : 'hover:bg-white/5 text-slate-300'}`}
          >
            <button 
              onClick={() => setCurrentIndex(idx)}
              className="flex-1 flex items-center gap-2 text-left"
            >
              <span className="font-mono text-[10px] opacity-60">0{idx + 1}.</span>
              <span className="truncate">{track.title} • <span className="opacity-60 text-[10px]">{track.artist}</span></span>
            </button>
            {isAdmin && track.id !== 'lofi_default_1' && track.id !== 'lofi_default_2' && track.id !== 'lofi_default_3' && (
              <button 
                onClick={() => handleDeleteTrack(track.id)}
                className="text-red-500 hover:text-red-400 p-1"
                title="Remove Track"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

const QuickByteCard = ({ videoUrl, isAdmin, onSaveUrl }: { videoUrl?: string, isAdmin: boolean, onSaveUrl: (url: string) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputUrl, setInputUrl] = useState(videoUrl || '');

  const getYouTubeId = (url?: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  };

  const videoId = getYouTubeId(videoUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveUrl(inputUrl);
    setIsEditing(false);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto rounded-[2rem] bg-slate-950/40 border border-indigo-500/10 text-white p-6 shadow-2xl relative overflow-hidden transition-all hover:border-indigo-500/20">
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-indigo-500" />
      
      <div className="flex justify-between items-center mb-4 relative z-10">
        <div>
          <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
            <span className="text-indigo-400">⚡</span> Quick Byte
          </h3>
          <p className="text-xs text-slate-400 font-bold tracking-wide uppercase">Edu-tricks & scientific study hacks</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => {
              setInputUrl(videoUrl || '');
              setIsEditing(!isEditing);
            }}
            className="text-[10px] font-black tracking-widest px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 rounded-full transition-all text-white shadow-lg"
          >
            {isEditing ? "✕ CANCEL" : "✎ EDIT VIDEO"}
          </button>
        )}
      </div>

      {isEditing && (
        <form onSubmit={handleSubmit} className="p-4 rounded-2xl bg-[#121c33] border border-indigo-500/20 space-y-3 mb-4">
          <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Update Video URL</h4>
          <input 
            value={inputUrl} 
            onChange={e => setInputUrl(e.target.value)} 
            placeholder="Paste YouTube Link (e.g., https://youtu.be/dQw4w9WgXcQ)"
            className="w-full px-3 py-2 bg-[#0c1325] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
          />
          <button type="submit" className="w-full py-2 bg-gradient-to-r from-indigo-400 to-indigo-600 hover:from-indigo-500 hover:to-indigo-700 font-black text-black tracking-widest text-[10px] uppercase rounded-xl transition-all">
            Save Video Address
          </button>
        </form>
      )}

      <div className="relative z-10 w-full aspect-video rounded-2xl overflow-hidden bg-black/60 border border-white/5">
        {videoId ? (
          <iframe 
            src={`https://www.youtube.com/embed/${videoId}`}
            title="StudySnap Quick Byte Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
            <VideoOff size={36} className="text-indigo-400 opacity-60 mb-3 animate-bounce" />
            <p className="text-xs font-bold leading-normal">No quick video set yet!</p>
            <p className="text-[10px] text-slate-500 mt-1">Admin can click 'Edit Video' above and paste any YouTube video link to broadcast.</p>
          </div>
        )}
      </div>
    </Card>
  );
};

const BlinkingHyperlinkBanner = ({ text, url, isAdmin, onSave }: { text?: string, url?: string, isAdmin: boolean, onSave: (text: string, url: string) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputText, setInputText] = useState(text || '');
  const [inputUrl, setInputUrl] = useState(url || '');

  const displayText = text || "Watch Today's Study Hacks Video!";
  const hasUrl = !!url && url.trim() !== '';
  const targetUrl = url || '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(inputText, inputUrl);
    setIsEditing(false);
  };

  return (
    <div className="w-full relative py-1 mr-0 ml-0 overflow-hidden select-none max-w-full">
      <div className="w-full max-w-4xl mx-auto rounded-2xl bg-[#080d19] border-2 border-green-500/40 py-4 px-6 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-[0_0_15px_rgba(34,197,94,0.15)] hover:shadow-[0_0_25px_rgba(34,197,94,0.3)] animate-pulse transition-all">
        {hasUrl ? (
          <a 
            href={targetUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex-1 flex items-center gap-3 group"
          >
            <span className="w-3 h-3 rounded-full bg-green-400 shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-ping shrink-0" />
            
            <div className="text-left">
              <p className="text-xs sm:text-sm font-black tracking-widest uppercase font-sans text-green-400 group-hover:text-green-300 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]">
                {displayText}
              </p>
              <p className="text-[9px] text-slate-500 font-mono tracking-tight font-bold truncate max-w-xs sm:max-w-md mt-0.5">
                TARGET URL: {targetUrl}
              </p>
            </div>
          </a>
        ) : (
          <div className="flex-1 flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-slate-500 shrink-0" />
            
            <div className="text-left">
              <p className="text-xs sm:text-sm font-black tracking-widest uppercase font-sans text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]">
                {displayText}
              </p>
              <p className="text-[9px] text-slate-500 font-mono tracking-tight font-bold truncate max-w-xs sm:max-w-md mt-0.5">
                (No Video URL Saved by Admin)
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 shrink-0">
          {hasUrl && (
            <a 
              href={targetUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] font-black tracking-widest px-4 py-2 bg-green-500 hover:bg-green-600 rounded-xl text-black transition-all shadow-md uppercase"
            >
              LAUNCH LINK ↗
            </a>
          )}
          
          {isAdmin && (
            <button 
              onClick={() => {
                setInputText(text || '');
                setInputUrl(url || '');
                setIsEditing(!isEditing);
              }}
              className="text-[10px] font-black tracking-widest px-3 py-2 bg-[#12231c] border border-green-500/20 text-green-400 rounded-xl hover:bg-[#1b362a] transition-all"
            >
              {isEditing ? "✕ CLOSE" : "EDIT"}
            </button>
          )}
        </div>
      </div>

      {isEditing && isAdmin && (
        <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto rounded-2xl p-5 bg-[#0e172a] border border-green-500/30 space-y-3 mt-3 relative z-10 animate-fancy-reveal">
          <h4 className="text-xs font-black text-green-400 uppercase tracking-widest">Configure Hyperlink Broadcast</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase">Banner Broadcast Text</label>
              <input 
                value={inputText} 
                onChange={e => setInputText(e.target.value)} 
                placeholder="Alert text (e.g. WATCH TODAY'S RETENTION HACK)"
                className="w-full px-3 py-2 bg-[#18253d] border border-green-500/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-green-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase">Click Target Address (URL)</label>
              <input 
                value={inputUrl} 
                onChange={e => setInputUrl(e.target.value)} 
                placeholder="HTTPS link address"
                className="w-full px-3 py-2 bg-[#18253d] border border-green-500/20 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-green-400"
              />
            </div>
          </div>
          <button type="submit" className="w-full py-2 bg-green-500 hover:bg-green-600 text-black font-black tracking-widest text-[10px] uppercase rounded-xl transition-all">
            Save and Distribute Link
          </button>
        </form>
      )}
    </div>
  );
};

const ElegantFooter = () => {
  return (
    <footer className="w-full mt-12 mb-6 px-4">
      <div 
        className="w-full max-w-4xl mx-auto rounded-3xl bg-[#0b1329] border border-cyan-500/20 py-5 px-6 flex items-center justify-center gap-2 shadow-[0_4px_30px_rgba(6,182,212,0.15)] relative overflow-hidden group select-none text-center"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.15),transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 border border-cyan-400/0 rounded-3xl pointer-events-none" />

        <p className="text-xs sm:text-sm font-bold tracking-wider text-cyan-400 uppercase font-mono animate-pulse flex items-center justify-center gap-1.5 leading-none">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-ping" />
          Designed with 💙 by <span className="font-black text-cyan-400">Subhajit Sanpui</span>
        </p>
      </div>
    </footer>
  );
};

const DeveloperPortfolioModal = ({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) => {
  const projects = [
    {
      name: "StudySnap Workspace",
      desc: "An advanced, real-time shared workspace for students in Bengal. Featuring offline resource caching, modular subject selectors, responsive note cards, study schedules, live discussions, and dynamic quizzes.",
      badge: "Firestore & Cache Engine"
    },
    {
      name: "The Mind Relaxer Audio Suite",
      desc: "Minimalist ambient audio & Lo-Fi player integrated directly with Cloud database sync. Features custom controls, multi-tab coordination, and high-fidelity tracks tailored to promote prolonged flow states.",
      badge: "Audio APIs & React Hooks"
    },
    {
      name: "Smart Portfolio Display",
      desc: "Elegant and highly detailed personal landing pages utilizing glassmorphic aesthetics, smooth Framer Motion transitions, custom contact forms, and automated SMTP routing integrations.",
      badge: "Glassmorphism UI/UX Design"
    },
    {
      name: "Enterprise Auth & Verification Suite",
      desc: "Robust student portal authentication incorporating strict security bounds, public read configurations, private user profiles, and specialized dual-auth administrative dashboards.",
      badge: "Firebase Security Rules"
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-gradient-to-b from-[#0b1222] to-[#040812] border border-cyan-500/20 text-white rounded-[2rem] overflow-hidden p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.15)] max-h-[85vh] flex flex-col">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl sm:text-3xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 font-sans tracking-tight uppercase">
            STUDIO CREATIONS BY SUBHAJIT
          </DialogTitle>
          <div className="h-[2px] w-24 bg-cyan-500/40 mx-auto mt-2 rounded-full" />
        </DialogHeader>

        <div className="space-y-5 overflow-y-auto pr-1 flex-1 pb-2">
          <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center font-black text-white text-2xl shadow-lg border-2 border-cyan-400 font-mono select-none shrink-0">
              SS
            </div>
            <div>
              <p className="text-sm font-black tracking-wide text-cyan-300 uppercase">Creator & Architect: Subhajit Sanpui</p>
              <p className="text-xs text-slate-400 font-medium leading-relaxed mt-1">
                Engineering high-fidelity fullstack workspaces, fluid micro-interactions, and secure integration layers with the Google Cloud ecosystem.
              </p>
            </div>
          </div>

          <h4 className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-cyan-400 border-b border-white/5 pb-2">Completed Engineering Projects</h4>
          
          <div className="space-y-3.5">
            {projects.map((proj, idx) => (
              <div 
                key={idx} 
                className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-cyan-500/30 hover:bg-slate-900/60 transition-all duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2 font-sans">
                    <h5 className="font-bold text-sm tracking-tight text-white group-hover:text-cyan-300 transition-colors">{proj.name}</h5>
                    <Badge className="text-[9px] bg-cyan-500/10 text-cyan-300 border-none font-bold uppercase">{proj.badge}</Badge>
                  </div>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">{proj.desc}</p>
                </div>
                
                <button 
                  onClick={() => {
                    toast.success(`Opening live build instance for: ${proj.name}`);
                  }}
                  className="px-3 py-1.5 bg-gradient-to-tr from-cyan-500 to-blue-500 hover:scale-[1.03] text-black font-black text-[9px] uppercase tracking-widest rounded-xl transition-all self-end sm:self-auto shadow-md"
                >
                  VIEW PROJECT
                </button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Dashboard = ({ 
  profile, isAdminMode, setProfile, notices, activeTab, appConfig, isUnlocked, setIsUnlocked, theme, onImageClick,
  notes, quizzes, leaderboard, userAttempts, loadingStates, onRefresh,
  qrScanCount = 0, calendarEvents = [], fetchCalendarEvents = () => {}
}: { 
  profile: UserProfile, isAdminMode: boolean, setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>, notices: Notice[], activeTab: string, appConfig: AppConfig, isUnlocked: boolean, setIsUnlocked: (v: boolean) => void, theme: string, onImageClick: (src: string) => void,
  notes: Note[], quizzes: Quiz[], leaderboard: LeaderboardEntry[], userAttempts: Record<string, any>, loadingStates: { notes: boolean, quizzes: boolean, leaderboard: boolean, notices: boolean, attempts: boolean },
  onRefresh: () => void,
  qrScanCount?: number,
  calendarEvents?: CalendarEvent[],
  fetchCalendarEvents?: () => void
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);

  const [activeSubject, setActiveSubject] = useState('All');

  // Lifted Lofi music state
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const defaultTracks = [
    {
      id: 'lofi_default_1',
      title: 'Midnight Focus Study',
      artist: 'Lofi Chills',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    },
    {
      id: 'lofi_default_2',
      title: 'Rainy Day Concentration',
      artist: 'Ambient Soundscape',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
    },
    {
      id: 'lofi_default_3',
      title: 'Serene Sunset Rhythm',
      artist: 'Subhajit Beats',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
    }
  ];

  useEffect(() => {
    const q = query(collection(db, 'lofiTracks'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTracks(docs);
      setLoading(false);
    }, (error) => {
      console.error("Lofi load failure:", error);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const currentTracks = tracks.length > 0 ? tracks : defaultTracks;
  const activeTrack = currentTracks[currentIndex] || defaultTracks[0];

  const [resolvedAudioSource, setResolvedAudioSource] = useState<string>('');
  const [isAssembling, setIsAssembling] = useState(false);
  const cacheRef = useRef<Record<string, string>>({});

  // Dynamic chunk retriever and assembler
  useEffect(() => {
    let active = true;
    if (!activeTrack) {
      setIsAssembling(false);
      setResolvedAudioSource('');
      return;
    }

    if (activeTrack.isChunked) {
      if (cacheRef.current[activeTrack.id]) {
        setResolvedAudioSource(cacheRef.current[activeTrack.id]);
        setIsAssembling(false);
        return;
      }

      // Clear the source immediately to stop the previous audio track
      setResolvedAudioSource('');
      setIsAssembling(true);
      const fetchChunksAndAssemble = async () => {
        try {
          const chunksRef = collection(db, 'lofiTracks', activeTrack.id, 'chunks');
          const q = query(chunksRef, orderBy('index', 'asc'));
          const snapshot = await getDocs(q);
          
          if (!active) return;
          
          const docs = snapshot.docs.map(d => d.data());
          // Join the base64 chunks
          const combinedBase64 = docs.map(d => d.chunkData).join('');
          
          // High-performance binary assembly using standard browser data-URI loader
          const dataUri = `data:${activeTrack.mimeType || 'audio/mp3'};base64,${combinedBase64}`;
          const res = await fetch(dataUri);
          const blob = await res.blob();
          const blobUrl = URL.createObjectURL(blob);
          
          cacheRef.current[activeTrack.id] = blobUrl;
          if (active) {
            setResolvedAudioSource(blobUrl);
          }
        } catch (error) {
          console.error("Failed to assemble chunks for track:", error);
          if (active) {
            toast.error("Chunk load failure. Please verify connection!");
          }
        } finally {
          if (active) {
            setIsAssembling(false);
          }
        }
      };

      fetchChunksAndAssemble();
    } else {
      setIsAssembling(false);
      setResolvedAudioSource(activeTrack.audioUrl || '');
    }

    return () => {
      active = false;
    };
  }, [activeTrack]);

  // Clean cache on unmount to prevent leaks
  useEffect(() => {
    return () => {
      Object.values(cacheRef.current).forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  // Track player setup
  useEffect(() => {
    if (!resolvedAudioSource) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }
    audioRef.current = new Audio(resolvedAudioSource);
    audioRef.current.loop = true;
    if (isPlaying) {
      audioRef.current.play().catch(err => console.log("Playback interrupted:", err));
    }

    return () => {
      if (audioRef.current) {
         audioRef.current.pause();
      }
    };
  }, [resolvedAudioSource]);
  const subjects = [
    { name: 'All', color: 'blue' },
    { name: 'Bookmarks', color: 'pink' },
    { name: 'Bengali', color: 'red' },
    { name: 'English', color: 'green' },
    { name: 'Math', color: 'orange' },
    { name: 'Phy Sci', color: 'purple' },
    { name: 'Life Sci', color: 'emerald' },
    { name: 'History', color: 'amber' },
    { name: 'Geography', color: 'cyan' },
    { name: 'Exam Suggestion', color: 'rose' },
    { name: 'Study Places', color: 'indigo' }
  ];

  const getTabColor = (subjectName: string) => {
    const s = subjects.find(sub => sub.name === subjectName);
    if (!s) return 'blue';
    return s.color;
  };

  const filteredNotes = notes.filter(n => {
    const isNoteApproved = n.isApproved !== false;
    const isAuthor = n.authorId === profile?.uid;
    if (!isNoteApproved && !isAdminMode && !isAuthor) {
      return false;
    }

    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         n.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeSubject === 'Bookmarks') {
      return matchesSearch && profile?.bookmarks?.includes(n.id);
    }

    const matchesSubject = activeSubject === 'All' || n.subject === activeSubject;
    return matchesSearch && matchesSubject;
  });

  const filteredQuizzes = quizzes.filter(q => 
    q.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    q.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPoints = async (pts: number) => {
    if (!profile) return;
    try {
      const newPoints = (profile.points || 0) + pts;
      await setDoc(doc(db, 'users', profile.uid), { ...profile, points: newPoints }, { merge: true });
      await setDoc(doc(db, 'leaderboard', profile.uid), { points: newPoints }, { merge: true });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 relative flex flex-col items-center w-full max-w-4xl mx-auto">
      {/* Top Left Mini Music Player */}
      {activeTab === 'home' && activeSubject === 'All' && profile?.role !== 'teacher' && (
        <div className="w-full flex justify-start px-1 sm:px-2">
          <MiniMusicPlayer 
            isAdmin={isAdminMode}
            tracks={tracks}
            loading={loading}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            audioRef={audioRef}
            isAssembling={isAssembling}
          />
        </div>
      )}

      {/* Crime Scene Tape Banner Section */}
      {activeTab === 'home' && activeSubject === 'All' && (
        <CrimeSceneTape text={appConfig.crimeTapeText} />
      )}
      {/* App QR Code & Link Section */}
      {activeTab === 'home' && activeSubject === 'All' && (
        <Card className="w-full max-w-4xl mx-auto rounded-[2.5rem] bg-white dark:bg-slate-900 border-none shadow-xl overflow-hidden p-6 mb-2">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="bg-slate-50 dark:bg-slate-950 p-4 rounded-3xl shrink-0 shadow-inner flex flex-col items-center gap-3 w-full sm:w-auto"
            >
              <motion.div
                whileHover={{ 
                  scale: 1.05, 
                  rotate: 2,
                  boxShadow: "0px 10px 30px rgba(37, 99, 235, 0.35)"
                }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="cursor-pointer bg-white p-1 rounded-2xl shadow-sm"
              >
                <QRCodeSVG 
                  id="studysnap-qr-svg"
                  value={
                    typeof window !== 'undefined' 
                      ? `${window.location.origin}${window.location.pathname}?from=qr` 
                      : "https://ais-pre-friugml2gcc5wyxrdimjhp-430241317112.asia-southeast1.run.app?from=qr"
                  } 
                  size={120}
                  level="H"
                  includeMargin={true}
                  className="rounded-xl bg-white"
                  fgColor="#2563eb"
                  imageSettings={{
                    src: logoSvgDataUri,
                    x: undefined,
                    y: undefined,
                    height: 30,
                    width: 30,
                    excavate: true,
                  }}
                />
              </motion.div>
              <Button 
                onClick={downloadQRCode}
                variant="outline"
                className="w-full flex items-center justify-center gap-1.5 h-8 text-[10px] font-black rounded-xl border-slate-200 dark:border-slate-800 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-blue-600 dark:text-blue-400 font-mono"
              >
                <Download size={12} className="shrink-0" />
                DOWNLOAD QR
              </Button>
            </motion.div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter text-navy-900 dark:text-white">Share StudySnap</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Scan this QR to open the app on any device</p>
                {isAdminMode && (
                  <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-mono text-[10px] font-black rounded-lg border border-blue-200/80 dark:border-blue-900/50">
                    <span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse" />
                    <span>SCAN COUNT: {qrScanCount}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Welcome Banner - Only show on Home tab and All subject */}
      {activeTab === 'home' && activeSubject === 'All' && (
        <section className={`p-6 sm:p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden text-center w-full max-w-4xl mx-auto transition-all duration-500
          ${theme === 'classic' ? 'bg-gradient-to-br from-blue-600 to-navy-900 border-none' : ''}
          ${theme === 'midnight' ? 'bg-[#1e293b] border border-slate-700' : ''}
          ${theme === 'sunset' ? 'bg-gradient-to-br from-orange-500 to-red-600 border-none' : ''}
          ${theme === 'forest' ? 'bg-gradient-to-br from-emerald-600 to-teal-800 border-none' : ''}
          ${theme === 'cyber' ? 'bg-gradient-to-br from-purple-600 to-indigo-900 border-none' : ''}
        `}>
          <div className="absolute top-4 left-4 z-20">
            <PortfolioLink variant="glow" />
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-white/20 text-white border-none backdrop-blur-md">Class {profile.class}</Badge>
              {profile.isVIP && <Badge className="bg-amber-400 text-navy-900 border-none font-bold">VIP Student</Badge>}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tighter mb-1">Hello, {profile.name?.split(' ')[0] || 'Student'}! 👋</h1>
            <p className="text-blue-100 text-sm font-medium opacity-90">Ready to boost your knowledge today?</p>
            
            <div className="mt-6 flex items-center gap-4 w-full">
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white/10 backdrop-blur-md p-3 rounded-2xl flex-1 border border-white/10"
              >
                <div className="text-[10px] uppercase font-bold text-blue-200 tracking-widest mb-1">Total Points</div>
                <div className="text-2xl font-black">{profile.points}</div>
              </motion.div>
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white/10 backdrop-blur-md p-3 rounded-2xl flex-1 border border-white/10"
              >
                <div className="text-[10px] uppercase font-bold text-blue-200 tracking-widest mb-1">Current Streak</div>
                <div className="text-2xl font-black">{profile.streak} Days</div>
              </motion.div>
            </div>
          </div>
          {/* Decorative Circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl" />
        </section>
      )}

      {/* Hyperlink Banner Section */}
      {activeTab === 'home' && activeSubject === 'All' && (
        <BlinkingHyperlinkBanner 
          text={appConfig.hyperlinkText} 
          url={appConfig.hyperlinkUrl} 
          isAdmin={isAdminMode} 
          onSave={async (text, url) => {
            try {
              await setDoc(doc(db, 'config', 'app'), { hyperlinkText: text, hyperlinkUrl: url }, { merge: true });
              toast.success("Blinking Alert Banner updated!");
            } catch (err: any) {
              toast.error("Failed to save: " + err.message);
            }
          }}
        />
      )}



      {/* Interactive Insights & Planning Panel */}
      {activeTab === 'home' && activeSubject === 'All' && (
        <div className="w-full max-w-4xl mx-auto mb-2">
          <CalendarView 
            config={appConfig} 
            notes={notes} 
            quizzes={quizzes} 
            notices={notices} 
            calendarEvents={calendarEvents}
            isAdmin={isAdminMode}
            onRefreshEvents={fetchCalendarEvents}
          />
        </div>
      )}

      {/* High Priority Actions */}
      {activeTab === 'home' && activeSubject === 'All' && (
        <div className="w-full max-w-4xl mx-auto space-y-6">
          <AskAdminSection profile={profile} isAdmin={isAdminMode} />
          {isAdminMode && (
            <div className="space-y-6">
              <section className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800">
                <FeedbackList isAdmin={isAdminMode} />
              </section>
            </div>
          )}
        </div>
      )}

      {/* Search and Add Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 w-full mx-auto">
        <div className="flex-1 w-full flex gap-2">
          <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <DialogTrigger render={
              <button className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-3 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm flex-1">
                <Search size={18} className="text-blue-500" />
                <span className="flex-1 text-left">Search Everything...</span>
              </button>
            } />
            <DialogContent className="max-w-4xl w-[95vw] rounded-3xl max-h-[80vh] flex flex-col">
            <DialogHeader><DialogTitle>Search StudySnap</DialogTitle></DialogHeader>
            <div className="py-4 space-y-4 flex-1 flex flex-col overflow-hidden">
              <Input 
                placeholder="Search notes, quizzes, subjects..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="rounded-xl h-12 shrink-0"
                autoFocus
              />
              <ScrollArea className="flex-1">
                <div className="space-y-4 pr-4">
                  {searchQuery && (
                    <>
                      {filteredNotes.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notes ({filteredNotes.length})</h4>
                          {filteredNotes.map(n => (
                            <div key={n.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                              <div className="font-bold text-sm">{n.title}</div>
                              <div className="text-[10px] text-blue-600 font-bold uppercase">{n.subject}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      {filteredQuizzes.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quizzes ({filteredQuizzes.length})</h4>
                          {filteredQuizzes.map(q => (
                            <div key={q.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                              <div className="font-bold text-sm">{q.question}</div>
                              <div className="text-[10px] text-purple-600 font-bold uppercase">{q.subject}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      {notices.filter(n => n.subject.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notices ({notices.filter(n => n.subject.toLowerCase().includes(searchQuery.toLowerCase())).length})</h4>
                          {notices.filter(n => n.subject.toLowerCase().includes(searchQuery.toLowerCase())).map(n => (
                            <div key={n.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                              <div className="font-bold text-sm">{n.subject}</div>
                              <div className="text-[10px] text-red-600 font-bold uppercase">Notice</div>
                            </div>
                          ))}
                        </div>
                      )}
                      {filteredNotes.length === 0 && filteredQuizzes.length === 0 && notices.filter(n => n.subject.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                        <div className="py-8 text-center text-slate-400 italic text-sm">No results found for "{searchQuery}"</div>
                      )}
                    </>
                  )}
                  {!searchQuery && <div className="py-8 text-center text-slate-400 text-sm">Type something to start searching...</div>}
                </div>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
        <Button 
          variant="outline" 
          onClick={() => {
            onRefresh();
            toast.success("Refreshing data...", { id: 'refreshing' });
          }}
          className="rounded-2xl h-12 gap-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-w-[50px] px-4"
          title="Refresh Data"
        >
          <RefreshCcw size={18} className={Object.values(loadingStates).some(v => v) ? 'animate-spin' : ''} />
        </Button>
      </div>

      {(isAdminMode || profile?.role === 'teacher') && (
          <div className="flex gap-4 w-full justify-center">
            {isAdminMode && <div className="flex-1 max-w-[200px]"><AddQuizDialog /></div>}
            <div className="flex-1 max-w-[200px]"><AddNoteDialog profile={profile} isAdmin={isAdminMode} /></div>
          </div>
        )}
      </div>

      {/* Subject Tabs */}
      <ScrollArea className="w-full whitespace-nowrap max-w-4xl mx-auto">
        <div className="flex w-max mx-auto space-x-3 p-1 px-4 scrollbar-hide">
          {subjects.map(s => {
            const activeClasses: Record<string, string> = {
              blue: 'bg-blue-600 border-blue-600 text-white shadow-blue-200',
              red: 'bg-red-600 border-red-600 text-white shadow-red-200',
              green: 'bg-green-600 border-green-600 text-white shadow-green-200',
              orange: 'bg-orange-600 border-orange-600 text-white shadow-orange-200',
              purple: 'bg-purple-600 border-purple-600 text-white shadow-purple-200',
              emerald: 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-200',
              amber: 'bg-amber-600 border-amber-600 text-white shadow-amber-200',
              cyan: 'bg-cyan-600 border-cyan-600 text-white shadow-cyan-200',
              rose: 'bg-rose-600 border-rose-600 text-white shadow-rose-200',
              pink: 'bg-pink-600 border-pink-600 text-white shadow-pink-200'
            };
            
            return (
              <motion.button 
                key={s.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveSubject(s.name)}
                className={`text-xs font-black px-4 py-2 rounded-full transition-all border-2 ${
                  activeSubject === s.name 
                    ? `${activeClasses[s.color]} shadow-lg` 
                    : `bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300`
                }`}
              >
                {s.name}
              </motion.button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="hidden" />
      </ScrollArea>

      {/* AI Generate Quiz Section */}
      {activeSubject !== 'All' && activeSubject !== 'Study Places' && activeSubject !== 'Bookmarks' && (
        <div className="w-full max-w-4xl px-4 flex justify-center">
          <GenerateQuizDialog subject={activeSubject} notes={notes.filter(n => n.subject === activeSubject)} />
        </div>
      )}

      <div className="w-full flex flex-col items-center mt-8 space-y-4">
        <div className="flex items-center justify-center gap-2">
           <BookOpen className="text-blue-600" />
           <h2 className="text-2xl font-black text-navy-900 dark:text-white">Study Vault</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full mx-auto justify-items-center">
        {loadingStates.notes ? (
           [1, 2, 3, 4, 5, 6].map(i => (
             <div key={i} className="w-[340px] h-[420px] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-md border border-slate-100 dark:border-slate-800 animate-pulse overflow-hidden">
               <div className="h-40 bg-slate-100 dark:bg-slate-800" />
               <div className="p-6 space-y-4">
                 <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-800 rounded-full" />
                 <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800 rounded-full" />
                 <div className="space-y-2 pt-4">
                   <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full" />
                   <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full" />
                 </div>
               </div>
             </div>
           ))
        ) : activeSubject === 'Study Places' ? (
          <div className="col-span-full flex justify-center w-full">
            <div className="w-full max-w-4xl mx-auto">
              <StudyPlaces />
            </div>
          </div>
        ) : filteredNotes.length > 0 ? (
          filteredNotes.map((note, idx) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              layout
            >
              <NoteCard 
                note={note} 
                isAdmin={isAdminMode} 
                userId={profile.uid}
                appConfig={appConfig}
                isGlobalUnlocked={isUnlocked}
                setIsGlobalUnlocked={setIsUnlocked}
                userProfile={profile}
                onImageClick={onImageClick}
              />
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400">
            <BookOpen className="mx-auto mb-2 opacity-20" size={48} />
            <p>No notes found for this subject.</p>
          </div>
        )}
      </div>
    </div>

      {/* Quiz Section (Only in 'All' tab) */}
      {activeSubject === 'All' && (
        <>
          <section className="space-y-4 w-full max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BrainCircuit className="text-navy-600" />
                Daily Quiz
              </h2>
            </div>
            <div className="space-y-3 w-full">
              {filteredQuizzes.length > 0 ? (
                filteredQuizzes.map((q, idx) => (
                  <QuizCard key={q.id} quiz={q} index={idx + 1} onCorrect={() => handleAddPoints(5)} userId={profile.uid} isAdmin={isAdminMode} attempt={userAttempts[q.id]} />
                ))
              ) : (
                <Card className="p-8 text-center border-dashed border-2 border-slate-200 rounded-3xl">
                  <p className="text-slate-400">No quizzes found.</p>
                </Card>
              )}
            </div>
          </section>

          {/* Leaderboard */}
          <section className="space-y-4 w-full max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Trophy className="text-amber-500" />
                Leaderboard
              </h2>
            </div>
            <Card className="rounded-3xl overflow-hidden border-none shadow-md w-full">
              <CardContent className="p-0">
                {leaderboard.map((entry, idx) => (
                  <div 
                    key={entry.userId} 
                    className={`flex items-center justify-between p-4 ${idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`w-6 text-center font-bold ${idx < 3 ? 'text-amber-600' : 'text-slate-400'}`}>
                        {idx + 1}
                      </span>
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>{entry.name?.[0] || '?'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold flex items-center gap-1">
                          {entry.name}
                          {entry.isVIP && <Badge className="bg-amber-100 text-amber-700 text-[10px] h-4 px-1">VIP</Badge>}
                        </div>
                        <div className="text-xs text-slate-500">{entry.points} Points</div>
                      </div>
                    </div>
                    {idx === 0 && <Trophy className="text-amber-500" size={20} />}
                  </div>
                ))}
              </CardContent>
            </Card>
            
            {!profile.isVIP && (
              <Button 
                id="vip-purchase-btn"
                className="w-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white rounded-xl h-12 gap-2 shadow-lg shadow-amber-200 dark:shadow-none"
                onClick={async () => {
                  if (profile.points >= 100) {
                    try {
                      const newPoints = profile.points - 100;
                      const updatedProfile = { ...profile, points: newPoints, isVIP: true };
                      await setDoc(doc(db, 'users', profile.uid), updatedProfile, { merge: true });
                      await setDoc(doc(db, 'leaderboard', profile.uid), { points: newPoints, isVIP: true }, { merge: true });
                      setProfile(updatedProfile);
                      toast.success("Congratulations! You are now a VIP Student!");
                      confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
                    } catch (e) {
                      handleFirestoreError(e, OperationType.UPDATE, `users/${profile.uid}`);
                    }
                  } else {
                    toast.error(`You need 100 points. Current: ${profile.points}`);
                  }
                }}
              >
                <ShieldCheck size={20} /> Buy Student Badge (VIP) - 100 Points
              </Button>
            )}
          </section>

          {/* Streak Section */}
          <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Clock className="text-orange-500" />
                7-Day Streak
              </h2>
              <Badge className="bg-orange-100 text-orange-700">{profile.streak}/7 Days</Badge>
            </div>
            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map(day => (
                <div key={day} className="flex flex-col items-center gap-2 flex-1">
                  <div className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all ${profile.streak >= day ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-slate-100 text-slate-400'}`}>
                    {profile.streak >= day ? <ShieldCheck size={20} /> : day}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">Day {day}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-4 text-center font-medium">Complete 7 days to get 100 points!</p>
          </section>
        </>
      )}
      
      {/* Disclaimer and Elegant Footer */}
      <ElegantFooter />

      <footer className="py-4 flex flex-col items-center gap-1 opacity-60">
        <p className="text-[10px] text-slate-400 max-w-xs mx-auto italic text-center">
          Disclaimer: This app is for educational purposes only. Study hard and stay focused.
        </p>
      </footer>
    </div>
  );
};

const NoteAISummary = ({ note }: { note: Note }) => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [isReading, setIsReading] = useState(false);

  const generateSummary = async () => {
    setLoading(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        toast.error("AI Configuration missing. Please check the Secrets tab.");
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      const content = note.content || note.htmlContent || note.description || note.title;
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: "user", parts: [{ text: `Explain this study content clearly and concisely in Bengali (বাংলা) for a student. Include key points: ${content}` }] }]
      });
      setSummary(response.text || "Could not generate summary.");
    } catch (e: any) {
      console.error("AI Summary Error:", e);
      toast.error("AI Summary failed. Please ensure your API key is correct.");
    } finally {
      setLoading(false);
    }
  };

  const readAloud = async () => {
    if (isReading) return;
    setIsReading(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        const errorMsg = "AI Configuration missing or invalid API key. Please add a valid GEMINI_API_KEY in the AI Studio Settings (Secrets).";
        toast.error(errorMsg);
        setIsReading(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      const textToRead = summary || note.content || note.title;
      
      // TTS usually requires specific models. Reverting to basic summary for stability if tts model fails.
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: 'user', parts: [{ text: `Read this study content clearly: ${textToRead}` }] }]
      });
      const summaryText = response.text || "TTS failed.";
      setSummary(summaryText);
      setIsReading(false);
      toast.info("TTS model replaced with text summary due to regional unavailability.");
    } catch (e) {
      console.error("TTS Error:", e);
      setIsReading(false);
    }
  };

  return (
    <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-100 dark:border-purple-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-bold text-sm">
          <BrainCircuit size={18} />
          AI Note Assistant
        </div>
        <div className="flex gap-2">
          {summary && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={readAloud}
              disabled={isReading}
              className="h-7 px-2 rounded-full text-purple-600 hover:bg-purple-100"
            >
              <Volume2 size={14} className={isReading ? "animate-pulse" : ""} />
            </Button>
          )}
          {!summary && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={generateSummary}
              disabled={loading}
              className="text-[10px] h-7 px-3 rounded-full border-purple-200 text-purple-600 hover:bg-purple-100"
            >
              {loading ? "Thinking..." : "Explain in Bengali"}
            </Button>
          )}
        </div>
      </div>
      {summary && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed prose prose-sm dark:prose-invert max-w-none"
        >
          <ReactMarkdown>{summary}</ReactMarkdown>
        </motion.div>
      )}
    </div>
  );
};

const GeminiChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key missing");
      const ai = new GoogleGenAI({ apiKey });
      
      const chat = ai.chats.create({
        model: "gemini-1.5-flash",
        config: {
          systemInstruction: "You are StudySnap AI, a helpful educational assistant for students. Answer questions clearly and concisely. If asked about study places, use your knowledge of local geography.",
        }
      });

      const response = await chat.sendMessage({
        message: userMsg
      });

      setMessages(prev => [...prev, { role: 'model', content: response.text || "I'm sorry, I couldn't process that." }]);
    } catch (e: any) {
      console.error("Chat Error:", e);
      const errorMsg = e.message || "Connection failed";
      toast.error(`AI Chat Error: ${errorMsg}`);
      setMessages(prev => [...prev, { role: 'model', content: "Error: " + errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-36 z-[120] right-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="mb-4 w-[90vw] sm:w-80 h-[450px] bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden origin-top-right"
          >
            <div className="p-4 bg-blue-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg"><BrainCircuit size={18} /></div>
                <span className="font-bold">StudySnap AI</span>
              </div>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  setMessages([]);
                }} 
                className="p-1 hover:bg-white/10 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>
            
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-10 space-y-2">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full mx-auto flex items-center justify-center">
                    <MessageSquare size={24} />
                  </div>
                  <p className="text-xs text-slate-400 font-medium">Ask me anything about your studies!</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                  }`}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your question..."
                className="rounded-xl h-10 text-sm"
              />
              <Button onClick={sendMessage} disabled={loading} size="icon" className="rounded-xl bg-blue-600 shrink-0">
                <Send size={18} />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (isOpen) setMessages([]);
          setIsOpen(!isOpen);
        }}
        className="w-14 h-14 bg-blue-600 text-white rounded-2xl shadow-xl flex items-center justify-center relative group"
      >
        <div className="absolute inset-0 bg-blue-400 rounded-2xl animate-ping opacity-20 group-hover:hidden" />
        <BrainCircuit size={28} />
      </motion.button>
    </div>
  );
};

const NoteContentViewer = ({ note, onClose, onImageClick }: { note: Note, onClose: () => void, onImageClick: (src: string) => void }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const withSafeColorsForCanvas = async (callback: () => Promise<void>) => {
    const originalStylesheets = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'));
    const tempStylesheets: HTMLStyleElement[] = [];

    for (const sheet of originalStylesheets) {
      try {
        let cssText = '';
        if (sheet.tagName.toLowerCase() === 'style') {
          cssText = (sheet as HTMLStyleElement).innerHTML;
        } else {
          const href = (sheet as HTMLLinkElement).href;
          if (href && href.startsWith(window.location.origin)) {
            const res = await fetch(href);
            cssText = await res.text();
          }
        }

        if (cssText && (cssText.includes('oklch') || cssText.includes('OKLCH'))) {
          const sanitizedCss = cssText.replace(/oklch\(([^)]+)\)/gi, (match, p1) => {
            if (p1.includes('/')) {
              const parts = p1.split('/');
              const opacity = parts[1].trim();
              return `rgba(59, 130, 246, ${opacity})`;
            }
            return 'rgb(59, 130, 246)'; 
          });

          const tempStyle = document.createElement('style');
          tempStyle.innerHTML = sanitizedCss;
          document.head.appendChild(tempStyle);
          tempStylesheets.push(tempStyle);

          if (sheet.tagName.toLowerCase() === 'style') {
            (sheet as HTMLStyleElement).disabled = true;
          } else {
            (sheet as HTMLLinkElement).disabled = true;
          }
        }
      } catch (e) {
        console.warn("Failed to sanitize stylesheet rule for canvas render:", e);
      }
    }

    try {
      await callback();
    } finally {
      for (const temp of tempStylesheets) {
        try { temp.parentNode?.removeChild(temp); } catch(_) {}
      }
      for (const sheet of originalStylesheets) {
        if (sheet.tagName.toLowerCase() === 'style') {
          (sheet as HTMLStyleElement).disabled = false;
        } else {
          (sheet as HTMLLinkElement).disabled = false;
        }
      }
    }
  };

  const downloadAsPDF = async () => {
    const element = document.getElementById(`note-content-${note.id}`);
    if (!element) return;
    
    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          await withSafeColorsForCanvas(async () => {
            const clone = element.cloneNode(true) as HTMLElement;
            // Pre-processing clone for better performance
            const iframes = clone.querySelectorAll('iframe');
            iframes.forEach(iframe => {
              const container = document.createElement('div');
              container.className = "p-6 bg-slate-100 border-2 border-dashed rounded-3xl my-6 text-[10px] font-black uppercase text-slate-400 text-center";
              container.innerText = "Interactive component removed for PDF export";
              iframe.parentNode?.replaceChild(container, iframe);
            });

            // Standardize quality to avoid memory issues
            const opt = {
              margin: 10,
              filename: `${note.title.replace(/\s+/g, '_')}.pdf`,
              image: { type: 'jpeg', quality: 0.95 },
              html2canvas: { 
                scale: 1.5, 
                useCORS: true, 
                logging: false,
                letterRendering: true
              },
              jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            
            // @ts-ignore
            await html2pdf().set(opt).from(clone).save();
          });
          resolve(true);
        } catch (e) {
          reject(e);
        }
      }),
      {
        loading: 'Crunching data for PDF...',
        success: 'PDF Ready!',
        error: 'Export failed'
      }
    );
  };

  const downloadAsImage = async (format: 'png' | 'jpeg') => {
    const element = document.getElementById(`note-content-${note.id}`);
    if (!element) return;

    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          await withSafeColorsForCanvas(async () => {
            const clone = element.cloneNode(true) as HTMLElement;
            
            // Style wrapper to hold clone offscreen with rich viewport size
            const wrapper = document.createElement('div');
            wrapper.style.position = 'absolute';
            wrapper.style.left = '-9999px';
            wrapper.style.top = '0px';
            wrapper.style.width = `${element.offsetWidth || 820}px`;
            wrapper.style.backgroundColor = '#ffffff';
            wrapper.style.padding = '32px';
            wrapper.style.borderRadius = '24px';
            
            // Force layout visibility
            clone.style.height = 'auto';
            clone.style.overflow = 'visible';
            clone.style.paddingBottom = '32px';

            // Process interactive elements for static screenshot
            const iframes = clone.querySelectorAll('iframe');
            iframes.forEach(iframe => {
              const container = document.createElement('div');
              container.className = "p-8 bg-slate-50 border-2 border-dashed rounded-3xl my-6 text-[11px] font-black uppercase text-slate-400 text-center";
              container.innerText = "Interactive preview omitted for image export";
              iframe.parentNode?.replaceChild(container, iframe);
            });

            // Ensure audio components are replaced with pretty custom text block representation
            const audios = clone.querySelectorAll('audio');
            audios.forEach(audio => {
              const container = document.createElement('div');
              container.className = "p-4 bg-slate-50 border rounded-2xl my-4 text-xs font-bold text-center text-slate-500 flex items-center justify-center gap-2";
              container.innerHTML = "🎵 Audio Note Content Included";
              audio.parentNode?.replaceChild(container, audio);
            });

            wrapper.appendChild(clone);
            document.body.appendChild(wrapper);

            // Wait brief moment for layout/mounting
            await new Promise((r) => setTimeout(r, 150));

            const canvas = await html2canvas(wrapper, {
              useCORS: true,
              allowTaint: true,
              scale: 2, // High clarity for devices
              backgroundColor: '#ffffff',
              logging: false,
            });

            const fileExtension = format;
            const mimeType = `image/${format}`;
            const quality = format === 'jpeg' ? 0.95 : undefined;
            const dataUrl = canvas.toDataURL(mimeType, quality);
            
            const downloadLink = document.createElement("a");
            downloadLink.href = dataUrl;
            downloadLink.download = `${note.title.replace(/\s+/g, '_')}.${fileExtension}`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            if (document.body.contains(wrapper)) {
              document.body.removeChild(wrapper);
            }
          });
          resolve(true);
        } catch (e) {
          reject(e);
        }
      }),
      {
        loading: `Creating high-resolution ${format.toUpperCase()} image...`,
        success: `${format.toUpperCase()} Image Saved!`,
        error: 'Export failed'
      }
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between bg-white sticky top-0 z-[10000]">
        <h2 className="text-lg font-black px-2 truncate mr-4">{note.title}</h2>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full border-2 border-slate-100 text-blue-600 bg-white hover:bg-blue-50 hover:border-blue-200 px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer outline-none transition-all">
              <Download size={14} />
              Save Note
              <ChevronDown size={11} className="opacity-80" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl p-1.5 bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800 w-48 z-[10100]">
              <DropdownMenuItem onClick={downloadAsPDF} className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                <FileText size={14} className="text-rose-500 shrink-0" />
                <span>Save as PDF</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadAsImage('png')} className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                <FileImage size={14} className="text-blue-500 shrink-0" />
                <span>Save as PNG Image</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadAsImage('jpeg')} className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                <ImageIcon size={14} className="text-emerald-500 shrink-0" />
                <span>Save as JPEG Image</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="default" size="sm" className="rounded-full bg-navy-900 text-white hover:bg-black shadow-lg px-6 font-black shrink-0" onClick={onClose}>
            <Check className="w-4 h-4 mr-2" />
            EXIT
          </Button>
        </div>
      </div>
      <div className="flex-1 bg-white overflow-hidden flex flex-col" ref={contentRef}>
        <div className="flex-1 overflow-y-auto w-full p-4 sm:p-8 pb-32" id={`note-content-${note.id}`}>
          {note.type === 'html' && (note.htmlUrl || note.htmlContent) && (
            <div className="w-full flex flex-col border rounded-3xl overflow-hidden mb-8 bg-white min-h-[500px]">
              <iframe 
                src={note.htmlUrl || undefined} 
                srcDoc={note.htmlContent ? `<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body { margin: 0; padding: 16px; font-family: -apple-system, system-ui, sans-serif; line-height: 1.6; word-wrap: break-word; overflow-x: hidden; } img { max-width: 100%; height: auto; border-radius: 12px; } * { box-sizing: border-box; }</style></head><body>${note.htmlContent}</body></html>` : undefined} 
                className="w-full h-[75vh] border-none" 
                title={note.title} 
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups" 
              />
            </div>
          )}
          {note.type === 'voice' && note.voiceUrl && (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-6 mb-8">
              <audio controls className="w-full max-w-md min-h-12"><source src={note.voiceUrl} type="audio/mpeg" /></audio>
            </div>
          )}
          {note.type === 'video' && note.videoUrl && (
            <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-xl bg-black border border-slate-800 mb-8">
              <video controls className="w-full h-full"><source src={note.videoUrl} type="video/mp4" /></video>
            </div>
          )}
          {note.pdfUrl && (
            <div className="w-full h-[60vh] sm:h-[80vh] rounded-xl overflow-hidden shadow-inner bg-white border border-slate-100 mb-8">
              <iframe src={note.pdfUrl} className="w-full h-full border-none" title={note.title} />
            </div>
          )}
          {note.content && (
            <div className="prose dark:prose-invert max-w-none bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-slate-100 mb-8">
              <ReactMarkdown>{note.content}</ReactMarkdown>
            </div>
          )}
          {note.images && note.images.length > 0 && (
            <div className="grid grid-cols-1 gap-8 mb-8">
              {note.images.map((img, i) => (
                <img 
                  key={i} 
                  src={img} 
                  alt={`Page ${i+1}`} 
                  onClick={() => onImageClick(img)}
                  className="w-full rounded-2xl shadow-lg border border-slate-100 cursor-pointer hover:scale-[1.02] transition-transform" 
                  referrerPolicy="no-referrer" 
                />
              ))}
            </div>
          )}
          <NoteAISummary note={note} />
        </div>
      </div>
    </div>
  );
};

const NoteCard = ({ note, isAdmin, userId, appConfig, isGlobalUnlocked, setIsGlobalUnlocked, userProfile, onImageClick }: { note: Note, isAdmin: boolean, userId: string, appConfig: AppConfig, isGlobalUnlocked: boolean, setIsGlobalUnlocked: (v: boolean) => void, userProfile: UserProfile, onImageClick: (src: string) => void }) => {
  const [showContent, setShowContent] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showLockPrompt, setShowLockPrompt] = useState(false);
  const [isNoteUnlocked, setIsNoteUnlocked] = useState(false);

  const handleOpenNote = () => {
    const userLock = userProfile?.noteLockPassword;
    if (userLock && !isAdmin && !isNoteUnlocked) {
      setShowLockPrompt(true);
    } else if (appConfig.isNoteLocked && !isAdmin && !isGlobalUnlocked) {
      setShowLockPrompt(true);
    } else {
      setShowContent(true);
    }
  };

  const verifyPassword = () => {
    const userLock = userProfile?.noteLockPassword;
    if (userLock && passwordInput === userLock) {
      setIsNoteUnlocked(true);
      setShowLockPrompt(false);
      setShowContent(true);
      toast.success("Identity Verified!");
    } else if (appConfig.isNoteLocked && passwordInput === appConfig.noteAccessPassword) {
      setIsGlobalUnlocked(true);
      setShowLockPrompt(false);
      setShowContent(true);
      toast.success("Global Notes Unlocked!");
    } else {
      toast.error("Invalid Password.");
    }
  };

  const getIcon = () => {
    if (note.title.toLowerCase().includes('calculator')) {
      return <div className="text-slate-700"><Calculator size={32} /></div>;
    }
    switch(note.type) {
      case 'pdf': return <div className="text-red-600"><BookOpen size={32} /></div>;
      case 'text': return <div className="text-blue-600"><Globe size={32} /></div>;
      case 'image': return <div className="text-green-600"><Camera size={32} /></div>;
      case 'html': return <div className="text-orange-600"><FileCode size={32} /></div>;
      case 'voice': return <div className="text-purple-600"><Volume2 size={32} /></div>;
      case 'video': return <div className="text-emerald-600"><Video size={32} /></div>;
      default:
        switch(note.subject) {
          case 'Math': return <div className="text-orange-600"><BookOpen size={32} /></div>;
          case 'Bengali': return <div className="text-blue-600"><Globe size={32} /></div>;
          case 'English': return <div className="text-green-600"><BookOpen size={32} /></div>;
          case 'Phy Sci': return <div className="text-purple-600"><BrainCircuit size={32} /></div>;
          case 'Life Sci': return <div className="text-emerald-600"><BrainCircuit size={32} /></div>;
          default: return <div className="text-slate-600"><BookOpen size={32} /></div>;
        }
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const isBookmarked = userProfile?.bookmarks?.includes(note.id);

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId || !userProfile) {
      toast.error("Please login to bookmark notes");
      return;
    }
    
    const currentBookmarks = userProfile.bookmarks || [];
    const newBookmarks = isBookmarked 
      ? currentBookmarks.filter(id => id !== note.id)
      : [...currentBookmarks, note.id];
      
    try {
      await setDoc(doc(db, 'users', userId), { bookmarks: newBookmarks }, { merge: true });
      toast.success(isBookmarked ? "Removed from bookmarks" : "Added to bookmarks", {
        icon: isBookmarked ? <Bookmark size={14} /> : <Bookmark className="fill-current" size={14} />
      });
    } catch (err) {
      toast.error("Failed to update bookmark");
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isDeleting) {
      setIsDeleting(true);
      toast.warning("Click delete again within 3s to confirm.", { id: 'delete-confirm' });
      setTimeout(() => setIsDeleting(false), 3000);
      return;
    }
    try {
      if (!note.id) throw new Error("Note ID missing");
      await deleteDoc(doc(db, 'notes', note.id));
      toast.success("Note deleted!", { id: 'delete-confirm' });
    } catch (err: any) {
      console.error("Delete Error:", err);
      toast.error(`Failed to delete: ${err.message || 'Unknown error'}`);
    }
  };

  const handleApproveNote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (!note.id) throw new Error("Note ID missing");
      await setDoc(doc(db, 'notes', note.id), { isApproved: true, pendingApproval: false }, { merge: true });
      toast.success("Note has been approved and is now live!");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to approve note: " + err.message);
    }
  };

  return (
    <>
      <Card 
        className={`group hover:shadow-2xl transition-all duration-500 rounded-[2rem] overflow-hidden relative shadow-lg h-full hover:-translate-y-1 cursor-pointer w-full max-w-sm mx-auto border-4 ${
          note.isApproved === false 
            ? 'border-red-500 animate-[pulse_1.5s_infinite] bg-red-50/50 dark:bg-rose-950/20' 
            : 'border-transparent bg-white dark:bg-slate-900'
        }`}
        onClick={handleOpenNote}
      >
      <CardContent className="p-8 space-y-4 flex flex-col items-center justify-center text-center h-full">
        <div className="flex justify-center w-full relative">
          {getIcon()}
          <div className="absolute right-0 top-0 flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`rounded-full transition-all ${isBookmarked ? 'text-pink-500 bg-pink-50 hover:bg-pink-100' : 'text-slate-300 hover:text-pink-500 hover:bg-pink-50'}`}
              onClick={toggleBookmark}
            >
              <Bookmark size={16} className={isBookmarked ? 'fill-current' : ''} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full text-blue-400 hover:text-blue-600 hover:bg-blue-50"
              onClick={(e) => {
                e.stopPropagation();
                setIsShareOpen(true);
              }}
            >
              <Send size={16} />
            </Button>
            {isAdmin && (
              <Button 
                variant={isDeleting ? "destructive" : "ghost"} 
                size="icon" 
                className={`rounded-full transition-all ${isDeleting ? 'w-auto px-3 gap-2' : 'text-red-400 hover:text-red-600 hover:bg-red-50'}`}
                onClick={handleDelete}
              >
                <Trash2 size={16} />
                {isDeleting && <span className="text-[10px] font-bold">Confirm?</span>}
              </Button>
            )}
          </div>
        </div>
        
        <div className="space-y-1">
          <h3 className="font-bold text-lg leading-tight text-slate-900 dark:text-white">{note.title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-300 line-clamp-2 font-medium">{note.description || note.subject}</p>
          {note.isApproved === false && (
            <div className="text-[10px] bg-red-600 text-white font-black uppercase tracking-wider px-3 py-1 rounded-full animate-bounce mt-2 inline-block">
              ⚠️ PENDING APPROVAL
            </div>
          )}
        </div>

        {isAdmin && note.isApproved === false && (
          <div className="pt-2 w-full z-10">
            <Button 
              onClick={handleApproveNote}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider py-2 rounded-xl shadow-md transition-all h-9"
            >
              Approve Note ✔
            </Button>
          </div>
        )}
      </CardContent>
    </Card>

    <Dialog open={showLockPrompt} onOpenChange={setShowLockPrompt}>
        <DialogContent className="max-w-md rounded-[2.5rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic tracking-tight">IDENTITY CHECK</DialogTitle>
            <DialogDescription>This study resource is protected. Please enter the access password.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 text-center">
             <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center gap-3">
              <Lock size={20} className="text-navy-900" />
              <Input 
                type="password" 
                placeholder="Enter Password" 
                value={passwordInput} 
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && verifyPassword()}
                className="bg-transparent border-none focus:ring-0 text-lg font-mono tracking-widest p-0 h-auto"
              />
            </div>
            <Button onClick={verifyPassword} className="w-full bg-navy-900 text-white h-14 rounded-2xl font-black italic tracking-widest shadow-xl active:scale-95 transition-all">
              VERIFY & OPEN
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    <Dialog open={showContent} onOpenChange={(open) => {
        setShowContent(open);
        if (!open && document.fullscreenElement) document.exitFullscreen();
      }}>
        <DialogContent className="max-w-4xl h-[95vh] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <NoteContentViewer note={note} onClose={() => setShowContent(false)} onImageClick={onImageClick} />
        </DialogContent>
      </Dialog>
      
      <ShareNoteDialog 
        note={note} 
        isOpen={isShareOpen} 
        onOpenChange={setIsShareOpen} 
        currentUser={userProfile} 
      />
    </>
  );
};

const QuizCard = ({ quiz, index, onCorrect, userId, isAdmin, attempt }: { quiz: Quiz, index: number, onCorrect: () => void, userId: string, isAdmin: boolean, attempt?: any }) => {
  const [selected, setSelected] = useState<number | null>(attempt?.selectedOption ?? null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(attempt?.isCorrect ?? null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [hasAttempted, setHasAttempted] = useState(!!attempt);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (attempt) {
      setHasAttempted(true);
      setSelected(attempt.selectedOption);
      setIsCorrect(attempt.isCorrect);
    } else {
      setHasAttempted(false);
      setSelected(null);
      setIsCorrect(null);
    }
  }, [attempt]);

  useEffect(() => {
    if (selected !== null || timeLeft <= 0 || hasAttempted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSelect(-1); // Mark as incorrect when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, selected, hasAttempted]);

  const handleSelect = async (idx: number) => {
    if (selected !== null || hasAttempted) return;
    
    setSelected(idx);
    const correct = idx === quiz.correctAnswer;
    setIsCorrect(correct);
    
    try {
      await setDoc(doc(db, 'quizAttempts', `${userId}_${quiz.id}`), {
        userId,
        quizId: quiz.id,
        selectedOption: idx,
        isCorrect: correct,
        timestamp: new Date().toISOString()
      });
      setHasAttempted(true);
    } catch (e) {
      toast.error("Failed to save attempt");
    }

    if (idx === -1) {
      toast.error("Time's up!");
    } else if (correct) {
      toast.success("+5 Points!");
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
      onCorrect();
    } else {
      toast.error("Wrong answer!");
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDeleting) {
      setIsDeleting(true);
      setTimeout(() => setIsDeleting(false), 3000);
      return;
    }

    if (!quiz.id) {
      toast.error("Invalid Quiz ID");
      return;
    }

    try {
      const quizRef = doc(db, 'quizzes', quiz.id);
      console.log("Attempting to delete quiz:", quiz.id);
      await deleteDoc(quizRef);
      toast.success("Quiz deleted successfully");
    } catch (err: any) {
      console.error("Delete error details:", err);
      toast.error(`Delete failed: ${err.message || 'Check permissions'}`);
    }
  };

  return (
    <Card className="rounded-2xl border-slate-100 dark:border-slate-800 overflow-hidden relative">
      {hasAttempted && (
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="secondary" className="bg-green-100 text-green-700">Completed</Badge>
        </div>
      )}
      <div className="h-1 bg-slate-100 w-full">
        <motion.div 
          initial={{ width: "100%" }}
          animate={{ width: `${(timeLeft / 60) * 100}%` }}
          className={`h-full ${timeLeft < 10 ? 'bg-red-500' : 'bg-navy-600'}`}
        />
      </div>
      <CardContent className="p-4 space-y-4 flex flex-col items-center">
        <div className="flex flex-col items-center gap-3 w-full text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="bg-navy-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
              {index}
            </span>
            {isAdmin && (
              <Button 
                variant={isDeleting ? "destructive" : "ghost"} 
                size="icon" 
                className={`rounded-full transition-all ${isDeleting ? 'w-auto px-3 gap-2' : 'text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8'}`}
                onClick={handleDelete}
              >
                <Trash2 size={14} />
                {isDeleting && <span className="text-[10px] font-bold">Confirm?</span>}
              </Button>
            )}
            {!hasAttempted && (
              <div className={`text-xs font-bold px-2 py-1 rounded-full ${timeLeft < 10 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-600'}`}>
                {timeLeft}s
              </div>
            )}
          </div>
          <p className="font-bold text-lg leading-tight">
            {quiz.question}
            {isAdmin && <span className="text-[8px] text-slate-400 mt-1 block">ID: {quiz.id}</span>}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2 w-full">
          {quiz.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={selected !== null || hasAttempted}
              className={`text-center p-3 rounded-xl border-2 transition-all ${
                selected === idx 
                  ? (isCorrect ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700')
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-navy-200'
              } ${selected !== null && idx === quiz.correctAnswer && !isCorrect ? 'bg-green-50 border-green-500 text-green-700' : ''} ${(selected !== null || hasAttempted) ? 'cursor-default' : ''}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// AskAdminSection moved to top of file

const AddQuizDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    subject: 'General',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.question || formData.options.some(o => !o)) {
      toast.error("All fields are required");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'quizzes'), {
        ...formData,
        points: 5,
        date: new Date().toISOString()
      });
      toast.success("Quiz added successfully!");
      setFormData({ subject: 'General', question: '', options: ['', '', '', ''], correctAnswer: 0 });
      setIsOpen(false);
    } catch (e) {
      toast.error("Failed to add quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={
        <button className="bg-white/80 backdrop-blur-sm border border-slate-200 px-4 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold text-blue-600 shadow-sm hover:bg-white transition-all">
          <div className="bg-blue-600 text-white rounded-full p-0.5"><Plus size={12} /></div>
          Add Quiz
        </button>
      } />
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Add New Quiz</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Subject</Label>
            <Select value={formData.subject} onValueChange={v => setFormData({...formData, subject: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['General', 'Bengali', 'Math', 'English', 'Phy Sci', 'Life Sci', 'History', 'Geography', 'Exam Suggestion'].map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Question</Label>
            <Input value={formData.question} onChange={e => setFormData({...formData, question: e.target.value})} placeholder="Enter question..." />
          </div>
          {formData.options.map((opt, i) => (
            <div key={i} className="space-y-2">
              <Label>Option {i + 1}</Label>
              <Input value={opt} onChange={e => {
                const newOpts = [...formData.options];
                newOpts[i] = e.target.value;
                setFormData({...formData, options: newOpts});
              }} placeholder={`Option ${i + 1}`} />
            </div>
          ))}
          <div className="space-y-2">
            <Label>Correct Answer</Label>
            <Select value={formData.correctAnswer.toString()} onValueChange={v => setFormData({...formData, correctAnswer: parseInt(v)})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3].map(i => (
                  <SelectItem key={i} value={i.toString()}>Option {i + 1}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSubmit} disabled={loading} className="w-full bg-blue-600 text-white h-12 rounded-xl">
            {loading ? "Adding..." : "Confirm Quiz"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const GenerateQuizDialog = ({ subject, notes }: { subject: string, notes: Note[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedQuizzes, setGeneratedQuizzes] = useState<any[]>([]);

  const generateAIQuiz = async () => {
    if (notes.length === 0) {
      toast.error("No notes available for this subject to generate quiz.");
      return;
    }
    setLoading(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        toast.error("AI Configuration missing. Please check the Secrets tab.");
        setLoading(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      const notesContext = notes.map(n => `Title: ${n.title}\nContent snippet: ${n.content || n.description}`).join('\n\n');
      
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [{ role: 'user', parts: [{ text: `You are an expert educator. Generate 5 multiple-choice questions for the subject: ${subject}. 
        Use the following notes as context for question generation:
        ${notesContext}
        
        The questions should be challenging but appropriate for the content. 
        Each quiz object MUST have: question (string), options (array of 4 strings), correctAnswer (index 0-3).` }] }],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { 
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                correctAnswer: { type: Type.INTEGER }
              },
              required: ['question', 'options', 'correctAnswer']
            }
          }
        }
      });

      const data = JSON.parse(response.text || '[]');
      setGeneratedQuizzes(data);
      toast.success("AI Quizzes Generated!");
    } catch (e) {
      console.error(e);
      toast.error("AI Generation failed. Please check your Gemini API key.");
    } finally {
      setLoading(false);
    }
  };

  const saveToSystem = async () => {
    if (generatedQuizzes.length === 0) return;
    setLoading(true);
    try {
      for (const q of generatedQuizzes) {
        await addDoc(collection(db, 'quizzes'), {
          ...q,
          subject,
          points: 10,
          date: new Date().toISOString()
        });
      }
      toast.success("All AI Quizzes added to System!");
      setIsOpen(false);
    } catch (e) {
      toast.error("Failed to save quizzes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={
        <button className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 rounded-2xl flex items-center gap-2 text-sm font-black text-white shadow-lg hover:scale-105 transition-all">
          <Sparkles size={18} />
          GENERATE AI QUIZ
        </button>
      } />
      <DialogContent className="max-w-xl max-h-[85vh] overflow-hidden flex flex-col rounded-[2.5rem] border-none shadow-2xl p-0">
        <DialogHeader className="p-8 pb-4 bg-purple-600 text-white rounded-t-[2.5rem]">
          <DialogTitle className="flex items-center gap-2 text-2xl font-black italic">
            <Sparkles className="text-white" /> AI INTEL QUIZ
          </DialogTitle>
          <p className="text-purple-100 text-xs font-bold uppercase tracking-widest opacity-80">Dynamic Questions from your {subject} Notes</p>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {generatedQuizzes.length === 0 ? (
            <div className="py-12 flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center animate-pulse">
                <BrainCircuit size={40} className="text-purple-600" />
              </div>
              <div className="space-y-2">
                <h3 className="font-black text-xl text-slate-800">Brainstorming Challenges?</h3>
                <p className="text-sm text-slate-500 max-w-xs">StudySnap AI will analyze all your {subject} notes to create 5 unique challenges for you.</p>
              </div>
              <Button onClick={generateAIQuiz} disabled={loading} className="w-full bg-navy-900 h-14 rounded-2xl text-white font-black hover:bg-black">
                {loading ? <div className="flex items-center gap-2 italic">Thinking... <Clock size={16} className="animate-spin" /></div> : "INITIATE AI GENERATION"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {generatedQuizzes.map((q, i) => (
                <div key={i} className="p-5 bg-slate-50 border border-slate-100 rounded-3xl space-y-3">
                  <div className="text-xs font-black text-purple-600 uppercase">Challenge #{i + 1}</div>
                  <div className="font-bold text-slate-900 leading-tight">{q.question}</div>
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt: string, idx: number) => (
                      <div key={idx} className={`p-2 text-[10px] rounded-lg border flex items-center gap-2 ${idx === q.correctAnswer ? 'bg-green-50 border-green-200 text-green-700 font-bold' : 'bg-white border-slate-200 text-slate-500'}`}>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${idx === q.correctAnswer ? 'bg-green-500 text-white' : 'bg-slate-200'}`}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="pt-4 flex gap-3">
                <Button variant="outline" className="flex-1 h-12 rounded-xl font-black" onClick={() => setGeneratedQuizzes([])}>DISCARD</Button>
                <Button className="flex-1 h-12 rounded-xl bg-purple-600 text-white font-black hover:bg-purple-700" onClick={saveToSystem} disabled={loading}>
                  {loading ? "SAVING..." : "ADD ALL TO SYSTEM"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const UserActivityRegistry = ({ userId }: { userId: string }) => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'activities'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setActivities(list);
    } catch (err) {
      console.error("Error reading student activity logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchActivities();
    }
  }, [userId]);

  return (
    <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-slate-50 dark:bg-slate-900/30 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-blue-500 animate-pulse" />
          <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Live Behavior Activity Register</h4>
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-7 text-[10px] font-black uppercase tracking-wider border-slate-200 text-slate-600 dark:text-slate-300 dark:border-slate-800 bg-white dark:bg-transparent"
          onClick={fetchActivities}
          disabled={loading}
        >
          {loading ? 'READING...' : 'SYNC REGISTRY'}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-6 text-slate-400 text-xs font-bold animate-pulse">Syncing student logs...</div>
      ) : activities.length === 0 ? (
        <div className="text-center py-6 text-slate-400 text-[10px] uppercase font-mono tracking-wider italic">No logged activity found for user</div>
      ) : (
        <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {activities.map((act) => {
            const timeStr = act.timestamp ? new Date(act.timestamp).toLocaleTimeString() : 'Unknown';
            const dateStr = act.timestamp ? new Date(act.timestamp).toLocaleDateString() : '';
            return (
              <div key={act.id} className="flex items-start justify-between p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 gap-3 text-left">
                <div className="space-y-0.5">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                    act.status === 'offline' 
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20' 
                      : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20'
                  }`}>
                    {act.activity || 'unknown'}
                  </span>
                  <p className="text-[10px] text-slate-400 font-bold tracking-tight mt-1">
                    State: <span className="font-mono text-slate-500 dark:text-slate-400 uppercase">{act.status || 'unknown'}</span> • Device: {act.device || 'Unreported'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] font-bold text-slate-900 dark:text-gray-100 font-mono leading-none">{timeStr}</div>
                  <div className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-1">{dateStr}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const UserListDialog = ({ isOpen, onOpenChange, onAddPoints, onUpdateStreak, onSendCommand, onPreviewNote }: { 
  isOpen: boolean, 
  onOpenChange: (open: boolean) => void,
  onAddPoints: (uid: string, current: number, pts: number) => void,
  onUpdateStreak: (uid: string, streak: number) => void,
  onSendCommand: (uid: string, type: 'lock' | 'alert' | 'logout' | 'none', payload?: string) => void,
  onPreviewNote: (noteId: string) => void
}) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [selectedUserForChat, setSelectedUserForChat] = useState<UserProfile | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const fetchUsers = async () => {
    setIsRefreshing(true);
    try {
      const q = query(collection(db, 'users'), limit(150));
      const snapshot = await getDocs(q);
      const usersData = snapshot.docs.map(d => d.data() as UserProfile);
      usersData.sort((a, b) => new Date(b.lastActive || 0).getTime() - new Date(a.lastActive || 0).getTime());
      setUsers(usersData);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'users');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const filteredUsers = users.filter(u => 
    (u.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.school?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-none rounded-[3rem] shadow-2xl p-0 flex flex-col">
          <DialogHeader className="p-8 pb-6 bg-navy-900 text-white rounded-t-[3rem] shrink-0">
            <DialogTitle className="flex items-center gap-2 justify-center text-2xl font-black">
              <ShieldCheck className="text-blue-400" size={28} />
              MASTER CONTROL PANEL
            </DialogTitle>
            <p className="text-center text-blue-200 text-xs font-bold uppercase tracking-widest opacity-60 mb-6">System Monitoring & Commands</p>
            
            <div className="relative max-w-md mx-auto w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
              <Input 
                placeholder="Search students or schools..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-white/10 border-white/20 text-white pl-12 h-12 rounded-2xl focus:bg-white/20 transition-all placeholder:text-white/40"
              />
            </div>
          </DialogHeader>
          
          <div className="p-6 space-y-3 flex-1 overflow-y-auto font-sans">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-20 text-slate-400 font-bold italic">No matching users found...</div>
            ) : filteredUsers.map(u => {
              const isExpanded = expandedUserId === u.uid;
              const isOnline = u.status === 'online' && 
                              u.lastActive && (new Date().getTime() - new Date(u.lastActive).getTime() < 120000);
              
              return (
                <div key={u.uid} className={`rounded-3xl border transition-all duration-500 overflow-hidden ${isExpanded ? 'bg-white dark:bg-slate-900 border-blue-200 shadow-xl scale-[1.02]' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800'}`}>
                  {/* Header (Always Visible) */}
                  <button 
                    onClick={() => setExpandedUserId(isExpanded ? null : u.uid)}
                    className="w-full p-4 flex items-center justify-between text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="w-12 h-12 border-2 border-white dark:border-slate-800 shadow-sm">
                          <AvatarFallback className="bg-blue-600 text-white font-black">{u.name?.[0] || '?'}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white dark:border-slate-900 rounded-full ${isOnline ? 'bg-green-500 shadow-lg shadow-green-500/20' : 'bg-slate-400'}`} />
                      </div>
                      <div>
                        <div className="font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                          {u.email === 'sanpuianup88@gmail.com' ? 'STUDYPOINT' : u.name}
                          {isOnline && <span className="text-[8px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-black animate-pulse">LIVE</span>}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{u.role || 'student'} • {formatTimeAgo(u.lastActive)}</div>
                      </div>
                    </div>
                    <div className={`transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}>
                      <Plus size={20} className="text-slate-300 group-hover:text-blue-500" />
                    </div>
                  </button>

                  {/* Details (Drill-down) */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-100 dark:border-slate-800"
                      >
                        <div className="p-6 bg-white dark:bg-slate-950 space-y-6">
                          {/* User Identity */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Email ID</Label>
                              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs font-bold text-slate-600 break-all">{u.email}</div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Academic Info</Label>
                              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs font-bold text-slate-600">Class {u.class} • {u.school}</div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Contact</Label>
                              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs font-bold text-slate-600">{u.phone || 'No phone provided'}</div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Activity</Label>
                              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-xs font-black text-blue-600 uppercase tracking-tighter">{u.currentActivity || 'Checking resources'}</div>
                            </div>
                          </div>

                          {/* System Intel */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"><Monitor size={12} /> Access Point</div>
                              <div className="text-[10px] font-bold text-slate-600 truncate" title={u.browserInfo?.userAgent || 'Unknown'}>
                                {u.deviceInfo?.androidVersion || 'Unknown OS'}
                              </div>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"><Globe size={12} /> Digital ID (IP)</div>
                              <div className="text-[10px] font-bold text-slate-600">{u.ipAddress || 'Checking...'}</div>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"><Battery size={12} /> Power</div>
                              <div className={`text-[10px] font-bold ${u.battery && u.battery.level < 20 ? 'text-red-500' : 'text-slate-600'}`}>
                                {u.battery ? `${u.battery.level}% ${u.battery.isCharging ? '(Charging)' : ''}` : 'Unknown'}
                              </div>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"><MapPin size={12} /> Geo-Trace</div>
                              {u.location ? (
                                <div className="space-y-1">
                                  <button 
                                    onClick={() => window.open(`https://www.google.com/maps?q=${u.location?.latitude},${u.location?.longitude}`, '_blank')}
                                    className="text-[10px] font-black text-blue-600 hover:underline flex items-center gap-1"
                                  >
                                    {u.email === 'sanpuianup88@gmail.com' ? 'STUDYPOINT (Live View)' : 'View Live Map'} <ExternalLink size={10} />
                                  </button>
                                  <div className="text-[8px] text-slate-400 font-bold uppercase">
                                    Last Check: {u.location.timestamp ? new Date(u.location.timestamp).toLocaleTimeString() : 'Recently'}
                                  </div>
                                </div>
                              ) : <span className="text-[10px] text-slate-400 italic">No GPS Lock</span>}
                            </div>
                          </div>

                          <UserActivityRegistry userId={u.uid} />

                          <div className="flex gap-3 justify-center sm:justify-start">
                            <Button 
                              size="sm" 
                              className="w-full sm:w-auto px-8 h-10 text-xs bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl"
                              onClick={() => setSelectedUserForChat(u)}
                            >
                              <MessageSquare size={14} className="mr-2" />
                              Monitor Conversation
                            </Button>
                          </div>

                          <Separator className="opacity-50" />

                          {/* Controls */}
                          <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                              <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-center">
                                  <Label className="text-[10px] font-black uppercase text-slate-400">XP Management</Label>
                                  <Badge className="bg-blue-100 text-blue-700 text-[8px] font-black">{u.points} XP</Badge>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <Button size="sm" variant="outline" className="h-8 text-[10px] rounded-lg" onClick={() => onAddPoints(u.uid, u.points, 10)}>+10</Button>
                                  <Button size="sm" variant="outline" className="h-8 text-[10px] rounded-lg" onClick={() => onAddPoints(u.uid, u.points, 50)}>+50</Button>
                                  <Button size="sm" variant="outline" className="h-8 text-[10px] text-red-500 rounded-lg" onClick={() => onAddPoints(u.uid, u.points, -u.points)}>Reset</Button>
                                </div>
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-center">
                                  <Label className="text-[10px] font-black uppercase text-slate-400">Streak Sync</Label>
                                  <Badge className="bg-orange-100 text-orange-700 text-[8px] font-black">{u.streak} DAYS</Badge>
                                </div>
                                <Input 
                                  type="number" 
                                  className="h-8 text-xs rounded-lg" 
                                  defaultValue={u.streak}
                                  onBlur={(e) => onUpdateStreak(u.uid, parseInt(e.target.value) || 0)}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase text-slate-400">Remote Intervention</Label>
                              <div className="flex flex-wrap gap-2">
                                <Button size="sm" className="h-8 text-[10px] bg-amber-500 hover:bg-amber-600 rounded-lg text-white font-black" onClick={() => {
                                  const msg = prompt("Message:");
                                  if (msg) onSendCommand(u.uid, 'alert', msg);
                                }}>Send Warning</Button>
                                <Button size="sm" className="h-8 text-[10px] bg-red-600 hover:bg-red-700 rounded-lg text-white font-black" onClick={() => onSendCommand(u.uid, 'logout')}>Force Logout</Button>
                                <Button size="sm" className="h-8 text-[10px] bg-navy-900 hover:bg-black rounded-lg text-white font-black" onClick={() => onSendCommand(u.uid, 'lock')}>Lock Access</Button>
                                <Button size="sm" variant="outline" className="h-8 text-[10px] border-2 border-slate-200 rounded-lg font-black" onClick={() => onSendCommand(u.uid, 'none')}>Reset Local Lock</Button>
                              </div>
                            </div>

                            {/* EMERGENCY SPECIAL LOCKOUT (HACK RECOVERY INTERFACE) */}
                            {u.email !== 'sanpuianup88@gmail.com' && (
                              <div className="p-4 rounded-2xl bg-red-500/10 dark:bg-red-950/20 border border-red-500/30 space-y-3 mt-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <AlertTriangle className="text-red-500 animate-pulse" size={16} />
                                    <span className="text-[11px] font-black uppercase tracking-wider text-red-600 dark:text-red-400">
                                      Emergency SysLock (Hacker Recovery Option)
                                    </span>
                                  </div>
                                  {(u.lockoutEnabled || u.lockoutPermanentSiren) && (
                                    <span className="text-[9px] bg-red-600 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse flex items-center gap-1">
                                      🚨 Locked {(u.lockoutPermanentSiren) ? '(Continuous Siren)' : '(1 Attempt Left)'}
                                    </span>
                                  )}
                                </div>

                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                  Immediately locks user out of all syllabus notes / core views. Forces a red "HACKED" terminal flashing system. Deactivating this works instantly without passwords.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-2 items-center">
                                  {u.lockoutEnabled || u.lockoutPermanentSiren ? (
                                    <Button
                                      size="sm"
                                      className="w-full bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 rounded-xl text-xs font-black uppercase tracking-wider h-10 shadow-sm"
                                      onClick={async () => {
                                        try {
                                          await setDoc(doc(db, 'users', u.uid), {
                                            lockoutEnabled: false,
                                            lockoutPermanentSiren: false,
                                            lockoutAttemptsCount: 0
                                          }, { merge: true });
                                          toast.success("SysLock deactivated successfully for " + u.name);
                                          fetchUsers();
                                        } catch (err: any) {
                                          toast.error("Failed to release lock: " + err.message);
                                        }
                                      }}
                                    >
                                      RELEASE SYSLOCK (Restore Normal Access)
                                    </Button>
                                  ) : (
                                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                                      <Input
                                        placeholder="Configure Lock Password..."
                                        id={`lock-pass-${u.uid}`}
                                        className="h-10 text-xs rounded-xl flex-1 dark:bg-slate-900 border-red-500/20 focus:border-red-500"
                                      />
                                      <Button
                                        size="sm"
                                        className="h-10 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs tracking-wider rounded-xl px-4 shrink-0"
                                        onClick={async () => {
                                          const inputEl = document.getElementById(`lock-pass-${u.uid}`) as HTMLInputElement;
                                          const pWords = inputEl?.value?.trim();
                                          if (!pWords) {
                                            toast.error("You must set a Recovery Password first!");
                                            return;
                                          }
                                          try {
                                            await setDoc(doc(db, 'users', u.uid), {
                                              lockoutEnabled: true,
                                              lockoutPassword: pWords,
                                              lockoutAttemptsCount: 0,
                                              lockoutPermanentSiren: false
                                            }, { merge: true });
                                            toast.success("Emergency SysLock deployed successfully! User is blocked.");
                                            inputEl.value = '';
                                            fetchUsers();
                                          } catch (err: any) {
                                            toast.error("Configuration deployment failure: " + err.message);
                                          }
                                        }}
                                      >
                                        DEPLOY LOCK
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
      {selectedUserForChat && (
        <AdminChatDialog 
          user={selectedUserForChat} 
          onClose={() => setSelectedUserForChat(null)} 
          onPreviewNote={onPreviewNote}
        />
      )}
    </>
  );
};

const AdminChatDialog = ({ user, onClose, onPreviewNote }: { user: UserProfile, onClose: () => void, onPreviewNote: (noteId: string) => void }) => {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    // Admin chat needs to be carefully queried to avoid reading all messages
    // We'll query both directions and combine
    const fetchAdminChat = async () => {
      if (!user?.uid) return;
      try {
        const q1 = query(collection(db, 'messages'), where('senderId', '==', user.uid), limit(50));
        const q2 = query(collection(db, 'messages'), where('receiverId', '==', user.uid), limit(50));
        
        const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        const combined = [
          ...s1.docs.map(d => ({ id: d.id, ...d.data() } as Message)),
          ...s2.docs.map(d => ({ id: d.id, ...d.data() } as Message))
        ];
        combined.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        setMessages(combined);
      } catch (e) {
        console.error(e);
      }
    };
    fetchAdminChat();
    // In admin mode, real-time might be useful but we'll stick to manual fetch for quota safety 
    // or very targeted listeners if really needed.
  }, [user.uid]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[70vh] flex flex-col p-0 overflow-hidden rounded-[2rem]">
        <DialogHeader className="p-4 border-b bg-navy-900 text-white flex flex-row items-center gap-3 space-y-0">
          <Avatar className="w-10 h-10 border-2 border-white/20">
            <AvatarFallback className="bg-white/10 text-white">{user.name?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <div>
            <DialogTitle className="text-lg">Chat: {user.name || 'Student'}</DialogTitle>
            <p className="text-[10px] text-blue-200 opacity-80">Admin Monitoring Mode</p>
          </div>
        </DialogHeader>
        <ScrollArea className="flex-1 p-4 bg-slate-50 dark:bg-slate-950">
          <div className="space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex flex-col ${m.senderId === user.uid ? 'items-start' : 'items-end'}`}>
                <div className="text-[10px] text-slate-400 mb-1 px-2">
                  {m.senderId === user.uid ? (user.name || 'Student') : (m.senderName || 'Other Student')}
                </div>
                <div className={`p-3 rounded-2xl max-w-[85%] text-sm shadow-sm ${
                  m.senderId === user.uid 
                    ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none' 
                    : 'bg-navy-600 text-white rounded-tr-none'
                }`}>
                  {m.text}
                  {m.sharedNoteId && (
                    <div className="mt-3 p-3 rounded-xl border bg-white/10 border-white/20 space-y-2">
                       <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-60">
                        <BookOpen size={12} /> Note Attached
                      </div>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        className="w-full h-8 rounded-lg font-black text-[10px] bg-blue-100 text-blue-700 hover:bg-blue-200 border-none"
                        onClick={() => onPreviewNote(m.sharedNoteId)}
                      >
                        VIEW SHARED NOTE
                      </Button>
                    </div>
                  )}
                  <div className="text-[8px] mt-1 opacity-50 text-right">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2 opacity-30">
                <MessageSquare size={48} />
                <p className="text-xs">No messages found for this user.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

const AddNoteDialog = ({ profile, isAdmin }: { profile: UserProfile | null, isAdmin: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    title: '', 
    subject: 'Bengali', 
    pdfUrl: '', 
    content: '', 
    htmlUrl: '',
    htmlContent: '',
    htmlInputType: 'code' as 'url' | 'code',
    voiceUrl: '',
    videoUrl: '',
    description: '',
    type: 'pdf' as 'pdf' | 'text' | 'image' | 'html' | 'voice' | 'video'
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async (type: 'voice' | 'video') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: type === 'video' 
      });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: type === 'voice' ? 'audio/mpeg' : 'video/mp4' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          if (type === 'voice') setFormData((prev) => ({ ...prev, voiceUrl: base64, type: 'voice' }));
          else setFormData((prev) => ({ ...prev, videoUrl: base64, type: 'video' }));
          toast.success(`${type === 'voice' ? 'Voice' : 'Video'} recorded!`);
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      toast.info(`Recording ${type}...`);
    } catch (err) {
      toast.error("Failed to access media devices");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (imageUrls.length + files.length > 50) {
      toast.error("Maximum 50 pages allowed");
      return;
    }

    Array.from(files).forEach(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit per image
        toast.error(`${file.name} is too large. Max 10MB.`);
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimension 1200px for better compression
          const maxDim = 1200;
          if (width > height) {
            if (width > maxDim) {
              height *= maxDim / width;
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width *= maxDim / height;
              height = maxDim;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to 0.7 quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setImageUrls(prev => [...prev, compressedDataUrl]);
        };
      };
      reader.readAsDataURL(file);
    });
  };

  const handleMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'voice' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Max 10MB.");
      return;
    }

    if (file.size > 1024 * 1024) {
      toast.warning("File is over 1MB. Firestore might reject it if it's too large. Consider using a URL instead.");
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === 'voice') setFormData({ ...formData, voiceUrl: base64 });
      else setFormData({ ...formData, videoUrl: base64 });
      toast.success(`${type === 'voice' ? 'Voice' : 'Video'} file loaded!`);
    };
    reader.readAsDataURL(file);
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("PDF is too large. Max 10MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, pdfUrl: reader.result as string });
      toast.success("PDF loaded successfully!");
    };
    reader.readAsDataURL(file);
  };

  const removeImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      toast.error("Title is required");
      return;
    }
    setLoading(true);
    try {
      const isTeacherRole = profile?.role === 'teacher';
      const noteData: any = {
        title: formData.title,
        subject: formData.subject,
        description: formData.description,
        createdAt: new Date().toISOString(),
        authorId: auth.currentUser?.uid,
        type: formData.type,
        isApproved: isAdmin ? true : false,
        pendingApproval: isAdmin ? false : true
      };

      if (formData.type === 'pdf') noteData.pdfUrl = formData.pdfUrl || '';
      if (formData.type === 'text') noteData.content = formData.content || '';
      if (formData.type === 'image') noteData.images = imageUrls;
      if (formData.type === 'html') {
        noteData.htmlUrl = formData.htmlUrl || '';
        noteData.htmlContent = formData.htmlContent || '';
      }
      if (formData.type === 'voice') noteData.voiceUrl = formData.voiceUrl || '';
      if (formData.type === 'video') noteData.videoUrl = formData.videoUrl || '';

      // Strict 1MB Check for Firestore
      const sizeStr = JSON.stringify(noteData);
      if (sizeStr.length > 1000000) {
        throw new Error("File is too large for Firestore. Please use smaller files or more compressed images.");
      }

      await addDoc(collection(db, 'notes'), noteData);
      toast.success("Note added successfully!");
      setFormData({ 
        title: '', 
        subject: 'Bengali', 
        pdfUrl: '', 
        content: '', 
        htmlUrl: '', 
        htmlContent: '',
        htmlInputType: 'url',
        voiceUrl: '', 
        videoUrl: '', 
        description: '', 
        type: 'pdf' 
      });
      setImageUrls([]);
      setIsOpen(false);
    } catch (e) {
      console.error("Firestore Error:", e);
      toast.error("Failed to add note: " + (e instanceof Error ? e.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger 
        render={
          <button className="bg-white/80 backdrop-blur-sm border border-slate-200 px-4 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold text-navy-900 shadow-sm hover:bg-white transition-all">
            <div className="bg-navy-900 text-white rounded-full p-0.5"><Plus size={12} /></div>
            Add notes
          </button>
        }
      />
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Note</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Class 9 Math Notes" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Short description..." />
          </div>
          <div className="space-y-2">
            <Label>Subject</Label>
            <Select value={formData.subject} onValueChange={v => setFormData({...formData, subject: v})}>
              <SelectTrigger>
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {['Bengali', 'Math', 'English', 'Phy Sci', 'Life Sci', 'History', 'Geography', 'Exam Suggestion'].map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Note Type</Label>
            <Tabs value={formData.type} onValueChange={(v: any) => setFormData({...formData, type: v})}>
              <TabsList className="grid w-full grid-cols-3 mb-2">
                <TabsTrigger value="pdf">PDF</TabsTrigger>
                <TabsTrigger value="text">Text</TabsTrigger>
                <TabsTrigger value="image">Images</TabsTrigger>
              </TabsList>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="html">HTML</TabsTrigger>
                <TabsTrigger value="voice">Voice</TabsTrigger>
                <TabsTrigger value="video">Video</TabsTrigger>
              </TabsList>
              <TabsContent value="pdf" className="space-y-4 pt-2">
                <Label className="flex items-center gap-2">
                  <BookOpen size={16} /> Upload note as PDF
                </Label>
                <Input 
                  type="file" 
                  accept=".pdf" 
                  onChange={handlePdfUpload}
                  className="cursor-pointer file:bg-blue-50 file:text-blue-700 file:border-none rounded-xl"
                />
                {formData.pdfUrl && <Badge className="bg-green-100 text-green-700">PDF Ready</Badge>}
              </TabsContent>
              <TabsContent value="html" className="space-y-2 pt-2">
                <Label>Paste HTML Code</Label>
                <textarea 
                  className="w-full h-48 rounded-xl border border-slate-200 p-3 text-[10px] font-mono focus:ring-2 focus:ring-navy-500 outline-none bg-slate-950 text-green-400"
                  value={formData.htmlContent}
                  onChange={e => setFormData({...formData, htmlContent: e.target.value})}
                  placeholder="<!DOCTYPE html><html>...</html>"
                />
                <p className="text-[10px] text-slate-400 italic px-1 text-center">Plain HTML only. URL entry removed per request.</p>
              </TabsContent>
              <TabsContent value="voice" className="space-y-4 pt-2">
                <Label>Voice Note (Record or Upload)</Label>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => isRecording ? stopRecording() : startRecording('voice')} 
                      className={`flex-1 h-16 rounded-2xl flex flex-col gap-1 ${isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-purple-600 hover:bg-purple-700'}`}
                    >
                      {isRecording ? <X size={20} /> : <Volume2 size={24} />}
                      <span className="text-[10px] font-bold tracking-widest">{isRecording ? 'STOP' : 'RECORD'}</span>
                    </Button>
                    <div className="relative flex-1">
                      <Input 
                        type="file" 
                        accept="audio/*" 
                        onChange={(e) => handleMediaFileChange(e, 'voice')}
                        className="h-16 cursor-pointer rounded-2xl opacity-0 absolute inset-0 z-10"
                      />
                      <Button variant="outline" className="w-full h-16 rounded-2xl flex flex-col gap-1 border-2 border-dashed border-purple-200">
                        <Plus size={24} className="text-purple-400" />
                        <span className="text-[10px] font-bold text-purple-400">UPLOAD</span>
                      </Button>
                    </div>
                  </div>
                  {formData.voiceUrl && (
                    <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-purple-700">Voice Recording Ready</span>
                      <Button variant="ghost" size="sm" onClick={() => setFormData({...formData, voiceUrl: ''})}>
                        <Trash2 size={12} className="text-red-500" />
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="video" className="space-y-4 pt-2">
                <Label>Video Note (Record or Upload)</Label>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => isRecording ? stopRecording() : startRecording('video')} 
                      className={`flex-1 h-16 rounded-2xl flex flex-col gap-1 ${isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-navy-900 hover:bg-black'}`}
                    >
                      {isRecording ? <X size={20} /> : <Video size={24} />}
                      <span className="text-[10px] font-bold tracking-widest">{isRecording ? 'STOP' : 'RECORD'}</span>
                    </Button>
                    <div className="relative flex-1">
                      <Input 
                        type="file" 
                        accept="video/*" 
                        onChange={(e) => handleMediaFileChange(e, 'video')}
                        className="h-16 cursor-pointer rounded-2xl opacity-0 absolute inset-0 z-10"
                      />
                      <Button variant="outline" className="w-full h-16 rounded-2xl flex flex-col gap-1 border-2 border-dashed border-navy-200">
                        <Plus size={24} className="text-navy-400" />
                        <span className="text-[10px] font-bold text-navy-400">UPLOAD</span>
                      </Button>
                    </div>
                  </div>
                  {formData.videoUrl && (
                    <div className="p-3 bg-navy-50 rounded-xl border border-navy-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-navy-700">Video Content Ready</span>
                      <Button variant="ghost" size="sm" onClick={() => setFormData({...formData, videoUrl: ''})}>
                        <Trash2 size={12} className="text-red-500" />
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="text" className="space-y-2 pt-2">
                <Label>Content (Markdown supported)</Label>
                <textarea 
                  className="w-full h-32 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  placeholder="Type your note here..."
                />
              </TabsContent>
              <TabsContent value="image" className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center">
                    <Label className="mb-2 block text-xs">Upload from Device</Label>
                    <div className="relative w-full">
                      <Input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        onChange={handleFileChange}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                      />
                      <Button variant="outline" className="w-full rounded-xl gap-2 text-xs">
                        <Smartphone size={14} />
                        Gallery
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center">
                    <Label className="mb-2 block text-xs">Capture with Camera</Label>
                    <div className="relative w-full">
                      <Input 
                        type="file" 
                        accept="image/*" 
                        capture="environment"
                        onChange={handleFileChange}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                      />
                      <Button variant="outline" className="w-full rounded-xl gap-2 text-xs border-blue-200 bg-blue-50 text-blue-700">
                        <Camera size={14} />
                        Camera
                      </Button>
                    </div>
                  </div>
                </div>
                
                <p className="text-[10px] text-slate-400 italic text-center">Max 50 pages allowed. Max 2MB per image.</p>
                
                <div className="space-y-3">
                  <Label>Selected Images ({imageUrls.length})</Label>
                  {imageUrls.length === 0 ? (
                    <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                      No images selected yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {imageUrls.map((url, i) => (
                        <div key={i} className="relative group aspect-video rounded-xl overflow-hidden border shadow-sm bg-white">
                          <img src={url || undefined} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                              onClick={() => removeImageUrl(i)}
                              className="bg-red-500 text-white p-2 rounded-full shadow-lg transform hover:scale-110 transition-transform"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="absolute bottom-1 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
                            Page {i + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="w-full bg-navy-900 text-white h-12 rounded-xl mt-4 shadow-lg active:scale-95 transition-all">
            {loading ? "Adding Resource..." : "PUBLISH STUDY NOTE"}
          </Button>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
            <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">
              <Info size={12} /> Upload Guidelines
            </div>
            <ul className="text-[10px] space-y-1 text-slate-500 dark:text-slate-400 font-medium">
              <li>• Maximum 50 pages allowed per study resource</li>
              <li>• PDF, Images, Text, HTML, Voice & Video supported</li>
              <li>• Individual file size should not exceed 10MB (Firestore limit: 1MB total)</li>
              <li>• For large videos/audios, consider sharing the public link</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AnalogClock = ({ date }: { date: Date }) => {
  const seconds = date.getSeconds();
  const minutes = date.getMinutes();
  const hours = date.getHours();

  const secondDegrees = (seconds / 60) * 360;
  const minuteDegrees = (minutes / 60) * 360 + (seconds / 60) * 6;
  const hourDegrees = (hours / 12) * 360 + (minutes / 60) * 30;

  return (
    <div className="relative w-48 h-48 rounded-full border-4 border-navy-900 dark:border-white bg-white dark:bg-slate-900 shadow-xl mx-auto flex items-center justify-center">
      {/* Hour markers */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute inset-2 flex items-start justify-center"
          style={{ transform: `rotate(${i * 30}deg)` }}
        >
          <div className="w-1 h-3 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>
      ))}
      
      {/* Center dot */}
      <div className="absolute w-3 h-3 bg-navy-900 dark:bg-white rounded-full z-20 shadow-sm" />

      {/* Hour hand */}
      <div
        className="absolute w-1.5 h-12 bg-navy-900 dark:bg-white rounded-full z-10 origin-bottom left-1/2 bottom-1/2 -translate-x-1/2"
        style={{
          transform: `translateX(-50%) rotate(${hourDegrees}deg)`,
        }}
      />

      {/* Minute hand */}
      <div
        className="absolute w-1 h-16 bg-slate-600 dark:bg-slate-300 rounded-full z-10 origin-bottom left-1/2 bottom-1/2 -translate-x-1/2"
        style={{
          transform: `translateX(-50%) rotate(${minuteDegrees}deg)`,
        }}
      />

      {/* Second hand */}
      <div
        className="absolute w-0.5 h-20 bg-red-500 rounded-full z-10 origin-bottom left-1/2 bottom-1/2 -translate-x-1/2"
        style={{
          transform: `translateX(-50%) rotate(${secondDegrees}deg)`,
        }}
      />
    </div>
  );
};

const TimerSection = () => {
  const [time, setTime] = useState(new Date());
  const [stopwatch, setStopwatch] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [alarmTime, setAlarmTime] = useState("");
  const [isAlarmSet, setIsAlarmSet] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);
      
      // Check alarm
      if (isAlarmSet && alarmTime) {
        const [alarmH, alarmM] = alarmTime.split(':');
        if (now.getHours() === parseInt(alarmH) && now.getMinutes() === parseInt(alarmM) && now.getSeconds() === 0) {
          toast.success("ALARM! Time to Study!", {
            duration: 10000,
            icon: <Bell className="animate-bounce" />
          });
          // Play sound if possible
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.play().catch(() => {});
          setIsAlarmSet(false);
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isAlarmSet, alarmTime]);

  const [totalStudyTime, setTotalStudyTime] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => {
        setStopwatch(s => s + 1);
        setTotalStudyTime(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 py-4 flex flex-col items-center w-full max-w-4xl mx-auto">
      <div className="flex flex-col items-center gap-8 w-full">
        <AnalogClock date={time} />
        
        <div className="text-center space-y-2">
          <h2 className="text-5xl font-black tracking-tighter text-navy-900 dark:text-white">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
          </h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
            {time.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-navy-900 text-white w-full max-w-md mx-auto">
        <CardHeader className="text-center pb-2 pt-8">
          <CardTitle className="text-blue-300 uppercase tracking-[0.3em] text-[10px] font-black">Study Stopwatch</CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center space-y-8">
          <div className="text-7xl font-mono font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-200">
            {formatTime(stopwatch)}
          </div>
          <div className="flex justify-center gap-4">
            <Button 
              onClick={() => setIsRunning(!isRunning)}
              className={`w-32 h-14 rounded-2xl font-black text-lg shadow-lg transition-all active:scale-95 ${isRunning ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-green-500 hover:bg-green-600 shadow-green-500/20'}`}
            >
              {isRunning ? "Pause" : "Start"}
            </Button>
            <Button 
              variant="outline"
              onClick={() => { setStopwatch(0); setIsRunning(false); }}
              className="w-32 h-14 rounded-2xl border-white/20 text-white hover:bg-white/10 font-bold"
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md mx-auto">
        <Dialog>
          <DialogTrigger nativeButton={false} render={
            <Card className="rounded-3xl p-5 flex items-center justify-between border-none shadow-md bg-white dark:bg-slate-900 cursor-pointer hover:bg-slate-50 transition-all group">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-2xl text-blue-600"><Bell size={24} /></div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alarm Status</div>
                  <div className="font-black text-lg">{isAlarmSet ? alarmTime : "Not Set"}</div>
                </div>
              </div>
              <Plus size={20} className="text-slate-300 group-hover:text-blue-600 transition-all" />
            </Card>
          } />
          <DialogContent className="rounded-[2.5rem] max-w-xs">
            <DialogHeader>
              <DialogTitle className="text-center font-black">Set Study Alarm</DialogTitle>
            </DialogHeader>
            <div className="py-6 space-y-6">
              <Input 
                type="time" 
                value={alarmTime} 
                onChange={e => setAlarmTime(e.target.value)}
                className="h-14 text-2xl font-black text-center rounded-2xl border-2 border-slate-100 focus:border-blue-600"
              />
              <div className="flex gap-2">
                <Button 
                  onClick={() => setIsAlarmSet(true)} 
                  className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold"
                  disabled={!alarmTime}
                >
                  Set Alarm
                </Button>
                {isAlarmSet && (
                  <Button 
                    variant="destructive" 
                    onClick={() => setIsAlarmSet(false)} 
                    className="h-12 rounded-xl px-4"
                  >
                    <X size={20} />
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Card className="rounded-3xl p-5 flex items-center gap-4 border-none shadow-md bg-white dark:bg-slate-900">
          <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-2xl text-orange-600"><Clock size={24} /></div>
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Study</div>
            <div className="font-black text-lg">{Math.floor(totalStudyTime / 3600)}h {Math.floor((totalStudyTime % 3600) / 60)}m</div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const NoticeSection = ({ notices, isAdmin, onImageClick }: { notices: Notice[], isAdmin: boolean, onImageClick: (src: string) => void }) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    subject: '', 
    fromDate: new Date().toISOString().split('T')[0], 
    toDate: new Date().toISOString().split('T')[0], 
    type: 'text' as 'text' | 'image' | 'html', 
    priority: 'low' as 'low' | 'medium' | 'high',
    content: '', 
    imageUrl: '', 
    htmlUrl: '',
    htmlContent: '',
    htmlInputType: 'code' as 'url' | 'code'
  });
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (formData.type === 'image') {
          setFormData({ ...formData, imageUrl: reader.result as string });
        } else if (formData.type === 'html') {
          setFormData({ ...formData, htmlContent: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddNotice = async () => {
    if (!formData.subject || !formData.fromDate || !formData.toDate) {
      toast.error("Subject and Dates are required");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'notices'), {
        subject: formData.subject,
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        type: formData.type,
        priority: formData.priority,
        content: formData.content || '',
        imageUrl: formData.imageUrl || '',
        htmlUrl: formData.htmlUrl || '',
        htmlContent: formData.htmlContent || '',
        createdAt: new Date().toISOString()
      });
      toast.success("Notice published!");
      setIsAddOpen(false);
      setFormData({ 
        subject: '', 
        fromDate: new Date().toISOString().split('T')[0], 
        toDate: new Date().toISOString().split('T')[0], 
        type: 'text', 
        priority: 'low',
        content: '', 
        imageUrl: '', 
        htmlUrl: '',
        htmlContent: '',
        htmlInputType: 'code'
      });
    } catch (e) {
      console.error("Notice add error:", e);
      toast.error("Failed to add notice");
    } finally {
      setLoading(false);
    }
  };

  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDeleteNotice = async (id: string) => {
    if (isDeleting !== id) {
      setIsDeleting(id);
      toast.warning("Click delete again to confirm", { id: 'notice-delete' });
      setTimeout(() => setIsDeleting(null), 3000);
      return;
    }
    try {
      await deleteDoc(doc(db, 'notices', id));
      toast.success("Notice deleted", { id: 'notice-delete' });
    } catch (e) {
      toast.error("Failed to delete notice");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 py-4 flex flex-col items-center w-full max-w-4xl mx-auto px-4 min-h-[80vh]">
      <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4 mb-4 sm:mb-8 bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-red-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-red-200 dark:shadow-none animate-pulse">
            <Megaphone size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-red-600 uppercase">Notice Board</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Official Updates</p>
          </div>
        </div>
        
        {isAdmin && (
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger nativeButton={true} render={
              <Button className="bg-red-600 hover:bg-red-700 text-white rounded-full px-6 h-12 font-black shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95">
                <Plus size={20} />
                <span>ADD NOTICE</span>
              </Button>
            } />
            <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
              <div className="p-6 bg-red-600 text-white">
                <DialogTitle className="text-xl font-black">Publish Announcement</DialogTitle>
                <p className="opacity-70 text-[10px] font-bold uppercase tracking-widest mt-1">Visible to all students</p>
              </div>
              <div className="p-8 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="space-y-1.5">
                  <Label className="font-black text-[10px] uppercase tracking-widest ml-1">Subject</Label>
                  <Input value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} placeholder="Exam Schedule Change" className="rounded-xl h-11 border-slate-200" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="font-black text-[10px] uppercase tracking-widest ml-1">Starts</Label>
                    <Input type="date" value={formData.fromDate} onChange={e => setFormData({...formData, fromDate: e.target.value})} className="rounded-xl h-11" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-black text-[10px] uppercase tracking-widest ml-1">Ends</Label>
                    <Input type="date" value={formData.toDate} onChange={e => setFormData({...formData, toDate: e.target.value})} className="rounded-xl h-11" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="font-black text-[10px] uppercase tracking-widest ml-1">Priority</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {['low', 'medium', 'high'].map(p => (
                      <button 
                        key={p}
                        onClick={() => setFormData({...formData, priority: p as any})}
                        className={`py-2 rounded-xl text-[9px] font-black uppercase transition-all border-2 ${
                          formData.priority === p 
                            ? 'bg-red-600 border-red-600 text-white shadow-md' 
                            : 'bg-white border-slate-100 text-slate-400'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="font-black text-[10px] uppercase tracking-widest ml-1">Notice Type</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {['text', 'image', 'html'].map(t => (
                      <button 
                        key={t}
                        onClick={() => setFormData({...formData, type: t as any})}
                        className={`py-2 rounded-xl text-[9px] font-black uppercase transition-all border-2 ${
                          formData.type === t 
                            ? 'bg-red-600 border-red-600 text-white' 
                            : 'bg-white border-slate-100 text-slate-400'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.type === 'text' ? (
                  <div className="space-y-1.5">
                    <Label className="font-black text-[10px] uppercase tracking-widest ml-1">Message Content</Label>
                    <textarea 
                      value={formData.content} 
                      onChange={e => setFormData({...formData, content: e.target.value})} 
                      className="w-full h-28 rounded-xl border-2 border-slate-50 p-3 text-sm focus:border-red-200 outline-none resize-none"
                      placeholder="Write details..."
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Label className="font-black text-[10px] uppercase tracking-widest ml-1">Upload {formData.type.toUpperCase()}</Label>
                    <Input type="file" accept={formData.type === 'image' ? 'image/*' : 'text/html'} onChange={handleFileChange} className="rounded-xl h-11" />
                  </div>
                )}
                
                <Button onClick={handleAddNotice} disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white h-12 rounded-xl font-black shadow-lg mt-2">
                  {loading ? 'PUBLISHING...' : 'PUBLISH'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 w-full pb-32">
        {notices.map((n) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            key={n.id}
            className="w-full"
          >
            <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-900 flex flex-col group hover:shadow-red-900/10 transition-all duration-500">
               <div className="p-6 bg-red-50 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${n.priority === 'high' ? 'bg-red-600 text-white animate-pulse shadow-lg' : 'bg-red-100 text-red-600 font-black'}`}>
                        <Megaphone size={20} />
                     </div>
                     <div>
                        <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{n.subject}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-60">Published on {new Date(n.createdAt).toLocaleDateString()}</p>
                     </div>
                  </div>
                  {isAdmin && (
                    <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 rounded-full" onClick={() => handleDeleteNotice(n.id!)}>
                      <Trash2 size={16} />
                    </Button>
                  )}
               </div>
               <CardContent className="p-8 space-y-6">
                  {n.type === 'text' && <p className="text-slate-600 dark:text-slate-300 font-bold whitespace-pre-wrap leading-relaxed text-sm sm:text-base">{n.content}</p>}
                  {n.type === 'image' && n.imageUrl && (
                    <div className="relative group cursor-pointer" onClick={() => onImageClick(n.imageUrl)}>
                       <img src={n.imageUrl} alt="Notice" className="w-full rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 transition-transform duration-500 group-hover:scale-[1.01]" referrerPolicy="no-referrer" />
                       <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-all rounded-3xl" />
                    </div>
                  )}
                  {n.type === 'html' && (n.htmlUrl || n.htmlContent) && (
                    <div className="w-full border-2 border-slate-50 dark:border-slate-800 rounded-3xl overflow-hidden bg-white dark:bg-slate-950 min-h-[300px] shadow-inner">
                      <iframe 
                        src={n.htmlUrl || undefined} 
                        srcDoc={n.htmlContent ? `<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body { margin: 0; padding: 20px; font-family: sans-serif; line-height: 1.5; word-wrap: break-word; }</style></head><body>${n.htmlContent}</body></html>` : undefined} 
                        className="w-full h-[400px] border-none" 
                        title={n.subject} 
                      />
                    </div>
                  )}
               </CardContent>
               <div className="px-8 py-5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm"><Calendar size={14} className="text-red-500" /></div>
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{n.fromDate} — {n.toDate}</span>
                  </div>
                  <Badge className={`${n.priority === 'high' ? 'bg-red-600 animate-bounce' : n.priority === 'medium' ? 'bg-orange-500' : 'bg-blue-500'} text-white border-0 text-[9px] font-black uppercase tracking-widest px-4 h-7 flex items-center rounded-full shadow-lg`}>
                    {n.priority}
                  </Badge>
               </div>
            </Card>
          </motion.div>
        ))}
        {notices.length === 0 && (
          <div className="py-24 text-center opacity-30 flex flex-col items-center gap-4">
            <Megaphone size={64} className="text-slate-400" />
            <div className="space-y-1">
              <p className="font-black text-sm uppercase tracking-[0.2em] text-slate-600">Silence is Gold</p>
              <p className="text-xs">No official announcements currently posted.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CommunitySection = ({ currentUser, onPreviewNote }: { currentUser: UserProfile, onPreviewNote: (noteId: string) => void }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMessages = async () => {
    setIsRefreshing(true);
    try {
      const oneHourAgo = new Date(new Date().getTime() - (60 * 60 * 1000)).toISOString();
      const q = query(
        collection(db, 'messages'),
        where('receiverId', '==', 'global'),
        where('timestamp', '>', oneHourAgo),
        orderBy('timestamp', 'desc'),
        limit(40)
      );
      const snapshot = await getDocs(q);
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs.reverse());
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await addDoc(collection(db, 'messages'), {
        senderId: currentUser.uid,
        senderName: currentUser.name || 'Student',
        receiverId: 'global',
        text: newMessage,
        timestamp: new Date().toISOString()
      });
      setNewMessage('');
      fetchMessages();
    } catch (e) {
      toast.error("Failed to send message");
    }
  };

  return (
     <div className="flex flex-col h-[75vh] w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden mt-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-950 border-b border-blue-100 dark:border-blue-900 flex justify-center flex-col items-center gap-2">
           <PortfolioLink className="w-full justify-center py-2" />
           <div className="text-[9px] font-black text-blue-400 uppercase tracking-widest px-2 py-1 bg-white/50 dark:bg-slate-800 rounded-full">Community Hub Built by Smart Subha</div>
        </div>
        <div className="p-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white flex items-center justify-between shrink-0">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-2xl"><Globe size={24} /></div>
              <div>
                 <h2 className="text-xl font-black italic tracking-tight uppercase">Global Commune</h2>
                 <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Connected • Last 1 hour</p>
              </div>
           </div>
           <div className="flex items-center gap-3">
             <Button 
               size="sm" 
               variant="ghost" 
               onClick={fetchMessages} 
               disabled={isRefreshing}
               className="bg-white/10 hover:bg-white/20 text-white rounded-xl"
             >
               <RefreshCcw size={14} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
               {isRefreshing ? 'RELOADING...' : 'REFRESH'}
             </Button>
             <Badge className="bg-white/20 text-white border-0">{messages.length} MSGS</Badge>
           </div>
        </div>

        <div className="px-6 py-6 bg-emerald-600 text-white border-b border-white/10 group cursor-pointer hover:bg-emerald-700 transition-all flex flex-col sm:flex-row items-center justify-between gap-6" onClick={() => window.open('https://chat.whatsapp.com/EbPxMMLpA7kEE4eIJnZIwt?mode=gi_t', '_blank')}>
          <div className="flex items-center gap-6 text-center sm:text-left">
            <div className="p-5 bg-white text-emerald-600 rounded-[2rem] shadow-2xl animate-bounce shrink-0 flex items-center justify-center"><Megaphone size={32} /></div>
            <div>
              <p className="text-2xl font-black uppercase tracking-tighter leading-tight">Join Official WhatsApp Group</p>
              <p className="text-sm text-white/90 font-bold max-w-md">Get instant notes, exam updates, and direct support from Admin!</p>
            </div>
          </div>
          <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50 rounded-2xl px-10 h-14 text-lg font-black shadow-2xl shrink-0 group-hover:scale-105 transition-transform">JOIN NOW</Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 space-y-4" ref={scrollRef}>
           {messages.map((m, idx) => {
              const isMe = m.senderId === currentUser.uid;
              return (
                 <motion.div 
                    initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={m.id || idx} 
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                 >
                    {!isMe && <span className="text-[9px] font-black text-slate-400 mb-1 ml-2 uppercase tracking-widest">{m.senderName || 'Anonymous'}</span>}
                    <div className={`max-w-[85%] sm:max-w-[70%] p-3 px-4 rounded-[1.5rem] text-sm shadow-sm relative group ${
                       isMe ? 'bg-navy-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none'
                    }`}>
                       {m.text}
                       {m.sharedNoteId && (
                          <div className={`mt-3 p-3 rounded-2xl border ${isMe ? 'bg-white/10 border-white/20' : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800'} space-y-2`}>
                             <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest opacity-60">
                                <BookOpen size={10} /> Shared Resource
                             </div>
                             <Button 
                                size="sm" 
                                variant="secondary"
                                className="w-full h-8 rounded-xl font-black text-[10px] bg-blue-100 text-blue-700 hover:bg-blue-200 border-none"
                                onClick={() => onPreviewNote(m.sharedNoteId!)}
                             >
                                ACTIVATE PREVIEW
                             </Button>
                          </div>
                       )}
                       <div className={`text-[8px] mt-1 opacity-40 font-bold ${isMe ? 'text-right' : 'text-left'}`}>
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </div>
                    </div>
                 </motion.div>
              );
           })}
           {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20 p-12">
                 <MessageSquare size={64} className="mb-4" />
                 <p className="font-bold">Be the first to start the conversation!</p>
              </div>
           )}
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
           <div className="flex gap-3 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-[2rem] border border-slate-100 dark:border-slate-800">
              <Input 
                 placeholder="Ask or Share..." 
                 value={newMessage}
                 onChange={e => setNewMessage(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && sendMessage()}
                 className="rounded-full border-none bg-transparent focus:ring-0 text-sm h-11"
              />
              <Button onClick={sendMessage} className="bg-navy-900 hover:bg-black text-white rounded-full w-11 h-11 p-0 shrink-0 shadow-lg transition-transform hover:scale-105">
                 <Send size={18} />
              </Button>
           </div>
        </div>
     </div>
  );
};

const PaymentSection = () => (
  <div className="space-y-6 py-4 flex flex-col items-center w-full max-w-4xl mx-auto">
    <PortfolioLink variant="large" />
    <div className="text-center space-y-4 w-full">
      <div className="w-full max-w-md mx-auto aspect-video rounded-3xl overflow-hidden shadow-lg border-4 border-white">
        <img 
          src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=800" 
          alt="Donation" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Support StudySnap</h2>
        <p className="text-slate-500">Scan the QR code to contribute and help us grow!</p>
      </div>
    </div>
    
    <Card className="max-w-md mx-auto rounded-3xl overflow-hidden shadow-xl border-none w-full">
      <div className="bg-blue-600 p-6 text-center text-white">
        <div className="text-sm font-medium opacity-70 mb-1">© Smart Subha</div>
        <div className="font-bold tracking-wider">Founder of StudySnap</div>
      </div>
      <CardContent className="p-8 flex flex-col items-center gap-6">
        <div className="p-4 bg-white rounded-2xl shadow-inner border-2 border-slate-50">
          <QRCodeSVG value="upi://pay?pa=lazysubhajit@fam&pn=StudySnap&cu=INR" size={200} />
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <ShieldCheck size={16} className="text-green-500" />
          Secure Payment via UPI
        </div>
      </CardContent>
    </Card>

    <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl text-blue-800 text-sm flex gap-3">
      <HelpCircle className="shrink-0" />
      <p>Your contribution helps us provide free notes and maintain the StudySnap platform for everyone.</p>
    </div>
  </div>
);

const ProfileEditDialog = ({ profile, onUpdate }: { profile: UserProfile, onUpdate: (data: Partial<UserProfile>) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: profile.name || '',
    class: profile.class || 10,
    school: profile.school || '',
    phone: profile.phone || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name || !formData.school || !formData.phone) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      await setDoc(doc(db, 'users', profile.uid), formData, { merge: true });
      onUpdate(formData);
      toast.success("Profile updated successfully!");
      setIsOpen(false);
    } catch (e) {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={
        <button className="w-full flex items-center justify-between p-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all border-b border-slate-50 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-600"><UserCircle size={20} /></div>
            <span className="font-medium">Edit Profile Info</span>
          </div>
          <ChevronRight size={16} className="text-slate-300" />
        </button>
      } />
      <DialogContent className="max-w-md rounded-[2.5rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black italic">EDIT PROFILE</DialogTitle>
          <DialogDescription>Update your academic and contact details</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="font-bold text-xs uppercase text-slate-400">Full Name</Label>
            <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-xl h-12" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase text-slate-400">Class</Label>
              <Select value={formData.class.toString()} onValueChange={v => setFormData({...formData, class: parseInt(v)})}>
                <SelectTrigger className="rounded-xl h-12"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[5, 6, 7, 8, 9, 10, 11, 12].map(c => (
                    <SelectItem key={c} value={c.toString()}>Class {c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase text-slate-400">Phone</Label>
              <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="rounded-xl h-12" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="font-bold text-xs uppercase text-slate-400">School Name</Label>
            <Input value={formData.school} onChange={e => setFormData({...formData, school: e.target.value})} className="rounded-xl h-12" />
          </div>
          <Button onClick={handleSubmit} disabled={loading} className="w-full bg-navy-900 text-white h-14 rounded-2xl font-black mt-4">
            {loading ? "Updating..." : "SAVE PROFILE"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const FeedbackList = ({ isAdmin }: { isAdmin: boolean }) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchFeedback = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'feedback'), orderBy('timestamp', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        setFeedbacks(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Feedback)));
      } catch (e) {
        handleFirestoreError(e, OperationType.LIST, 'feedback');
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, [isAdmin]);

  if (!isAdmin) return null;

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="text-purple-600" size={20} />
        <h3 className="font-black uppercase tracking-tight text-lg">User Feedback</h3>
      </div>
      {loading ? (
        <div className="text-center py-6 text-slate-400 font-bold italic text-xs">Loading feedback...</div>
      ) : feedbacks.length === 0 ? (
        <div className="text-center py-6 text-slate-400 font-bold italic text-xs">No feedback yet.</div>
      ) : (
        <div className="space-y-3">
          {feedbacks.map(f => (
            <Card key={f.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase">{f.userName}</span>
                  <span className="text-[8px] text-slate-500 font-bold">{f.userEmail}</span>
                </div>
                <span className="text-[8px] text-slate-400 font-bold">{formatTimeAgo(f.timestamp)}</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{f.text}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const FeedbackForm = ({ profile }: { profile: UserProfile }) => {
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      toast.error("Please enter your feedback");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        userId: profile.uid,
        userName: profile.name,
        userEmail: profile.email,
        text: feedback,
        recipientEmail: 'sanpuianup88@gmail.com',
        timestamp: new Date().toISOString()
      });
      
      toast.success("Feedback Logged!", {
        description: "Admin will be notified. Opening Gmail to send a direct copy..."
      });
      
      // Auto-open Gmail after a short delay
      setTimeout(() => {
        openGmail();
        setFeedback("");
      }, 1500);
      
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'feedback');
    } finally {
      setLoading(false);
    }
  };

  const openGmail = () => {
    const subject = encodeURIComponent(`StudySnap Feedback from ${profile.name}`);
    const body = encodeURIComponent(feedback || "Hi Admin, I have some feedback...");
    window.open(`mailto:sanpuianup88@gmail.com?subject=${subject}&body=${body}`);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <textarea 
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="w-full h-40 rounded-3xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-sm font-bold focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none resize-none transition-all shadow-inner"
          placeholder="What's your experience with StudySnap? Tell us everything..."
        />
        <div className="absolute bottom-4 right-4 flex gap-2">
           <button 
             onClick={openGmail}
             className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-500 rounded-xl transition-colors"
             title="Send via Gmail instead"
           >
             <div className="flex items-center gap-1">
               <Globe size={14} />
               <span className="text-[10px] font-black uppercase">Gmail</span>
             </div>
           </button>
        </div>
      </div>
      <Button 
        onClick={handleSubmit} 
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white h-14 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
      >
        {loading ? <RefreshCcw size={20} className="animate-spin" /> : (
          <>
            <Send size={18} />
            SUBMIT FEEDBACK TO ADMIN
          </>
        )}
      </Button>
      <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">Feedback is directly sent to sanpuianup88@gmail.com</p>
    </div>
  );
};

const SettingsSection = ({ profile, onLogout, darkMode, setDarkMode, eyeComfort, setEyeComfort, appConfig, isAdminMode, setProfile, onUpdateTheme, activeTheme }: { profile: UserProfile, onLogout: () => void, darkMode: boolean, setDarkMode: (v: boolean) => void, eyeComfort: boolean, setEyeComfort: (v: boolean) => void, appConfig: AppConfig, isAdminMode: boolean, setProfile: (p: UserProfile) => void, onUpdateTheme: (t: string) => void, activeTheme: string }) => {
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [configData, setConfigData] = useState(appConfig);
  const [requests, setRequests] = useState<any[]>([]);
  const [isViewingRequests, setIsViewingRequests] = useState(false);

  useEffect(() => {
    if (!isAdminMode) return;
    const q = query(collection(db, 'adminRequests'), orderBy('requestedAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => {
      console.warn("Failed to subscribe to promotion requests:", err);
    });
    return unsub;
  }, [isAdminMode]);

  const handleApproveRequest = async (colUserId: string) => {
    try {
      await setDoc(doc(db, 'users', colUserId), { role: 'admin' }, { merge: true });
      await setDoc(doc(db, 'adminRequests', colUserId), { status: 'approved' }, { merge: true });
      toast.success("User promoted to Admin successfully!");
    } catch (err: any) {
      toast.error("Promotion failed: " + err.message);
    }
  };

  const handleRejectRequest = async (colUserId: string) => {
    try {
      await setDoc(doc(db, 'adminRequests', colUserId), { status: 'rejected' }, { merge: true });
      toast.success("Request declined successfully.");
    } catch (err: any) {
      toast.error("Rejection failed: " + err.message);
    }
  };

  const themes = [
    { id: 'classic', name: 'StudyBlue', color: 'bg-blue-600' },
    { id: 'midnight', name: 'Midnight', color: 'bg-slate-950' },
    { id: 'sunset', name: 'Sunset', color: 'bg-orange-500' },
    { id: 'forest', name: 'Forest', color: 'bg-emerald-600' },
    { id: 'cyber', name: 'Cyberpunk', color: 'bg-purple-600' },
  ];

  const handleTogglePref = async (key: 'newNoteAlerts' | 'communityMsgs') => {
    try {
      const currentPrefs = profile.notificationPrefs || { newNoteAlerts: true, communityMsgs: true };
      const newPrefs = { ...currentPrefs, [key]: !currentPrefs[key] };
      await setDoc(doc(db, 'users', profile.uid), { notificationPrefs: newPrefs }, { merge: true });
      setProfile({ ...profile, notificationPrefs: newPrefs });
      toast.success("Preference updated");
    } catch (e) {
      toast.error("Failed to update preference");
    }
  };

  const handleSaveConfig = async () => {
    try {
      await setDoc(doc(db, 'config', 'app'), configData);
      toast.success("App configuration updated!");
      setIsEditingConfig(false);
    } catch (e: any) {
      console.error("Config Update Error:", e);
      toast.error("Failed to update config: " + (e.message || "Unknown error"));
    }
  };

  return (
    <div className="space-y-6 py-4 flex flex-col items-center w-full max-w-4xl mx-auto">
      <PortfolioLink className="bg-blue-600 text-white font-black py-4 w-full justify-center shadow-lg" />
      <div className="flex flex-col items-center text-center gap-4 p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-md border border-slate-100 dark:border-slate-800 w-full relative overflow-hidden">
        <Avatar className="w-24 h-24 border-4 border-white dark:border-slate-800 shadow-xl relative z-10">
          <AvatarFallback className="bg-navy-900 text-white text-3xl">{profile.name?.[0] || '?'}</AvatarFallback>
        </Avatar>
        <div className="space-y-2 relative z-10">
          <h2 className="text-2xl font-black flex flex-col items-center gap-2">
            {profile.name}
            <div className="flex gap-2">
              {profile.isVIP && <Badge className="bg-amber-100 text-amber-700 font-bold">VIP</Badge>}
              <Badge variant="outline" className={`capitalize font-bold border-2 ${profile.role === 'admin' ? 'border-navy-200 text-navy-700 bg-navy-50' : 'border-slate-100 text-slate-500'}`}>
                {profile.role}
              </Badge>
            </div>
          </h2>
          <p className="text-sm font-bold text-slate-400">Class {profile.class} • {profile.school}</p>
        </div>
        {/* Decorative background for profile card */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl -mr-16 -mt-16" />
      </div>

      {isAdminMode && (
        <div className="space-y-2 w-full max-w-4xl mx-auto">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2 text-center">Admin Controls</h3>
          <Card className="rounded-2xl overflow-hidden border-slate-100 dark:border-slate-800 w-full shadow-sm">
            <button 
              className="w-full flex items-center justify-between p-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all border-b border-slate-50 dark:border-slate-800"
              onClick={() => setIsEditingConfig(true)}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-600"><Clock size={20} /></div>
                <span className="font-medium">Edit Countdown Message</span>
              </div>
              <Plus size={16} className="text-slate-300" />
            </button>

            <button 
              className="w-full flex items-center justify-between p-4 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all"
              onClick={() => setIsViewingRequests(true)}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-100 text-orange-600"><ShieldAlert size={20} /></div>
                <span className="font-medium flex items-center gap-2">
                  <span>Promotion Requests Queue</span>
                  {requests.filter(r => r.status === 'pending').length > 0 && (
                    <Badge className="bg-red-500 text-white animate-pulse text-[9px] font-black px-2 py-0.5 rounded-full">
                      {requests.filter(r => r.status === 'pending').length} NEW
                    </Badge>
                  )}
                </span>
              </div>
              <Plus size={16} className="text-slate-300" />
            </button>
          </Card>

          <Dialog open={isViewingRequests} onOpenChange={setIsViewingRequests}>
            <DialogContent className="max-w-xl rounded-[2.5rem]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ShieldAlert className="text-orange-500" />
                  <span>Admin Promotion Requests Queue</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                <p className="text-xs text-slate-400 font-medium">
                  Review and promote students requesting administrative roles. This will enable them to access the Admin Port securely.
                </p>

                {requests.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 font-bold text-xs">
                    No requests received yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {requests.map((req) => (
                      <div 
                        key={req.id} 
                        className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-900"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">{req.userName}</span>
                            <Badge 
                              className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                                req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                'bg-red-100 text-red-700'
                              }`}
                            >
                              {req.status}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono">{req.userEmail}</p>
                          <p className="text-[9px] text-slate-500 font-medium">
                            Sent: {new Date(req.requestedAt).toLocaleString()}
                          </p>
                        </div>

                        {req.status === 'pending' && (
                          <div className="flex items-center gap-2 shrink-0">
                            <button 
                              onClick={() => handleRejectRequest(req.userId)}
                              className="px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-[10px] font-black uppercase transition-all"
                            >
                              ✖ REJECT NO
                            </button>
                            <button 
                              onClick={() => handleApproveRequest(req.userId)}
                              className="px-3 py-1.5 rounded-xl bg-green-500 hover:bg-green-600 text-black text-[10px] font-black uppercase transition-all shadow-sm"
                            >
                              ✔ APPROVE YES
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditingConfig} onOpenChange={setIsEditingConfig}>
            <DialogContent className="max-w-md rounded-[2.5rem]">
              <DialogHeader><DialogTitle>Edit Countdown</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Countdown Message</Label>
                  <Input 
                    value={configData.countdownMessage} 
                    onChange={e => setConfigData({...configData, countdownMessage: e.target.value})} 
                    placeholder="e.g. PORIKHHAY MON DAO" 
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Target Date & Time</Label>
                  <Input 
                    type="datetime-local" 
                    value={configData.countdownDate.slice(0, 16)} 
                    onChange={e => setConfigData({...configData, countdownDate: e.target.value})} 
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-500">
                    <span>🚨 FLASH MESSAGE (CAUTION TAPE TEXT)</span>
                  </Label>
                  <Input 
                    value={configData.crimeTapeText || ''} 
                    onChange={e => setConfigData({...configData, crimeTapeText: e.target.value})} 
                    placeholder="e.g. CAUTION: ASSIGNMENT DEADLINE APPROACHING • SUBMIT NOW" 
                    className="rounded-xl font-mono text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50/50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900/50"
                  />
                  <p className="text-[10px] text-slate-400 font-medium leading-normal">
                    This displays/broadcasts as a stationary, high-contrast yellow caution/crime-scene banner alert on the Home tab for all students.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 pt-2 border-t mt-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-bold">Lock All Notes</Label>
                      <p className="text-[10px] text-slate-400 font-medium">Require password for access</p>
                    </div>
                    <button 
                      onClick={() => setConfigData({...configData, isNoteLocked: !configData.isNoteLocked})}
                      className={`w-12 h-6 rounded-full transition-all relative ${configData.isNoteLocked ? 'bg-navy-900' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${configData.isNoteLocked ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                  {configData.isNoteLocked && (
                    <div className="space-y-2">
                      <Label className="text-xs font-bold">Access Password</Label>
                      <Input 
                        value={configData.noteAccessPassword || ''} 
                        onChange={e => setConfigData({...configData, noteAccessPassword: e.target.value})} 
                        placeholder="Set password for notes" 
                        className="rounded-xl h-10 text-sm font-mono"
                      />
                    </div>
                  )}
                </div>
                <Button onClick={handleSaveConfig} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-2xl font-bold mt-4 shadow-lg active:scale-95 transition-all">
                  Save Changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <div className="space-y-2 w-full max-w-4xl mx-auto">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2 text-center">Account</h3>
        <Card className="rounded-2xl overflow-hidden border-slate-100 dark:border-slate-800 w-full shadow-sm">
          <ProfileEditDialog profile={profile} onUpdate={(data) => setProfile({...profile, ...data})} />
          {!profile.isVIP && (
            <button 
              className="w-full flex items-center justify-between p-4 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all border-b border-slate-50 dark:border-slate-800"
              onClick={() => toast.info("Please go to Home tab to buy VIP badge with points!")}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-600"><ShieldCheck size={20} /></div>
                <span className="font-medium">Get VIP Student Badge</span>
              </div>
              <div className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">100 PTS</div>
            </button>
          )}
          <button 
            className="w-full flex items-center justify-between p-4 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-red-600"
            onClick={onLogout}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-100 text-red-600"><LogOutIcon size={20} /></div>
              <span className="font-medium">Logout Account</span>
            </div>
          </button>
        </Card>
      </div>

      <div className="space-y-2 w-full max-w-4xl mx-auto">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2 text-center">Preferences</h3>
        <Card className="rounded-2xl overflow-hidden border-slate-100 dark:border-slate-800 w-full shadow-sm">
          <div className="p-4 border-b border-slate-50 dark:border-slate-800">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Appearance Themes</h4>
            <div className="grid grid-cols-5 gap-2">
              {themes.map(t => (
                <button 
                  key={t.id}
                  onClick={() => onUpdateTheme(t.id)}
                  className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all ${activeTheme === t.id ? 'bg-slate-50 dark:bg-slate-800 scale-105 shadow-sm' : 'opacity-60 hover:opacity-100'}`}
                >
                  <div className={`w-8 h-8 rounded-full ${t.color} border-2 ${activeTheme === t.id ? 'border-blue-500' : 'border-transparent'}`} />
                  <span className="text-[8px] font-black uppercase truncate w-full text-center">{t.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between p-4 border-b border-slate-50 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${darkMode ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </div>
              <span className="font-medium">Dark Mode</span>
            </div>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-6 rounded-full transition-all relative ${darkMode ? 'bg-navy-600' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${darkMode ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between p-4 border-b border-slate-50 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${eyeComfort ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                <Eye size={20} />
              </div>
              <span className="font-medium">Eye Comfort</span>
            </div>
            <button 
              onClick={() => setEyeComfort(!eyeComfort)}
              className={`w-12 h-6 rounded-full transition-all relative ${eyeComfort ? 'bg-amber-600' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${eyeComfort ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between p-4 border-b border-slate-50 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-100 text-blue-600"><Bell size={20} /></div>
              <span className="font-medium">Note Alerts</span>
            </div>
            <button 
              onClick={() => handleTogglePref('newNoteAlerts')}
              className={`w-12 h-6 rounded-full transition-all relative ${(profile.notificationPrefs?.newNoteAlerts ?? true) ? 'bg-blue-600' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${(profile.notificationPrefs?.newNoteAlerts ?? true) ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between p-4 border-b border-slate-50 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-green-100 text-green-600"><MessageSquare size={20} /></div>
              <span className="font-medium">Community Messages</span>
            </div>
            <button 
              onClick={() => handleTogglePref('communityMsgs')}
              className={`w-12 h-6 rounded-full transition-all relative ${(profile.notificationPrefs?.communityMsgs ?? true) ? 'bg-green-600' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${(profile.notificationPrefs?.communityMsgs ?? true) ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
          <button 
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            onClick={() => window.open('https://wa.me/8670225411', '_blank')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-100 text-blue-600"><HelpCircle size={20} /></div>
              <span className="font-medium">Help & Support</span>
            </div>
            <ExternalLink size={16} className="text-slate-300" />
          </button>
        </Card>
      </div>

      {/* Feedback Section */}
      <div className="space-y-2 w-full max-w-4xl mx-auto">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2 text-center">Feedback</h3>
        <Card className="rounded-3xl overflow-hidden border-slate-100 dark:border-slate-800 w-full shadow-md bg-white dark:bg-slate-900 p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <MessageSquare size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm">Send us your thoughts</h4>
              <p className="text-[10px] text-slate-400 font-medium">Your feedback helps us make StudySnap better.</p>
            </div>
          </div>
          
          <FeedbackForm profile={profile} />
        </Card>
      </div>
    </div>
  );
};

// ==========================================
// NEW COMPONENTS FOR PERFORMANCE & CALENDAR
// ==========================================

const CalendarView = ({ 
  config, 
  notes, 
  quizzes, 
  notices, 
  calendarEvents = [], 
  isAdmin = false, 
  onRefreshEvents = () => {} 
}: { 
  config: AppConfig, 
  notes: Note[], 
  quizzes: Quiz[], 
  notices: Notice[], 
  calendarEvents?: CalendarEvent[], 
  isAdmin?: boolean, 
  onRefreshEvents?: () => void 
}) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  
  // Event Add Form state
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState<'exam' | 'holiday' | 'class' | 'other'>('exam');
  const [eventDescription, setEventDescription] = useState('');
  const [submittingEvent, setSubmittingEvent] = useState(false);

  const examDate = config.countdownDate ? new Date(config.countdownDate) : null;

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleGoToToday = () => {
    const today = new Date();
    setViewDate(today);
    setSelectedDate(today);
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarCells: { date: Date; isCurrentMonth: boolean; isToday: boolean }[] = [];

  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarCells.push({
      date: new Date(year, month - 1, daysInPrevMonth - i),
      isCurrentMonth: false,
      isToday: false
    });
  }

  const todayDate = new Date();
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    const isToday = todayDate.getDate() === i && todayDate.getMonth() === month && todayDate.getFullYear() === year;
    calendarCells.push({
      date,
      isCurrentMonth: true,
      isToday
    });
  }

  const remainingCells = 42 - calendarCells.length;
  for (let i = 1; i <= remainingCells; i++) {
    calendarCells.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
      isToday: false
    });
  }

  const isSameDay = (d1: Date | null, d2: Date | null) => {
    if (!d1 || !d2) return false;
    return d1.getDate() === d2.getDate() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getFullYear() === d2.getFullYear();
  };

  const getEventsForDate = (date: Date) => {
    const events: { id?: string; type: 'exam' | 'quiz' | 'notice' | 'holiday' | 'class' | 'other'; title: string; description?: string; isCustom?: boolean }[] = [];

    if (examDate && isSameDay(date, examDate)) {
      events.push({
        type: 'exam',
        title: config.countdownMessage || 'Important Exam Countdown!'
      });
    }

    quizzes.forEach(q => {
      if (q.date) {
        const qDate = new Date(q.date);
        if (isSameDay(date, qDate)) {
          events.push({
            type: 'quiz',
            title: `Quiz available: ${q.question.substring(0, 35)}${q.question.length > 35 ? '...' : ''}`
          });
        }
      }
    });

    notices.forEach(n => {
      if (n.fromDate) {
        const fDate = new Date(n.fromDate);
        const tDate = n.toDate ? new Date(n.toDate) : fDate;
        const compareDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        const startOnly = new Date(fDate.getFullYear(), fDate.getMonth(), fDate.getDate()).getTime();
        const endOnly = new Date(tDate.getFullYear(), tDate.getMonth(), tDate.getDate()).getTime();
        if (compareDateOnly >= startOnly && compareDateOnly <= endOnly) {
          events.push({
            type: 'notice',
            title: `Notice active: ${n.subject}`
          });
        }
      }
    });

    // Custom calendar events
    calendarEvents.forEach(e => {
      if (e.date) {
        const [eYear, eMonth, eDay] = e.date.split('-').map(Number);
        const eDate = new Date(eYear, eMonth - 1, eDay);
        if (isSameDay(date, eDate)) {
          events.push({
            id: e.id,
            type: e.type,
            title: e.title,
            description: e.description,
            isCustom: true
          });
        }
      }
    });

    return events;
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const handleAddEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !selectedDate) return;

    try {
      setSubmittingEvent(true);
      const yyyy = selectedDate.getFullYear();
      const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const dd = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      await addDoc(collection(db, 'calendarEvents'), {
        title: eventTitle.trim(),
        date: dateStr,
        type: eventType,
        description: eventDescription.trim(),
        createdAt: new Date().toISOString()
      });

      toast.success("Event added successfully!");
      setEventTitle('');
      setEventDescription('');
      setIsAddEventOpen(false);
      onRefreshEvents();
    } catch (error: any) {
      toast.error("Failed to add event: " + (error.message || String(error)));
    } finally {
      setSubmittingEvent(false);
    }
  };

  const handleDeleteEvent = async (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      await deleteDoc(doc(db, 'calendarEvents', eventId));
      toast.success("Event deleted from calendar.");
      onRefreshEvents();
    } catch (error: any) {
      toast.error("Failed to delete event: " + (error.message || String(error)));
    }
  };

  return (
    <Card className="rounded-[2.5rem] bg-white dark:bg-slate-900 border-none shadow-lg p-6 sm:p-7 flex flex-col h-full min-h-[310px] relative overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
      <div className="flex justify-between items-center relative z-10 mb-3">
        <div>
          <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-widest leading-none mb-1.5 block">Academic Calendar</span>
          <h3 className="text-lg font-black text-slate-800 dark:text-white leading-none">
            {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
        </div>
        <div className="flex gap-1.5 items-center">
          <Button variant="ghost" size="icon" className="w-7 h-7 rounded-full text-slate-600 dark:text-slate-300" onClick={handlePrevMonth}>
            <ChevronLeft size={14} />
          </Button>
          <button 
            onClick={handleGoToToday} 
            className="text-[9px] font-black tracking-tight px-2.5 py-1 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
          >
            TODAY
          </button>
          
          {isAdmin && selectedDate && (
            <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
              <DialogTrigger 
                render={
                  <button 
                    className="text-[9px] font-black tracking-tight px-2.5 py-1 bg-amber-500 hover:bg-amber-600 transition-all rounded-full text-white flex items-center gap-1 shadow-sm"
                  >
                    <span>+ ADD EVENT</span>
                  </button>
                }
              />
              <DialogContent className="rounded-[2rem] bg-white dark:bg-slate-900 border-none">
                <DialogHeader>
                  <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">Add Academic Event</DialogTitle>
                  <DialogDescription className="text-xs text-slate-400 dark:text-slate-500">
                    Add custom event for <span className="font-extrabold text-blue-600 dark:text-blue-400">{selectedDate.toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>. All students will see this event.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddEventSubmit} className="space-y-4 pt-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Event Title</Label>
                    <Input 
                      value={eventTitle}
                      onChange={e => setEventTitle(e.target.value)}
                      placeholder="e.g. Physics Lab Submission"
                      className="rounded-2xl border-slate-200 dark:border-slate-800 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Event Type</Label>
                    <Select value={eventType} onValueChange={(val: any) => setEventType(val)}>
                      <SelectTrigger className="rounded-2xl border-slate-200 dark:border-slate-800">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="exam">🏆 Exam / Test</SelectItem>
                        <SelectItem value="holiday">🏝️ Holiday / Vacation</SelectItem>
                        <SelectItem value="class">📚 Special Class</SelectItem>
                        <SelectItem value="other">📌 Other Event</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Description (Optional)</Label>
                    <textarea 
                      value={eventDescription}
                      onChange={e => setEventDescription(e.target.value)}
                      placeholder="Enter details about this calendar event..."
                      rows={3}
                      className="w-full text-sm rounded-2xl p-3 border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <DialogFooter className="pt-2">
                    <DialogClose render={<Button type="button" variant="ghost" className="rounded-xl">Cancel</Button>} />
                    <Button 
                      type="submit" 
                      disabled={submittingEvent}
                      className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl"
                    >
                      {submittingEvent ? "Adding..." : "Save Event"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}

          <Button variant="ghost" size="icon" className="w-7 h-7 rounded-full text-slate-600 dark:text-slate-300" onClick={handleNextMonth}>
            <ChevronRight size={14} />
          </Button>
        </div>
      </div>

      <div className="relative z-10 flex-1 grid grid-cols-7 gap-1 text-center font-bold text-[11px] mb-3">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div key={day} className="text-slate-400 dark:text-slate-600 text-[9px] uppercase tracking-wider pb-1 self-center">
            {day}
          </div>
        ))}

        {calendarCells.map((cell, idx) => {
          const events = getEventsForDate(cell.date);
          const hasExam = events.some(e => e.type === 'exam');
          const hasQuiz = events.some(e => e.type === 'quiz');
          const hasNotice = events.some(e => e.type === 'notice');
          const hasHoliday = events.some(e => e.type === 'holiday');
          const hasClass = events.some(e => e.type === 'class');
          const hasOther = events.some(e => e.type === 'other');
          const isSelected = isSameDay(cell.date, selectedDate);

          return (
            <div
              key={idx}
              onClick={() => setSelectedDate(cell.date)}
              className={`
                relative h-8 rounded-xl flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-200
                ${cell.isCurrentMonth ? 'text-slate-700 dark:text-slate-200' : 'text-slate-300 dark:text-slate-700'}
                ${isSelected ? 'bg-blue-600 text-white font-black dark:text-white shadow-md' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}
                ${cell.isToday && !isSelected ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 font-black' : ''}
                ${hasExam ? 'ring-2 ring-red-400' : ''}
              `}
            >
              <span className="text-xs">{cell.date.getDate()}</span>
              
              <div className="flex gap-0.5 justify-center mt-0.5 absolute bottom-1">
                {hasExam && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-red-500 animate-pulse'}`} />
                )}
                {hasQuiz && (
                  <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-purple-500'}`} />
                )}
                {hasNotice && (
                  <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-cyan-500'}`} />
                )}
                {hasHoliday && (
                  <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
                )}
                {hasClass && (
                  <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />
                )}
                {hasOther && (
                  <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-slate-400'}`} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            key={selectedDate.toDateString()}
            className="relative z-10 p-4 bg-slate-50 dark:bg-slate-950/30 rounded-2xl border border-slate-100 dark:border-slate-800/50 flex flex-col min-h-[85px] justify-center"
          >
            <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2 leading-none">
              <span>{selectedDate.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
              <span>{selectedDateEvents.length} Event{selectedDateEvents.length === 1 ? '' : 's'}</span>
            </div>
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-2 overflow-y-auto max-h-[110px] pr-1">
                {selectedDateEvents.map((evt, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-2 text-xs py-1 border-b border-slate-100/50 dark:border-slate-800/50 last:border-0">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      {evt.type === 'exam' && <span className="p-0.5 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 rounded shrink-0">🏆</span>}
                      {evt.type === 'quiz' && <span className="p-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 rounded shrink-0">🧠</span>}
                      {evt.type === 'notice' && <span className="p-0.5 bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300 rounded shrink-0">📢</span>}
                      {evt.type === 'holiday' && <span className="p-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 rounded shrink-0">🏝️</span>}
                      {evt.type === 'class' && <span className="p-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded shrink-0">📚</span>}
                      {evt.type === 'other' && <span className="p-0.5 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded shrink-0">📌</span>}
                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-slate-800 dark:text-slate-200 leading-tight">{evt.title}</p>
                        {evt.description && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed font-medium">
                            {evt.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {evt.isCustom && isAdmin && evt.id && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-5 h-5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full shrink-0"
                        onClick={(e) => handleDeleteEvent(evt.id!, e)}
                      >
                        <Trash2 size={12} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] italic text-slate-400 dark:text-slate-500 mt-1 font-medium text-center">No academic events on this day.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-amber-50/50 dark:bg-amber-900/5 rounded-full blur-3xl pointer-events-none" />
    </Card>
  );
};
