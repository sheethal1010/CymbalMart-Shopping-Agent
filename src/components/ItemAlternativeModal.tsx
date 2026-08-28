import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  TrendingDown, 
  Crown, 
  Leaf, 
  ArrowRight, 
  AlertCircle,
} from 'lucide-react';
import { ShoppingItem, PartyPlan } from '../types';
import { formatCurrency } from '../utils/storage';

interface ItemAlternativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ShoppingItem | null;
  plan: PartyPlan;
  onApplySwap: (originalItemId: string, newItem: ShoppingItem) => void;
}

interface AlternativeOption {
  type: 'budget_saver' | 'premium_upgrade' | 'dietary_eco';
  title: string;
  name: string;
  estimatedPrice: number;
  savingsOrDifference: string;
  whyPickThis: string;
  storeCategory?: string;
}

export const ItemAlternativeModal: React.FC<ItemAlternativeModalProps> = ({
  isOpen,
  onClose,
  item,
  plan,
  onApplySwap,
}) => {
  const [loading, setLoading] = useState(false);
  const [alternatives, setAlternatives] = useState<AlternativeOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !item) {
      setAlternatives([]);
      setError(null);
      return;
    }

    const fetchAlternatives = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/suggest-alternatives', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            item,
            theme: plan.theme,
            budgetTier: plan.budgetTier,
          }),
        });

        const data = await res.json();
        if (!data.success || !data.alternatives) {
          throw new Error(data.error || 'Failed to fetch AI alternatives');
        }

        setAlternatives(data.alternatives);
      } catch (err: any) {
        console.error('Failed to suggest alternatives', err);
        setError(err.message || 'Could not load alternatives.');
      } finally {
        setLoading(false);
      }
    };

    fetchAlternatives();
  }, [isOpen, item, plan]);

  if (!isOpen || !item) return null;

  const handleSelectAlternative = (alt: AlternativeOption) => {
    const updated: ShoppingItem = {
      ...item,
      name: alt.name,
      estimatedPrice: alt.estimatedPrice || item.estimatedPrice,
      notes: `${alt.title}: ${alt.whyPickThis}`,
    };

    onApplySwap(item.id, updated);
    onClose();
  };

  const getOptionBadge = (type: string) => {
    switch (type) {
      case 'budget_saver':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E8EFE6] border border-[#D0E0CC] text-[#4F6448] text-xs font-semibold">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Budget Saver</span>
          </div>
        );
      case 'premium_upgrade':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FDF6EB] border border-[#F2E0C4] text-[#A06C28] text-xs font-semibold">
            <Crown className="w-3.5 h-3.5" />
            <span>Gourmet Upgrade</span>
          </div>
        );
      case 'dietary_eco':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF2F4] border border-[#CFE2E6] text-[#4E707A] text-xs font-semibold">
            <Leaf className="w-3.5 h-3.5" />
            <span>Dietary & Eco Swap</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3D3A35]/60 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-xl bg-[#FFFFFF] border border-[#E6DFD5] rounded-3xl shadow-2xl overflow-hidden text-[#3D3A35] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#FAF9F6] border-b border-[#E6DFD5]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F2EAE1] text-[#7A6453] border border-[#E0D1C1] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#C29B7F]" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-[#3D3A35]">
                AI Smart Item Swaps & Budget Alternatives
              </h2>
              <p className="text-xs text-[#7D756D]">
                Current item: <span className="text-[#3D3A35] font-semibold">{item.name}</span> ({formatCurrency(item.estimatedPrice)})
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
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          
          {loading && (
            <div className="py-12 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-[#5E7356]/30 border-t-[#5E7356] rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[#7D756D]">
                Agent is analyzing wholesale prices, dietary substitutes, and gourmet upgrades...
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#FAECE8] border border-[#F0CEC7] text-[#A85344] text-xs">
              <AlertCircle className="w-4 h-4 text-[#A85344] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Failed to load alternatives</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {!loading && alternatives.length > 0 && (
            <div className="space-y-3">
              {alternatives.map((alt, idx) => {
                const isCheaper = alt.estimatedPrice < item.estimatedPrice;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#F8F6F0] border border-[#E6DFD5] hover:border-[#5E7356]/50 transition-all space-y-2.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      {getOptionBadge(alt.type)}
                      <div className="text-right">
                        <div className="text-sm font-bold text-[#3D3A35]">
                          {formatCurrency(alt.estimatedPrice)}
                        </div>
                        <div className={`text-[10px] font-semibold ${
                          isCheaper ? 'text-[#4F6448]' : 'text-[#A06C28]'
                        }`}>
                          {alt.savingsOrDifference}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-[#3D3A35]">{alt.name}</h4>
                      <p className="text-xs text-[#5C564F] mt-0.5 leading-relaxed">{alt.whyPickThis}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#E6DFD5]">
                      <span className="text-[11px] text-[#8C857D]">
                        {alt.storeCategory ? `Found at: ${alt.storeCategory}` : ''}
                      </span>
                      <button
                        onClick={() => handleSelectAlternative(alt)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#5E7356] hover:bg-[#4F6448] text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
                      >
                        <span>Swap into List</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#FAF9F6] border-t border-[#E6DFD5] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#F5F2EB] border border-[#E6DFD5] text-[#5C564F] text-xs font-medium transition-colors"
          >
            Keep Original Item
          </button>
        </div>

      </div>
    </div>
  );
};
