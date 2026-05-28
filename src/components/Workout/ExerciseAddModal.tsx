import React, { useState, useMemo } from 'react';
import type { WorkoutExercise, Exercise, UserSettings, WorkoutSession } from '../../types';
import { getAddOptions } from '../../utils/generator';
import { X, Search, Sparkles, Plus, Eye } from 'lucide-react';

interface ExerciseAddModalProps {
  workoutType: WorkoutSession['type'];
  settings: UserSettings;
  currentExercises: WorkoutExercise[];
  isOpen: boolean;
  onClose: () => void;
  onAdd: (exercise: Exercise) => void;
  onPreview: (exercise: Exercise) => void;
}

export const ExerciseAddModal: React.FC<ExerciseAddModalProps> = ({
  workoutType,
  settings,
  currentExercises,
  isOpen,
  onClose,
  onAdd,
  onPreview
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const addOptions = useMemo(() => {
    if (!isOpen) return [];
    return getAddOptions(workoutType, settings, currentExercises);
  }, [workoutType, settings, currentExercises, isOpen]);

  const filteredOptions = useMemo(() => {
    return addOptions.filter(opt => 
      opt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.primaryMuscles.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [addOptions, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl glass-panel border border-white/10 shadow-2xl transition-all duration-300 max-h-[80vh] flex flex-col z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold font-heading text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-neon-teal" />
              Add Exercise
            </h3>
            <button 
              onClick={onClose}
              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Add a movement suitable for a <span className="text-neon-teal font-medium capitalize">{workoutType}</span> workout to your active session.
          </p>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-white/5 bg-black/20">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by exercise name or muscle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-charcoal-900 border border-white/5 focus:border-neon-teal/50 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Alternatives List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div 
                key={opt.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/15 transition-all duration-200 group"
              >
                <div className="flex-1 min-w-0 pr-3">
                  <h4 className="text-sm font-semibold text-white truncate group-hover:text-neon-teal transition-colors">
                    {opt.name}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5 capitalize truncate">
                    {opt.primaryMuscles[0]} • {opt.equipment}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPreview(opt)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      onAdd(opt);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-neon-teal text-black text-xs font-bold hover:bg-cyan-400 transition-colors shadow-lg shadow-neon-teal/10 flex items-center gap-0.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-zinc-500">
              <Sparkles className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-xs text-center font-medium">No suitable exercises found</p>
              <p className="text-[10px] text-center opacity-70 mt-1">Try expanding available equipment in settings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
