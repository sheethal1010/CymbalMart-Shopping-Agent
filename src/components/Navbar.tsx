import React from 'react';
import { 
  Sparkles, 
  PlusCircle, 
  Share2, 
  ShieldCheck, 
  Bot, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  ChevronDown
} from 'lucide-react';
import { PartyPlan } from '../types';
import { formatCurrency } from '../utils/storage';

interface NavbarProps {
  plans: PartyPlan[];
  activePlan: PartyPlan | null;
  onSelectPlan: (id: string) => void;
  onOpenWizard: () => void;
  onOpenAudit: () => void;
  onOpenExport: () => void;
  onOpenCheckout?: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
  onDeletePlan?: (id: string) => void;
  onDuplicatePlan?: (plan: PartyPlan) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  plans,
  activePlan,
  onSelectPlan,
  onOpenWizard,
  onOpenAudit,
  onOpenExport,
  onOpenCheckout,
  onToggleChat,
  isChatOpen,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const totalGuests = activePlan 
    ? (activePlan.guestCount.adults || 0) + (activePlan.guestCount.kids || 0) 
    : 0;

  const totalEstimated = activePlan 
    ? activePlan.items.reduce((sum, i) => sum + (i.estimatedPrice || 0), 0) 
    : 0;

  const purchasedCount = activePlan 
    ? activePlan.items.filter(i => i.isPurchased).length 
    : 0;

  const totalItems = activePlan?.items.length || 0;
  const progressPercent = totalItems > 0 ? Math.round((purchasedCount / totalItems) * 100) : 0;
  const isOverBudget = activePlan ? totalEstimated > activePlan.budgetTarget : false;

