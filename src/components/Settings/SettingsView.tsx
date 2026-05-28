import React, { useState } from 'react';
import type { UserSettings } from '../../types';
import { 
  Dumbbell, Clock, Shield, Zap, ToggleLeft, 
  ToggleRight, Check, RefreshCw, Info 
} from 'lucide-react';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings, regenerateThisWeek: boolean) => void;
}

const EQUIPMENT_OPTIONS = [
  { id: 'bodyweight', name: 'Bodyweight Only', desc: 'No equipment needed' },
  { id: 'dumbbell', name: 'Dumbbells', desc: 'Dumbbell-based exercises' },
  { id: 'barbell', name: 'Barbell', desc: 'Barbells and EZ Curl Bars' },
  { id: 'bench', name: 'Bench', desc: 'Flat/Incline exercise bench' },
  { id: 'pull-up-bar', name: 'Pull-up Bar', desc: 'Doorway or wall pull-up bar' },
  { id: 'bands', name: 'Resistance Bands', desc: 'Loop or tube bands' },
  { id: 'machines', name: 'Machines / Cable', desc: 'Lat pulldown, cables, leg press' },
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings
}) => {
  const [equipment, setEquipment] = useState<string[]>(settings.equipment);
  const [duration, setDuration] = useState<UserSettings['duration']>(settings.duration);
  const [fitnessLevel, setFitnessLevel] = useState<UserSettings['fitnessLevel']>(settings.fitnessLevel);
  const [intensity, setIntensity] = useState<UserSettings['intensity']>(settings.intensity);
  const [enableFullBody, setEnableFullBody] = useState(settings.enableFullBody);
  
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleEquipmentToggle = (id: string) => {
    if (id === 'bodyweight') {
      // Bodyweight only clears other equipment
      setEquipment(['bodyweight']);
    } else {
      let updated = [...equipment];
      if (updated.includes(id)) {
        updated = updated.filter(item => item !== id);
        // If nothing is selected, fall back to bodyweight
        if (updated.length === 0) {
          updated = ['bodyweight'];
        }
      } else {
        // Add item and remove bodyweight if present (unless bodyweight is all they had)
        updated = updated.filter(item => item !== 'bodyweight');
        updated.push(id);
      }
      setEquipment(updated);
    }
  };

  const handleSave = (regenerate: boolean) => {
    const updatedSettings: UserSettings = {
      equipment,
      duration,
      fitnessLevel,
      intensity,
      enableFullBody,
      setupCompleted: true
    };
    
    onUpdateSettings(updatedSettings, regenerate);
    
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
    setShowRegenConfirm(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <span className="text-xs text-neon-purple font-bold uppercase tracking-wider font-heading">
          Configuration
        </span>
        <h2 className="text-2xl font-black text-white font-heading mt-0.5">
          Program Settings
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Adjust your workout preferences. Changes will automatically apply to all future generated weeks.
        </p>
      </div>

      <div className="space-y-5">
        
        {/* 1. Equipment Grid */}
        <div className="bg-charcoal-900 border border-white/5 rounded-2xl p-5 glass-panel space-y-4">
          <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-neon-teal" />
            Available Equipment
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {EQUIPMENT_OPTIONS.map((opt) => {
              const isChecked = equipment.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => handleEquipmentToggle(opt.id)}
                  className={`p-3 rounded-xl border text-left flex items-start justify-between gap-3 transition-all ${
                    isChecked
                      ? 'bg-neon-teal/10 border-neon-teal text-white'
                      : 'bg-white/5 border-white/5 text-zinc-400 hover:border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div>
                    <p className={`text-sm font-bold ${isChecked ? 'text-white' : 'text-zinc-300'}`}>
                      {opt.name}
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">
                      {opt.desc}
                    </p>
                  </div>
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                    isChecked ? 'bg-neon-teal border-neon-teal text-black' : 'border-white/20'
                  }`}>
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Workout Duration Selection */}
        <div className="bg-charcoal-900 border border-white/5 rounded-2xl p-5 glass-panel space-y-4">
          <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
            <Clock className="w-4 h-4 text-neon-purple" />
            Workout Duration
          </h3>
          <p className="text-xs text-zinc-500 leading-normal">
            Workout sizes scale the number of compound and accessory exercises generated per session.
          </p>
          <div className="grid grid-cols-4 gap-2">
            {([15, 30, 45, 60] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`py-3 rounded-xl border text-center font-bold text-sm transition-all ${
                  duration === d
                    ? 'bg-neon-purple/20 border-neon-purple text-white shadow-lg shadow-neon-purple/10'
                    : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10 hover:border-white/10'
                }`}
              >
                <span>{d}m</span>
                <span className="block text-[8px] font-normal text-zinc-500 mt-0.5">
                  {d === 15 ? 'Express' : d === 30 ? 'Smart' : d === 45 ? 'Balanced' : 'Full'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Fitness Level & Intensity */}
        <div className="grid grid-cols-1 gap-4">
          
          {/* Fitness level */}
          <div className="bg-charcoal-900 border border-white/5 rounded-2xl p-5 glass-panel space-y-4">
            <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Fitness Level
            </h3>
            <div className="space-y-2">
              {(['beginner', 'intermediate', 'advanced'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setFitnessLevel(l)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    fitnessLevel === l
                      ? 'bg-emerald-500/10 border-emerald-500 text-white'
                      : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10 hover:border-white/10'
                  }`}
                >
                  <span className="text-xs font-bold capitalize">{l}</span>
                  <span className="text-[10px] text-zinc-500">
                    {l === 'beginner' ? '3 sets • high reps' : l === 'intermediate' ? '3-4 sets • moderate reps' : '4 sets • lower reps'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Intensity */}
          <div className="bg-charcoal-900 border border-white/5 rounded-2xl p-5 glass-panel space-y-4">
            <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Training Intensity
            </h3>
            <div className="flex flex-col gap-2">
              {(['moderate', 'high'] as const).map((i) => (
                <button
                  key={i}
                  onClick={() => setIntensity(i)}
                  className={`w-full py-3 rounded-xl border text-center font-bold text-xs capitalize transition-all ${
                    intensity === i
                      ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/5'
                      : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10'
                  }`}
                >
                  {i}
                  <span className="block text-[8px] font-normal text-zinc-500 mt-0.5">
                    {i === 'moderate' ? 'Standard overload' : 'Aggressive weight progression'}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* 4. Full Body Day Toggle */}
        <div className="bg-charcoal-900 border border-white/5 rounded-2xl p-5 glass-panel flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
              Enable Full Body Day
            </h3>
            <p className="text-xs text-zinc-500 leading-normal pr-4">
              Add a 4th optional conditioning/strength workout to the weekly dashboard in addition to Push, Pull, Legs.
            </p>
          </div>
          <button 
            onClick={() => setEnableFullBody(!enableFullBody)}
            className="text-zinc-400 hover:text-white transition-colors focus:outline-none"
          >
            {enableFullBody ? (
              <ToggleRight className="w-12 h-12 text-neon-teal" />
            ) : (
              <ToggleLeft className="w-12 h-12 text-zinc-600" />
            )}
          </button>
        </div>

        {/* 5. Save Controls */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => handleSave(false)}
            className="flex-1 py-3 rounded-xl bg-charcoal-800 border border-white/10 hover:border-white/20 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-98"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                <span>Saved Settings</span>
              </>
            ) : (
              <span>Save & Apply (Next Week)</span>
            )}
          </button>

          <button
            onClick={() => setShowRegenConfirm(true)}
            className="flex-1 py-3 rounded-xl bg-neon-purple text-white text-xs font-bold hover:bg-purple-600 shadow-lg shadow-neon-purple/20 transition-all flex items-center justify-center gap-1.5 active:scale-98"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Save & Regenerate This Week</span>
          </button>
        </div>

      </div>

      {/* 6. Regenerate confirmation modal */}
      {showRegenConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setShowRegenConfirm(false)} />
          
          <div className="relative w-full max-w-sm rounded-2xl glass-panel border border-white/10 p-5 z-10 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold font-heading text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-neon-purple" />
              Regenerate Current Week?
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              This will overwrite your current weekly workouts and generate fresh ones using your updated equipment and settings. Any logged stats for *completed* workouts in the history ledger will not be touched.
            </p>
            
            <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-rose-300">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-[10px] leading-normal font-medium">
                Warning: Any in-progress workouts for this week will be reset.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRegenConfirm(false)}
                className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave(true)}
                className="flex-1 py-2 rounded-xl bg-neon-purple text-white text-xs font-bold hover:bg-purple-600 transition-colors shadow-lg shadow-neon-purple/20"
              >
                Regenerate
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
