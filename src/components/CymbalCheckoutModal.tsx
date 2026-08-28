import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  CheckCircle2, 
  Truck, 
  Store, 
  MapPin, 
  Sparkles, 
  Tag, 
  CreditCard, 
  Calendar, 
  Clock, 
  Printer, 
  Share2, 
  ArrowRight,
  ShieldCheck,
  Check,
  Building2,
  Receipt
} from 'lucide-react';
import { PartyPlan, ShoppingItem, CymbalMartOrder } from '../types';
import { formatCurrency } from '../utils/storage';

interface CymbalCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PartyPlan;
  onPlanUpdated?: (updatedPlan: PartyPlan) => void;
}

const CYMBAL_LOCATIONS = [
  { id: 'store-1', name: 'CymbalMart Supercenter - Central Square', address: '100 Cymbal Parkway, Metro Area', openHours: '6:00 AM - 11:00 PM' },
  { id: 'store-2', name: 'CymbalMart Express & Fresh Depot - Westside', address: '450 University Blvd, West Valley', openHours: '7:00 AM - 10:00 PM' },
  { id: 'store-3', name: 'CymbalMart Flagship & Spirits Emporium', address: '88 Harborview Way, Waterfront', openHours: '6:00 AM - Midnight' },
];

export const CymbalCheckoutModal: React.FC<CymbalCheckoutModalProps> = ({
  isOpen,
  onClose,
  plan,
  onPlanUpdated,
}) => {
  const [step, setStep] = useState<'refine' | 'fulfillment' | 'confirmed'>('refine');
  
  // Refinement options
  const [isCymbalMember, setIsCymbalMember] = useState(true);
  const [onlyEssentials, setOnlyEssentials] = useState(false);
  const [swapAllToValueBrand, setSwapAllToValueBrand] = useState(false);

  // Fulfillment options
  const [fulfillmentType, setFulfillmentType] = useState<'pickup' | 'delivery' | 'in_store_run'>('delivery');
  const [selectedStore, setSelectedStore] = useState(CYMBAL_LOCATIONS[0].name);
  const [deliverySlot, setDeliverySlot] = useState('Today: 4:00 PM - 6:00 PM (Express 2-Hour)');
  const [deliveryNotes, setDeliveryNotes] = useState('Please leave heavy beverage packs near front porch cooler.');
  
  // Confirmed state
  const [confirmedOrder, setConfirmedOrder] = useState<CymbalMartOrder | null>(null);

  if (!isOpen) return null;

  // Calculate items based on refinement filters
  const activeItems = plan.items.filter(item => {
    if (onlyEssentials && item.priority !== 'essential') return false;
    return true;
  });

  const baseSubtotal = activeItems.reduce((sum, item) => sum + (item.estimatedPrice * (item.quantity > 0 ? 1 : 1)), 0);
  
  // Member discount (approx 8% on CymbalMart items)
  const memberDiscount = isCymbalMember ? Math.round(baseSubtotal * 0.08 * 100) / 100 : 0;
  const valueBrandSavings = swapAllToValueBrand ? Math.round(baseSubtotal * 0.12 * 100) / 100 : 0;
  const deliveryFee = fulfillmentType === 'delivery' ? (isCymbalMember ? 0 : 7.99) : 0;
  
  const subtotalAfterSavings = Math.max(0, baseSubtotal - memberDiscount - valueBrandSavings);
  const estimatedTax = Math.round(subtotalAfterSavings * 0.075 * 100) / 100;
  const finalTotal = Math.round((subtotalAfterSavings + estimatedTax + deliveryFee) * 100) / 100;
  
  const budgetVariance = finalTotal - plan.budgetTarget;
  const isUnderBudget = budgetVariance <= 0;

  const handleApplyConstraintSwaps = () => {
    if (swapAllToValueBrand && onPlanUpdated) {
      const updatedItems = plan.items.map(item => ({
        ...item,
        isCymbalValueBrand: true,
        estimatedPrice: Math.round(item.estimatedPrice * 0.88 * 100) / 100,
        brandSuggestion: `Cymbal Everyday Value ${item.name}`,
      }));
      onPlanUpdated({
        ...plan,
        items: updatedItems,
        updatedAt: new Date().toISOString(),
      });
    }
    setStep('fulfillment');
  };

  const handleFinalizeOrder = () => {
    const newOrder: CymbalMartOrder = {
      orderId: `CYMBAL-${Math.floor(100000 + Math.random() * 900000)}`,
      fulfillmentType,
      deliverySlot: fulfillmentType === 'in_store_run' ? 'Self-Guided Smart Walk' : deliverySlot,
      storeLocation: selectedStore,
      cymbalClubMember: isCymbalMember,
      memberSavings: memberDiscount + valueBrandSavings,
      subtotal: subtotalAfterSavings,
      estimatedTax,
      finalTotal,
      itemsCount: activeItems.length,
      placedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
    };

    setConfirmedOrder(newOrder);
    setStep('confirmed');
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
            <div className="w-10 h-10 rounded-2xl bg-[#5E7356] text-white flex items-center justify-center shadow-sm">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold text-[#3D3A35]">
                  CymbalMart Express Checkout
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8EFE6] text-[#4F6448] border border-[#D0E0CC]">
                  CUJ Step 3: Refine & Checkout
                </span>
              </div>
              <p className="text-xs text-[#7D756D]">
                Adjust final constraints, apply member perks, and lock in party fulfillment
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

        {/* Step Tabs */}
        {step !== 'confirmed' && (
          <div className="grid grid-cols-2 bg-[#F8F6F0] border-b border-[#E6DFD5] text-xs">
            <button
              onClick={() => setStep('refine')}
              className={`py-3 px-4 text-center font-semibold flex items-center justify-center gap-2 transition-colors ${
                step === 'refine' ? 'text-[#4F6448] border-b-2 border-[#5E7356] bg-[#E8EFE6]/60' : 'text-[#7D756D] hover:text-[#3D3A35]'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-[#FFFFFF] text-[10px] flex items-center justify-center border border-[#E6DFD5] font-bold">1</span>
              Refine & Optimize Budget
            </button>
            <button
              onClick={() => setStep('fulfillment')}
              className={`py-3 px-4 text-center font-semibold flex items-center justify-center gap-2 transition-colors ${
                step === 'fulfillment' ? 'text-[#4F6448] border-b-2 border-[#5E7356] bg-[#E8EFE6]/60' : 'text-[#7D756D] hover:text-[#3D3A35]'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-[#FFFFFF] text-[10px] flex items-center justify-center border border-[#E6DFD5] font-bold">2</span>
              Fulfillment & Payment
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto max-h-[68vh] space-y-5">
          
          {/* STEP 1: REFINE CONSTRAINTS & BUDGET */}
          {step === 'refine' && (
            <div className="space-y-5">
              
              {/* Budget Alignment Summary Banner */}
              <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-[#E6DFD5] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-[#7D756D] font-medium">Event Budget Target: ${plan.budgetTarget}</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-serif text-[#3D3A35]">
                      {formatCurrency(finalTotal)}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isUnderBudget 
                        ? 'bg-[#E8EFE6] text-[#4F6448] border border-[#D0E0CC]' 
                        : 'bg-[#FAECE8] text-[#A85344] border border-[#F0CEC7]'
                    }`}>
                      {isUnderBudget 
                        ? `✓ Under Target by ${formatCurrency(Math.abs(budgetVariance))}` 
                        : `⚠ Over Target by ${formatCurrency(budgetVariance)}`}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#8C857D]">
                    {activeItems.length} items ready for {plan.guestCount.adults + plan.guestCount.kids} guests
                  </div>
                </div>

                <div className="text-right sm:border-l sm:border-[#E6DFD5] sm:pl-4">
                  <div className="text-[11px] text-[#7D756D]">Per Guest Average</div>
                  <div className="text-base font-bold text-[#4F6448]">
                    {formatCurrency(finalTotal / Math.max(1, plan.guestCount.adults + plan.guestCount.kids))}
                  </div>
                </div>
              </div>

              {/* Constraint Refinement Toggles */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-[#7D756D] uppercase tracking-wider block">
                  ⚙ Adjust Constraints & Instant Savings
                </label>

                {/* CymbalMart Member Card Toggle */}
                <div 
                  onClick={() => setIsCymbalMember(!isCymbalMember)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    isCymbalMember 
                      ? 'bg-[#E8EFE6] border-[#5E7356]/60 shadow-xs' 
                      : 'bg-[#F8F6F0] border-[#E6DFD5]'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center border ${
                    isCymbalMember ? 'bg-[#5E7356] border-[#4F6448] text-white' : 'border-[#D0C9BE] bg-white'
                  }`}>
                    {isCymbalMember && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#3D3A35]">Apply CymbalMart Club Perks</span>
                      <span className="font-bold text-[#4F6448]">Save ~8% ({formatCurrency(memberDiscount)})</span>
                    </div>
                    <p className="text-[#5C564F] mt-0.5">
                      Unlocks instant store-member discounts, free grocery delivery, and bulk beverage markdowns.
                    </p>
                  </div>
                </div>

                {/* Cymbal Value Brand Swap Toggle */}
                <div 
                  onClick={() => setSwapAllToValueBrand(!swapAllToValueBrand)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    swapAllToValueBrand 
                      ? 'bg-[#E8EFE6] border-[#5E7356]/60 shadow-xs' 
                      : 'bg-[#F8F6F0] border-[#E6DFD5]'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center border ${
                    swapAllToValueBrand ? 'bg-[#5E7356] border-[#4F6448] text-white' : 'border-[#D0C9BE] bg-white'
                  }`}>
                    {swapAllToValueBrand && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#3D3A35]">Swap to "Cymbal Everyday Value" Brands</span>
                      <span className="font-bold text-[#4F6448]">Save ~12% ({formatCurrency(valueBrandSavings)})</span>
                    </div>
                    <p className="text-[#5C564F] mt-0.5">
                      Replaces name-brand chips, cheeses, cups, and sodas with CymbalMart's highest-rated house brands.
                    </p>
                  </div>
                </div>

                {/* Essentials Only Filter */}
                <div 
                  onClick={() => setOnlyEssentials(!onlyEssentials)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    onlyEssentials 
                      ? 'bg-[#E8EFE6] border-[#5E7356]/60 shadow-xs' 
                      : 'bg-[#F8F6F0] border-[#E6DFD5]'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center border ${
                    onlyEssentials ? 'bg-[#5E7356] border-[#4F6448] text-white' : 'border-[#D0C9BE] bg-white'
                  }`}>
                    {onlyEssentials && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#3D3A35]">Strict Essentials Only (Skip Optional Decor & Extra Games)</span>
                      <span className="text-[#7D756D]">
                        {onlyEssentials ? 'Active' : 'Show All'}
                      </span>
                    </div>
                    <p className="text-[#5C564F] mt-0.5">
                      Trims non-critical party decor and extra accessories to strictly prioritize food, beverages, ice, and tableware.
                    </p>
                  </div>
                </div>
              </div>

              {/* Shopping List Items Quick Preview */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-[#7D756D] uppercase tracking-wider mb-2">
                  <span>Cart Items ({activeItems.length})</span>
                  <span>CymbalMart Aisle Location</span>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 bg-[#F8F6F0] rounded-2xl border border-[#E6DFD5]">
                  {activeItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-[#FFFFFF] border border-[#E6DFD5] text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2 h-2 rounded-full bg-[#5E7356]" />
                        <span className="font-medium text-[#3D3A35] truncate">{item.name}</span>
                        <span className="text-[#8C857D] text-[11px]">({item.quantity} {item.unit})</span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-[10px] text-[#7A6453] bg-[#F2EAE1] px-2 py-0.5 rounded-md font-semibold">
                          {item.cymbalAisle || 'Aisle 3'}
                        </span>
                        <span className="font-bold text-[#3D3A35]">{formatCurrency(item.estimatedPrice)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* STEP 2: FULFILLMENT & PAYMENT */}
          {step === 'fulfillment' && (
            <div className="space-y-4">
              
              {/* Select Fulfillment Method */}
              <div>
                <label className="text-xs font-semibold text-[#7D756D] uppercase tracking-wider block mb-2">
                  🚚 Choose CymbalMart Fulfillment Method
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFulfillmentType('delivery')}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      fulfillmentType === 'delivery'
                        ? 'bg-[#E8EFE6] border-[#5E7356] text-[#4F6448] shadow-xs'
                        : 'bg-[#F8F6F0] border-[#E6DFD5] text-[#7D756D] hover:text-[#3D3A35]'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-[#3D3A35] mb-1">
                      <Truck className="w-4 h-4 text-[#5E7356]" />
                      2-Hour Delivery
                    </div>
                    <p className="text-[11px] text-[#5C564F]">
                      Delivered chilled directly to your party venue.
                    </p>
                    <span className="text-[10px] font-bold text-[#4F6448] mt-1 block">
                      {isCymbalMember ? 'FREE for Members' : '$7.99 Standard'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFulfillmentType('pickup')}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      fulfillmentType === 'pickup'
                        ? 'bg-[#E8EFE6] border-[#5E7356] text-[#4F6448] shadow-xs'
                        : 'bg-[#F8F6F0] border-[#E6DFD5] text-[#7D756D] hover:text-[#3D3A35]'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-[#3D3A35] mb-1">
                      <Store className="w-4 h-4 text-[#5E7356]" />
                      Curbside Pickup
                    </div>
                    <p className="text-[11px] text-[#5C564F]">
                      Staff loads cooler ice & bulk bags straight into your trunk.
                    </p>
                    <span className="text-[10px] font-bold text-[#4F6448] mt-1 block">
                      FREE (Ready in 45 min)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFulfillmentType('in_store_run')}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      fulfillmentType === 'in_store_run'
                        ? 'bg-[#E8EFE6] border-[#5E7356] text-[#4F6448] shadow-xs'
                        : 'bg-[#F8F6F0] border-[#E6DFD5] text-[#7D756D] hover:text-[#3D3A35]'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-[#3D3A35] mb-1">
                      <MapPin className="w-4 h-4 text-[#5E7356]" />
                      In-Store Walk
                    </div>
                    <p className="text-[11px] text-[#5C564F]">
                      Aisle-ordered digital shopping run map on your mobile phone.
                    </p>
                    <span className="text-[10px] font-bold text-[#4F6448] mt-1 block">
                      Instant Self-Shop
                    </span>
                  </button>
                </div>
              </div>

              {/* Store Location & Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#5C564F] block mb-1">
                    CymbalMart Store Branch
                  </label>
                  <select
                    value={selectedStore}
                    onChange={e => setSelectedStore(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E6DFD5] rounded-xl text-xs text-[#3D3A35] focus:outline-none focus:border-[#5E7356]"
                  >
                    {CYMBAL_LOCATIONS.map(loc => (
                      <option key={loc.id} value={loc.name}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-[#5C564F] block mb-1">
                    {fulfillmentType === 'delivery' ? 'Delivery Window' : 'Pickup Slot'}
                  </label>
                  <select
                    value={deliverySlot}
                    onChange={e => setDeliverySlot(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E6DFD5] rounded-xl text-xs text-[#3D3A35] focus:outline-none focus:border-[#5E7356]"
                  >
                    <option>Today: 4:00 PM - 6:00 PM (Express 2-Hour)</option>
                    <option>Today: 6:00 PM - 8:00 PM (Evening Prep)</option>
                    <option>Tomorrow: 10:00 AM - 12:00 PM (Morning Party)</option>
                    <option>Tomorrow: 2:00 PM - 4:00 PM (Afternoon BBQ)</option>
                  </select>
                </div>
              </div>

              {/* Special Delivery or Pickup Instructions */}
              <div>
                <label className="text-xs font-medium text-[#5C564F] block mb-1">
                  Host Special Instructions (Ice Handling / Gate Codes / Dietary Separation)
                </label>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={e => setDeliveryNotes(e.target.value)}
                  placeholder="e.g. Keep vegan boxes separated; call upon arrival"
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E6DFD5] rounded-xl text-xs text-[#3D3A35] focus:outline-none focus:border-[#5E7356]"
                />
              </div>

              {/* Financial Order Ledger */}
              <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-[#E6DFD5] space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#7D756D]">
                  <span>Items Subtotal ({activeItems.length} products)</span>
                  <span>{formatCurrency(baseSubtotal)}</span>
                </div>
                {memberDiscount > 0 && (
                  <div className="flex items-center justify-between text-[#4F6448] font-semibold">
                    <span>CymbalMart Club Member Discount</span>
                    <span>-{formatCurrency(memberDiscount)}</span>
                  </div>
                )}
                {valueBrandSavings > 0 && (
                  <div className="flex items-center justify-between text-[#4F6448] font-semibold">
                    <span>Cymbal Everyday Value Brand Savings</span>
                    <span>-{formatCurrency(valueBrandSavings)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-[#7D756D]">
                  <span>Estimated Sales Tax (7.5%)</span>
                  <span>{formatCurrency(estimatedTax)}</span>
                </div>
                <div className="flex items-center justify-between text-[#7D756D]">
                  <span>Fulfillment & Bagging Fee</span>
                  <span>{deliveryFee > 0 ? formatCurrency(deliveryFee) : 'FREE'}</span>
                </div>
                <div className="pt-2 border-t border-[#E6DFD5] flex items-center justify-between text-sm font-bold text-[#3D3A35]">
                  <span>Final Order Total:</span>
                  <span className="text-base text-[#4F6448]">{formatCurrency(finalTotal)}</span>
                </div>
              </div>

            </div>
          )}

          {/* STEP 3: ORDER CONFIRMATION & SLIP */}
          {step === 'confirmed' && confirmedOrder && (
            <div className="space-y-5 text-center py-2">
              
              <div className="w-16 h-16 rounded-full bg-[#E8EFE6] text-[#4F6448] border-2 border-[#D0E0CC] flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="font-serif text-xl font-bold text-[#3D3A35]">
                  Party Order Locked In!
                </h3>
                <p className="text-xs text-[#7D756D] mt-1">
                  Order ID: <span className="font-mono font-bold text-[#3D3A35]">{confirmedOrder.orderId}</span> • Placed at {confirmedOrder.placedAt}
                </p>
              </div>

              {/* Digital Slip Receipt */}
              <div className="p-5 rounded-2xl bg-[#F8F6F0] border border-[#E6DFD5] text-left text-xs space-y-3 shadow-inner">
                <div className="flex items-center justify-between border-b border-[#E6DFD5] pb-2 font-bold text-[#3D3A35]">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-[#5E7356]" />
                    <span>CymbalMart Party Order Manifest</span>
                  </div>
                  <span className="text-[#4F6448]">{formatCurrency(confirmedOrder.finalTotal)}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-[#5C564F]">
                  <div>
                    <span className="text-[#8C857D] block">Fulfillment:</span>
                    <span className="font-semibold text-[#3D3A35] capitalize">{confirmedOrder.fulfillmentType}</span>
                  </div>
                  <div>
                    <span className="text-[#8C857D] block">Scheduled Window:</span>
                    <span className="font-semibold text-[#3D3A35]">{confirmedOrder.deliverySlot}</span>
                  </div>
                  <div>
                    <span className="text-[#8C857D] block">Store:</span>
                    <span className="font-semibold text-[#3D3A35] truncate">{confirmedOrder.storeLocation}</span>
                  </div>
                  <div>
                    <span className="text-[#8C857D] block">Total Savings:</span>
                    <span className="font-semibold text-[#4F6448]">Saved {formatCurrency(confirmedOrder.memberSavings)}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#E6DFD5] text-[11px] text-[#5C564F] flex items-center justify-between">
                  <span>Items Prepared: {confirmedOrder.itemsCount} products</span>
                  <span className="font-bold text-[#4F6448]">✓ Packed & Verified</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#F5F2EB] border border-[#E6DFD5] text-[#3D3A35] text-xs font-semibold shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-[#7D756D]" />
                  <span>Print Receipt & Aisle Map</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#FAF9F6] border-t border-[#E6DFD5]">
          {step === 'refine' && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#F5F2EB] border border-[#E6DFD5] text-[#7D756D] text-xs font-medium transition-colors"
              >
                Back to Review List
              </button>
              <button
                type="button"
                id="proceed-to-fulfillment-btn"
                onClick={handleApplyConstraintSwaps}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5E7356] hover:bg-[#4F6448] text-white text-xs font-bold shadow-md transition-all active:scale-95"
              >
                <span>Continue to Fulfillment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {step === 'fulfillment' && (
            <>
              <button
                type="button"
                onClick={() => setStep('refine')}
                className="px-4 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#F5F2EB] border border-[#E6DFD5] text-[#3D3A35] text-xs font-medium transition-colors"
              >
                Back to Constraints
              </button>
              <button
                type="button"
                id="finalize-cymbal-order-btn"
                onClick={handleFinalizeOrder}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#5E7356] hover:bg-[#4F6448] text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Place CymbalMart Order ({formatCurrency(finalTotal)})</span>
              </button>
            </>
          )}

          {step === 'confirmed' && (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-[#5E7356] hover:bg-[#4F6448] text-white text-xs font-bold shadow-sm transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
