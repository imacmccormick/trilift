import React from 'react';
import type { WeeklyPlan, WorkoutSession, UserSettings } from '../../types';
import { getMondayOfCurrentWeek, formatMonthDay } from '../../utils/dateUtils';
import { 
  Flame, CheckCircle, Clock, Play, 
  ChevronRight, Calendar, Award 
} from 'lucide-react';

interface WeeklyDashboardProps {
  currentPlan: WeeklyPlan | null;
  settings: UserSettings;
  streak: number;
  totalWorkouts: number;
  onStartWorkout: (workoutId: string) => void;
}

export const WeeklyDashboard: React.FC<WeeklyDashboardProps> = ({
  currentPlan,
  settings,
  streak,
  totalWorkouts,
  onStartWorkout
}) => {
  if (!currentPlan) return null;

  const monday = getMondayOfCurrentWeek();
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  // Statistics calculation
  const coreWorkouts = currentPlan.workouts.filter(w => w.type !== 'Full Body');
  const coreCompletedCount = coreWorkouts.filter(w => w.isCompleted).length;
  const coreTotalCount = coreWorkouts.length;

  const fullBodyWorkout = currentPlan.workouts.find(w => w.type === 'Full Body');
  const fullBodyCompleted = fullBodyWorkout?.isCompleted || false;

  return (
    <div className="space-y-6">
      
      {/* 1. Date and Week Header */}
      <div className="space-y-4">
        <div>
          <span className="text-xs text-neon-teal font-bold uppercase tracking-wider font-heading">
            Weekly Cycle
          </span>
          <h2 className="text-2xl font-black text-white font-heading mt-0.5">
            This Week's Plan
          </h2>
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs mt-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {formatMonthDay(monday)} – {formatMonthDay(sunday)}
            </span>
          </div>
        </div>

        {/* Streak and Total Logged indicators */}
        <div className="flex gap-3">
          <div className="flex-1 bg-charcoal-900 border border-white/5 py-2 px-3.5 rounded-2xl flex items-center gap-2.5 glass-panel">
            <div className="p-1.5 rounded-lg bg-orange-500/10">
              <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 font-bold uppercase">Streak</p>
              <p className="text-sm font-bold text-white font-mono">{streak} weeks</p>
            </div>
          </div>

          <div className="flex-1 bg-charcoal-900 border border-white/5 py-2 px-3.5 rounded-2xl flex items-center gap-2.5 glass-panel">
            <div className="p-1.5 rounded-lg bg-neon-purple/10">
              <Award className="w-5 h-5 text-neon-purple" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 font-bold uppercase">Total Workouts</p>
              <p className="text-sm font-bold text-white font-mono">{totalWorkouts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Core Weekly Workouts Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
            Core Routine
          </h3>
          <span className="text-[10px] text-neon-teal font-mono font-bold">
            {coreCompletedCount} of {coreTotalCount} Completed
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {coreWorkouts.map((workout) => (
            <WorkoutCard 
              key={workout.id}
              workout={workout}
              settings={settings}
              onStart={onStartWorkout}
            />
          ))}
        </div>
      </div>

      {/* 4. Optional Workouts Section */}
      {settings.enableFullBody && fullBodyWorkout && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Optional Challenge
            </h3>
            <span className="text-[10px] text-zinc-400 font-mono font-bold">
              {fullBodyCompleted ? 'Completed' : 'Pending'}
            </span>
          </div>

          <div>
            <WorkoutCard 
              workout={fullBodyWorkout}
              settings={settings}
              onStart={onStartWorkout}
            />
          </div>
        </div>
      )}
    </div>
  );
};

/* --- Internal WorkoutCard Helper Component --- */
interface WorkoutCardProps {
  workout: WorkoutSession;
  settings: UserSettings;
  onStart: (id: string) => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({
  workout,
  settings,
  onStart
}) => {
  // Collect target muscles
  const muscleTargets = Array.from(new Set(
    workout.exercises.map(ex => ex.primaryMuscles[0])
  ));

  const isStarted = workout.startedAt !== null;
  const isCompleted = workout.isCompleted;

  let statusText = 'Not Started';
  let badgeColor = 'bg-charcoal-900 text-zinc-400 border-white/5';

  if (isCompleted) {
    statusText = 'Completed';
    badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  } else if (isStarted) {
    statusText = 'In Progress';
    badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  }

  return (
    <div className={`p-5 rounded-2xl border flex flex-col justify-between min-h-[190px] transition-all glass-panel glass-panel-hover ${
      isCompleted ? 'border-emerald-500/20' : 'border-white/5'
    }`}>
      
      {/* Header Info */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${badgeColor}`}>
            {statusText}
          </span>
        </div>

        <div>
          <h4 className="text-lg font-extrabold font-heading text-white">
            {workout.type}
          </h4>
          <p className="text-xs text-zinc-400 mt-1 capitalize leading-relaxed">
            Targets: {muscleTargets.join(', ')}
          </p>
        </div>
      </div>

      {/* Footer / Trigger */}
      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
        
        {/* Info label */}
        <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono">
          <Clock className="w-3.5 h-3.5" />
          <span>{settings.duration}m duration</span>
        </div>

        {/* Start Button */}
        {isCompleted ? (
          <div className="flex items-center gap-1 text-xs text-emerald-400 font-bold">
            <CheckCircle className="w-4 h-4" />
            <span>Logged</span>
          </div>
        ) : (
          <button
            onClick={() => onStart(workout.id)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isStarted 
                ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-lg shadow-amber-500/10'
                : 'bg-white text-black hover:bg-zinc-200'
            }`}
          >
            {isStarted ? (
              <>
                <span>Resume</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>Start</span>
              </>
            )}
          </button>
        )}
      </div>

    </div>
  );
};
