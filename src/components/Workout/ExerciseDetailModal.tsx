import React from 'react';
import type { Exercise } from '../../types';
import { X, Dumbbell, ShieldAlert, BookOpen } from 'lucide-react';

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exercise,
  isOpen,
  onClose
}) => {
  if (!isOpen || !exercise) return null;

  // Resolve the image paths. Free-exercise-db stores them as relative paths in an array e.g., ["3_4_Sit-Up/0.jpg", "3_4_Sit-Up/1.jpg"]
  const imageBaseUrl = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
  const imageUrls = exercise.images && exercise.images.length > 0
    ? exercise.images.map(img => `${imageBaseUrl}${img}`)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl glass-panel border border-white/10 shadow-2xl transition-all duration-300 max-h-[85vh] flex flex-col z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex-1 pr-4">
            <h3 className="text-xl font-bold font-heading text-white line-clamp-1">
              {exercise.name}
            </h3>
            <p className="text-xs text-neon-teal font-medium mt-0.5 capitalize flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5" />
              {exercise.primaryMuscles.join(', ')} • {exercise.equipment}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* Images / Visual Guidance Carousel */}
          {imageUrls.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 bg-black/40 p-2.5 rounded-xl border border-white/5">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="relative aspect-square overflow-hidden rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center group">
                  <img 
                    src={url} 
                    alt={`${exercise.name} step ${idx + 1}`}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      // Hide image on load error
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4 bg-white/5 rounded-xl border border-white/5 text-zinc-400">
              <ShieldAlert className="w-8 h-8 text-zinc-500 mb-2" />
              <p className="text-xs text-center font-medium">No demonstration image available</p>
            </div>
          )}

          {/* Details / Metadata */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-white/5 py-2 px-3 rounded-lg border border-white/5">
              <p className="text-zinc-500 font-medium">Level</p>
              <p className="text-white font-bold capitalize mt-0.5">{exercise.level}</p>
            </div>
            <div className="bg-white/5 py-2 px-3 rounded-lg border border-white/5">
              <p className="text-zinc-500 font-medium">Force</p>
              <p className="text-white font-bold capitalize mt-0.5">{exercise.force || 'N/A'}</p>
            </div>
            <div className="bg-white/5 py-2 px-3 rounded-lg border border-white/5">
              <p className="text-zinc-500 font-medium">Mechanic</p>
              <p className="text-white font-bold capitalize mt-0.5">{exercise.mechanic || 'Isolation'}</p>
            </div>
          </div>

          {/* Instructions List */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white font-heading flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-neon-purple" />
              Execution Steps
            </h4>
            <ol className="space-y-2.5">
              {exercise.instructions.map((step, idx) => (
                <li key={idx} className="flex gap-3 text-sm leading-relaxed text-zinc-300">
                  <span className="flex items-center justify-center w-5 h-5 rounded bg-neon-purple/20 text-neon-purple text-xs font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Secondary Target Muscles */}
          {exercise.secondaryMuscles.length > 0 && (
            <div className="space-y-1.5 border-t border-white/5 pt-4">
              <h4 className="text-xs font-bold text-zinc-400 font-heading">
                Secondary Muscles Targeted
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {exercise.secondaryMuscles.map((muscle, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-zinc-400 capitalize border border-white/5">
                    {muscle}
                  </span>
                ))}
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};
