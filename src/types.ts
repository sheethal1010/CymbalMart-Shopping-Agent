export type ItemCategory = 
  | 'Food & Snacks'
  | 'Beverages & Mixers'
  | 'Alcohol & Spirits'
  | 'Tableware & Disposables'
  | 'Decor & Lighting'
  | 'Entertainment & Games'
  | 'Ice & Logistics';

export type StoreCategory = 
  | 'Supermarket / Grocery'
  | 'Wholesale / Warehouse Club'
  | 'Party Supply Store'
  | 'Beverage & Liquor Depot'
  | 'Dollar / General Store'
  | 'Bakery / Specialty Market';

export type ItemPriority = 'essential' | 'recommended' | 'optional';

export interface ShoppingItem {
  id: string;
  name: string;
  category: ItemCategory;
  storeCategory: StoreCategory;
  quantity: number;
  unit: string;
  estimatedPrice: number;
  actualPrice?: number;
  isPurchased: boolean;
  priority: ItemPriority;
  dietaryTags?: string[];
  notes?: string;
  brandSuggestion?: string;
  cymbalAisle?: string;
  inStock?: boolean;
  isCymbalValueBrand?: boolean;
}

export interface CymbalMartOrder {
  orderId: string;
  fulfillmentType: 'delivery' | 'pickup' | 'in_store_run';
  deliverySlot?: string;
  storeLocation: string;
  cymbalClubMember: boolean;
  memberSavings: number;
  subtotal: number;
  estimatedTax: number;
  finalTotal: number;
  itemsCount: number;
  placedAt: string;
}

export interface ServingRatio {
  id: string;
  category: string;
  label: string;
  calculatedAmount: string;
  formulaExplanation: string;
}

export interface TimelineStep {
  id: string;
  phase: '1_week_before' | '2_days_before' | 'day_of_morning' | '1_hour_before';
  phaseTitle: string;
  task: string;
  category: 'shopping' | 'prep' | 'decor' | 'drinks';
  completed: boolean;
}

export interface StoreRoute {
  storeName: string;
  storeCategory: StoreCategory;
  itemCount: number;
  estimatedCost: number;
  proTip: string;
}

export interface PartyPlan {
  id: string;
  title: string;
  eventType: string;
  theme: string;
  vibe: string;
  guestCount: {
    adults: number;
    kids: number;
    drinkers: number;
    nonDrinkers: number;
  };
  durationHours: number;
  budgetTarget: number;
  budgetTier: 'budget' | 'balanced' | 'premium';
  venueType: 'indoor' | 'backyard' | 'park' | 'rented_venue';
  dietaryRestrictions: string[];
  ownedSupplies?: string[];
  summary: string;
  items: ShoppingItem[];
  servingRatios: ServingRatio[];
  timelineSteps: TimelineStep[];
  storeRoutes: StoreRoute[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  actions?: {
    label: string;
    actionType: 'add_item' | 'apply_budget_cut' | 'filter_category' | 'generate_mocktails' | 'recalculate';
    payload?: any;
  }[];
  listAdjustments?: {
    itemsToAdd?: Omit<ShoppingItem, 'id' | 'isPurchased'>[];
    itemIdsToRemove?: string[];
    priceAdjustments?: { id: string; newPrice: number; reason: string }[];
  };
}

export interface PartyAudit {
  score: number; // 0 - 100
  status: 'Ready to Party' | 'Good with minor tweaks' | 'Needs Attention';
  criticalMissing: string[];
  budgetOptimizations: string[];
  dietaryCoverage: {
    tag: string;
    itemCount: number;
    status: 'covered' | 'needs_more';
  }[];
  proTips: string[];
}
