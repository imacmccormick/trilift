import React, { useState, useMemo } from 'react';
import type { WorkoutSession, PersonalRecord } from '../../types';
import { formatLocalDate } from '../../utils/dateUtils';
import { 
  History, Trophy, BarChart2, Calendar, 
  ChevronDown, ChevronUp, Dumbbell, Award 
} from 'lucide-react';

interface HistoryAnalyticsViewProps {
  history: WorkoutSession[];
  prs: PersonalRecord[];
}

type TabType = 'logs' | 'prs' | 'analytics';

export const HistoryAnalyticsView: React.FC<HistoryAnalyticsViewProps> = ({
  history,
  prs
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('logs');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  // Memoized stats calculations for custom analytics bar charts
  const stats = useMemo(() => {
    const muscleVolume: Record<string, number> = {};
    const muscleSets: Record<string, number> = {};
    let totalVolume = 0;
    let totalSets = 0;

    history.forEach(session => {
      session.exercises.forEach(ex => {
        if (!ex.completed) return;
        ex.sets.forEach(s => {
          if (!s.completed) return;
          const vol = s.reps * s.weight;
          totalVolume += vol;
          totalSets++;
          
          ex.primaryMuscles.forEach(m => {
            muscleVolume[m] = (muscleVolume[m] || 0) + vol;
            muscleSets[m] = (muscleSets[m] || 0) + 1;
          });
        });
      });
    });

    const averageDuration = history.length > 0
      ? Math.round(history.reduce((sum, s) => sum + (s.durationMinutes || 30), 0) / history.length)
      : 0;

    return {
      muscleVolume,
      muscleSets,
      totalVolume,
      totalSets,
      averageDuration
    };
  }, [history]);

  return (
    <div className="space-y-6">
      
      {/* 1. Header and Tab controls */}
      <div className="space-y-4">
        <div>
          <span className="text-xs text-neon-teal font-bold uppercase tracking-wider font-heading">
            Performance Ledger
          </span>
          <h2 className="text-2xl font-black text-white font-heading mt-0.5">
            History & Analytics
          </h2>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-charcoal-900 border border-white/5 p-1 rounded-xl glass-panel w-full sm:w-auto">
          {(['logs', 'prs', 'analytics'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-white/5 text-white border border-white/10'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                {tab === 'logs' && <History className="w-3.5 h-3.5" />}
                {tab === 'prs' && <Trophy className="w-3.5 h-3.5" />}
                {tab === 'analytics' && <BarChart2 className="w-3.5 h-3.5" />}
                {tab}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Tab Content View */}
      <div className="space-y-4">
        
        {/* TAB 1: LOGS */}
        {activeTab === 'logs' && (
          <div className="space-y-3">
            {history.length > 0 ? (
              [...history].reverse().map((session) => {
                const isExpanded = expandedSessionId === session.id;
                const completedCount = session.exercises.filter(e => e.completed).length;
                
                return (
                  <div 
                    key={session.id} 
                    className="bg-charcoal-900 border border-white/5 rounded-2xl overflow-hidden glass-panel"
                  >
                    {/* Log Row Header */}
                    <button
                      onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                      className="w-full p-4 text-left flex justify-between items-center gap-3 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-neon-teal/15 text-neon-teal text-[9px] font-extrabold uppercase">
                            {session.type}
                          </span>
                          <span className="text-xs text-zinc-500 font-bold font-mono">
                            {formatLocalDate(session.completedAt || session.startedAt || Date.now())}
                          </span>
                        </div>
                        <p className="text-xs text-white font-semibold mt-1">
                          {completedCount} exercises logged • {session.durationMinutes || 30}m duration
                        </p>
                      </div>

                      {/* Dropdown chevron */}
                      <div className="text-zinc-500">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {/* Collapsible Details */}
                    {isExpanded && (
                      <div className="p-4 border-t border-white/5 bg-black/20 space-y-4">
                        
                        {/* Note */}
                        {session.notes && (
                          <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-xs text-zinc-300 italic">
                            <span className="font-bold text-white block not-italic text-[10px] uppercase tracking-wider mb-1">
                              Workout Notes
                            </span>
                            "{session.notes}"
                          </div>
                        )}

                        {/* Exercise Sets details */}
                        <div className="space-y-3.5 divide-y divide-white/5">
                          {session.exercises.map((ex, exIdx) => (
                            <div key={ex.id} className={`${exIdx > 0 ? 'pt-3.5' : ''}`}>
                              <div className="flex justify-between items-start">
                                <h4 className="text-xs font-bold text-white font-heading">
                                  {ex.name}
                                </h4>
                                <span className="text-[9px] text-zinc-500 capitalize">
                                  {ex.primaryMuscles[0]}
                                </span>
                              </div>

                              {ex.notes && (
                                <p className="text-[10px] text-zinc-500 italic mt-0.5">
                                  Notes: "{ex.notes}"
                                </p>
                              )}

                              {/* Sets summary */}
                              <div className="flex flex-wrap gap-2 mt-2">
                                {ex.sets.map((s, sIdx) => (
                                  <div 
                                    key={s.id} 
                                    className={`px-2.5 py-1 rounded bg-charcoal-900 border border-white/5 text-[10px] font-mono ${
                                      s.completed ? 'text-zinc-300' : 'text-zinc-600 line-through'
                                    }`}
                                  >
                                    <span className="text-zinc-500 font-bold mr-1">S{sIdx+1}:</span>
                                    {s.weight} lbs × {s.reps}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4 bg-charcoal-900 border border-white/5 rounded-2xl glass-panel text-zinc-500">
                <Calendar className="w-10 h-10 mb-2 opacity-50 text-neon-teal" />
                <p className="text-sm font-bold text-zinc-300">No workouts logged yet</p>
                <p className="text-xs text-center opacity-70 mt-1 max-w-xs leading-normal">
                  Your completed active workouts will appear here with logged weights, sets, and training notes.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PRs */}
        {activeTab === 'prs' && (
          <div className="space-y-3">
            {prs.length > 0 ? (
              <div className="bg-charcoal-900 border border-white/5 rounded-2xl overflow-hidden glass-panel">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[320px]">
                    <thead>
                      <tr className="border-b border-white/5 text-zinc-500 font-bold uppercase tracking-wider bg-black/10">
                        <th className="p-4">Exercise</th>
                        <th className="p-4 text-center">Max Lift Record</th>
                        <th className="p-4 text-center">Reps</th>
                        <th className="p-4 text-right">Date Achieved</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-zinc-300">
                      {[...prs].sort((a,b) => b.date - a.date).map((pr) => (
                        <tr key={pr.exerciseId} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-bold text-white flex items-center gap-2">
                            <Award className="w-4 h-4 text-amber-500 shrink-0" />
                            {pr.exerciseName}
                          </td>
                          <td className="p-4 text-center font-mono font-bold text-neon-teal">
                            {pr.weight} lbs
                          </td>
                          <td className="p-4 text-center font-mono">
                            {pr.reps} reps
                          </td>
                          <td className="p-4 text-right text-zinc-500 font-mono">
                            {new Date(pr.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4 bg-charcoal-900 border border-white/5 rounded-2xl glass-panel text-zinc-500">
                <Trophy className="w-10 h-10 mb-2 opacity-50 text-amber-400" />
                <p className="text-sm font-bold text-zinc-300">No Personal Records Yet</p>
                <p className="text-xs text-center opacity-70 mt-1 max-w-xs leading-normal">
                  PRs are automatically saved whenever you complete a set with a new maximum weight. Let's lift!
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-5">
            {history.length > 0 ? (
              <>
                {/* Overall summary stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-charcoal-900 border border-white/5 p-4 rounded-2xl glass-panel">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase">Total Workouts</p>
                    <p className="text-xl font-black text-white font-mono mt-1">{history.length}</p>
                  </div>
                  <div className="bg-charcoal-900 border border-white/5 p-4 rounded-2xl glass-panel">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase">Total Sets Completed</p>
                    <p className="text-xl font-black text-neon-teal font-mono mt-1">{stats.totalSets}</p>
                  </div>
                  <div className="bg-charcoal-900 border border-white/5 p-4 rounded-2xl glass-panel">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase">Average Duration</p>
                    <p className="text-xl font-black text-neon-purple font-mono mt-1">{stats.averageDuration}m</p>
                  </div>
                  <div className="bg-charcoal-900 border border-white/5 p-4 rounded-2xl glass-panel">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase">Total Est. Weight</p>
                    <p className="text-xl font-black text-emerald-400 font-mono mt-1">
                      {Math.round(stats.totalVolume).toLocaleString()} lbs
                    </p>
                  </div>
                </div>

                {/* Muscle Frequency Chart (Custom HTML Horizontal bar chart) */}
                <div className="bg-charcoal-900 border border-white/5 p-5 rounded-2xl glass-panel space-y-4">
                  <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-neon-teal" />
                    Muscle Groups Training Frequency
                  </h3>
                  <p className="text-xs text-zinc-500 leading-normal">
                    This represents the total volume of sets performed targeting each muscle group across all history.
                  </p>
                  
                  <div className="space-y-3.5 pt-2">
                    {Object.entries(stats.muscleSets)
                      .sort((a,b) => b[1] - a[1])
                      .map(([muscle, count]) => {
                        const maxCount = Math.max(...Object.values(stats.muscleSets));
                        const percent = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
                        
                        // Map colors to muscle groups
                        let barColor = 'from-neon-teal to-cyan-500';
                        if (muscle === 'chest' || muscle === 'shoulders' || muscle === 'triceps') {
                          barColor = 'from-neon-purple to-fuchsia-500';
                        } else if (muscle === 'quadriceps' || muscle === 'hamstrings' || muscle === 'glutes' || muscle === 'calves') {
                          barColor = 'from-emerald-400 to-green-500';
                        }
                        
                        return (
                          <div key={muscle} className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-semibold text-white capitalize">{muscle}</span>
                              <span className="text-zinc-400 font-bold font-mono">{count} sets</span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/5">
                              <div 
                                className={`bg-gradient-to-r ${barColor} h-full rounded-full transition-all duration-500`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4 bg-charcoal-900 border border-white/5 rounded-2xl glass-panel text-zinc-500">
                <BarChart2 className="w-10 h-10 mb-2 opacity-50 text-neon-teal" />
                <p className="text-sm font-bold text-zinc-300">No Analytics Available</p>
                <p className="text-xs text-center opacity-70 mt-1 max-w-xs leading-normal">
                  Complete workouts to populate stats, average durations, and target muscle set distribution bars.
                </p>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
