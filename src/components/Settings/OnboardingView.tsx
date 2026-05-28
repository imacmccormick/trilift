import React, { useState } from 'react';
import type { UserSettings } from '../../types';
import { 
  Sparkles, Check, ChevronRight, Play 
} from 'lucide-react';

interface OnboardingViewProps {
  onComplete: (settings: UserSettings) => void;
}

const STEPS = [
  { id: 'welcome', title: 'Welcome to TriLift' },
  { id: 'equipment', title: 'Your Gym Gear' },
  { id: 'duration', title: 'Your Schedule' },
  { id: 'level', title: 'Your Goals' }
];

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const [stepIdx, setStepIdx] = useState(0);
  
  // Settings Form State
  const [equipment, setEquipment] = useState<string[]>(['bodyweight']);
  const [duration, setDuration] = useState<UserSettings['duration']>(30);
  const [fitnessLevel, setFitnessLevel] = useState<UserSettings['fitnessLevel']>('beginner');
  const [intensity, setIntensity] = useState<UserSettings['intensity']>('moderate');
  const [enableFullBody, setEnableFullBody] = useState(false);

  const nextStep = () => {
    if (stepIdx < STEPS.length - 1) {
      setStepIdx(prev => prev + 1);
    } else {
      const finalSettings: UserSettings = {
        equipment,
        duration,
        fitnessLevel,
        intensity,
        enableFullBody,
        setupCompleted: true
      };
      onComplete(finalSettings);
    }
  };

  const prevStep = () => {
    if (stepIdx > 0) {
      setStepIdx(prev => prev - 1);
    }
  };

  const handleEquipmentToggle = (id: string) => {
    if (id === 'bodyweight') {
      setEquipment(['bodyweight']);
    } else {
      let updated = [...equipment];
      if (updated.includes(id)) {
        updated = updated.filter(item => item !== id);
        if (updated.length === 0) updated = ['bodyweight'];
      } else {
        updated = updated.filter(item => item !== 'bodyweight');
        updated.push(id);
      }
      setEquipment(updated);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      
      {/* Outer Card */}
      <div className="relative w-full max-w-md rounded-3xl glass-panel border border-white/10 p-6 md:p-8 space-y-6 shadow-2xl flex flex-col justify-between min-h-[480px] overflow-hidden">
        {/* Glow backgrounds */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-neon-teal/10 rounded-full blur-3xl -z-10" />

        {/* Top Header & Indicator */}
        <div className="space-y-4">
          {stepIdx > 0 && (
            <div className="flex justify-between items-center text-[10px] text-zinc-500 font-bold uppercase tracking-wider font-mono">
              <span>Step {stepIdx} of {STEPS.length - 1}</span>
              <div className="flex gap-1">
                {STEPS.slice(1).map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1 rounded-full transition-all duration-300 ${
                      idx + 1 === stepIdx ? 'w-4 bg-neon-teal' : 'w-1.5 bg-zinc-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          <h2 className="text-2xl font-black text-white font-heading">
            {STEPS[stepIdx].title}
          </h2>
        </div>

        {/* Step Body Content */}
        <div className="flex-1 py-4 flex flex-col justify-center">
          
          {/* Step 0: Welcome Screen */}
          {stepIdx === 0 && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-neon-purple to-neon-teal flex items-center justify-center mx-auto shadow-lg shadow-neon-purple/20">
                <Sparkles className="w-8 h-8 text-white fill-white/10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-zinc-200 font-heading">
                  Your Personal Workout Coach
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
                  TriLift generates customized, progressive weekly training rhythms that adapt automatically to your equipment and schedule. Let's configure your coaching preferences.
                </p>
              </div>
            </div>
          )}

          {/* Step 1: Equipment */}
          {stepIdx === 1 && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-400 leading-normal mb-1">
                Select any equipment you can access. TriLift will filter exercises automatically to match.
              </p>
              
              <div className="grid grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pr-1">
                {[
                  { id: 'bodyweight', name: 'Bodyweight Only' },
                  { id: 'dumbbell', name: 'Dumbbells' },
                  { id: 'barbell', name: 'Barbell' },
                  { id: 'bench', name: 'Flat/Incline Bench' },
                  { id: 'pull-up-bar', name: 'Pull-up Bar' },
                  { id: 'bands', name: 'Resistance Bands' },
                  { id: 'machines', name: 'Machines / Cable' },
                ].map((opt) => {
                  const isChecked = equipment.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleEquipmentToggle(opt.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-start justify-between gap-2 transition-all ${
                        isChecked
                          ? 'bg-neon-teal/10 border-neon-teal text-white'
                          : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-xs font-bold leading-tight">{opt.name}</span>
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                        isChecked ? 'bg-neon-teal border-neon-teal text-black' : 'border-white/20'
                      }`}>
                        {isChecked && <Check className="w-2.5 h-2.5 stroke-[4]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Workout Duration */}
          {stepIdx === 2 && (
            <div className="space-y-5 text-center">
              <p className="text-xs text-zinc-400 leading-normal max-w-xs mx-auto">
                How much time do you want to dedicate to each workout session?
              </p>

              <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                {[
                  { value: 15, name: '15 Min Express', desc: '3 movements, high speed' },
                  { value: 30, name: '30 Min Smart', desc: '4 movements, balanced' },
                  { value: 45, name: '45 Min Balanced', desc: '5-6 movements, steady' },
                  { value: 60, name: '60 Min Full', desc: '7 movements, comprehensive' }
                ].map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDuration(d.value as UserSettings['duration'])}
                    className={`p-3 rounded-xl border text-left space-y-1 transition-all ${
                      duration === d.value
                        ? 'bg-neon-purple/20 border-neon-purple text-white shadow-lg shadow-neon-purple/10'
                        : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10'
                    }`}
                  >
                    <p className="text-xs font-bold text-white">{d.name}</p>
                    <p className="text-[9px] text-zinc-500 leading-snug">{d.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Fitness Goals */}
          {stepIdx === 3 && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-400 text-center leading-normal mb-1">
                Configure your fitness level and training style.
              </p>

              <div className="space-y-3.5">
                {/* Level selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                    Fitness Level
                  </label>
                  <div className="flex gap-2">
                    {(['beginner', 'intermediate', 'advanced'] as const).map((l) => (
                      <button
                        key={l}
                        onClick={() => setFitnessLevel(l)}
                        className={`flex-1 py-2 rounded-lg border text-xs capitalize font-bold transition-all ${
                          fitnessLevel === l
                            ? 'bg-emerald-500/10 border-emerald-500 text-white'
                            : 'bg-white/5 border-white/5 text-zinc-400'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Intensity */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                    Weight Progression Intensity
                  </label>
                  <div className="flex gap-2">
                    {(['moderate', 'high'] as const).map((i) => (
                      <button
                        key={i}
                        onClick={() => setIntensity(i)}
                        className={`flex-1 py-2 rounded-lg border text-xs capitalize font-bold transition-all ${
                          intensity === i
                            ? 'bg-amber-500/15 border-amber-500 text-white'
                            : 'bg-white/5 border-white/5 text-zinc-400'
                        }`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional full body */}
                <button
                  onClick={() => setEnableFullBody(!enableFullBody)}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                    enableFullBody
                      ? 'bg-neon-teal/10 border-neon-teal text-white'
                      : 'bg-white/5 border-white/5 text-zinc-400'
                  }`}
                >
                  <div className="text-left pr-2">
                    <p className="text-xs font-bold text-zinc-200">Include Optional Full Body day</p>
                    <p className="text-[9px] text-zinc-500 mt-0.5">Adds a 4th workout alongside Push, Pull, Legs.</p>
                  </div>
                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                    enableFullBody ? 'bg-neon-teal border-neon-teal text-black' : 'border-white/20'
                  }`}>
                    {enableFullBody && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Actions */}
        <div className="flex items-center gap-3 pt-2">
          {stepIdx > 0 && (
            <button
              onClick={prevStep}
              className="px-4 py-2.5 rounded-xl border border-white/5 text-zinc-400 hover:text-white text-xs font-bold transition-colors"
            >
              Back
            </button>
          )}

          <button
            onClick={nextStep}
            className="flex-1 py-2.5 rounded-xl bg-neon-purple text-white text-xs font-bold hover:bg-purple-600 transition-colors shadow-lg shadow-neon-purple/25 flex items-center justify-center gap-1 active:scale-95"
          >
            {stepIdx === 0 ? (
              <>
                <span>Configure Program</span>
                <ChevronRight className="w-4 h-4" />
              </>
            ) : stepIdx === STEPS.length - 1 ? (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>Generate Workouts</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};
