import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  HelpCircle,
  Menu,
  MoreVertical,
  Plus,
  RotateCw,
  Search,
  Settings,
  Sparkles,
  Unlock,
  User,
  Calculator,
  GraduationCap,
  Download,
  Upload,
  Paperclip,
  Share2,
  Folder,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  Award,
  Layers,
  Inbox,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface LearningDisguiseViewProps {
  onUnlock: () => void;
  disguiseType?: 'classroom' | 'canvas' | 'desmos';
}

interface ClassItem {
  id: number;
  title: string;
  code: string;
  period: string;
  teacher: string;
  color: string;
  bannerGradient: string;
  grade: string;
  percentage: string;
  announcements: { id: number; author: string; time: string; text: string; files?: string[] }[];
  assignments: { id: number; title: string; due: string; points: string; status: 'due' | 'submitted' | 'graded'; score?: string; desc: string }[];
}

export const LearningDisguiseView: React.FC<LearningDisguiseViewProps> = ({
  onUnlock,
  disguiseType: initialDisguise = 'classroom',
}) => {
  // Current mode: Google Classroom, Canvas LMS, or Desmos Graphing Suite
  const [platform, setPlatform] = useState<'classroom' | 'canvas' | 'desmos'>(initialDisguise);
  const [activeTab, setActiveTab] = useState<'stream' | 'todo' | 'calculator' | 'grapher' | 'flashcards' | 'notes' | 'grades'>('stream');
  
  // Selected class for detailed view
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);
  const [completedTasks, setCompletedTasks] = useState<number[]>([1]);

  // Calculator & Grapher State
  const [calcInput, setCalcInput] = useState('0');
  const [graphEquation, setGraphEquation] = useState('sin(x)');
  const graphCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Flashcards state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Study Timer state
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  // Scratchpad Notes state
  const [studentNotes, setStudentNotes] = useState(() => {
    return localStorage.getItem('gam3_student_notes') || 
      'AP Calculus BC - Chapter 4 Notes:\n- Critical points occur where f\'(x) = 0 or is undefined.\n- Second derivative test: f\'\'(c) > 0 indicates local minimum, f\'\'(c) < 0 indicates local maximum.\n- Optimization setup: define objective function, constraint, substitute single variable, and find domain bounds.';
  });

  const flashcards = [
    { q: 'Derivative of sin(x)', a: 'cos(x)', topic: 'AP Calculus BC' },
    { q: 'Derivative of cos(x)', a: '-sin(x)', topic: 'AP Calculus BC' },
    { q: 'Derivative of ln(x)', a: '1/x', topic: 'AP Calculus BC' },
    { q: 'Integral of 1/x dx', a: 'ln|x| + C', topic: 'AP Calculus BC' },
    { q: 'Momentum formula', a: 'p = m · v', topic: 'AP Physics C' },
    { q: 'Kinetic energy formula', a: 'K = 1/2 · m · v²', topic: 'AP Physics C' },
    { q: 'Year of the Emancipation Proclamation', a: '1863', topic: 'US History' },
    { q: 'First Amendment Protections', a: 'Speech, Religion, Press, Assembly, Petition', topic: 'US History' },
  ];

  const classes: ClassItem[] = [
    {
      id: 1,
      title: 'AP Calculus BC',
      code: 'bc-302a',
      period: 'Period 2',
      teacher: 'Mr. David Harrison',
      color: '#0f766e',
      bannerGradient: 'from-emerald-700 via-teal-800 to-slate-900',
      grade: 'A',
      percentage: '96.4%',
      announcements: [
        {
          id: 101,
          author: 'Mr. Harrison',
          time: 'Yesterday at 2:15 PM',
          text: 'Reminder: Unit 4 Optimization Problem Set is due this Friday at 11:59 PM. Please make sure to verify critical points with both the 1st and 2nd derivative tests.',
          files: ['Unit4_Optimization_Worksheet.pdf', 'AnswerKey_OddProblems.pdf']
        },
        {
          id: 102,
          author: 'Mr. Harrison',
          time: 'Oct 8',
          text: 'Midterm exam solutions have been uploaded to the Class Drive folder. Review questions 14 and 19 before next week\'s quiz.',
        }
      ],
      assignments: [
        { id: 1, title: 'Optimization & Related Rates Problem Set #4', due: 'Friday, 11:59 PM', points: '100 points', status: 'due', desc: 'Complete problems 1-18 on pages 214-216. Show all algebraic derivative calculations and state units.' },
        { id: 2, title: 'Mean Value Theorem Lab Report', due: 'Completed', points: '50 points', status: 'graded', score: '50/50', desc: 'Verify continuity and differentiability on closed intervals [a, b].' },
        { id: 3, title: 'Limits & L\'Hôpital\'s Rule Mastery Check', due: 'Completed', points: '100 points', status: 'graded', score: '96/100', desc: 'Indeterminate forms 0/0 and inf/inf.' },
      ]
    },
    {
      id: 2,
      title: 'AP Physics C: Mechanics',
      code: 'phy-401c',
      period: 'Period 4',
      teacher: 'Dr. Katherine Mitchell',
      color: '#1d4ed8',
      bannerGradient: 'from-blue-700 via-indigo-800 to-slate-900',
      grade: 'A-',
      percentage: '92.8%',
      announcements: [
        {
          id: 201,
          author: 'Dr. Mitchell',
          time: 'Today at 8:45 AM',
          text: 'Lab groups: make sure your rotary motion sensors are calibrated before starting the moment of inertia lab stations.',
          files: ['Rotational_Dynamics_LabManual_v2.pdf']
        }
      ],
      assignments: [
        { id: 4, title: 'Rotational Inertia of Cylindrical Shells Lab', due: 'Tomorrow, 11:59 PM', points: '100 points', status: 'due', desc: 'Calculate experimental I values vs theoretical 1/2*M(R1^2 + R2^2).' },
        { id: 5, title: 'Conservation of Angular Momentum Homework', due: 'Completed', points: '40 points', status: 'graded', score: '38/40', desc: 'Collisions of rotating discs and non-zero torque integrals.' },
      ]
    },
    {
      id: 3,
      title: 'English Literature & Comp (AP)',
      code: 'lit-505e',
      period: 'Period 5',
      teacher: 'Mrs. Rebecca Jenkins',
      color: '#7e22ce',
      bannerGradient: 'from-purple-700 via-fuchsia-900 to-slate-900',
      grade: 'A',
      percentage: '97.2%',
      announcements: [
        {
          id: 301,
          author: 'Mrs. Jenkins',
          time: 'Oct 11',
          text: 'Please bring your annotations for The Great Gatsby chapters 5-7 to our Socratic seminar discussion tomorrow.',
        }
      ],
      assignments: [
        { id: 6, title: 'Synthesized Thesis & Outline: Modernist Symbolism', due: 'Oct 20', points: '100 points', status: 'due', desc: 'Draft a comparative analysis of Fitzgerald\'s green light and Gatsby\'s facade.' },
        { id: 7, title: 'Timed In-Class Prose Essay #2', due: 'Completed', points: '60 points', status: 'graded', score: '58/60', desc: 'AP 9-point rubric evaluation.' },
      ]
    },
    {
      id: 4,
      title: 'United States History (Honors)',
      code: 'ush-701h',
      period: 'Period 7',
      teacher: 'Mr. David Roberts',
      color: '#b45309',
      bannerGradient: 'from-amber-700 via-orange-800 to-slate-900',
      grade: 'A',
      percentage: '95.0%',
      announcements: [
        {
          id: 401,
          author: 'Mr. Roberts',
          time: 'Oct 9',
          text: 'DBQ primary document packets have been distributed. Remember to source at least 3 documents using HIPPO analysis.',
        }
      ],
      assignments: [
        { id: 8, title: 'Document-Based Question: Civil War Reconstruction', due: 'Oct 24', points: '100 points', status: 'due', desc: 'Analyze federal policies vs state legislation from 1865 to 1877.' },
        { id: 9, title: 'Manifest Destiny & Westward Expansion Quiz', due: 'Completed', points: '50 points', status: 'graded', score: '47/50', desc: 'Treaty of Guadalupe Hidalgo and annexation timeline.' },
      ]
    },
  ];

  // Global key listener for secret unlock (<Ctrl> + <Shift> + <U> or <`>)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'u') || e.key === '`') {
        onUnlock();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onUnlock]);

  // Pomodoro study timer countdown
  useEffect(() => {
    let interval: any;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds(s => s - 1), 1000);
    } else if (timerSeconds === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  // Interactive Graph Canvas Renderer
  useEffect(() => {
    if (activeTab !== 'grapher') return;
    const canvas = graphCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Background grid
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    const step = 40;
    const originX = w / 2;
    const originY = h / 2;

    for (let x = 0; x <= w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(w, originY);
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, h);
    ctx.stroke();

    // Plot Function Curve
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const scale = step; // pixels per unit
    let first = true;

    for (let px = 0; px <= w; px += 2) {
      const x = (px - originX) / scale;
      let y = 0;

      // Safe mathematical evaluation
      try {
        if (graphEquation.includes('sin')) y = Math.sin(x);
        else if (graphEquation.includes('cos')) y = Math.cos(x);
        else if (graphEquation.includes('x^2') || graphEquation.includes('x*x')) y = x * x;
        else if (graphEquation.includes('x^3')) y = x * x * x;
        else if (graphEquation.includes('sqrt')) y = Math.sqrt(Math.max(0, x));
        else if (graphEquation.includes('exp')) y = Math.exp(x * 0.5);
        else y = 2 * x + 1; // default linear
      } catch {
        y = 0;
      }

      const py = originY - y * scale;
      if (first) {
        ctx.moveTo(px, py);
        first = false;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();

    // Plot Origin Dot & Label
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(originX, originY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '11px sans-serif';
    ctx.fillText('(0,0)', originX + 6, originY + 14);
  }, [activeTab, graphEquation]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCalcBtn = (val: string) => {
    if (val === 'C') {
      setCalcInput('0');
    } else if (val === '=') {
      try {
        const sanitized = calcInput.replace(/[^0-9+\-*/.()]/g, '');
        // eslint-disable-next-line no-eval
        const res = Function(`'use strict'; return (${sanitized})`)();
        setCalcInput(String(res));
      } catch {
        setCalcInput('Error');
      }
    } else {
      setCalcInput(prev => (prev === '0' || prev === 'Error' ? val : prev + val));
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans flex flex-col select-none">
      {/* Top Header Disguise Bar */}
      <header className="h-16 px-4 sm:px-6 bg-white border-b border-[#e2e8f0] flex items-center justify-between shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => { setSelectedClass(null); setSelectedAssignment(null); }}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition"
            title="Main menu / Classes"
          >
            <Menu size={20} />
          </button>

          {/* Platform Branding Toggle */}
          <div className="flex items-center gap-2">
            {platform === 'classroom' && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#10a37f] flex items-center justify-center text-white font-bold shadow-sm">
                  <BookOpen size={18} />
                </div>
                <span className="text-xl font-medium tracking-tight text-gray-800">
                  Google <span className="font-semibold text-gray-900">Classroom</span>
                </span>
              </div>
            )}

            {platform === 'canvas' && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#e11d48] flex items-center justify-center text-white font-bold shadow-sm">
                  <GraduationCap size={20} />
                </div>
                <span className="text-xl font-bold tracking-tight text-gray-900">
                  Canvas <span className="text-xs font-normal text-gray-500 uppercase px-2 py-0.5 rounded bg-gray-100">Student</span>
                </span>
              </div>
            )}

            {platform === 'desmos' && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center text-white font-bold shadow-sm">
                  <Calculator size={18} />
                </div>
                <span className="text-xl font-bold tracking-tight text-gray-900">
                  Desmos <span className="text-xs font-normal text-blue-600">Graphing Calculator</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Center Disguise View Tabs */}
        <div className="hidden lg:flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-600">
          <button
            onClick={() => { setSelectedClass(null); setActiveTab('stream'); }}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'stream' && !selectedClass
                ? 'bg-white text-gray-900 shadow-sm'
                : 'hover:text-gray-900'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('todo')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'todo' ? 'bg-white text-gray-900 shadow-sm' : 'hover:text-gray-900'
            }`}
          >
            To-do Tasks
          </button>
          <button
            onClick={() => setActiveTab('grades')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'grades' ? 'bg-white text-gray-900 shadow-sm' : 'hover:text-gray-900'
            }`}
          >
            Grades & GPA
          </button>
          <button
            onClick={() => setActiveTab('grapher')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'grapher' ? 'bg-white text-gray-900 shadow-sm' : 'hover:text-gray-900'
            }`}
          >
            Graphing Suite
          </button>
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'flashcards' ? 'bg-white text-gray-900 shadow-sm' : 'hover:text-gray-900'
            }`}
          >
            Flashcards
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'notes' ? 'bg-white text-gray-900 shadow-sm' : 'hover:text-gray-900'
            }`}
          >
            Study Notes
          </button>
        </div>

        {/* Right Tools & Discreet Controls */}
        <div className="flex items-center gap-2">
          {/* Platform Switcher */}
          <div className="hidden sm:flex items-center bg-gray-100 p-0.5 rounded-lg text-[11px] font-medium text-gray-600">
            <button
              onClick={() => setPlatform('classroom')}
              className={`px-2 py-1 rounded transition ${
                platform === 'classroom' ? 'bg-white text-emerald-700 shadow-sm font-bold' : ''
              }`}
            >
              Classroom
            </button>
            <button
              onClick={() => setPlatform('canvas')}
              className={`px-2 py-1 rounded transition ${
                platform === 'canvas' ? 'bg-white text-rose-700 shadow-sm font-bold' : ''
              }`}
            >
              Canvas
            </button>
            <button
              onClick={() => { setPlatform('desmos'); setActiveTab('grapher'); }}
              className={`px-2 py-1 rounded transition ${
                platform === 'desmos' ? 'bg-white text-blue-700 shadow-sm font-bold' : ''
              }`}
            >
              Desmos
            </button>
          </div>

          {/* Reload / Secret Unlock Button */}
          <button
            onClick={onUnlock}
            title="Reload or click to enter gam-3 (or press Ctrl+Shift+U)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition"
          >
            <RotateCw size={13} />
            <span className="hidden sm:inline">Reload to Unlock</span>
          </button>

          {/* Student Profile Avatar */}
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
            FG
          </div>
        </div>
      </header>

      {/* Main Body Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* SUB-VIEW 1: CLASSROOM DASHBOARD / CLASS CARDS */}
        {!selectedClass && activeTab === 'stream' && (
          <div>
            {/* Announcements Banner */}
            <div className="bg-white rounded-2xl p-5 border border-[#e2e8f0] shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                    Spring Term Semester 2 Active (Quarter 4)
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    District student attendance verified • 4 courses enrolled • Current Term GPA: 3.92 Unweighted
                  </p>
                </div>
              </div>

              {/* Study Pomodoro Clock Widget */}
              <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 shrink-0">
                <Clock size={16} className="text-blue-600" />
                <span className="font-mono text-sm font-bold text-gray-800">
                  {formatTimer(timerSeconds)}
                </span>
                <button
                  onClick={() => setTimerRunning(r => !r)}
                  className="p-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-xs"
                >
                  {timerRunning ? <Pause size={12} /> : <Play size={12} />}
                </button>
                <button
                  onClick={() => { setTimerRunning(false); setTimerSeconds(25 * 60); }}
                  className="p-1 rounded-md bg-gray-200 text-gray-600 hover:bg-gray-300 text-xs"
                >
                  <RotateCcw size={12} />
                </button>
              </div>
            </div>

            {/* Grid of Course Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  onClick={() => setSelectedClass(cls)}
                  className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm hover:shadow-md transition overflow-hidden flex flex-col group cursor-pointer"
                >
                  {/* Card Banner */}
                  <div className={`p-4 bg-gradient-to-r ${cls.bannerGradient} text-white relative`}>
                    <div className="flex items-start justify-between">
                      <h2 className="font-bold text-base leading-snug group-hover:underline">
                        {cls.title}
                      </h2>
                      <button className="text-white/80 hover:text-white p-0.5">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                    <div className="text-xs text-white/90 mt-1">{cls.period} • {cls.teacher}</div>
                    
                    {/* Grade Badge */}
                    <div className="absolute right-4 -bottom-4 px-2.5 py-1 rounded-lg bg-white text-gray-900 font-bold text-xs shadow-md border border-gray-100 flex items-center gap-1">
                      <span className="text-emerald-600">{cls.grade}</span>
                      <span className="text-gray-400 font-normal">({cls.percentage})</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 pt-6 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Next Assignment Due
                      </span>
                      <p className="text-xs font-medium text-gray-800 mt-1 line-clamp-2">
                        {cls.assignments[0]?.title || 'No upcoming work'}
                      </p>
                      <div className="text-[11px] text-blue-600 mt-0.5">
                        {cls.assignments[0]?.due}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Folder size={13} /> Class Drive
                      </span>
                      <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition flex items-center gap-0.5">
                        Open Course <ChevronRight size={13} />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB-VIEW 2: SPECIFIC CLASS STREAM & ASSIGNMENTS */}
        {selectedClass && (
          <div>
            {/* Back Button */}
            <button
              onClick={() => { setSelectedClass(null); setSelectedAssignment(null); }}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 mb-4 transition"
            >
              <ArrowLeft size={14} /> Back to All Classes
            </button>

            {/* Course Banner */}
            <div className={`p-6 sm:p-8 rounded-2xl bg-gradient-to-r ${selectedClass.bannerGradient} text-white shadow-md mb-6 relative overflow-hidden`}>
              <div className="max-w-xl">
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-200">
                  {selectedClass.period} • Section {selectedClass.code}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
                  {selectedClass.title}
                </h1>
                <p className="text-sm text-white/90 mt-1">Instructor: {selectedClass.teacher}</p>
              </div>

              <div className="absolute right-6 bottom-6 hidden sm:flex items-center gap-2 bg-black/30 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-xs">
                <span>Current Grade:</span>
                <span className="font-bold text-emerald-300">{selectedClass.grade} ({selectedClass.percentage})</span>
              </div>
            </div>

            {/* Class Stream & Work Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Upcoming Work Box */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Upcoming Work
                  </h3>
                  <div className="space-y-3">
                    {selectedClass.assignments.filter(a => a.status === 'due').map(a => (
                      <div
                        key={a.id}
                        onClick={() => setSelectedAssignment(a)}
                        className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition cursor-pointer border border-gray-100"
                      >
                        <div className="text-xs font-bold text-gray-900">{a.title}</div>
                        <div className="text-[11px] text-blue-600 mt-0.5">{a.due}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm text-xs text-gray-500">
                  <div className="font-bold text-gray-700 mb-1">Class Code</div>
                  <div className="font-mono text-sm font-semibold text-blue-600 select-all">{selectedClass.code}</div>
                  <p className="text-[11px] mt-1 text-gray-400">Share with guardians or counselors</p>
                </div>
              </div>

              {/* Right Columns: Stream Feed & Announcements */}
              <div className="lg:col-span-2 space-y-4">
                {/* Share with your class input */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                    FG
                  </div>
                  <input
                    type="text"
                    placeholder="Announce something to your class..."
                    className="flex-1 bg-gray-50 hover:bg-gray-100 rounded-xl px-4 py-2 text-xs text-gray-700 outline-none border border-transparent focus:border-blue-500 transition"
                  />
                </div>

                {/* Announcement Cards */}
                {selectedClass.announcements.map(ann => (
                  <div key={ann.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center text-xs">
                        {ann.author[0]}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900">{ann.author}</div>
                        <div className="text-[10px] text-gray-400">{ann.time}</div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed">{ann.text}</p>

                    {ann.files && ann.files.length > 0 && (
                      <div className="pt-2 border-t border-gray-100 space-y-2">
                        {ann.files.map(f => (
                          <div key={f} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs">
                            <span className="flex items-center gap-2 font-medium text-gray-800">
                              <FileText size={14} className="text-red-500" /> {f}
                            </span>
                            <button className="text-blue-600 hover:underline flex items-center gap-1 text-[11px]">
                              <Download size={12} /> View
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUB-VIEW 3: GRADES & GPA SUMMARY */}
        {activeTab === 'grades' && (
          <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Award size={20} className="text-emerald-600" /> Official Academic Transcript
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Spring Term 2026 • District Cumulative GPA: <strong className="text-gray-900 font-bold">3.94</strong>
                </p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs">
                  Honor Roll Status: High Honors
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {classes.map(cls => (
                <div key={cls.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">{cls.title}</h3>
                    <p className="text-xs text-gray-500">{cls.teacher} • {cls.period}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xs text-gray-400">Score</div>
                      <div className="font-bold text-gray-800 text-sm">{cls.percentage}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center font-extrabold text-base text-emerald-600 shadow-sm">
                      {cls.grade}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB-VIEW 4: INTERACTIVE DESMOS FUNCTION GRAPHER */}
        {activeTab === 'grapher' && (
          <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-200 p-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Calculator size={18} className="text-blue-600" /> Desmos Interactive Function Grapher
                </h2>
                <p className="text-xs text-gray-500">Plot real continuous mathematical functions on the cartesian plane.</p>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 text-xs">
                {['sin(x)', 'cos(x)', 'x^2', 'sqrt(x)', 'exp(x)'].map(eq => (
                  <button
                    key={eq}
                    onClick={() => setGraphEquation(eq)}
                    className={`px-2.5 py-1 rounded-lg border transition font-mono ${
                      graphEquation === eq
                        ? 'bg-blue-600 text-white border-blue-600 font-bold'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                    }`}
                  >
                    y = {eq}
                  </button>
                ))}
              </div>
            </div>

            {/* Equation Input Bar */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 border border-gray-300 font-mono text-sm mb-4">
              <span className="font-bold text-blue-600">f(x) =</span>
              <input
                type="text"
                value={graphEquation}
                onChange={(e) => setGraphEquation(e.target.value)}
                placeholder="sin(x), cos(x), x^2, sqrt(x)..."
                className="flex-1 bg-transparent text-gray-900 outline-none"
              />
            </div>

            {/* Canvas Plot */}
            <div className="w-full aspect-[16/9] rounded-xl overflow-hidden border border-gray-300 bg-white shadow-inner">
              <canvas
                ref={graphCanvasRef}
                width={800}
                height={450}
                className="w-full h-full block"
              />
            </div>
          </div>
        )}

        {/* SUB-VIEW 5: STUDY FLASHCARD DECK */}
        {activeTab === 'flashcards' && (
          <div className="max-w-xl mx-auto flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-4 text-xs text-gray-500">
              <span>Topic: <strong>{flashcards[cardIndex].topic}</strong></span>
              <span>Card {cardIndex + 1} of {flashcards.length}</span>
            </div>

            {/* 3D Flip Flashcard */}
            <div
              onClick={() => setIsFlipped(f => !f)}
              className="w-full h-64 rounded-2xl bg-white border-2 border-gray-200 shadow-md p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 transition select-none"
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 mb-2">
                {isFlipped ? 'Answer' : 'Question (Click to reveal)'}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
                {isFlipped ? flashcards[cardIndex].a : flashcards[cardIndex].q}
              </h2>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 mt-5">
              <button
                onClick={() => { setCardIndex(i => Math.max(0, i - 1)); setIsFlipped(false); }}
                disabled={cardIndex === 0}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700 text-xs font-semibold transition"
              >
                Previous
              </button>
              <button
                onClick={() => setIsFlipped(f => !f)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow"
              >
                Flip Card
              </button>
              <button
                onClick={() => { setCardIndex(i => Math.min(flashcards.length - 1, i + 1)); setIsFlipped(false); }}
                disabled={cardIndex === flashcards.length - 1}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700 text-xs font-semibold transition"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* SUB-VIEW 6: STUDENT DIGITAL NOTES */}
        {activeTab === 'notes' && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <FileText size={18} className="text-teal-600" /> Digital Student Study Notebook
              </h2>
              <span className="text-[11px] text-gray-400">Auto-saves to browser storage</span>
            </div>

            <textarea
              value={studentNotes}
              onChange={(e) => {
                setStudentNotes(e.target.value);
                localStorage.setItem('gam3_student_notes', e.target.value);
              }}
              rows={12}
              className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 text-xs sm:text-sm font-mono leading-relaxed outline-none focus:border-teal-500 transition"
              placeholder="Type your lecture notes, formula sheets, or homework outlines here..."
            />
          </div>
        )}

        {/* SUB-VIEW 7: TO-DO HOMEWORK CHECKLIST */}
        {activeTab === 'todo' && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <CheckCircle className="text-emerald-600" size={20} />
              Assigned Homework & Quizzes
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              Track upcoming submissions and study tasks across all active periods.
            </p>

            <div className="space-y-3">
              {[
                { id: 1, title: 'Calculus BC: Optimization & Related Rates #4', class: 'AP Calculus BC', due: 'Friday, 11:59 PM' },
                { id: 2, title: 'Physics C Mechanics: Angular Momentum Lab', class: 'AP Physics C', due: 'Tomorrow' },
                { id: 3, title: 'English Lit: The Great Gatsby Analysis Draft', class: 'English Literature', due: 'Oct 18' },
                { id: 4, title: 'History DBQ: Industrial Revolution Document Set', class: 'US History Honors', due: 'Oct 22' },
              ].map((task) => {
                const isDone = completedTasks.includes(task.id);
                return (
                  <div
                    key={task.id}
                    onClick={() => setCompletedTasks(prev => prev.includes(task.id) ? prev.filter(t => t !== task.id) : [...prev, task.id])}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer ${
                      isDone
                        ? 'bg-gray-50 border-gray-200 text-gray-400'
                        : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-800 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                      />
                      <div>
                        <div className={`text-sm font-medium ${isDone ? 'line-through' : ''}`}>
                          {task.title}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {task.class} • <span className="text-blue-600">{task.due}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Discrete Bottom Footer */}
      <footer className="py-3 px-6 text-center text-xs text-gray-400 border-t border-gray-200 bg-white flex items-center justify-between">
        <span className="select-text">Google Classroom / District LMS • Connected to Student Information System</span>
        <button
          onClick={onUnlock}
          className="text-gray-400 hover:text-gray-600 transition flex items-center gap-1 text-xs"
          title="Return to gam-3 (or press Ctrl+Shift+U)"
        >
          <Unlock size={12} /> Unlock
        </button>
      </footer>
    </div>
  );
};
