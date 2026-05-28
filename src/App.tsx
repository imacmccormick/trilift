import { useState } from 'react';
import { useWorkoutState } from './hooks/useWorkoutState';
import { OnboardingView } from './components/Settings/OnboardingView';
import { WeeklyDashboard } from './components/Dashboard/WeeklyDashboard';
import { ActiveWorkoutView } from './components/Workout/ActiveWorkoutView';
import { HistoryAnalyticsView } from './components/History/HistoryAnalyticsView';
import { SettingsView } from './components/Settings/SettingsView';
import { 
  Dumbbell, Calendar, History, Settings, 
  Flame 
} from 'lucide-react';

type MainTab = 'dashboard' | 'history' | 'settings';

function App() {
  const {
    settings,
    currentPlan,
    history: workoutHistory,
    prs,
    activeWorkout,
    completeOnboarding,
    updateSettings,
    startWorkout,
    logSet,
    updateExerciseNotes,
    swapExercise,
    deleteExercise,
    addExercise,
    finishWorkout,
    cancelWorkout,
    getStats,
  } = useWorkoutState();

  const [activeTab, setActiveTab] = useState<MainTab>('dashboard');

  // If onboarding is not completed, show the Onboarding flow
  if (!settings.setupCompleted) {
    return (
      <div className="min-h-screen bg-obsidian text-zinc-100 flex flex-col justify-center">
        <header className="p-4 flex items-center justify-center gap-2 max-w-md mx-auto w-full">
          <Dumbbell className="w-6 h-6 text-neon-teal animate-pulse" />
          <span className="text-xl font-extrabold tracking-tight font-heading text-white bg-gradient-to-r from-neon-teal to-neon-purple bg-clip-text text-transparent">
            TriLift
          </span>
        </header>
        <main className="flex-1 w-full max-w-lg mx-auto px-4 flex flex-col justify-center">
          <OnboardingView onComplete={completeOnboarding} />
        </main>
      </div>
    );
  }

  const { streak, totalWorkoutsCompleted } = getStats();

  return (
    <div className="min-h-screen bg-obsidian text-zinc-100 flex flex-col pb-28">
      {/* 1. Header (Hidden during active workout to maximize screen) */}
      {!activeWorkout && (
        <header className="sticky top-0 z-30 bg-obsidian/80 backdrop-blur-md border-b border-white/5 py-3 px-4 max-w-lg mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-neon-teal" />
            <h1 className="text-lg font-black tracking-tight font-heading text-white bg-gradient-to-r from-neon-teal to-neon-purple bg-clip-text text-transparent">
              TriLift
            </h1>
          </div>

          <div className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-full border border-white/5 text-[10px] font-bold text-orange-500 font-mono">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>{streak} Streak</span>
          </div>
        </header>
      )}

      {/* 2. Main Content Container */}
      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-4 overflow-y-auto">
        {activeWorkout ? (
          /* Active Workout Session view overrides default layout */
          <ActiveWorkoutView
            activeWorkout={activeWorkout}
            settings={settings}
            onLogSet={logSet}
            onUpdateNotes={updateExerciseNotes}
            onSwapExercise={swapExercise}
            onDeleteExercise={deleteExercise}
            onAddExercise={addExercise}
            onFinishWorkout={finishWorkout}
            onCancelWorkout={cancelWorkout}
          />
        ) : (
          /* Default tab routing */
          <>
            {activeTab === 'dashboard' && (
              <WeeklyDashboard
                currentPlan={currentPlan}
                settings={settings}
                streak={streak}
                totalWorkouts={totalWorkoutsCompleted}
                onStartWorkout={startWorkout}
              />
            )}

            {activeTab === 'history' && (
              <HistoryAnalyticsView
                history={workoutHistory}
                prs={prs}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                settings={settings}
                onUpdateSettings={updateSettings}
              />
            )}
          </>
        )}
      </main>

      {/* 3. Navigation Bar (Hidden during active workout) */}
      {!activeWorkout && (
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-charcoal-900/90 backdrop-blur-md border-t border-white/10 py-3.5 px-8 flex items-center justify-around max-w-lg mx-auto rounded-t-2xl shadow-xl">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === 'dashboard' ? 'text-neon-teal' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-wider font-heading">
              Plan
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === 'history' ? 'text-neon-teal' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <History className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-wider font-heading">
              History
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === 'settings' ? 'text-neon-teal' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-wider font-heading">
              Settings
            </span>
          </button>
        </nav>
      )}
    </div>
  );
}

export default App;
