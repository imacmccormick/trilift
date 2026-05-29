import React, { useState, useEffect, useRef } from 'react';
import type { WorkoutSession, WorkoutExercise, SetLog, Exercise, UserSettings } from '../../types';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { ExerciseSwapModal } from './ExerciseSwapModal';
import { ExerciseAddModal } from './ExerciseAddModal';
import { 
  CheckCircle, RefreshCw, Plus, Minus, Check, Clock, 
  MessageSquare, ArrowLeft, MoreVertical, Trash2
} from 'lucide-react';

interface ActiveWorkoutViewProps {
  activeWorkout: WorkoutSession;
  settings: UserSettings;
  onLogSet: (exerciseId: string, setId: string, reps: number, weight: number, completed: boolean) => void;
  onUpdateNotes: (exerciseId: string, notes: string) => void;
  onSwapExercise: (exerciseId: string, newExercise: Exercise) => void;
  onDeleteExercise: (exerciseId: string) => void;
  onAddExercise: (newExercise: Exercise) => void;
  onFinishWorkout: (notes?: string) => void;
  onCancelWorkout: () => void;
}

export const ActiveWorkoutView: React.FC<ActiveWorkoutViewProps> = ({
  activeWorkout,
  settings,
  onLogSet,
  onUpdateNotes,
  onSwapExercise,
  onDeleteExercise,
  onAddExercise,
  onFinishWorkout,
  onCancelWorkout
}) => {
  // Modal states
  const [selectedDetailExercise, setSelectedDetailExercise] = useState<Exercise | null>(null);
  const [selectedSwapExercise, setSelectedSwapExercise] = useState<WorkoutExercise | null>(null);
  const [activeMenuExerciseId, setActiveMenuExerciseId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [workoutNotes, setWorkoutNotes] = useState('');

  // UI state
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [activeImageIndexes, setActiveImageIndexes] = useState<Record<string, number>>({});

  // Timer states
  const timerDuration = 90; // default rest 90s
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerMinimized, setTimerMinimized] = useState(false);
  
  const timerIntervalRef = useRef<any>(null);

  // Synthesize beep using Web Audio API
  const playBeep = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      
      // Play a triple quick pulse for standard workout buzzer
      const playPulse = (startTime: number, freq: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        
        gain.gain.setValueAtTime(0.08, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration - 0.05);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = audioCtx.currentTime;
      playPulse(now, 880, 0.15);
      playPulse(now + 0.2, 880, 0.15);
      playPulse(now + 0.4, 1200, 0.3);
    } catch (e) {
      console.warn("Web Audio API sound blocked or failed:", e);
    }
  };

  // Timer Tick effect
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerIntervalRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      playBeep();
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]); // double buzz on mobile
      }
    }

    return () => {
      if (timerIntervalRef.current) clearTimeout(timerIntervalRef.current);
    };
  }, [timeLeft, timerActive]);

  // Start rest timer helper
  const triggerRestTimer = () => {
    setTimeLeft(timerDuration);
    setTimerActive(true);
    setTimerMinimized(false);
  };

  const handleSetToggle = (exerciseId: string, set: SetLog) => {
    const nextCompleted = !set.completed;
    onLogSet(exerciseId, set.id, set.reps, set.weight, nextCompleted);

    // If marked completed, trigger rest timer
    if (nextCompleted) {
      triggerRestTimer();
    }
  };

  const adjustSetRep = (exerciseId: string, set: SetLog, change: number) => {
    const newReps = Math.max(1, set.reps + change);
    onLogSet(exerciseId, set.id, newReps, set.weight, set.completed);
  };

  const adjustSetWeight = (exerciseId: string, set: SetLog, change: number) => {
    const newWeight = Math.max(0, set.weight + change);
    onLogSet(exerciseId, set.id, set.reps, newWeight, set.completed);
  };

  // Calculate stats
  const completedSetsCount = activeWorkout.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter(s => s.completed).length,
    0
  );
  const totalSetsCount = activeWorkout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const progressPercent = totalSetsCount > 0 ? Math.round((completedSetsCount / totalSetsCount) * 100) : 0;

  return (
    <div className="space-y-6 pb-24">
      {/* Top Banner Status */}
      <div className="flex items-center justify-between bg-charcoal-900 border border-white/5 rounded-2xl p-4 glass-panel">
        <div>
          <span className="px-2 py-0.5 rounded bg-neon-purple/20 text-neon-purple font-bold text-xs uppercase tracking-wider">
            Active Session
          </span>
          <h2 className="text-xl font-extrabold font-heading text-white mt-1">
            {activeWorkout.type} Workout
          </h2>
        </div>

        {/* Workout Progress Bar */}
        <div className="text-right">
          <p className="text-xs text-zinc-400 font-medium">Sets Logged</p>
          <p className="text-sm font-bold text-neon-teal mt-0.5">
            {completedSetsCount} / {totalSetsCount} ({progressPercent}%)
          </p>
        </div>
      </div>

      {/* Progress Track line */}
      <div className="w-full bg-charcoal-800 rounded-full h-1.5 overflow-hidden border border-white/5">
        <div 
          className="bg-gradient-to-r from-neon-purple to-neon-teal h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>



      {/* 2. Exercises List */}
      <div className="space-y-4">
        {activeWorkout.exercises.map((ex, exIdx) => {
          const isExpanded = expandedExerciseId === ex.id;
          const imageBaseUrl = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
          const imageUrls = ex.images && ex.images.length > 0
            ? ex.images.map(img => `${imageBaseUrl}${img}`)
            : [];

          return (
            <div 
              key={ex.id}
              className={`rounded-2xl border transition-all duration-300 ${
                ex.completed 
                  ? 'bg-emerald-950/10 border-emerald-500/20' 
                  : 'bg-charcoal-900 border-white/5 glass-panel'
              }`}
            >
              {/* Exercise Header */}
              <div className="p-4 flex items-center justify-between gap-3.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-zinc-500 font-bold font-mono">
                      #{exIdx + 1}
                    </span>
                    <h3 
                      onClick={() => setSelectedDetailExercise(ex)}
                      className="text-base font-bold text-white truncate font-heading cursor-pointer hover:text-neon-teal hover:underline transition-colors"
                    >
                      {ex.name}
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400 capitalize mt-0.5 truncate">
                    {ex.primaryMuscles[0]} • {ex.equipment || 'bodyweight'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button 
                      onClick={() => setActiveMenuExerciseId(activeMenuExerciseId === ex.id ? null : ex.id)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                      title="Exercise options"
                    >
                      <MoreVertical className="w-4 h-4 text-zinc-400" />
                    </button>
                    
                    {activeMenuExerciseId === ex.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setActiveMenuExerciseId(null)}
                        />
                        <div className="absolute right-0 top-11 w-36 rounded-xl bg-charcoal-900 border border-white/10 shadow-xl z-20 p-1 flex flex-col glass-panel animate-in fade-in-50 zoom-in-95 duration-100">
                          <button
                            onClick={() => {
                              setSelectedSwapExercise(ex);
                              setActiveMenuExerciseId(null);
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg text-left transition-colors w-full"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-neon-teal" />
                            <span>Swap</span>
                          </button>
                          <button
                            onClick={() => {
                              onDeleteExercise(ex.id);
                              setActiveMenuExerciseId(null);
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg text-left transition-colors w-full"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Single Image Carousel (Tap to Cycle) */}
              {imageUrls.length > 0 && (() => {
                const currentImgIdx = activeImageIndexes[ex.id] || 0;
                return (
                  <div className="px-4 pb-4">
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        const nextIdx = (currentImgIdx + 1) % imageUrls.length;
                        setActiveImageIndexes(prev => ({ ...prev, [ex.id]: nextIdx }));
                      }}
                      className="relative h-48 sm:h-64 rounded-2xl overflow-hidden bg-black/40 border border-white/5 flex items-center justify-center cursor-pointer hover:border-neon-teal/30 group transition-all"
                    >
                      <img 
                        src={imageUrls[currentImgIdx]} 
                        alt={`${ex.name} step ${currentImgIdx + 1}`}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLElement).parentElement!.style.display = 'none';
                        }}
                      />
                      
                      {/* Image indicator dots overlay */}
                      {imageUrls.length > 1 && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/60 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-sm">
                          {imageUrls.map((_, idx) => (
                            <div 
                              key={idx}
                              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                idx === currentImgIdx ? 'bg-neon-teal scale-110' : 'bg-zinc-600'
                              }`}
                            />
                          ))}
                        </div>
                      )}

                      {/* Instruction Step Info Overlay */}
                      <div className="absolute top-3 right-3 bg-black/60 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold text-zinc-400 border border-white/10 backdrop-blur-sm">
                        Step {currentImgIdx + 1} of {imageUrls.length}
                      </div>
                    </div>
                  </div>
                );
              })()}               {/* Set Tracking Table */}
              <div className="px-4 pb-4 overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[320px]">
                  <thead>
                    <tr className="border-b border-white/5 text-zinc-500 font-bold uppercase tracking-wider">
                      <th className="py-2 w-12 text-center">Set</th>
                      <th className="py-2 w-32 text-center">Weight (lbs)</th>
                      <th className="py-2 w-28 text-center">Reps</th>
                      <th className="py-2 w-12 text-center">Done</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {ex.sets.map((set, setIdx) => (
                      <tr 
                        key={set.id} 
                        className={`transition-colors ${
                          set.completed ? 'bg-emerald-950/20' : ''
                        }`}
                      >
                        {/* Set index */}
                        <td className="py-3 font-semibold text-zinc-400 text-center font-mono">
                          {setIdx + 1}
                        </td>
 
                        {/* Weight log input with increments */}
                        <td className="py-2">
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              onClick={() => adjustSetWeight(ex.id, set, -2.5)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 text-zinc-300 font-bold text-xs"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input 
                              type="number" 
                              value={set.weight || ''}
                              placeholder={set.previousWeight !== undefined ? String(set.previousWeight) : '--'}
                              onChange={(e) => onLogSet(ex.id, set.id, set.reps, parseFloat(e.target.value) || 0, set.completed)}
                              className="w-14 text-center py-1 bg-charcoal-950 border border-white/5 rounded-md text-white font-bold font-mono focus:outline-none focus:border-neon-teal/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button 
                              onClick={() => adjustSetWeight(ex.id, set, 2.5)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 text-zinc-300 font-bold text-xs"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
 
                        {/* Reps log input with increments */}
                        <td className="py-2">
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              onClick={() => adjustSetRep(ex.id, set, -1)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 text-zinc-300 font-bold text-xs"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input 
                              type="number" 
                              value={set.reps || ''}
                              placeholder={set.previousReps !== undefined ? String(set.previousReps) : '--'}
                              onChange={(e) => onLogSet(ex.id, set.id, parseInt(e.target.value) || 0, set.weight, set.completed)}
                              className="w-10 text-center py-1 bg-charcoal-950 border border-white/5 rounded-md text-white font-bold font-mono focus:outline-none focus:border-neon-teal/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button 
                              onClick={() => adjustSetRep(ex.id, set, 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 text-zinc-300 font-bold text-xs"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        {/* Completion Checkbox */}
                        <td className="py-2 text-center">
                          <button
                            onClick={() => handleSetToggle(ex.id, set)}
                            className={`w-6 h-6 rounded-md border flex items-center justify-center mx-auto transition-all ${
                              set.completed
                                ? 'bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                                : 'border-white/20 hover:border-white/40 text-transparent'
                            }`}
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Collapsible notes trigger */}
              <div className="px-4 pb-4 flex items-center justify-between border-t border-white/5 pt-3">
                <button
                  onClick={() => setExpandedExerciseId(isExpanded ? null : ex.id)}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 hover:text-white uppercase transition-colors"
                >
                  <MessageSquare className="w-3 h-3" />
                  {ex.notes ? 'Edit Exercise Notes' : 'Add Notes'}
                </button>
                {ex.notes && (
                  <span className="text-[10px] text-zinc-500 italic max-w-[200px] truncate">
                    "{ex.notes}"
                  </span>
                )}
              </div>

              {/* Notes Input Field */}
              {isExpanded && (
                <div className="px-4 pb-4">
                  <textarea
                    rows={2}
                    placeholder="E.g., felt light, bar path felt good, slight shoulder tweak..."
                    value={ex.notes || ''}
                    onChange={(e) => onUpdateNotes(ex.id, e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-charcoal-950 border border-white/5 focus:border-neon-purple/50 text-white placeholder-zinc-500 focus:outline-none transition-colors"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Exercise Button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-charcoal-900 border border-white/5 hover:border-neon-teal/30 hover:bg-white/5 text-zinc-300 hover:text-white text-xs font-bold transition-all glass-panel"
        >
          <Plus className="w-4 h-4 text-neon-teal" />
          <span>Add Exercise</span>
        </button>
      </div>

      {/* 3. Action Drawer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-charcoal-900/90 backdrop-blur-md border-t border-white/10 flex items-center justify-between gap-4 z-30 max-w-lg mx-auto rounded-t-2xl shadow-xl">
        <button
          onClick={onCancelWorkout}
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Minimalized Timer Trigger */}
        {timerActive && (
          <button 
            onClick={() => setTimerMinimized(false)}
            className="flex items-center gap-2 bg-charcoal-950 border border-white/5 px-3 py-1.5 rounded-full text-xs font-bold text-neon-teal font-mono hover:border-neon-teal/30 transition-colors animate-pulse"
          >
            <Clock className="w-3.5 h-3.5" />
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </button>
        )}

        <button
          onClick={() => setShowFinishConfirm(true)}
          className="flex-1 py-2.5 rounded-xl bg-neon-purple text-white text-xs font-bold hover:bg-purple-600 transition-colors shadow-lg shadow-neon-purple/20 flex items-center justify-center gap-1.5"
        >
          <CheckCircle className="w-4 h-4" />
          Finish Workout
        </button>
      </div>

      {/* 4. Rest Timer Overlay Modal */}
      {timerActive && !timerMinimized && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setTimerMinimized(true)} />
          
          <div className="relative w-full max-w-sm rounded-2xl glass-panel border border-white/10 p-6 z-10 shadow-2xl flex flex-col items-center justify-center space-y-6 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
            <h3 className="text-sm font-bold font-heading text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-neon-teal" />
              Rest Interval
            </h3>
            
            {/* Huge Clock Digit */}
            <div className="text-6xl font-black text-white font-mono tracking-tight drop-shadow-md select-none">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>

            {/* Adjust rest timer */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setTimeLeft(prev => Math.max(10, prev - 15))}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-zinc-300 font-bold"
              >
                -15s
              </button>
              <button 
                onClick={() => setTimeLeft(prev => prev + 30)}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-zinc-300 font-bold"
              >
                +30s
              </button>
            </div>

            <div className="w-full bg-zinc-800 rounded-full h-1">
              <div 
                className="bg-neon-teal h-full transition-all duration-1000"
                style={{ width: `${(timeLeft / timerDuration) * 100}%` }}
              />
            </div>

            {/* Timer Controls */}
            <div className="flex w-full gap-3 pt-2">
              <button
                onClick={() => setTimerMinimized(true)}
                className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 transition-colors"
              >
                Minimize
              </button>
              <button
                onClick={() => {
                  setTimerActive(false);
                  setTimeLeft(0);
                }}
                className="flex-1 py-2 rounded-xl bg-rose-500/20 text-rose-500 hover:bg-rose-500/30 text-xs font-bold transition-colors"
              >
                Skip Rest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Finish Confirmation Modal */}
      {showFinishConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setShowFinishConfirm(false)} />
          
          <div className="relative w-full max-w-sm rounded-2xl glass-panel border border-white/10 p-5 z-10 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold font-heading text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-neon-purple" />
              Complete Workout?
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Awesome effort! Add any workout notes below (e.g. general energy level, hydration) to log your progress into history.
            </p>

            <textarea
              rows={3}
              placeholder="Workout session notes..."
              value={workoutNotes}
              onChange={(e) => setWorkoutNotes(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl bg-charcoal-950 border border-white/5 focus:border-neon-purple/50 text-white placeholder-zinc-500 focus:outline-none transition-colors"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => {
                  onFinishWorkout(workoutNotes);
                  setShowFinishConfirm(false);
                }}
                className="flex-1 py-2 rounded-xl bg-neon-purple text-white text-xs font-bold hover:bg-purple-600 transition-colors shadow-lg shadow-neon-purple/20"
              >
                Log Workout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail and Swap modals */}
      <ExerciseDetailModal 
        exercise={selectedDetailExercise}
        isOpen={selectedDetailExercise !== null}
        onClose={() => setSelectedDetailExercise(null)}
      />

      <ExerciseSwapModal 
        exercise={selectedSwapExercise}
        settings={settings}
        isOpen={selectedSwapExercise !== null}
        onClose={() => setSelectedSwapExercise(null)}
        onSwap={onSwapExercise}
        onPreview={(ex) => setSelectedDetailExercise(ex)}
      />

      <ExerciseAddModal
        workoutType={activeWorkout.type}
        settings={settings}
        currentExercises={activeWorkout.exercises}
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={onAddExercise}
        onPreview={(ex) => setSelectedDetailExercise(ex)}
      />
    </div>
  );
};
