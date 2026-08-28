import React from 'react';
import { 
  MapPin, 
  Store, 
  Check, 
  ArrowRight, 
  ExternalLink,
  DollarSign,
  PackageCheck
} from 'lucide-react';
import { PartyPlan, StoreCategory } from '../types';
import { formatCurrency } from '../utils/storage';

interface StoreRoutesViewProps {
  plan: PartyPlan;
  onTogglePurchased: (id: string) => void;
}

export const StoreRoutesView: React.FC<StoreRoutesViewProps> = ({
  plan,
  onTogglePurchased,
}) => {
  // Group items by store category
  const storeGroups = React.useMemo(() => {
    const map = new Map<StoreCategory, typeof plan.items>();
    
    plan.items.forEach(item => {
      const cat = item.storeCategory;
      if (!map.has(cat)) {
        map.set(cat, []);
      }
      map.get(cat)!.push(item);
    });

    return Array.from(map.entries()).map(([store, items]) => {
      const total = items.reduce((s, i) => s + i.estimatedPrice, 0);
      const purchasedCount = items.filter(i => i.isPurchased).length;
      const isComplete = items.length > 0 && purchasedCount === items.length;

      return {
        store,
        items,
        total,
        purchasedCount,
        isComplete,
      };
    });
  }, [plan.items]);

  // Recommended trip order
  const recommendedOrder: StoreCategory[] = [
    'Party Supply Store',
    'Dollar / General Store',
    'Wholesale / Warehouse Club',
    'Beverage & Liquor Depot',
    'Supermarket / Grocery',
    'Bakery / Specialty Market',
  ];

  // Sort groups by optimal run order (dry goods first, cold/perishables last)
  const sortedStoreGroups = [...storeGroups].sort((a, b) => {
    const idxA = recommendedOrder.indexOf(a.store);
    const idxB = recommendedOrder.indexOf(b.store);
    return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
  });

  const totalStores = sortedStoreGroups.length;
  const completedStores = sortedStoreGroups.filter(g => g.isComplete).length;

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6DFD5] text-[#3D3A35] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8EFE6] text-[#5E7356] flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-base sm:text-lg font-bold text-[#3D3A35]">
                Optimal Multi-Store Shopping Route
              </h2>
              <p className="text-xs text-[#7D756D]">
                Sequenced logically: Dry goods & decor first, perishables, warm food & ice last
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#F8F6F0] px-3.5 py-1.5 rounded-xl border border-[#E6DFD5] text-xs font-semibold text-[#5C564F]">
            <PackageCheck className="w-4 h-4 text-[#5E7356]" />
            <span>{completedStores} of {totalStores} Store Stops Finished</span>
          </div>
        </div>
      </div>

      {/* Store Run Sequence */}
      <div className="space-y-4">
        {sortedStoreGroups.map((group, index) => {
          const progressPercent = Math.round((group.purchasedCount / group.items.length) * 100);

          return (
            <div 
              key={group.store}
              className={`rounded-2xl border transition-all shadow-sm ${
                group.isComplete 
                  ? 'bg-[#FFFFFF] border-[#D0E0CC]' 
                  : 'bg-[#FFFFFF] border-[#E6DFD5]'
              }`}
            >
              {/* Store Header */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6DFD5]">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#F5F2EB] text-[#7A6453] font-bold text-xs border border-[#E6DFD5]">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm sm:text-base text-[#3D3A35]">
                        {group.store}
                      </h3>
                      {group.isComplete ? (
                        <span className="flex items-center gap-1 text-[10px] font-semibold bg-[#E8EFE6] text-[#4F6448] px-2 py-0.5 rounded-full border border-[#D0E0CC]">
                          <Check className="w-3 h-3" /> Stop Complete
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#7D756D] bg-[#F8F6F0] px-2 py-0.5 rounded-full border border-[#E6DFD5] font-medium">
                          {group.items.length - group.purchasedCount} items remaining
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#8C857D] mt-0.5">
                      {group.store.includes('Grocery') 
                        ? 'Stop here last for fresh dairy, meats, produce and ice bag chilling.' 
                        : group.store.includes('Liquor') 
                        ? 'Stop for beer, wine cases, specialty bitters, and mocktail syrups.' 
                        : group.store.includes('Warehouse') 
                        ? 'Best value for bulk paper plates, sodas, chips, and snacks.' 
                        : 'Pick up themed decorations, banners, tableware, and lighting.'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="text-right">
                    <div className="text-sm font-bold text-[#4F6448]">
                      {formatCurrency(group.total)}
                    </div>
                    <div className="text-[10px] text-[#8C857D]">
                      {group.purchasedCount}/{group.items.length} items ({progressPercent}%)
                    </div>
                  </div>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(group.store)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F8F6F0] hover:bg-[#F2EAE1] text-[#7A6453] text-xs font-semibold border border-[#E6DFD5] transition-colors"
                  >
                    <span>Find Nearby</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Items in this Store */}
              <div className="divide-y divide-[#E6DFD5]/80">
                {group.items.map(item => (
                  <div 
                    key={item.id}
                    className={`px-4 py-2.5 flex items-center justify-between gap-3 text-xs transition-colors ${
                      item.isPurchased ? 'bg-[#F8F6F0]/60 opacity-75' : 'hover:bg-[#FAF9F6]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => onTogglePurchased(item.id)}
                        className={`flex-shrink-0 w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                          item.isPurchased 
                            ? 'bg-[#5E7356] border-[#4F6448] text-white' 
                            : 'border-[#D0C9BE] hover:border-[#5E7356] bg-[#FFFFFF]'
                        }`}
                      >
                        {item.isPurchased && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>

                      <span className={`truncate ${item.isPurchased ? 'line-through text-[#8C857D]' : 'text-[#3D3A35] font-medium'}`}>
                        {item.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className="px-2 py-0.5 rounded bg-[#F8F6F0] text-[#5C564F] border border-[#E6DFD5] text-[11px] font-semibold">
                        {item.quantity} {item.unit}
                      </span>
                      <span className="font-bold text-[#4F6448] w-14 text-right">
                        {formatCurrency(item.estimatedPrice)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
