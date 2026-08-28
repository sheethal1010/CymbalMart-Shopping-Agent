import React from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Check, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { PartyPlan } from '../types';

interface TimelinePrepViewProps {
  plan: PartyPlan;
  onToggleStep: (stepId: string) => void;
}

export const TimelinePrepView: React.FC<TimelinePrepViewProps> = ({
  plan,
  onToggleStep,
}) => {
  const steps = plan.timelineSteps || [];
  const completedCount = steps.filter(s => s.completed).length;
  const progressPercent = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6DFD5] text-[#3D3A35] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8EFE6] text-[#5E7356] flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-base sm:text-lg font-bold text-[#3D3A35]">
                Party Prep & Run-of-Show Timeline
              </h2>
              <p className="text-xs text-[#7D756D]">
                Step-by-step staging schedule to keep your party stress-free from 1 week out to kickoff
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[#F8F6F0] px-4 py-2 rounded-xl border border-[#E6DFD5] text-xs">
            <CheckCircle2 className="w-4 h-4 text-[#5E7356]" />
            <div>
              <div className="text-[#8C857D] text-[10px] uppercase font-semibold">Staging Progress</div>
              <div className="font-bold text-[#3D3A35]">{completedCount} of {steps.length} milestones ({progressPercent}%)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Steps List */}
      <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E6DFD5]">
        {steps.map((step, index) => {
          const isDone = step.completed;

          return (
            <div 
              key={step.id}
              className={`relative rounded-2xl border transition-all shadow-sm ${
                isDone 
                  ? 'bg-[#FFFFFF] border-[#D0E0CC] opacity-80' 
                  : 'bg-[#FFFFFF] border-[#E6DFD5]'
              }`}
            >
              {/* Timeline Marker Dot */}
              <div 
                className={`absolute -left-[27px] sm:-left-[35px] top-5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  isDone 
                    ? 'bg-[#5E7356] border-[#4F6448] text-white shadow-xs' 
                    : 'bg-[#FFFFFF] border-[#7A6453] text-[#7A6453]'
                }`}
              >
                {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : <span className="text-[10px] font-bold">{index + 1}</span>}
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  
                  {/* Time Badge */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#F5F2EB] text-[#7A6453] border border-[#E6DFD5]">
                      <Clock className="w-3 h-3 text-[#7A6453]" />
                      {step.timeOffset}
                    </span>

                    {isDone && (
                      <span className="text-[10px] font-semibold text-[#4F6448] bg-[#E8EFE6] px-2 py-0.5 rounded-full border border-[#D0E0CC]">
                        Completed
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className={`text-sm sm:text-base font-bold ${isDone ? 'line-through text-[#8C857D]' : 'text-[#3D3A35]'}`}>
                      {step.task}
                    </h3>
                    <p className="text-xs text-[#5C564F] mt-1 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Actionable Advice */}
                  {step.actionableAdvice && (
                    <div className="p-2.5 rounded-xl bg-[#F8F6F0] border border-[#E6DFD5] text-[11px] text-[#5C564F] flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#C29B7F] flex-shrink-0 mt-0.5" />
                      <span>{step.actionableAdvice}</span>
                    </div>
                  )}

                </div>

                {/* Toggle Button */}
                <button
                  onClick={() => onToggleStep(step.id)}
                  className={`self-start sm:self-center flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 flex-shrink-0 ${
                    isDone
                      ? 'bg-[#E8EFE6] text-[#4F6448] border-[#D0E0CC] hover:bg-[#FAF9F6]'
                      : 'bg-[#5E7356] hover:bg-[#4F6448] text-white border-transparent shadow-sm'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isDone ? 'Mark Incomplete' : 'Complete Task'}</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Pro-Tip Box */}
      <div className="p-4 rounded-2xl bg-[#F2EAE1] border border-[#E0D1C1] text-xs text-[#3D3A35] flex items-start gap-3 shadow-sm">
        <AlertCircle className="w-4 h-4 text-[#7A6453] flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Host Success Secret: </span>
          Complete all store shopping at least 24 hours in advance. On party day, your only tasks should be chilling beverages, plating hot appetizers, and turning on the music playlist 15 minutes before the first guest arrives!
        </div>
      </div>

    </div>
  );
};
