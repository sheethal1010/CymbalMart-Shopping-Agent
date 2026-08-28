import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Users, 
  DollarSign, 
  Clock, 
  Home, 
  Check, 
  Wand2,
  AlertCircle,
} from 'lucide-react';
import { PartyPlan } from '../types';

interface PartyWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanCreated: (plan: PartyPlan) => void;
}

const THEME_INSPIRATIONS = [
  { title: "Alex's Neon 80s Disco", type: 'Birthday Party', theme: 'Neon 80s Retro Arcade', vibe: 'Energetic, funky synthwave & glow vibes', budget: 400, adults: 20, kids: 0 },
  { title: 'Backyard Taco & Margarita Fiesta', type: 'Dinner & Social', theme: 'Authentic Street Taco Bar', vibe: 'Festive, sun-soaked outdoor evening', budget: 320, adults: 16, kids: 4 },
  { title: 'Tuscan Wine & Artisan Charcuterie', type: 'Cocktail Soirée', theme: 'Rustic Italian Vineyard', vibe: 'Intimate, sophisticated, jazz background', budget: 350, adults: 12, kids: 0 },
  { title: 'Jurassic Dinosaur Dino Quest', type: "Kid's Birthday", theme: 'Prehistoric Jungle Expedition', vibe: 'Playful, adventurous, roaring fun', budget: 250, adults: 8, kids: 14 },
  { title: 'Game Night Craft Beer & Sliders', type: 'Game Night', theme: 'Cozy Board Game Parlor', vibe: 'Casual, competitive, craft tasting', budget: 200, adults: 10, kids: 0 },
  { title: 'Summer Poolside Tiki Lounge', type: 'Pool / BBQ Party', theme: 'Tropical Hawaiian Luau', vibe: 'Breezy, tropical cocktails, ukulele jams', budget: 450, adults: 18, kids: 6 },
];

const DIETARY_OPTIONS = [
  'Vegetarian Friendly',
  'Vegan Options',
  'Gluten-Free Snacks',
  'Nut-Free Safe',
  'Dairy-Free / Lactose-Free',
  'Halal Friendly',
  'Kosher Friendly',
  'Low Sugar / Keto',
  'Non-Alcoholic Mocktails Focus',
];

const OWNED_SUPPLY_OPTIONS = [
  'Cooler / Ice Chest',
  'Bluetooth Speaker',
  'Grill / BBQ Pit',
  'Punch Bowl & Ladle',
  'Folding Tables & Chairs',
  'Wine Opener & Cocktail Shaker',
  'Serving Platters & Bowls',
  'Patio String Lights',
];