  return (
    <header className="sticky top-0 z-30 bg-[#FFFFFF] border-b border-[#E6DFD5] text-[#3D3A35] shadow-[0_2px_8px_rgba(61,58,53,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2">
          
          {/* Logo & Party Selector */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#5E7356] text-[#FAF9F6] shadow-sm flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-base sm:text-lg tracking-tight text-[#3D3A35] truncate">
                  CymbalMart Party Planner
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8EFE6] text-[#4F6448] border border-[#D0E0CC]">
                  Shopping Agent
                </span>
              </div>

              {/* Party Switcher Dropdown */}
              <div className="relative mt-0.5">
                <button
                  id="party-selector-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 text-xs text-[#5C564F] hover:text-[#3D3A35] bg-[#F5F2EB] hover:bg-[#EFECE6] px-2.5 py-1 rounded-lg border border-[#E6DFD5] transition-colors truncate max-w-[200px] sm:max-w-[280px]"
                  title="Switch Party Plan"
                >
                  <span className="truncate font-medium">
                    {activePlan ? activePlan.title : 'Select a Party'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#8C857D] flex-shrink-0" />
                </button>

                {dropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setDropdownOpen(false)} 
                    />
                    <div className="absolute left-0 mt-1 w-72 rounded-2xl bg-[#FFFFFF] border border-[#E6DFD5] shadow-xl z-50 py-2 max-h-80 overflow-y-auto">
                      <div className="px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#8C857D] border-b border-[#E6DFD5]">
                        Your CymbalMart Party Plans
                      </div>
                      {plans.map((p) => {
                        const isSelected = p.id === activePlan?.id;
                        return (
                          <div
                            key={p.id}
                            className={`flex items-center justify-between px-3.5 py-2.5 text-xs hover:bg-[#F5F2EB] cursor-pointer transition-colors ${
                              isSelected ? 'bg-[#E8EFE6] text-[#3B4D36] font-semibold' : 'text-[#3D3A35]'
                            }`}
                            onClick={() => {
                              onSelectPlan(p.id);
                              setDropdownOpen(false);
                            }}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="truncate font-medium">{p.title}</div>
                              <div className="text-[10px] text-[#8C857D]">
                                {p.guestCount.adults + p.guestCount.kids} guests • ${p.budgetTarget} target
                              </div>
                            </div>
                            {isSelected && (
                              <div className="w-2 h-2 rounded-full bg-[#5E7356] flex-shrink-0" />
                            )}
                          </div>
                        );
                      })}

                      <div className="p-2 border-t border-[#E6DFD5] mt-1">
                        <button
                          id="dropdown-new-party-btn"
                          onClick={() => {
                            setDropdownOpen(false);
                            onOpenWizard();
                          }}
                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#5E7356] hover:bg-[#4F6448] text-white text-xs font-semibold shadow-sm transition-colors"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          Plan New Party with AI
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar (Desktop) */}
          {activePlan && (
            <div className="hidden lg:flex items-center gap-5 px-4 py-1.5 rounded-2xl bg-[#F5F2EB] border border-[#E6DFD5] text-xs">
              {/* Guests */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#EAE2D8] text-[#7A6453] flex items-center justify-center">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[#8C857D] text-[10px]">Guests</div>
                  <div className="font-semibold text-[#3D3A35]">{totalGuests} people</div>
                </div>
              </div>

              <div className="h-6 w-px bg-[#E6DFD5]" />

              {/* Budget */}
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  isOverBudget ? 'bg-[#FAECE8] text-[#A85344]' : 'bg-[#E8EFE6] text-[#4F6448]'
                }`}>
                  <DollarSign className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[#8C857D] text-[10px]">Estimated / Target</div>
                  <div className="font-semibold text-[#3D3A35]">
                    <span className={isOverBudget ? 'text-[#A85344] font-bold' : 'text-[#4F6448]'}>
                      {formatCurrency(totalEstimated)}
                    </span>
                    <span className="text-[#8C857D] text-[11px] ml-1">/ ${activePlan.budgetTarget}</span>
                  </div>
                </div>
              </div>

              <div className="h-6 w-px bg-[#E6DFD5]" />

              {/* Shopping Progress */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#E8EFE6] text-[#4F6448] flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[#8C857D] text-[10px]">Purchased</div>
                  <div className="font-semibold text-[#3D3A35]">
                    {purchasedCount}/{totalItems} ({progressPercent}%)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Step 1: Define Event Wizard */}
            <button
              id="header-new-party-btn"
              onClick={onOpenWizard}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[#5E7356] hover:bg-[#4F6448] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all active:scale-95"
              title="Step 1: Define Event"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Define Event</span>
              <span className="sm:hidden">New</span>
            </button>

            {/* Step 3: Refine & Checkout */}
            {onOpenCheckout && (
              <button
                id="header-checkout-btn"
                onClick={onOpenCheckout}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[#7A6453] hover:bg-[#685343] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all active:scale-95"
                title="Step 3: Refine & Checkout"
              >
                <span className="hidden sm:inline">Refine & Checkout</span>
                <span className="sm:hidden">Checkout</span>
              </button>
            )}

            {/* Party Audit */}
            <button
              id="header-audit-btn"
              onClick={onOpenAudit}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#F5F2EB] border border-[#E6DFD5] text-[#3D3A35] text-xs sm:text-sm font-medium transition-colors"
              title="Audit Party Essentials & Budget"
            >
              <ShieldCheck className="w-4 h-4 text-[#5E7356]" />
              <span className="hidden md:inline">Party Audit</span>
            </button>

            {/* Export & Share */}
            <button
              id="header-export-btn"
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#F5F2EB] border border-[#E6DFD5] text-[#3D3A35] text-xs sm:text-sm font-medium transition-colors"
              title="Share / Export Shopping List"
            >
              <Share2 className="w-4 h-4 text-[#7A6453]" />
              <span className="hidden md:inline">Export</span>
            </button>

            {/* CymbalMart Assistant Toggle */}
            <button
              id="header-chat-toggle-btn"
              onClick={onToggleChat}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                isChatOpen
                  ? 'bg-[#5E7356] text-white border-[#4F6448] shadow-sm'
                  : 'bg-[#F2EAE1] hover:bg-[#EAD8C7] text-[#7A6453] hover:text-[#5C4533] border-[#E0D1C1]'
              }`}
              title="Open CymbalMart Assistant"
            >
              <Bot className="w-4 h-4 text-[#7A6453] group-hover:text-[#5C4533]" />
              <span className="hidden sm:inline">CymbalMart Assistant</span>
              <span className="sm:hidden">Assistant</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5E7356] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5E7356]"></span>
              </span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
