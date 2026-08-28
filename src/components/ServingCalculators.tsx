import React from 'react';
import { 
  Calculator, 
  Wine, 
  Utensils, 
  Sparkles, 
  Info, 
  CupSoda, 
  Package,
} from 'lucide-react';
import { PartyPlan } from '../types';

interface ServingCalculatorsProps {
  plan: PartyPlan;
  onUpdatePlan: (updated: PartyPlan) => void;
}

export const ServingCalculators: React.FC<ServingCalculatorsProps> = ({
  plan,
}) => {
  const { guestCount, durationHours } = plan;
  const adults = guestCount.adults || 0;
  const kids = guestCount.kids || 0;
  const totalGuests = adults + kids;
  const drinkers = guestCount.drinkers || 0;
  const nonDrinkers = guestCount.nonDrinkers || 0;

  // Real-time calculator metrics
  // Drinks math: 2 drinks 1st hour + 1 drink each subsequent hour
  const drinksPerDrinker = Math.max(1, Math.round(2 + Math.max(0, durationHours - 1)));
  const totalAlcoholicDrinks = drinkers * drinksPerDrinker;
  
  // Suggested drink distribution: 45% Beer/Seltzer, 35% Wine, 20% Spirits/Cocktails
  const beerCans = Math.round(totalAlcoholicDrinks * 0.45);
  const wineBottles = Math.ceil((totalAlcoholicDrinks * 0.35) / 5); // 5 glasses per 750ml bottle
  const spiritBottles = Math.ceil((totalAlcoholicDrinks * 0.20) / 16); // 16 1.5oz pours per 750ml
  const nonAlcoholicDrinks = Math.round((nonDrinkers * durationHours * 1.5) + (drinkers * 1));

  // Food math: 2-3 hr cocktail party = 6-8 bites/person; 4+ hr dinner = 10-12 bites or meal portions
  const appetizerBitesPerPerson = durationHours <= 2.5 ? 6 : durationHours <= 4 ? 9 : 12;
  const totalAppetizerBites = totalGuests * appetizerBitesPerPerson;
  const meatLbsNeeded = Math.round((adults * 0.5 + kids * 0.25) * 10) / 10;
  const chipBagsNeeded = Math.ceil((totalGuests * 3) / 16);

  // Ice math: 1.5 lbs ice per guest (drink ice + cooler chilling)
  const iceLbsNeeded = Math.ceil(totalGuests * 1.5);
  const iceBags10lb = Math.ceil(iceLbsNeeded / 10);

  // Tableware buffer: 2.2x cups and napkins
  const cupsNeeded = Math.ceil(totalGuests * 2.2);
  const napkinsNeeded = Math.ceil(totalGuests * 2.8);
  const platesNeeded = Math.ceil(totalGuests * 1.8);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6DFD5] text-[#3D3A35] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8EFE6] text-[#5E7356] flex items-center justify-center flex-shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-base sm:text-lg font-bold text-[#3D3A35]">
                Party Catering & Beverage Ratio Engine
              </h2>
              <p className="text-xs text-[#7D756D]">
                Scientifically calculated catering yields for {totalGuests} guests over {durationHours} hours
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs bg-[#F8F6F0] px-3.5 py-1.5 rounded-xl border border-[#E6DFD5] text-[#5C564F]">
            <Info className="w-3.5 h-3.5 text-[#5E7356]" />
            <span>Formulas calibrated to standard event industry standards</span>
          </div>
        </div>
      </div>

      {/* Grid of Interactive Ratio Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* 1. Bar & Beverage Ratios */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6DFD5] space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-[#7A5B69]">
              <Wine className="w-4 h-4 text-[#7A5B69]" />
              Beverage & Alcohol Formula
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F5EDF1] text-[#7A5B69] border border-[#E7D6E0]">
              {drinkers} Drinkers • {nonDrinkers} Non-Drinkers
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="p-3 rounded-xl bg-[#F8F6F0] border border-[#E6DFD5] text-center">
              <div className="text-xl font-bold text-[#3D3A35]">{beerCans}</div>
              <div className="text-[10px] text-[#7D756D] font-medium">Beer / Seltzer (Cans)</div>
            </div>
            <div className="p-3 rounded-xl bg-[#F8F6F0] border border-[#E6DFD5] text-center">
              <div className="text-xl font-bold text-[#3D3A35]">{wineBottles}</div>
              <div className="text-[10px] text-[#7D756D] font-medium">Wine (750ml Bottles)</div>
            </div>
            <div className="p-3 rounded-xl bg-[#F8F6F0] border border-[#E6DFD5] text-center">
              <div className="text-xl font-bold text-[#3D3A35]">{spiritBottles}</div>
              <div className="text-[10px] text-[#7D756D] font-medium">Spirits (750ml Bottles)</div>
            </div>
            <div className="p-3 rounded-xl bg-[#F8F6F0] border border-[#E6DFD5] text-center">
              <div className="text-xl font-bold text-[#4F6448]">{nonAlcoholicDrinks}</div>
              <div className="text-[10px] text-[#7D756D] font-medium">Sodas / Mocktails</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#F8F6F0] border border-[#E6DFD5] text-xs text-[#5C564F] space-y-1">
            <div className="font-semibold text-[#3D3A35]">How this is calculated:</div>
            <p className="text-[11px] text-[#7D756D] leading-relaxed">
              Standard consumption: 2 drinks during hour 1, plus 1 drink per hour thereafter = <strong className="text-[#3D3A35]">{drinksPerDrinker} drinks/guest</strong>. Wine yields 5 glasses per bottle; liquor yields 16 cocktails per 750ml.
            </p>
          </div>
        </div>

        {/* 2. Food & Portions */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6DFD5] space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-[#8C5D39]">
              <Utensils className="w-4 h-4 text-[#8C5D39]" />
              Food & Appetizer Portions
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F7EFE9] text-[#8C5D39] border border-[#EAD8C7]">
              {totalGuests} Total Attendees
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="p-3 rounded-xl bg-[#F8F6F0] border border-[#E6DFD5] text-center">
              <div className="text-xl font-bold text-[#3D3A35]">{totalAppetizerBites}</div>
              <div className="text-[10px] text-[#7D756D] font-medium">Appetizer Bites</div>
            </div>
            <div className="p-3 rounded-xl bg-[#F8F6F0] border border-[#E6DFD5] text-center">
              <div className="text-xl font-bold text-[#3D3A35]">{meatLbsNeeded} lbs</div>
              <div className="text-[10px] text-[#7D756D] font-medium">Main Protein</div>
            </div>
            <div className="p-3 rounded-xl bg-[#F8F6F0] border border-[#E6DFD5] text-center">
              <div className="text-xl font-bold text-[#3D3A35]">{chipBagsNeeded}</div>
              <div className="text-[10px] text-[#7D756D] font-medium">Large Chip Bags</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#F8F6F0] border border-[#E6DFD5] text-xs text-[#5C564F] space-y-1">
            <div className="font-semibold text-[#3D3A35]">How this is calculated:</div>
            <p className="text-[11px] text-[#7D756D] leading-relaxed">
              Based on a {durationHours}-hour event. For cocktail parties, budget {appetizerBitesPerPerson} bite portions per person. If serving a main dinner, target 0.5 lb cooked protein per adult and 0.25 lb per kid.
            </p>
          </div>
        </div>

        {/* 3. Ice & Cooler Requirements */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6DFD5] space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-[#4E707A]">
              <CupSoda className="w-4 h-4 text-[#4E707A]" />
              Ice & Cooler Logistics
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EAF2F4] text-[#4E707A] border border-[#CFE2E6]">
              Chilling + Drinks
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="p-3 rounded-xl bg-[#F8F6F0] border border-[#E6DFD5] text-center">
              <div className="text-xl font-bold text-[#4E707A]">{iceLbsNeeded} lbs</div>
              <div className="text-[10px] text-[#7D756D] font-medium">Total Clean Ice</div>
            </div>
            <div className="p-3 rounded-xl bg-[#F8F6F0] border border-[#E6DFD5] text-center">
              <div className="text-xl font-bold text-[#3D3A35]">{iceBags10lb} bags</div>
              <div className="text-[10px] text-[#7D756D] font-medium">Standard 10-lb Bags</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#F8F6F0] border border-[#E6DFD5] text-xs text-[#5C564F] space-y-1">
            <div className="font-semibold text-[#3D3A35]">Pro-Tip from the Agent:</div>
            <p className="text-[11px] text-[#7D756D] leading-relaxed">
              Allocate half the ice directly into coolers with salt for ice-cold beer and seltzers, and reserve the other half in clean tubs with tongs for cocktail drink cups.
            </p>
          </div>
        </div>

        {/* 4. Tableware & Disposables Buffer */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6DFD5] space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-[#5E7356]">
              <Package className="w-4 h-4 text-[#5E7356]" />
              Disposables & Tableware Buffer
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#E8EFE6] text-[#4F6448] border border-[#D0E0CC]">
              Prevents Shortages
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="p-3 rounded-xl bg-[#F8F6F0] border border-[#E6DFD5] text-center">
              <div className="text-xl font-bold text-[#3D3A35]">{cupsNeeded}</div>
              <div className="text-[10px] text-[#7D756D] font-medium">16oz Party Cups</div>
            </div>
            <div className="p-3 rounded-xl bg-[#F8F6F0] border border-[#E6DFD5] text-center">
              <div className="text-xl font-bold text-[#3D3A35]">{platesNeeded}</div>
              <div className="text-[10px] text-[#7D756D] font-medium">Sturdy Plates</div>
            </div>
            <div className="p-3 rounded-xl bg-[#F8F6F0] border border-[#E6DFD5] text-center">
              <div className="text-xl font-bold text-[#3D3A35]">{napkinsNeeded}</div>
              <div className="text-[10px] text-[#7D756D] font-medium">Party Napkins</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#F8F6F0] border border-[#E6DFD5] text-xs text-[#5C564F] space-y-1">
            <div className="font-semibold text-[#3D3A35]">Why the multiplier?</div>
            <p className="text-[11px] text-[#7D756D] leading-relaxed">
              Guests set down and lose cups an average of 1.5–2 times per party. Always provide markers to write names on cups to save 30% on disposable cup waste!
            </p>
          </div>
        </div>

      </div>

      {/* AI Saved Plan Ratios summary */}
      {plan.servingRatios && plan.servingRatios.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6DFD5] space-y-3 shadow-sm">
          <h3 className="font-serif text-sm font-bold text-[#3D3A35] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C29B7F]" />
            AI Tailored Ratios for "{plan.title}"
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {plan.servingRatios.map((ratio) => (
              <div key={ratio.id} className="p-3.5 rounded-xl bg-[#F8F6F0] border border-[#E6DFD5] text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#7A6453]">{ratio.label}</span>
                  <span className="text-[10px] text-[#8C857D] uppercase tracking-wider font-semibold">{ratio.category}</span>
                </div>
                <div className="font-bold text-[#3D3A35] text-sm">{ratio.calculatedAmount}</div>
                <div className="text-[11px] text-[#7D756D]">{ratio.formulaExplanation}</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