export const PartyWizardModal: React.FC<PartyWizardModalProps> = ({
  isOpen,
  onClose,
  onPlanCreated,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('Birthday Party');
  const [theme, setTheme] = useState('');
  const [vibe, setVibe] = useState('');
  
  const [adults, setAdults] = useState(14);
  const [kids, setKids] = useState(0);
  const [drinkers, setDrinkers] = useState(12);
  const [nonDrinkers, setNonDrinkers] = useState(2);
  
  const [durationHours, setDurationHours] = useState(3.5);
  const [budgetTarget, setBudgetTarget] = useState(350);
  const [budgetTier, setBudgetTier] = useState<'budget' | 'balanced' | 'premium'>('balanced');
  const [venueType, setVenueType] = useState<'indoor' | 'backyard' | 'park' | 'rented_venue'>('indoor');
  
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [selectedOwned, setSelectedOwned] = useState<string[]>(['Bluetooth Speaker', 'Cooler / Ice Chest']);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof THEME_INSPIRATIONS[0]) => {
    setTitle(preset.title);
    setEventType(preset.type);
    setTheme(preset.theme);
    setVibe(preset.vibe);
    setBudgetTarget(preset.budget);
    setAdults(preset.adults);
    setKids(preset.kids);
    setDrinkers(Math.max(0, preset.adults - 2));
    setNonDrinkers(preset.kids + 2);
  };

  const toggleDietary = (item: string) => {
    setSelectedDietary(prev => 
      prev.includes(item) ? prev.filter(d => d !== item) : [...prev, item]
    );
  };

  const toggleOwned = (item: string) => {
    setSelectedOwned(prev => 
      prev.includes(item) ? prev.filter(d => d !== item) : [...prev, item]
    );
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg(null);

    const payload = {
      title: title.trim() || `${theme || eventType} Celebration`,
      eventType,
      theme: theme.trim() || 'Festive Celebration',
      vibe: vibe.trim() || 'Fun, upbeat, and welcoming atmosphere',
      guestCount: {
        adults: Number(adults) || 1,
        kids: Number(kids) || 0,
        drinkers: Number(drinkers) || 0,
        nonDrinkers: Number(nonDrinkers) || 0,
      },
      durationHours: Number(durationHours) || 3,
      budgetTarget: Number(budgetTarget) || 250,
      budgetTier,
      venueType,
      dietaryRestrictions: selectedDietary,
      ownedSupplies: selectedOwned,
    };

    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success || !data.plan) {
        throw new Error(data.error || 'Failed to generate party plan');
      }

      onPlanCreated(data.plan);
      onClose();
    } catch (err: any) {
      console.error('AI Plan Generation failed', err);
      setErrorMsg(err.message || 'Failed to connect to AI server. Please check your settings or try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3D3A35]/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-[#FFFFFF] border border-[#E6DFD5] rounded-3xl shadow-2xl overflow-hidden my-8 text-[#3D3A35] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#FAF9F6] border-b border-[#E6DFD5]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#5E7356] text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-[#3D3A35] tracking-tight">
                  CymbalMart Party Planner Wizard
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8EFE6] text-[#4F6448] border border-[#D0E0CC]">
                  CUJ Step 1: Define Event
                </span>
              </div>
              <p className="text-xs text-[#7D756D]">
                Define event type, theme, budget target, guest counts, and special requests
              </p>
            </div>
          </div>
          <button
            id="close-wizard-btn"
            onClick={onClose}
            disabled={isGenerating}
            className="p-1.5 text-[#8C857D] hover:text-[#3D3A35] rounded-lg hover:bg-[#F5F2EB] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 bg-[#F8F6F0] border-b border-[#E6DFD5] text-xs">
          <button
            onClick={() => setStep(1)}
            disabled={isGenerating}
            className={`py-3 px-3 text-center font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              step === 1 ? 'text-[#4F6448] border-b-2 border-[#5E7356] bg-[#E8EFE6]/60' : 'text-[#7D756D] hover:text-[#3D3A35]'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-[#FFFFFF] text-[10px] flex items-center justify-center border border-[#E6DFD5] font-bold">1</span>
            Occasion & Vibe
          </button>
          <button
            onClick={() => setStep(2)}
            disabled={isGenerating}
            className={`py-3 px-3 text-center font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              step === 2 ? 'text-[#4F6448] border-b-2 border-[#5E7356] bg-[#E8EFE6]/60' : 'text-[#7D756D] hover:text-[#3D3A35]'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-[#FFFFFF] text-[10px] flex items-center justify-center border border-[#E6DFD5] font-bold">2</span>
            Guests & Diet
          </button>
          <button
            onClick={() => setStep(3)}
            disabled={isGenerating}
            className={`py-3 px-3 text-center font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              step === 3 ? 'text-[#4F6448] border-b-2 border-[#5E7356] bg-[#E8EFE6]/60' : 'text-[#7D756D] hover:text-[#3D3A35]'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-[#FFFFFF] text-[10px] flex items-center justify-center border border-[#E6DFD5] font-bold">3</span>
            Budget & Venue
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[65vh] space-y-5">
          
          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#FAECE8] border border-[#F0CEC7] text-[#A85344] text-xs">
              <AlertCircle className="w-4 h-4 text-[#A85344] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Planning Error</p>
                <p>{errorMsg}</p>
              </div>
            </div>
          )}

          {/* STEP 1: Occasion & Theme */}
          {step === 1 && (
            <div className="space-y-4">
              
              {/* Quick Inspiration Presets */}
              <div>
                <label className="text-xs font-semibold text-[#7D756D] uppercase tracking-wider block mb-2">
                  ✨ Quick Theme Inspiration (Click to prefill)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {THEME_INSPIRATIONS.map((insp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(insp)}
                      className="p-2.5 text-left rounded-xl bg-[#F8F6F0] hover:bg-[#F5F2EB] border border-[#E6DFD5] hover:border-[#5E7356]/60 transition-all text-xs group"
                    >
                      <div className="font-semibold text-[#3D3A35] group-hover:text-[#5E7356] truncate">
                        {insp.title}
                      </div>
                      <div className="text-[10px] text-[#8C857D] truncate">
                        ${insp.budget} • {insp.adults} guests
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Occasion */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#5C564F] block mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Jordan's 30th Birthday Bash"
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E6DFD5] rounded-xl text-sm text-[#3D3A35] placeholder-[#8C857D] focus:outline-none focus:border-[#5E7356]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#5C564F] block mb-1">
                    Event Type
                  </label>
                  <select
                    value={eventType}
                    onChange={e => setEventType(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E6DFD5] rounded-xl text-sm text-[#3D3A35] focus:outline-none focus:border-[#5E7356]"
                  >
                    <option>Birthday Party</option>
                    <option>Dinner & Social</option>
                    <option>Cocktail Soirée</option>
                    <option>Summer Pool / BBQ Party</option>
                    <option>Game Night</option>
                    <option>Holiday / Festive Gathering</option>
                    <option>Housewarming</option>
                    <option>Baby / Bridal Shower</option>
                    <option>Tailgate / Sports Watch Party</option>
                    <option>Custom Celebration</option>
                  </select>
                </div>
              </div>

              {/* Theme & Vibe */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#5C564F] block mb-1">
                    Theme / Aesthetic
                  </label>
                  <input
                    type="text"
                    value={theme}
                    onChange={e => setTheme(e.target.value)}
                    placeholder="e.g. Retro 80s Disco, Rustic Farmhouse, Tropical Luau"
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E6DFD5] rounded-xl text-sm text-[#3D3A35] placeholder-[#8C857D] focus:outline-none focus:border-[#5E7356]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#5C564F] block mb-1">
                    Vibe & Atmosphere
                  </label>
                  <input
                    type="text"
                    value={vibe}
                    onChange={e => setVibe(e.target.value)}
                    placeholder="e.g. High energy dance, Cozy & intimate, Chill poolside"
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E6DFD5] rounded-xl text-sm text-[#3D3A35] placeholder-[#8C857D] focus:outline-none focus:border-[#5E7356]"
                  />
                </div>
              </div>

            </div>
          )}

          {/* STEP 2: Guests & Dietary */}
          {step === 2 && (
            <div className="space-y-4">
              
              {/* Guest Counts */}
              <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-[#E6DFD5] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#3D3A35]">
                    <Users className="w-4 h-4 text-[#7A6453]" />
                    Guest Count Breakdown
                  </div>
                  <div className="text-xs text-[#4F6448] font-bold bg-[#E8EFE6] px-2.5 py-0.5 rounded-full border border-[#D0E0CC]">
                    Total: {adults + kids} Attendees
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] text-[#7D756D] block mb-1 font-medium">Adults</label>
                    <input
                      type="number"
                      min="1"
                      max="200"
                      value={adults}
                      onChange={e => {
                        const val = Math.max(1, parseInt(e.target.value) || 1);
                        setAdults(val);
                        if (drinkers > val) setDrinkers(val);
                      }}
                      className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E6DFD5] rounded-lg text-sm text-[#3D3A35] font-semibold focus:outline-none focus:border-[#5E7356]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#7D756D] block mb-1 font-medium">Kids / Teens</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={kids}
                      onChange={e => {
                        const val = Math.max(0, parseInt(e.target.value) || 0);
                        setKids(val);
                      }}
                      className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E6DFD5] rounded-lg text-sm text-[#3D3A35] font-semibold focus:outline-none focus:border-[#5E7356]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#7D756D] block mb-1 font-medium">Drinkers (Alcohol)</label>
                    <input
                      type="number"
                      min="0"
                      max={adults}
                      value={drinkers}
                      onChange={e => {
                        const val = Math.min(adults, Math.max(0, parseInt(e.target.value) || 0));
                        setDrinkers(val);
                        setNonDrinkers(adults - val + kids);
                      }}
                      className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E6DFD5] rounded-lg text-sm text-[#3D3A35] font-semibold focus:outline-none focus:border-[#5E7356]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#7D756D] block mb-1 font-medium">Non-Drinkers</label>
                    <input
                      type="number"
                      min="0"
                      value={nonDrinkers}
                      onChange={e => setNonDrinkers(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E6DFD5] rounded-lg text-sm text-[#3D3A35] font-semibold focus:outline-none focus:border-[#5E7356]"
                    />
                  </div>
                </div>
              </div>

              {/* Dietary Preferences */}
              <div>
                <label className="text-xs font-semibold text-[#7D756D] uppercase tracking-wider block mb-2">
                  🥗 Dietary Needs & Menu Specializations
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DIETARY_OPTIONS.map((item) => {
                    const isSelected = selectedDietary.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleDietary(item)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs text-left transition-all ${
                          isSelected
                            ? 'bg-[#E8EFE6] border-[#5E7356]/50 text-[#4F6448] font-semibold shadow-xs'
                            : 'bg-[#F8F6F0] border-[#E6DFD5] text-[#7D756D] hover:text-[#3D3A35]'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                          isSelected ? 'bg-[#5E7356] border-[#4F6448] text-white' : 'border-[#D0C9BE] bg-white'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="truncate">{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* STEP 3: Budget, Venue & Owned Supplies */}
          {step === 3 && (
            <div className="space-y-4">
              
              {/* Budget & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Budget */}
                <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-[#E6DFD5] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#3D3A35] flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-[#5E7356]" />
                      Budget Target
                    </label>
                    <span className="text-base font-bold text-[#4F6448]">${budgetTarget}</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="2000"
                    step="25"
                    value={budgetTarget}
                    onChange={e => setBudgetTarget(Number(e.target.value))}
                    className="w-full accent-[#5E7356] cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[10px] text-[#8C857D]">
                    <span>${Math.round(budgetTarget / Math.max(1, adults + kids))} / guest</span>
                    <span>Max: $2,000</span>
                  </div>
                </div>

                {/* Duration & Venue */}
                <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-[#E6DFD5] space-y-2">
                  <label className="text-xs font-semibold text-[#3D3A35] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#7A6453]" />
                    Party Duration
                  </label>
                  <select
                    value={durationHours}
                    onChange={e => setDurationHours(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E6DFD5] rounded-lg text-xs text-[#3D3A35] focus:outline-none"
                  >
                    <option value={2}>2 Hours (Light snacks & drinks)</option>
                    <option value={3}>3 Hours (Standard evening)</option>
                    <option value={4}>4 Hours (Full party with meal/rounds)</option>
                    <option value={5}>5+ Hours (Extended celebration / BBQ)</option>
                  </select>

                  <label className="text-xs font-semibold text-[#3D3A35] flex items-center gap-1.5 pt-1">
                    <Home className="w-3.5 h-3.5 text-[#5E7356]" />
                    Venue Type
                  </label>
                  <select
                    value={venueType}
                    onChange={e => setVenueType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E6DFD5] rounded-lg text-xs text-[#3D3A35] focus:outline-none"
                  >
                    <option value="indoor">Indoor (Home / Apartment)</option>
                    <option value="backyard">Backyard / Patio</option>
                    <option value="park">Public Park / Outdoor Pavilion</option>
                    <option value="rented_venue">Rented Hall / Studio</option>
                  </select>
                </div>

              </div>

              {/* Quality / Budget Tier */}
              <div>
                <label className="text-xs font-semibold text-[#7D756D] uppercase tracking-wider block mb-2">
                  Quality & Price Tier
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'budget', label: 'Budget Saver', desc: 'Smart store brands & wholesale packs' },
                    { id: 'balanced', label: 'Balanced Quality', desc: 'Mix of crowd favorites & value picks' },
                    { id: 'premium', label: 'Gourmet / Artisan', desc: 'Top-shelf spirits & craft fare' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setBudgetTier(t.id as any)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        budgetTier === t.id
                          ? 'bg-[#F2EAE1] border-[#C29B7F] text-[#7A6453] shadow-xs'
                          : 'bg-[#F8F6F0] border-[#E6DFD5] text-[#7D756D] hover:text-[#3D3A35]'
                      }`}
                    >
                      <div className="font-semibold text-xs text-[#3D3A35]">{t.label}</div>
                      <div className="text-[10px] text-[#8C857D] mt-0.5 leading-tight">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Already Owned Supplies */}
              <div>
                <label className="text-xs font-semibold text-[#7D756D] uppercase tracking-wider block mb-2">
                  📦 Supplies You Already Own (AI won't re-buy)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {OWNED_SUPPLY_OPTIONS.map((item) => {
                    const isSelected = selectedOwned.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleOwned(item)}
                        className={`flex items-center gap-1.5 p-2.5 rounded-xl border text-xs text-left transition-all ${
                          isSelected
                            ? 'bg-[#E8EFE6] border-[#5E7356]/50 text-[#4F6448] font-semibold'
                            : 'bg-[#F8F6F0] border-[#E6DFD5] text-[#7D756D] hover:text-[#3D3A35]'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded flex items-center justify-center border ${
                          isSelected ? 'bg-[#5E7356] border-[#4F6448] text-white' : 'border-[#D0C9BE] bg-white'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span className="truncate">{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#FAF9F6] border-t border-[#E6DFD5]">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((step - 1) as any)}
                disabled={isGenerating}
                className="px-4 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#F5F2EB] border border-[#E6DFD5] text-[#3D3A35] text-xs font-medium transition-colors"
              >
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                disabled={isGenerating}
                className="px-4 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#F5F2EB] border border-[#E6DFD5] text-[#7D756D] text-xs font-medium transition-colors"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((step + 1) as any)}
                className="px-5 py-2 rounded-xl bg-[#5E7356] hover:bg-[#4F6448] text-white text-xs font-semibold shadow-sm transition-colors"
              >
                Next Step
              </button>
            ) : (
              <button
                type="button"
                id="generate-plan-submit-btn"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#5E7356] hover:bg-[#4F6448] text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Procuring Party Plan with AI...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Generate AI Shopping List</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
