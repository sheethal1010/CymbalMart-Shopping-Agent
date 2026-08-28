import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  ShoppingBag, 
  Calculator, 
  MapPin, 
  Calendar, 
  Sparkles, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  Bot,
} from 'lucide-react';

import { PartyPlan, ShoppingItem } from './types';
import { 
  getSavedPlans, 
  savePlans, 
  getActivePlanId, 
  setActivePlanId, 
  formatCurrency 
} from './utils/storage';

import { Navbar } from './components/Navbar';
import { ShoppingListView } from './components/ShoppingListView';
import { ServingCalculators } from './components/ServingCalculators';
import { StoreRoutesView } from './components/StoreRoutesView';
import { TimelinePrepView } from './components/TimelinePrepView';
import { PartyWizardModal } from './components/PartyWizardModal';
import { ItemAlternativeModal } from './components/ItemAlternativeModal';
import { PartyAuditModal } from './components/PartyAuditModal';
import { ExportShareModal } from './components/ExportShareModal';
import { AgentChatDrawer } from './components/AgentChatDrawer';
import { CymbalCheckoutModal } from './components/CymbalCheckoutModal';

export default function App() {
  // Global Party State
  const [plans, setPlans] = useState<PartyPlan[]>([]);
  const [activePlanId, setActiveId] = useState<string>('');
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'shopping' | 'calculators' | 'stores' | 'timeline'>('shopping');

  // Modals & Drawers
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  // Alternative modal item
  const [selectedAlternativeItem, setSelectedAlternativeItem] = useState<ShoppingItem | null>(null);

  // Initialize from storage
  useEffect(() => {
    const loadedPlans = getSavedPlans();
    setPlans(loadedPlans);
    const initialActiveId = getActivePlanId();
    if (loadedPlans.some(p => p.id === initialActiveId)) {
      setActiveId(initialActiveId);
    } else if (loadedPlans.length > 0) {
      setActiveId(loadedPlans[0].id);
    }
  }, []);

  // Sync to storage on change
  const updateActivePlan = (updater: (prev: PartyPlan) => PartyPlan) => {
    setPlans(prevPlans => {
      const nextPlans = prevPlans.map(p => {
        if (p.id === activePlanId) {
          const updated = updater(p);
          return { ...updated, updatedAt: new Date().toISOString() };
        }
        return p;
      });
      savePlans(nextPlans);
      return nextPlans;
    });
  };

  const handleSelectPlan = (id: string) => {
    setActiveId(id);
    setActivePlanId(id);
  };

  const handlePlanCreated = (newPlan: PartyPlan) => {
    setPlans(prev => {
      const next = [newPlan, ...prev];
      savePlans(next);
      return next;
    });
    setActiveId(newPlan.id);
    setActivePlanId(newPlan.id);

    // Celebratory confetti for creating a complete new party plan
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const activePlan = useMemo(() => {
    return plans.find(p => p.id === activePlanId) || plans[0] || null;
  }, [plans, activePlanId]);

  // Shopping List item handlers
  const handleTogglePurchased = (itemId: string) => {
    if (!activePlan) return;
    updateActivePlan(p => {
      const items = p.items.map(i => {
        if (i.id === itemId) {
          return { ...i, isPurchased: !i.isPurchased };
        }
        return i;
      });

      // Check if all are purchased for confetti
      const allDone = items.length > 0 && items.every(i => i.isPurchased);
      if (allDone) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
        });
      }

      return { ...p, items };
    });
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    updateActivePlan(p => ({
      ...p,
      items: p.items.map(i => {
        if (i.id === itemId) {
          const newQty = Math.max(1, i.quantity + delta);
          const unitPrice = i.estimatedPrice / (i.quantity || 1);
          return {
            ...i,
            quantity: newQty,
            estimatedPrice: Math.round(unitPrice * newQty * 100) / 100,
          };
        }
        return i;
      }),
    }));
  };

  const handleUpdatePrice = (itemId: string, newPrice: number) => {
    updateActivePlan(p => ({
      ...p,
      items: p.items.map(i => i.id === itemId ? { ...i, estimatedPrice: newPrice } : i),
    }));
  };

  const handleDeleteItem = (itemId: string) => {
    updateActivePlan(p => ({
      ...p,
      items: p.items.filter(i => i.id !== itemId),
    }));
  };

  const handleAddItem = (newItem: Omit<ShoppingItem, 'id' | 'isPurchased'>) => {
    const item: ShoppingItem = {
      ...newItem,
      id: `custom-item-${Date.now()}`,
      isPurchased: false,
    };
    updateActivePlan(p => ({
      ...p,
      items: [item, ...p.items],
    }));
  };

  const handleBulkMarkPurchased = (purchased: boolean) => {
    updateActivePlan(p => ({
      ...p,
      items: p.items.map(i => ({ ...i, isPurchased: purchased })),
    }));
  };

  const handleApplySwap = (originalItemId: string, swappedItem: ShoppingItem) => {
    updateActivePlan(p => ({
      ...p,
      items: p.items.map(i => i.id === originalItemId ? swappedItem : i),
    }));
  };

  const handleAddMissingItemsFromAudit = (newItems: Omit<ShoppingItem, 'id' | 'isPurchased'>[]) => {
    const formatted: ShoppingItem[] = newItems.map((it, idx) => ({
      ...it,
      id: `audit-item-${Date.now()}-${idx}`,
      isPurchased: false,
    }));

    updateActivePlan(p => ({
      ...p,
      items: [...formatted, ...p.items],
    }));
  };

  const handleToggleTimelineStep = (stepId: string) => {
    updateActivePlan(p => ({
      ...p,
      timelineSteps: (p.timelineSteps || []).map(s => s.id === stepId ? { ...s, completed: !s.completed } : s),
    }));
  };

  const handleApplyChatAdjustments = (adjustments: {
    itemsToAdd?: Omit<ShoppingItem, 'id' | 'isPurchased'>[];
    itemIdsToRemove?: string[];
    priceAdjustments?: { id: string; newPrice: number; reason: string }[];
  }) => {
    updateActivePlan(p => {
      let updatedItems = [...p.items];

      // 1. Remove items
      if (adjustments.itemIdsToRemove && adjustments.itemIdsToRemove.length > 0) {
        updatedItems = updatedItems.filter(i => !adjustments.itemIdsToRemove?.includes(i.id));
      }

      // 2. Add items
      if (adjustments.itemsToAdd && adjustments.itemsToAdd.length > 0) {
        const toAdd: ShoppingItem[] = adjustments.itemsToAdd.map((it, idx) => ({
          ...it,
          id: `ai-adj-${Date.now()}-${idx}`,
          isPurchased: false,
        }));
        updatedItems = [...toAdd, ...updatedItems];
      }

      // 3. Price Adjustments
      if (adjustments.priceAdjustments && adjustments.priceAdjustments.length > 0) {
        adjustments.priceAdjustments.forEach(adj => {
          const found = updatedItems.find(i => i.id === adj.id || i.name.toLowerCase().includes(adj.id.toLowerCase()));
          if (found) {
            found.estimatedPrice = adj.newPrice;
            found.notes = `${found.notes || ''} [Agent: ${adj.reason}]`.trim();
          }
        });
      }

      return { ...p, items: updatedItems };
    });
  };

  if (!activePlan) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#3D3A35] flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md bg-[#FFFFFF] p-8 rounded-3xl border border-[#E6DFD5] shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#E8EFE6] text-[#5E7356] flex items-center justify-center mx-auto border border-[#D0E0CC]">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#3D3A35]">Welcome to Party Planner Shopping Agent</h1>
          <p className="text-sm text-[#7D756D] leading-relaxed">
            Let our AI shopping concierge calculate your drink ratios, food portions, and store shopping routes.
          </p>
          <button
            onClick={() => setIsWizardOpen(true)}
            className="px-6 py-3 rounded-xl bg-[#5E7356] hover:bg-[#4F6448] text-white font-semibold shadow-sm transition-all"
          >
            Create Your First Party Plan
          </button>
        </div>
      </div>
    );
  }

  // Calculated metrics
  const totalGuests = (activePlan.guestCount.adults || 0) + (activePlan.guestCount.kids || 0);
  const totalEstimated = activePlan.items.reduce((s, i) => s + (i.estimatedPrice || 0), 0);
  const purchasedItems = activePlan.items.filter(i => i.isPurchased);
  const costPerGuest = totalGuests > 0 ? totalEstimated / totalGuests : 0;
  const budgetDifference = activePlan.budgetTarget - totalEstimated;
  const isOverBudget = totalEstimated > activePlan.budgetTarget;
  const progressPercent = activePlan.items.length > 0 ? Math.round((purchasedItems.length / activePlan.items.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#3D3A35] flex flex-col font-sans selection:bg-[#5E7356] selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        plans={plans}
        activePlan={activePlan}
        onSelectPlan={handleSelectPlan}
        onOpenWizard={() => setIsWizardOpen(true)}
        onOpenAudit={() => setIsAuditOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        isChatOpen={isChatOpen}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* CUJ Workflow Tracker Banner */}
        <section className="bg-[#FFFFFF] border border-[#E6DFD5] rounded-2xl p-3 sm:p-4 shadow-xs">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm text-[#3D3A35]">CymbalMart CUJ:</span>
              <span className="text-[#7D756D] hidden sm:inline">Event Planner Shopping Workflow</span>
            </div>

            <div className="grid grid-cols-3 gap-2 flex-1 max-w-2xl">
              {/* Task 1: Define Event */}
              <button
                onClick={() => setIsWizardOpen(true)}
                className="flex items-center justify-center sm:justify-start gap-2 p-2 rounded-xl bg-[#F8F6F0] hover:bg-[#EFECE6] border border-[#E6DFD5] transition-all text-left group"
              >
                <div className="w-5 h-5 rounded-full bg-[#5E7356] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                  1
                </div>
                <div className="truncate">
                  <div className="font-bold text-[#3D3A35] text-[11px] group-hover:text-[#5E7356] truncate">
                    Define Event
                  </div>
                  <div className="text-[10px] text-[#8C857D] hidden sm:block truncate">
                    Type, budget & guests
                  </div>
                </div>
              </button>

              {/* Task 2: Review List */}
              <button
                onClick={() => setActiveTab('shopping')}
                className={`flex items-center justify-center sm:justify-start gap-2 p-2 rounded-xl border transition-all text-left ${
                  activeTab === 'shopping' 
                    ? 'bg-[#E8EFE6] border-[#5E7356]/60 shadow-xs' 
                    : 'bg-[#F8F6F0] hover:bg-[#EFECE6] border-[#E6DFD5]'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-[#5E7356] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                  2
                </div>
                <div className="truncate">
                  <div className="font-bold text-[#3D3A35] text-[11px] truncate">
                    Review List
                  </div>
                  <div className="text-[10px] text-[#8C857D] hidden sm:block truncate">
                    Align with total budget
                  </div>
                </div>
              </button>

              {/* Task 3: Refine & Checkout */}
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="flex items-center justify-center sm:justify-start gap-2 p-2 rounded-xl bg-[#F2EAE1] hover:bg-[#EAD8C7] border border-[#E0D1C1] transition-all text-left group"
              >
                <div className="w-5 h-5 rounded-full bg-[#7A6453] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                  3
                </div>
                <div className="truncate">
                  <div className="font-bold text-[#7A6453] text-[11px] group-hover:text-[#5C4533] truncate">
                    Refine & Checkout
                  </div>
                  <div className="text-[10px] text-[#8C857D] hidden sm:block truncate">
                    Adjust & finalize plan
                  </div>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Party Hero & Key Metrics Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-[#FFFFFF] border border-[#E6DFD5] p-6 sm:p-8 shadow-[0_2px_12px_rgba(61,58,53,0.03)]">
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left: Party Identity */}
            <div className="space-y-2.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E8EFE6] text-[#4F6448] border border-[#D0E0CC]">
                  {activePlan.eventType}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F2EAE1] text-[#7A6453] border border-[#E0D1C1]">
                  {activePlan.theme}
                </span>
                <span className="text-xs text-[#8C857D] capitalize font-medium">
                  • {activePlan.venueType} Venue
                </span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#3D3A35] tracking-tight">
                {activePlan.title}
              </h1>

              <p className="text-xs sm:text-sm text-[#5C564F] leading-relaxed">
                {activePlan.summary}
              </p>

              {activePlan.dietaryRestrictions && activePlan.dietaryRestrictions.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-[#8C857D] font-medium">Dietary Accommodations:</span>
                  {activePlan.dietaryRestrictions.map((diet, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-[#E8EFE6] text-[#4F6448] text-[10px] font-semibold border border-[#D0E0CC]">
                      {diet}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Key Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-shrink-0">
              
              {/* Total Estimated vs Target Budget */}
              <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-[#E6DFD5] flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#8C857D] text-xs">
                  <span>Est. Budget</span>
                  <DollarSign className={`w-3.5 h-3.5 ${isOverBudget ? 'text-[#A85344]' : 'text-[#5E7356]'}`} />
                </div>
                <div className="my-1.5">
                  <div className="text-xl font-bold text-[#3D3A35]">
                    {formatCurrency(totalEstimated)}
                  </div>
                  <div className="text-[10px] text-[#8C857D]">
                    Target: ${activePlan.budgetTarget} ({isOverBudget ? `+$${Math.abs(budgetDifference).toFixed(0)}` : `-$${budgetDifference.toFixed(0)} under`})
                  </div>
                </div>
                {/* Visual Progress Bar against target */}
                <div className="w-full bg-[#E6DFD5] rounded-full h-1.5 overflow-hidden mt-1">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      isOverBudget ? 'bg-[#A85344]' : 'bg-[#5E7356]'
                    }`}
                    style={{ width: `${Math.min(100, Math.round((totalEstimated / activePlan.budgetTarget) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Guest Unit Cost */}
              <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-[#E6DFD5] flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#8C857D] text-xs">
                  <span>Cost / Guest</span>
                  <Users className="w-3.5 h-3.5 text-[#7A6453]" />
                </div>
                <div className="my-1.5">
                  <div className="text-xl font-bold text-[#7A6453]">
                    {formatCurrency(costPerGuest)}
                  </div>
                  <div className="text-[10px] text-[#8C857D]">
                    {totalGuests} total ({activePlan.guestCount.adults} adults, {activePlan.guestCount.kids} kids)
                  </div>
                </div>
                <div className="text-[10px] text-[#7A6453] font-semibold mt-1">
                  {activePlan.guestCount.drinkers} drinkers
                </div>
              </div>

              {/* Shopping Progress */}
              <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-[#F8F6F0] border border-[#E6DFD5] flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#8C857D] text-xs">
                  <span>Cart Status</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#5E7356]" />
                </div>
                <div className="my-1.5">
                  <div className="text-xl font-bold text-[#3D3A35]">
                    {purchasedItems.length} / {activePlan.items.length}
                  </div>
                  <div className="text-[10px] text-[#8C857D]">
                    {progressPercent}% items purchased
                  </div>
                </div>
                <div className="w-full bg-[#E6DFD5] rounded-full h-1.5 overflow-hidden mt-1">
                  <div 
                    className="h-full bg-[#5E7356] rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* View Switcher Tabs */}
        <div className="flex items-center justify-between border-b border-[#E6DFD5] pb-2 overflow-x-auto gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Shopping List Tab */}
            <button
              id="tab-shopping-list"
              onClick={() => setActiveTab('shopping')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'shopping'
                  ? 'bg-[#5E7356] text-white shadow-sm'
                  : 'bg-[#FFFFFF] hover:bg-[#F5F2EB] text-[#5C564F] hover:text-[#3D3A35] border border-[#E6DFD5]'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Shopping Manifest</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'shopping' ? 'bg-white/20 text-white' : 'bg-[#F5F2EB] text-[#7D756D]'
              }`}>
                {activePlan.items.length}
              </span>
            </button>

            {/* Serving Ratios Tab */}
            <button
              id="tab-catering-ratios"
              onClick={() => setActiveTab('calculators')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'calculators'
                  ? 'bg-[#C29B7F] text-white shadow-sm'
                  : 'bg-[#FFFFFF] hover:bg-[#F5F2EB] text-[#5C564F] hover:text-[#3D3A35] border border-[#E6DFD5]'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Catering & Drink Ratios</span>
            </button>

            {/* Store Routes Tab */}
            <button
              id="tab-store-routes"
              onClick={() => setActiveTab('stores')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'stores'
                  ? 'bg-[#6F8766] text-white shadow-sm'
                  : 'bg-[#FFFFFF] hover:bg-[#F5F2EB] text-[#5C564F] hover:text-[#3D3A35] border border-[#E6DFD5]'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Store Run Routes</span>
            </button>

            {/* Timeline Prep Tab */}
            <button
              id="tab-run-of-show"
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'timeline'
                  ? 'bg-[#7A6453] text-white shadow-sm'
                  : 'bg-[#FFFFFF] hover:bg-[#F5F2EB] text-[#5C564F] hover:text-[#3D3A35] border border-[#E6DFD5]'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Prep Timeline</span>
            </button>

          </div>

          {/* Quick AI Advice Prompt on right */}
          <button
            id="open-assistant-btn"
            onClick={() => setIsChatOpen(true)}
            className="hidden md:flex items-center gap-2 text-xs text-[#5E7356] hover:text-[#4F6448] bg-[#E8EFE6] hover:bg-[#DEE8DB] px-3.5 py-2 rounded-xl border border-[#D0E0CC] transition-colors flex-shrink-0 font-bold shadow-xs"
          >
            <Bot className="w-4 h-4 text-[#5E7356]" />
            <span>Chat with CymbalMart Assistant</span>
          </button>
        </div>

        {/* Tab Views Rendering */}
        <div className="pt-1">
          {activeTab === 'shopping' && (
            <ShoppingListView
              items={activePlan.items}
              onTogglePurchased={handleTogglePurchased}
              onUpdateQuantity={handleUpdateQuantity}
              onUpdatePrice={handleUpdatePrice}
              onDeleteItem={handleDeleteItem}
              onAddItem={handleAddItem}
              onOpenAlternatives={(item) => setSelectedAlternativeItem(item)}
              onBulkMarkPurchased={handleBulkMarkPurchased}
            />
          )}

          {activeTab === 'calculators' && (
            <ServingCalculators
              plan={activePlan}
              onUpdatePlan={(updated) => updateActivePlan(() => updated)}
            />
          )}

          {activeTab === 'stores' && (
            <StoreRoutesView
              plan={activePlan}
              onTogglePurchased={handleTogglePurchased}
            />
          )}

          {activeTab === 'timeline' && (
            <TimelinePrepView
              plan={activePlan}
              onToggleStep={handleToggleTimelineStep}
            />
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#E6DFD5] py-6 text-center text-xs text-[#8C857D] bg-[#FAF9F6]">
        <p>CymbalMart Party Planner Shopping Agent • AI-Powered Catering Logistics, In-Store Navigation & Cost Optimization</p>
      </footer>

      {/* Floating CymbalMart Assistant Button */}
      {!isChatOpen && (
        <button
          id="floating-cymbalmart-assistant-btn"
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#5E7356] hover:bg-[#4F6448] text-white shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 group border border-[#4F6448]"
          title="Chat with CymbalMart Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#C29B7F] rounded-full ring-2 ring-[#5E7356] animate-pulse" />
          </div>
          <span className="font-semibold text-xs sm:text-sm tracking-tight">CymbalMart Assistant</span>
        </button>
      )}

      {/* Modals & Drawers */}
      <PartyWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onPlanCreated={handlePlanCreated}
      />

      <ItemAlternativeModal
        isOpen={!!selectedAlternativeItem}
        onClose={() => setSelectedAlternativeItem(null)}
        item={selectedAlternativeItem}
        plan={activePlan}
        onApplySwap={handleApplySwap}
      />

      <PartyAuditModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        plan={activePlan}
        onAddMissingItems={handleAddMissingItemsFromAudit}
      />

      <ExportShareModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        plan={activePlan}
      />

      <AgentChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        plan={activePlan}
        onApplyListAdjustments={handleApplyChatAdjustments}
      />

      <CymbalCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        plan={activePlan}
        onPlanUpdated={(updated) => updateActivePlan(() => updated)}
      />

    </div>
  );
}
