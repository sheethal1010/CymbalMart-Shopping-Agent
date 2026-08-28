import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown, 
  Sparkles, 
  Plus, 
  Utensils, 
  AlertCircle
} from 'lucide-react';
import { PartyPlan, PartyAudit, ShoppingItem } from '../types';

interface PartyAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PartyPlan;
  onAddMissingItems: (items: Omit<ShoppingItem, 'id' | 'isPurchased'>[]) => void;
}

export const PartyAuditModal: React.FC<PartyAuditModalProps> = ({
  isOpen,
  onClose,
  plan,
  onAddMissingItems,
}) => {
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState<PartyAudit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setAudit(null);
      setError(null);
      setAddedSuccess(false);
      return;
    }

    const runAudit = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/audit-party', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan }),
        });

        const data = await res.json();
        if (!data.success || !data.audit) {
          throw new Error(data.error || 'Audit analysis failed');
        }

        setAudit(data.audit);
      } catch (err: any) {
        console.error('Audit error', err);
        setError(err.message || 'Failed to complete party audit.');
      } finally {
        setLoading(false);
      }
    };

    runAudit();
  }, [isOpen, plan]);

  if (!isOpen) return null;

  const handleAddCriticalItems = () => {
    if (!audit?.criticalMissing || audit.criticalMissing.length === 0) return;

    const itemsToAppend: Omit<ShoppingItem, 'id' | 'isPurchased'>[] = audit.criticalMissing.map(itemName => ({
      name: itemName,
      category: 'Ice & Logistics',
      storeCategory: 'Supermarket / Grocery',
      quantity: 1,
      unit: 'pack',
      estimatedPrice: 6.50,
      priority: 'essential',
      notes: 'Added from AI Readiness Audit',
    }));

    onAddMissingItems(itemsToAppend);
    setAddedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-[#4F6448] border-[#D0E0CC] bg-[#E8EFE6]';
    if (score >= 65) return 'text-[#A06C28] border-[#F2E0C4] bg-[#FDF6EB]';
    return 'text-[#A85344] border-[#F0CEC7] bg-[#FAECE8]';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3D3A35]/60 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-2xl bg-[#FFFFFF] border border-[#E6DFD5] rounded-3xl shadow-2xl overflow-hidden text-[#3D3A35] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#FAF9F6] border-b border-[#E6DFD5]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E8EFE6] text-[#5E7356] border border-[#D0E0CC] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-[#3D3A35]">
                AI Party Readiness & Missing Essentials Audit
              </h2>
              <p className="text-xs text-[#7D756D]">
                Evaluating shopping list completeness, budget leaks, and dietary safety
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8C857D] hover:text-[#3D3A35] rounded-lg hover:bg-[#F5F2EB] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          
          {loading && (
            <div className="py-16 text-center space-y-3">
              <div className="w-9 h-9 border-3 border-[#5E7356]/30 border-t-[#5E7356] rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[#5C564F] font-medium">
                Auditing supplies, napkin ratios, trash bags, cooler ice, and dietary tags...
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#FAECE8] border border-[#F0CEC7] text-[#A85344] text-xs">
              <AlertCircle className="w-4 h-4 text-[#A85344] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Audit could not be completed</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {!loading && audit && (
            <div className="space-y-4">
              
              {/* Score Card */}
              <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-[#E6DFD5] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center font-bold ${getScoreColor(audit.score)}`}>
                    <span className="text-2xl leading-none">{audit.score}</span>
                    <span className="text-[9px] uppercase tracking-wider opacity-80">/ 100</span>
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#3D3A35]">
                      Party Readiness: {audit.status}
                    </h3>
                    <p className="text-xs text-[#7D756D]">
                      Evaluated against {plan.guestCount.adults + plan.guestCount.kids} guests for a {plan.durationHours}-hour {plan.eventType}.
                    </p>
                  </div>
                </div>

                {audit.criticalMissing.length > 0 && (
                  <button
                    onClick={handleAddCriticalItems}
                    disabled={addedSuccess}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5E7356] hover:bg-[#4F6448] text-white text-xs font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50"
                  >
                    {addedSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Added to Shopping List!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Add Missing Essentials ({audit.criticalMissing.length})</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Critical Missing Essentials */}
              {audit.criticalMissing.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#FAECE8]/70 border border-[#F0CEC7] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#A85344]">
                    <AlertTriangle className="w-4 h-4 text-[#A85344]" />
                    Critical Overlooked Essentials
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {audit.criticalMissing.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-[#3D3A35] bg-[#FFFFFF] px-2.5 py-1.5 rounded-lg border border-[#F0CEC7]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#A85344] flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Budget Optimizations */}
              {audit.budgetOptimizations.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-[#E6DFD5] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#4F6448]">
                    <TrendingDown className="w-4 h-4 text-[#4F6448]" />
                    Budget Optimization Opportunities
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#5C564F] pt-1">
                    {audit.budgetOptimizations.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#4F6448] font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Dietary Coverage */}
              {audit.dietaryCoverage && audit.dietaryCoverage.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-[#E6DFD5] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#7A6453]">
                    <Utensils className="w-4 h-4 text-[#7A6453]" />
                    Dietary Requirements Safety Check
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {audit.dietaryCoverage.map((d, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-[#FFFFFF] border border-[#E6DFD5] text-xs">
                        <span className="text-[#3D3A35] font-medium">{d.tag}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          d.status === 'covered' 
                            ? 'bg-[#E8EFE6] text-[#4F6448] border border-[#D0E0CC]' 
                            : 'bg-[#FDF6EB] text-[#A06C28] border border-[#F2E0C4]'
                        }`}>
                          {d.itemCount} items ({d.status === 'covered' ? 'Covered' : 'Needs attention'})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pro Tips */}
              {audit.proTips && audit.proTips.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#F2EAE1] border border-[#E0D1C1] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#7A6453]">
                    <Sparkles className="w-4 h-4 text-[#C29B7F]" />
                    Host Secret Pro-Tips
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#5C564F] pt-1">
                    {audit.proTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#C29B7F] font-bold">★</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#FAF9F6] border-t border-[#E6DFD5] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#F5F2EB] border border-[#E6DFD5] text-[#3D3A35] text-xs font-semibold transition-colors"
          >
            Close Audit
          </button>
        </div>

      </div>
    </div>
  );
};
