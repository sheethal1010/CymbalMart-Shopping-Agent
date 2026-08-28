import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy Google GenAI Client getter
function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  try {
    return new GoogleGenAI({
      apiKey: apiKey.trim(),
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
    return null;
  }
}

// 1. Health check
app.get('/api/health', (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY';
  res.json({ status: 'ok', hasGeminiKey: hasKey });
});

// Helper for precision algorithmic party plan fallback
function generateAlgorithmicPlan(body: any) {
  const {
    title,
    eventType = 'Party',
    theme = 'Festive Celebration',
    vibe = 'Energetic and fun',
    guestCount = { adults: 12, kids: 0, drinkers: 10, nonDrinkers: 2 },
    durationHours = 3,
    budgetTarget = 250,
    budgetTier = 'balanced',
    venueType = 'indoor',
    dietaryRestrictions = [],
    ownedSupplies = [],
  } = body;

  const adults = Number(guestCount.adults) || 10;
  const kids = Number(guestCount.kids) || 0;
  const totalGuests = adults + kids;
  const drinkers = Math.min(adults, Number(guestCount.drinkers) || adults);
  const nonDrinkers = Math.max(0, totalGuests - drinkers);
  const duration = Number(durationHours) || 3;
  const budget = Number(budgetTarget) || 250;

  // Ratios
  // Drinks: 2 in first hour + 1/hr after
  const drinksPerDrinker = 2 + Math.max(0, duration - 1) * 1;
  const totalAlcoholicDrinks = drinkers * drinksPerDrinker;
  const totalNonAlcDrinks = Math.ceil(totalGuests * 1.5 * duration * 0.4 + nonDrinkers * duration * 1.2);
  const iceLbs = Math.ceil(drinkers * 1.5 + (venueType === 'backyard' || venueType === 'park' ? 15 : 10));

  const items: any[] = [];
  const timestamp = Date.now();

  const isOwned = (itemKeyword: string) => {
    return ownedSupplies.some((owned: string) => 
      owned.toLowerCase().includes(itemKeyword.toLowerCase()) || 
      itemKeyword.toLowerCase().includes(owned.toLowerCase())
    );
  };

  // Alcohol & Drinks
  if (drinkers > 0) {
    const beerCases = Math.max(1, Math.ceil((totalAlcoholicDrinks * 0.45) / 12));
    items.push({
      id: `fallback-item-${timestamp}-1`,
      name: `Cymbal Craft Beer & Crisp Seltzer Variety (${beerCases * 12} cans)`,
      category: 'Alcohol & Spirits',
      storeCategory: 'Beverage & Liquor Depot',
      quantity: beerCases,
      unit: '12-pack',
      estimatedPrice: Number((beerCases * (budgetTier === 'budget' ? 14.5 : 18.99)).toFixed(2)),
      isPurchased: false,
      priority: 'essential',
      brandSuggestion: 'Cymbal Select Brews',
      cymbalAisle: 'Aisle 12 - Wine & Craft Beers',
      notes: `${Math.round(totalAlcoholicDrinks * 0.45)} total servings for ${drinkers} drinkers`,
      isCymbalValueBrand: true,
      inStock: true,
    });

    const wineBottles = Math.max(1, Math.ceil((totalAlcoholicDrinks * 0.35) / 5));
    items.push({
      id: `fallback-item-${timestamp}-2`,
      name: `Cymbal Reserve Wine (Pinot Grigio & Cabernet Sauvignon)`,
      category: 'Alcohol & Spirits',
      storeCategory: 'Beverage & Liquor Depot',
      quantity: wineBottles,
      unit: '750ml bottles',
      estimatedPrice: Number((wineBottles * (budgetTier === 'budget' ? 9.99 : 14.50)).toFixed(2)),
      isPurchased: false,
      priority: 'essential',
      brandSuggestion: 'Cymbal Estate Vineyards',
      cymbalAisle: 'Aisle 12 - Wine & Craft Beers',
      notes: `${wineBottles * 5} glasses calculated at 5 pours per bottle`,
      isCymbalValueBrand: false,
      inStock: true,
    });

    if (totalAlcoholicDrinks > 20 || budgetTier === 'premium') {
      items.push({
        id: `fallback-item-${timestamp}-3`,
        name: `Premium Cocktail Spirit (Vodka / Tequila / Gin) & Artisanal Tonic`,
        category: 'Alcohol & Spirits',
        storeCategory: 'Beverage & Liquor Depot',
        quantity: 1,
        unit: '750ml bottle + mixers',
        estimatedPrice: Number((budgetTier === 'budget' ? 18.00 : 28.50).toFixed(2)),
        isPurchased: false,
        priority: 'recommended',
        brandSuggestion: 'Cymbal Spirits Bar',
        cymbalAisle: 'Aisle 12 - Wine & Craft Beers',
        notes: 'Yields ~16 cocktail servings for signature theme cocktail',
        isCymbalValueBrand: false,
        inStock: true,
      });
    }
  }

  // Non-Alcoholic Beverages & Mixers
  const sodaPacks = Math.max(1, Math.ceil(totalNonAlcDrinks / 12));
  items.push({
    id: `fallback-item-${timestamp}-4`,
    name: `Cymbal Sparkling Flavored Seltzers & Craft Sodas`,
    category: 'Beverages & Mixers',
    storeCategory: 'Supermarket / Grocery',
    quantity: sodaPacks,
    unit: '12-pack (cans)',
    estimatedPrice: Number((sodaPacks * 6.49).toFixed(2)),
    isPurchased: false,
    priority: 'essential',
    brandSuggestion: 'Cymbal Refresh Seltzer',
    cymbalAisle: 'Aisle 9 - Non-Alcoholic Mixers & Soda',
    notes: 'Hydration option for all guests & non-drinkers',
    isCymbalValueBrand: true,
    inStock: true,
  });

  items.push({
    id: `fallback-item-${timestamp}-5`,
    name: `Fresh Citrus & Garnishes (Limes, Lemons, Mint)`,
    category: 'Beverages & Mixers',
    storeCategory: 'Supermarket / Grocery',
    quantity: 2,
    unit: 'mesh bags',
    estimatedPrice: 7.50,
    isPurchased: false,
    priority: 'recommended',
    dietaryTags: ['Vegan', 'Gluten-Free'],
    cymbalAisle: 'Aisle 1 - Fresh Produce',
    notes: 'For mocktails and beverage garnish station',
    inStock: true,
  });

  // Food & Snacks (6-8 portions/person)
  const isVeg = dietaryRestrictions.some((d: string) => d.toLowerCase().includes('vegan') || d.toLowerCase().includes('veg'));
  const isGF = dietaryRestrictions.some((d: string) => d.toLowerCase().includes('gluten'));

  items.push({
    id: `fallback-item-${timestamp}-6`,
    name: `Artisan Charcuterie, Aged Cheddar & Cheese Trio Platter`,
    category: 'Food & Snacks',
    storeCategory: 'Supermarket / Grocery',
    quantity: Math.max(1, Math.ceil(totalGuests / 10)),
    unit: 'large board platter',
    estimatedPrice: Number((Math.max(1, Math.ceil(totalGuests / 10)) * 22.00).toFixed(2)),
    isPurchased: false,
    priority: 'essential',
    dietaryTags: isVeg ? ['Vegetarian Friendly'] : [],
    brandSuggestion: 'Cymbal Deli Signature',
    cymbalAisle: 'Aisle 5 - Deli & Charcuterie',
    notes: 'Crowd-pleaser savory grazing station',
    inStock: true,
  });

  items.push({
    id: `fallback-item-${timestamp}-7`,
    name: `Cymbal Gourmet Slider Rolls & Savory Sliders (Pulled Pork / Veggie Jackfruit)`,
    category: 'Food & Snacks',
    storeCategory: 'Supermarket / Grocery',
    quantity: Math.max(2, Math.ceil((totalGuests * 2.2) / 12)),
    unit: 'packs (12ct each)',
    estimatedPrice: Number((Math.max(2, Math.ceil((totalGuests * 2.2) / 12)) * 14.50).toFixed(2)),
    isPurchased: false,
    priority: 'essential',
    dietaryTags: isVeg ? ['Vegetarian Option'] : ['Gluten-Free Option'],
    brandSuggestion: 'Cymbal Kitchens',
    cymbalAisle: 'Aisle 4 - Fresh Meats & Bakery',
    notes: 'Hearty protein base: ~2-3 sliders per guest',
    inStock: true,
  });

  items.push({
    id: `fallback-item-${timestamp}-8`,
    name: `Organic Tortilla Chips, Fresh Salsa & Chunky Guacamole`,
    category: 'Food & Snacks',
    storeCategory: 'Wholesale / Warehouse Club',
    quantity: Math.max(2, Math.ceil(totalGuests / 7)),
    unit: 'party size tubs & bags',
    estimatedPrice: Number((Math.max(2, Math.ceil(totalGuests / 7)) * 7.50).toFixed(2)),
    isPurchased: false,
    priority: 'essential',
    dietaryTags: ['Vegan', 'Gluten-Free'],
    brandSuggestion: 'Cymbal Everyday Value',
    cymbalAisle: 'Aisle 3 - Chips, Dips & Crackers',
    notes: 'Crucial self-serve grazing snack',
    isCymbalValueBrand: true,
    inStock: true,
  });

  if (isVeg || isGF || dietaryRestrictions.length > 0) {
    items.push({
      id: `fallback-item-${timestamp}-9`,
      name: `Fresh Veggie Crudité & Roasted Garlic Hummus Dip (Allergen-Safe)`,
      category: 'Food & Snacks',
      storeCategory: 'Supermarket / Grocery',
      quantity: Math.max(1, Math.ceil(totalGuests / 12)),
      unit: 'party tray',
      estimatedPrice: 15.00,
      isPurchased: false,
      priority: 'essential',
      dietaryTags: ['Vegan', 'Gluten-Free', 'Nut-Free Safe'],
      brandSuggestion: 'Cymbal Organic Harvest',
      cymbalAisle: 'Aisle 1 - Fresh Produce',
      notes: 'Dedicated allergen-safe platter for dietary guests',
      inStock: true,
    });
  }

  // Dessert / Bakery
  items.push({
    id: `fallback-item-${timestamp}-10`,
    name: `Mini Artisan Cupcakes & Sea Salt Fudge Brownie Bites`,
    category: 'Food & Snacks',
    storeCategory: 'Bakery / Specialty Market',
    quantity: Math.max(1, Math.ceil((totalGuests * 1.5) / 18)),
    unit: 'bakery packs (18ct)',
    estimatedPrice: Number((Math.max(1, Math.ceil((totalGuests * 1.5) / 18)) * 12.99).toFixed(2)),
    isPurchased: false,
    priority: 'recommended',
    brandSuggestion: 'Cymbal Fresh Bakery',
    cymbalAisle: 'Bakery Counter',
    notes: 'Bite-sized sweet finish',
    inStock: true,
  });

  // Tableware & Disposables
  const cupsCount = totalGuests * 2;
  items.push({
    id: `fallback-item-${timestamp}-11`,
    name: `Heavy-Duty Compostable Party Cups (50ct, 16oz)`,
    category: 'Tableware & Disposables',
    storeCategory: 'Supermarket / Grocery',
    quantity: Math.max(1, Math.ceil(cupsCount / 50)),
    unit: 'pack (50ct)',
    estimatedPrice: Number((Math.max(1, Math.ceil(cupsCount / 50)) * 6.99).toFixed(2)),
    isPurchased: false,
    priority: 'essential',
    brandSuggestion: 'Cymbal Eco Party',
    cymbalAisle: 'Aisle 7 - Party Tableware & Cups',
    notes: `Calculated at 2 cups per guest (${cupsCount} total) since guests misplace drinks`,
    isCymbalValueBrand: true,
    inStock: true,
  });

  items.push({
    id: `fallback-item-${timestamp}-12`,
    name: `Heavyweight Biodegradable Plates & 3-Ply Dinner Napkins (100ct)`,
    category: 'Tableware & Disposables',
    storeCategory: 'Supermarket / Grocery',
    quantity: 1,
    unit: 'combo bundle',
    estimatedPrice: 11.50,
    isPurchased: false,
    priority: 'essential',
    brandSuggestion: 'Cymbal Everyday Value',
    cymbalAisle: 'Aisle 7 - Party Tableware & Cups',
    notes: 'Generous 2.5 napkins per guest buffer',
    isCymbalValueBrand: true,
    inStock: true,
  });

  // Ice & Logistics
  items.push({
    id: `fallback-item-${timestamp}-13`,
    name: `Cymbal Crystal Party Ice (${iceLbs} lbs total)`,
    category: 'Ice & Logistics',
    storeCategory: 'Supermarket / Grocery',
    quantity: Math.max(2, Math.ceil(iceLbs / 10)),
    unit: '10 lb bags',
    estimatedPrice: Number((Math.max(2, Math.ceil(iceLbs / 10)) * 3.49).toFixed(2)),
    isPurchased: false,
    priority: 'essential',
    brandSuggestion: 'Cymbal Ice Depot',
    cymbalAisle: 'Aisle 15 - Ice Chests & Cleaning',
    notes: `1.5 lbs per drinker (${drinkers * 1.5} lbs) + cooler reservoir ice`,
    isCymbalValueBrand: true,
    inStock: true,
  });

  items.push({
    id: `fallback-item-${timestamp}-14`,
    name: `Heavy Duty Drawstring Trash & Recycling Bags (33 Gallon, 20pk)`,
    category: 'Ice & Logistics',
    storeCategory: 'Supermarket / Grocery',
    quantity: 1,
    unit: 'box',
    estimatedPrice: 8.99,
    isPurchased: false,
    priority: 'essential',
    brandSuggestion: 'Cymbal Clean Home',
    cymbalAisle: 'Aisle 15 - Ice Chests & Cleaning',
    notes: 'Essential for fast 15-minute party cleanup',
    inStock: true,
  });

  // Decor & Lighting (only if not already fully equipped)
  if (!isOwned('decor') && !isOwned('Patio String Lights')) {
    items.push({
      id: `fallback-item-${timestamp}-15`,
      name: `Themed Accent Banners & Warm LED Fairy Table Lights`,
      category: 'Decor & Lighting',
      storeCategory: 'Party Supply Store',
      quantity: 1,
      unit: 'set',
      estimatedPrice: 14.99,
      isPurchased: false,
      priority: 'recommended',
      cymbalAisle: 'Aisle 7 - Party Tableware & Cups',
      notes: `Matches ${theme} aesthetic and warm ambient lighting`,
      inStock: true,
    });
  }

  // Calculate sum and normalize to budget if needed
  const servingRatios = [
    {
      id: `ratio-${timestamp}-1`,
      category: 'Alcohol & Drinks',
      label: 'Drinks per guest formula',
      calculatedAmount: `${drinksPerDrinker} drinks/drinker (${totalAlcoholicDrinks} total drinks)`,
      formulaExplanation: '2 drinks allocated in the first hour + 1 drink per hour thereafter.',
    },
    {
      id: `ratio-${timestamp}-2`,
      category: 'Ice Allocation',
      label: 'Party Ice Requirement',
      calculatedAmount: `${iceLbs} lbs total (${Math.ceil(iceLbs / 10)} x 10lb bags)`,
      formulaExplanation: '1.5 lbs of ice per drinking guest for shaker cocktail chilling and beverage bins.',
    },
    {
      id: `ratio-${timestamp}-3`,
      category: 'Food & Appetizers',
      label: 'Finger Food Grazing Portions',
      calculatedAmount: `6-8 portions per guest (~${totalGuests * 7} total portions)`,
      formulaExplanation: 'Finger foods, sliders, and charcuterie calibrated for 3-4 hours of continuous grazing.',
    },
    {
      id: `ratio-${timestamp}-4`,
      category: 'Disposables Buffer',
      label: 'Cups & Napkins Ratio',
      calculatedAmount: `2 cups & 2.5 napkins per guest (${cupsCount} cups, ${Math.ceil(totalGuests * 2.5)} napkins)`,
      formulaExplanation: 'Buffer accounts for misplaced beverage cups and messy savory finger food handling.',
    },
  ];

  const timelineSteps = [
    {
      id: `timeline-${timestamp}-1`,
      phase: '1_week_before' as const,
      phaseTitle: '1 Week Before Event',
      task: `Finalize RSVP counts (${totalGuests} guests), order specialty items, check owned coolers and speakers.`,
      category: 'shopping' as const,
      completed: false,
    },
    {
      id: `timeline-${timestamp}-2`,
      phase: '2_days_before' as const,
      phaseTitle: '2 Days Before Event',
      task: 'Complete CymbalMart grocery & non-perishable shopping run (crackers, tableware, mixers, wines, decor).',
      category: 'shopping' as const,
      completed: false,
    },
    {
      id: `timeline-${timestamp}-3`,
      phase: 'day_of_morning' as const,
      phaseTitle: 'Morning of Event',
      task: 'Pick up bakery cupcakes, fresh sliders, and party ice bags. Chill white wine and beer in cooler bins.',
      category: 'prep' as const,
      completed: false,
    },
    {
      id: `timeline-${timestamp}-4`,
      phase: '1_hour_before' as const,
      phaseTitle: '1 Hour Before Doors Open',
      task: 'Set out room-temperature snack grazing boards, cue ambient music playlist, slice fresh citrus garnish.',
      category: 'decor' as const,
      completed: false,
    },
  ];

  const storeRoutes = [
    {
      storeName: 'CymbalMart Supercenter (Aisles 1, 3, 5, 7, 9, 15)',
      storeCategory: 'Supermarket / Grocery' as const,
      itemCount: items.length - 2,
      estimatedCost: Number((budget * 0.78).toFixed(2)),
      proTip: 'Follow the smart aisle path: Dry Goods (Aisles 3 & 7) first -> Deli & Produce (Aisles 1 & 5) -> Ice (Aisle 15) right before checkout.',
    },
    {
      storeName: 'CymbalMart Beverage Depot (Aisle 12)',
      storeCategory: 'Beverage & Liquor Depot' as const,
      itemCount: 2,
      estimatedCost: Number((budget * 0.22).toFixed(2)),
      proTip: 'Look for Cymbal Value brand 12-packs and bundle savings for wine bottles in 6-pack carrier boxes.',
    },
  ];

  return {
    id: `plan-${timestamp}`,
    title: title || `${theme} Celebration`,
    eventType,
    theme,
    vibe,
    guestCount: { adults, kids, drinkers, nonDrinkers },
    durationHours: duration,
    budgetTarget: budget,
    budgetTier,
    venueType,
    dietaryRestrictions,
    ownedSupplies,
    summary: `A curated party plan for ${totalGuests} guests (${drinkers} drinkers) with precision catering rations, CymbalMart aisle routing, and balanced budget management.`,
    items,
    servingRatios,
    timelineSteps,
    storeRoutes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// 2. Generate Complete Party Plan & Shopping List for CymbalMart
app.post('/api/generate-plan', async (req, res) => {
  try {
    const {
      title,
      eventType,
      theme,
      vibe,
      guestCount,
      durationHours,
      budgetTarget,
      budgetTier,
      venueType,
      dietaryRestrictions = [],
      ownedSupplies = [],
    } = req.body;

    const totalGuests = (guestCount?.adults || 0) + (guestCount?.kids || 0);
    const drinkers = guestCount?.drinkers || 0;
    const nonDrinkers = guestCount?.nonDrinkers || 0;

    const ai = getAIClient();
    
    // If AI is available, attempt Gemini generation
    if (ai) {
      try {
        const prompt = `
You are the CymbalMart Master Party Planner & Shopping Procurement Specialist.
Generate a comprehensive, precision-calculated shopping list, catering ratios, CymbalMart store shopping routes, and run-of-show timeline for this party:

Event Title: ${title || 'Party'}
Event Type: ${eventType || 'Social Gathering'}
Theme / Aesthetic: ${theme || 'Festive'}
Vibe: ${vibe || 'Fun and inviting'}
Guests: ${totalGuests} total (${guestCount?.adults || 0} adults, ${guestCount?.kids || 0} kids, ${drinkers} drinkers, ${nonDrinkers} non-drinkers)
Duration: ${durationHours || 3} hours
Budget Target: $${budgetTarget || 250} (Tier: ${budgetTier || 'balanced'})
Venue: ${venueType || 'indoor'}
Dietary Preferences / Restrictions: ${dietaryRestrictions.join(', ') || 'None specified'}
Already Owned Supplies: ${ownedSupplies.join(', ') || 'None'}

CRITICAL RULES FOR QUANTITY CALCULATIONS & CYMBALMART AISLE MAPPING:
1. Drinks: Standard rule is 2 drinks per person for the first hour + 1 drink per hour thereafter. Calculate exact wine bottles (5 glasses/bottle), beer/seltzer packs, spirit bottles (16 drinks/750ml), and non-alcoholic sodas/sparkling waters.
2. Food: Finger food / Heavy Appetizers: 6-8 portions per person for 2-3 hr party, or 10-12 portions for 4+ hrs. Main meals: 6-8 oz protein per adult + 2 side portions.
3. Ice: 1.5 lbs of ice per drinking guest for cooling and drink serving.
4. Disposables: Always include 2x cups per guest (guests lose cups), 2.5x napkins, sturdy plates, cutlery, and heavy-duty 30+ gal trash bags for cleanup.
5. Store categories MUST be one of:
   - "Supermarket / Grocery"
   - "Wholesale / Warehouse Club"
   - "Party Supply Store"
   - "Beverage & Liquor Depot"
   - "Dollar / General Store"
   - "Bakery / Specialty Market"
6. Item categories MUST be one of:
   - "Food & Snacks"
   - "Beverages & Mixers"
   - "Alcohol & Spirits"
   - "Tableware & Disposables"
   - "Decor & Lighting"
   - "Entertainment & Games"
   - "Ice & Logistics"
7. CymbalMart Aisle assignments:
   - Map each item to a realistic CymbalMart aisle (e.g. "Aisle 1 - Fresh Produce", "Aisle 3 - Chips, Dips & Crackers", "Aisle 5 - Deli & Charcuterie", "Aisle 7 - Party Tableware & Cups", "Aisle 9 - Non-Alcoholic Mixers & Soda", "Aisle 12 - Wine & Craft Brews", "Aisle 15 - Ice Chests & Cleaning Bags", "Bakery Counter").
8. Realistic estimated prices matching current retail US prices at CymbalMart. Sum of estimated prices should reasonably align with the Budget Target of $${budgetTarget}.
9. Provide 3-5 Store Routes showing optimal shopping efficiency inside CymbalMart and partner depots.
10. Provide 4 Timeline Steps: "1_week_before", "2_days_before", "day_of_morning", "1_hour_before".
11. Provide 4 Serving Ratios explaining the math to the host.
`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                summary: { type: Type.STRING },
                items: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      category: {
                        type: Type.STRING,
                        enum: [
                          'Food & Snacks',
                          'Beverages & Mixers',
                          'Alcohol & Spirits',
                          'Tableware & Disposables',
                          'Decor & Lighting',
                          'Entertainment & Games',
                          'Ice & Logistics',
                        ],
                      },
                      storeCategory: {
                        type: Type.STRING,
                        enum: [
                          'Supermarket / Grocery',
                          'Wholesale / Warehouse Club',
                          'Party Supply Store',
                          'Beverage & Liquor Depot',
                          'Dollar / General Store',
                          'Bakery / Specialty Market',
                        ],
                      },
                      quantity: { type: Type.NUMBER },
                      unit: { type: Type.STRING },
                      estimatedPrice: { type: Type.NUMBER },
                      priority: {
                        type: Type.STRING,
                        enum: ['essential', 'recommended', 'optional'],
                      },
                      dietaryTags: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      notes: { type: Type.STRING },
                      brandSuggestion: { type: Type.STRING },
                      cymbalAisle: { type: Type.STRING },
                    },
                    required: ['name', 'category', 'storeCategory', 'quantity', 'unit', 'estimatedPrice', 'priority'],
                  },
                },
                servingRatios: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      category: { type: Type.STRING },
                      label: { type: Type.STRING },
                      calculatedAmount: { type: Type.STRING },
                      formulaExplanation: { type: Type.STRING },
                    },
                    required: ['category', 'label', 'calculatedAmount', 'formulaExplanation'],
                  },
                },
                timelineSteps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      phase: {
                        type: Type.STRING,
                        enum: ['1_week_before', '2_days_before', 'day_of_morning', '1_hour_before'],
                      },
                      phaseTitle: { type: Type.STRING },
                      task: { type: Type.STRING },
                      category: {
                        type: Type.STRING,
                        enum: ['shopping', 'prep', 'decor', 'drinks'],
                      },
                    },
                    required: ['phase', 'phaseTitle', 'task', 'category'],
                  },
                },
                storeRoutes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      storeName: { type: Type.STRING },
                      storeCategory: {
                        type: Type.STRING,
                        enum: [
                          'Supermarket / Grocery',
                          'Wholesale / Warehouse Club',
                          'Party Supply Store',
                          'Beverage & Liquor Depot',
                          'Dollar / General Store',
                          'Bakery / Specialty Market',
                        ],
                      },
                      itemCount: { type: Type.NUMBER },
                      estimatedCost: { type: Type.NUMBER },
                      proTip: { type: Type.STRING },
                    },
                    required: ['storeName', 'storeCategory', 'itemCount', 'estimatedCost', 'proTip'],
                  },
                },
              },
              required: ['title', 'summary', 'items', 'servingRatios', 'timelineSteps', 'storeRoutes'],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');

        // Add unique IDs and initial defaults
        const itemsWithIds = (parsed.items || []).map((it: any, index: number) => ({
          ...it,
          id: `ai-item-${Date.now()}-${index}`,
          isPurchased: false,
          estimatedPrice: Number(it.estimatedPrice) || 5.0,
          quantity: Number(it.quantity) || 1,
          cymbalAisle: it.cymbalAisle || 'Aisle 3 - Center Grocery',
          inStock: true,
          isCymbalValueBrand: it.brandSuggestion?.toLowerCase().includes('cymbal') || Math.random() > 0.5,
        }));

        const servingRatiosWithIds = (parsed.servingRatios || []).map((r: any, idx: number) => ({
          ...r,
          id: `ratio-${Date.now()}-${idx}`,
        }));

        const timelineStepsWithIds = (parsed.timelineSteps || []).map((t: any, idx: number) => ({
          ...t,
          id: `timeline-${Date.now()}-${idx}`,
          completed: false,
        }));

        const finalPlan = {
          id: `plan-${Date.now()}`,
          title: parsed.title || title || 'Custom Party Plan',
          eventType: eventType || 'Party',
          theme: theme || 'Celebration',
          vibe: vibe || 'Festive & Fun',
          guestCount: guestCount || { adults: 10, kids: 0, drinkers: 8, nonDrinkers: 2 },
          durationHours: durationHours || 3,
          budgetTarget: budgetTarget || 200,
          budgetTier: budgetTier || 'balanced',
          venueType: venueType || 'indoor',
          dietaryRestrictions: dietaryRestrictions || [],
          ownedSupplies: ownedSupplies || [],
          summary: parsed.summary || 'A customized party shopping plan tailored to your guest count and budget.',
          items: itemsWithIds,
          servingRatios: servingRatiosWithIds,
          timelineSteps: timelineStepsWithIds,
          storeRoutes: parsed.storeRoutes || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        return res.json({ success: true, plan: finalPlan });
      } catch (geminiError: any) {
        console.warn('Gemini API call returned an error, falling back to algorithmic plan generator:', geminiError.message);
      }
    }

    // Algorithmic Fallback Generator
    const fallbackPlan = generateAlgorithmicPlan(req.body);
    return res.json({ success: true, plan: fallbackPlan });
  } catch (error: any) {
    console.error('Error in /api/generate-plan:', error);
    // Even on uncaught error, deliver a valid fallback plan
    const emergencyPlan = generateAlgorithmicPlan(req.body || {});
    res.json({ success: true, plan: emergencyPlan });
  }
});

// Helper for Conversational Chat Heuristics Fallback
function generateAlgorithmicChatResponse(message: string, plan: any) {
  const msg = (message || '').toLowerCase();
  const timestamp = Date.now();

  if (msg.includes('delivery') || msg.includes('pickup') || msg.includes('curbside') || msg.includes('express') || msg.includes('order')) {
    return {
      text: `**CymbalMart Fulfillment Options for Your Event:**\n\n1. ⚡ **2-Hour Express Delivery**: Our shoppers hand-pick fresh chilled items, pack party ice in thermal bags, and deliver right to your venue doorstep ($4.99 or FREE for Cymbal Club).\n2. 🚗 **Curbside Trunk-Load Pickup**: Drive into designated parking bays at your local CymbalMart — our team loads your items directly into your trunk in under 5 minutes.\n3. 🛒 **In-Store Guided Smart Route**: Follow the app's aisle order (Dry goods -> Spirits -> Deli -> Ice last) for the fastest self-checkout.\n\nYou can schedule your preferred option anytime in the **Refine & Checkout** tab!`,
      actions: [
        { label: '📦 Open Checkout & Delivery', actionType: 'checkout' },
        { label: '🛒 View Aisle Navigation', actionType: 'filter_category' },
      ],
    };
  }

  if (msg.includes('cut') || msg.includes('trim') || msg.includes('budget') || msg.includes('save') || msg.includes('cheaper') || msg.includes('$50')) {
    return {
      text: `To trim roughly $35–$55 from your CymbalMart cart without sacrificing guest satisfaction:\n1. **Switch to Cymbal Everyday Value brands** for seltzers, tortilla chips, and tableware (saves ~$18).\n2. **Optimize drink ratios**: Replace one specialty liquor bottle with a festive batch punch (saves ~$20).\n3. **DIY Citrus Prep**: Buy whole limes and lemons rather than pre-cut garnish trays (saves ~$6).\n\nClick the button below to apply these cost-saving adjustments automatically!`,
      actions: [
        { label: '💰 Apply $45 Budget Savings', actionType: 'apply_budget_cut' },
        { label: '🍹 Batch Punch Recipe', actionType: 'generate_mocktails' },
      ],
      listAdjustments: {
        priceAdjustments: (plan?.items || []).slice(0, 4).map((it: any) => ({
          id: it.id,
          newPrice: Number((Math.max(2.5, it.estimatedPrice * 0.72)).toFixed(2)),
          reason: 'Swapped to Cymbal Everyday Value brand',
        })),
      },
    };
  }

  if (msg.includes('vegan') || msg.includes('gf') || msg.includes('gluten') || msg.includes('dietary') || msg.includes('allergen') || msg.includes('vegetarian')) {
    return {
      text: `I've prepared two crowd-pleasing, allergen-safe party snacks that satisfy vegan and gluten-free guests:\n\n1. **Artisan Veggie Crudité with Roasted Garlic & Herb Hummus**: Crisp rainbow carrots, cucumber rounds, and sweet bell peppers from CymbalMart Fresh Produce (Aisle 1).\n2. **Gluten-Free Sea Salt Rice Crisps & Guacamole**: Certified gluten-free and vegan grazing classic from Aisle 3.\n\nI can add these directly to your CymbalMart shopping list!`,
      actions: [
        { label: '🌱 Add Vegan/GF Grazing Pack', actionType: 'add_item' },
      ],
      listAdjustments: {
        itemsToAdd: [
          {
            name: 'Artisan Veggie Crudité & Herb Hummus Platter',
            category: 'Food & Snacks',
            storeCategory: 'Supermarket / Grocery',
            quantity: 1,
            unit: 'party platter',
            estimatedPrice: 12.99,
            priority: 'essential',
            dietaryTags: ['Vegan', 'Gluten-Free', 'Nut-Free Safe'],
            notes: 'Ready-to-serve produce deli platter',
          },
          {
            name: 'Organic Sea Salt Rice Crackers & Fresh Guacamole',
            category: 'Food & Snacks',
            storeCategory: 'Supermarket / Grocery',
            quantity: 2,
            unit: 'boxes + tubs',
            estimatedPrice: 9.50,
            priority: 'essential',
            dietaryTags: ['Vegan', 'Gluten-Free'],
            notes: 'Crunchy snack for dietary guests',
          },
        ],
      },
    };
  }

  if (msg.includes('cocktail') || msg.includes('mocktail') || msg.includes('drink') || msg.includes('punch') || msg.includes('signature')) {
    return {
      text: `Here is a signature themed pair for your party from CymbalMart Beverage Depot:\n\n🍸 **Signature Cocktail: "Cymbal Sunset Paloma"**\n- 2 oz Blanco Tequila or Vodka (Aisle 12)\n- 3 oz Fresh Pink Grapefruit Juice (Aisle 1)\n- 0.5 oz Fresh Lime Juice\n- Top with Cymbal Grapefruit Seltzer & Rosemary sprig garnish.\n\n🍹 **Matching Mocktail: "Virgin Ruby Spritz"**\n- 4 oz Pink Grapefruit Juice\n- 1 oz Splash of Cranberry\n- Top with Club Soda, Agave drizzle & Fresh Mint.\n\nWould you like me to add these mixers and citrus garnishes to your list?`,
      actions: [
        { label: '🍹 Add Signature Drink Mixers ($14)', actionType: 'add_item' },
      ],
      listAdjustments: {
        itemsToAdd: [
          {
            name: 'Ruby Red Grapefruit Juice & Fresh Rosemary Sprigs',
            category: 'Beverages & Mixers',
            storeCategory: 'Supermarket / Grocery',
            quantity: 2,
            unit: 'bottles + fresh herbs',
            estimatedPrice: 8.50,
            priority: 'recommended',
            dietaryTags: ['Vegan', 'Gluten-Free'],
            notes: 'Base mixer for signature cocktail & mocktail',
          },
          {
            name: 'Cymbal Premium Agave Nectar & Club Soda (6pk)',
            category: 'Beverages & Mixers',
            storeCategory: 'Supermarket / Grocery',
            quantity: 1,
            unit: 'pack',
            estimatedPrice: 6.00,
            priority: 'recommended',
            dietaryTags: ['Vegan', 'Gluten-Free'],
            notes: 'Sweetener and fizzy topper for spritzers',
          },
        ],
      },
    };
  }

  if (msg.includes('guest') || msg.includes('people') || msg.includes('rsvp') || msg.includes('+6') || msg.includes('+10') || msg.includes('more')) {
    return {
      text: `For +6 additional adult guests, our catering formula recommends:\n- **Drinks**: +18 to +24 drinks (+1 case beer/seltzer or +2 bottles wine from Aisle 12).\n- **Ice**: +9 lbs of ice (add one extra 10 lb bag from Aisle 15).\n- **Finger food**: +36 to +48 appetizer bites (+1 slider pack + 1 large chip bag).\n- **Tableware**: +12 cups and +15 napkins from Aisle 7.\n\nLet me know if you would like me to increase the quantities across your list!`,
      actions: [
        { label: '👥 Recalculate for +6 Guests', actionType: 'recalculate' },
      ],
    };
  }

  if (msg.includes('aisle') || msg.includes('route') || msg.includes('store') || msg.includes('fastest') || msg.includes('order')) {
    return {
      text: `**Fastest CymbalMart In-Store Navigation Strategy:**\n1. **Aisle 7 (Tableware & Disposables)**: Grab paper plates, cups, and napkins first while cart is empty.\n2. **Aisle 3 & 9 (Pantry & Beverages)**: Load heavy mixers, seltzers, and boxed snacks into bottom basket.\n3. **Aisle 12 (Wine & Spirits)**: Select craft brews and wine bottles.\n4. **Aisles 1 & 5 (Fresh Produce & Deli)**: Grab fresh charcuterie, sliders, and herbs so they stay cool.\n5. **Aisle 15 (Ice Depot)**: **Always grab party ice bags last** right before the register to prevent melting!`,
      actions: [
        { label: '🛒 View Store Routes View', actionType: 'filter_category' },
      ],
    };
  }

  // General fallback assistant reply
  return {
    text: `Hello! I am your CymbalMart Assistant. I'm currently tracking "${plan?.title || 'Event'}" with ${plan?.guestCount?.adults || 10} adults and a $${plan?.budgetTarget || 250} budget. How can I help you? I can assist with product search, aisle navigation, dietary options, signature drink recipes, or applying cost-saving brand swaps.`,
    actions: [
      { label: '💰 Trim $50 from order', actionType: 'apply_budget_cut' },
      { label: '🌱 Vegan & Gluten-Free items', actionType: 'add_item' },
      { label: '🍹 Signature Cocktail & Mocktail', actionType: 'generate_mocktails' },
    ],
  };
}

// 3. Conversational AI Co-Pilot Shopping Agent
app.post('/api/agent-chat', async (req, res) => {
  try {
    const { message, plan, history = [] } = req.body;

    const ai = getAIClient();

    if (ai) {
      try {
        const partyContext = plan
          ? `
CURRENT PARTY PROFILE:
- Title: "${plan.title}"
- Event Type: ${plan.eventType}
- Theme & Vibe: ${plan.theme} (${plan.vibe})
- Guests: ${plan.guestCount.adults} adults, ${plan.guestCount.kids} kids (${plan.guestCount.drinkers} drinkers, ${plan.guestCount.nonDrinkers} non-drinkers)
- Duration: ${plan.durationHours} hours
- Target Budget: $${plan.budgetTarget}
- Current Estimated Total: $${(plan.items || []).reduce((acc: number, i: any) => acc + (i.estimatedPrice || 0), 0).toFixed(2)}
- Current Item Count: ${(plan.items || []).length} items
- Dietary Restrictions: ${(plan.dietaryRestrictions || []).join(', ') || 'None'}
- Top Items Sample: ${(plan.items || []).slice(0, 10).map((i: any) => `${i.name} ($${i.estimatedPrice}, Qty: ${i.quantity} ${i.unit})`).join('; ')}
`
          : 'No active party plan loaded yet.';

        const systemPrompt = `
You are the "CymbalMart Assistant" — an intelligent, courteous, and highly knowledgeable shopping concierge and party planning assistant for CymbalMart customers.
Your job is to assist customers with event menus, precise drink/food catering math, CymbalMart brand recommendations, store aisle navigation, budget savings with Cymbal Everyday Value lines, dietary solutions, and fulfillment methods (2-hour express delivery, curbside pickup).

When the user asks to modify the shopping list (such as "Add a vegan gluten-free dessert", "Cut $50 from my budget", "We added 10 guests", "Add signature mocktail ingredients", "Remove all alcohol"):
You MUST provide structured listAdjustments in your JSON response so the host can apply them with a single click.

Format your output as a JSON object:
{
  "text": "Your helpful, conversational response explaining recommendations, math, or pro tips.",
  "actions": [
    { "label": "Quick action prompt", "actionType": "add_item" | "apply_budget_cut" | "generate_mocktails" | "recalculate", "payload": {} }
  ],
  "listAdjustments": {
    "itemsToAdd": [
      {
        "name": "Item name",
        "category": "Food & Snacks" | "Beverages & Mixers" | "Alcohol & Spirits" | "Tableware & Disposables" | "Decor & Lighting" | "Entertainment & Games" | "Ice & Logistics",
        "storeCategory": "Supermarket / Grocery" | "Wholesale / Warehouse Club" | "Party Supply Store" | "Beverage & Liquor Depot" | "Dollar / General Store" | "Bakery / Specialty Market",
        "quantity": 1,
        "unit": "pack",
        "estimatedPrice": 12.50,
        "priority": "essential" | "recommended" | "optional",
        "dietaryTags": ["Vegan", "Gluten-Free"],
        "notes": "Brief pro-tip note"
      }
    ],
    "itemIdsToRemove": [],
    "priceAdjustments": [
      { "id": "optional-id-or-name", "newPrice": 10.0, "reason": "Swap to store-brand generic" }
    ]
  }
}
`;

        const chatContents: any[] = [];
        
        // Add formatted history
        for (const h of history.slice(-6)) {
          chatContents.push({
            role: h.sender === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }],
          });
        }

        // Add current message with context
        chatContents.push({
          role: 'user',
          parts: [
            {
              text: `Context:\n${partyContext}\n\nUser Request: ${message}`,
            },
          ],
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: chatContents,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                actions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      actionType: { type: Type.STRING },
                    },
                    required: ['label', 'actionType'],
                  },
                },
                listAdjustments: {
                  type: Type.OBJECT,
                  properties: {
                    itemsToAdd: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          category: { type: Type.STRING },
                          storeCategory: { type: Type.STRING },
                          quantity: { type: Type.NUMBER },
                          unit: { type: Type.STRING },
                          estimatedPrice: { type: Type.NUMBER },
                          priority: { type: Type.STRING },
                          dietaryTags: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                          },
                          notes: { type: Type.STRING },
                        },
                        required: ['name', 'category', 'storeCategory', 'quantity', 'unit', 'estimatedPrice'],
                      },
                    },
                    itemIdsToRemove: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    priceAdjustments: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          newPrice: { type: Type.NUMBER },
                          reason: { type: Type.STRING },
                        },
                        required: ['newPrice', 'reason'],
                      },
                    },
                  },
                },
              },
              required: ['text'],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');

        return res.json({
          success: true,
          text: parsed.text || 'I have analyzed your party details and have some recommendations.',
          actions: parsed.actions || [],
          listAdjustments: parsed.listAdjustments || null,
        });
      } catch (geminiErr: any) {
        console.warn('Gemini chat error, falling back to smart rules:', geminiErr.message);
      }
    }

    // Algorithmic Chat fallback
    const fallbackResponse = generateAlgorithmicChatResponse(message, plan);
    return res.json({
      success: true,
      text: fallbackResponse.text,
      actions: fallbackResponse.actions,
      listAdjustments: fallbackResponse.listAdjustments || null,
    });
  } catch (error: any) {
    console.error('Error in /api/agent-chat:', error);
    const fallbackResponse = generateAlgorithmicChatResponse(req.body?.message || '', req.body?.plan || null);
    res.json({
      success: true,
      text: fallbackResponse.text,
      actions: fallbackResponse.actions,
      listAdjustments: fallbackResponse.listAdjustments || null,
    });
  }
});

// Helper for Smart Item Alternatives fallback
function generateAlgorithmicAlternatives(item: any, theme?: string) {
  const price = Number(item.estimatedPrice) || 12.0;
  const itemName = item.name || 'Party Item';
  const category = item.category || 'Food & Snacks';

  const budgetPrice = Number((Math.max(2.99, price * 0.62)).toFixed(2));
  const premiumPrice = Number((price * 1.65).toFixed(2));
  const ecoPrice = Number((price * 1.15).toFixed(2));

  return [
    {
      type: 'budget_saver' as const,
      title: 'Cymbal Everyday Value Brand Swap',
      name: `Cymbal Value Store-Brand ${itemName.replace(/Gourmet |Artisan |Premium /g, '')}`,
      estimatedPrice: budgetPrice,
      savingsOrDifference: `-$${(price - budgetPrice).toFixed(2)} (Save 38%)`,
      whyPickThis: 'Identical volume and taste for 38% less than premium name brands.',
      storeCategory: 'Supermarket / Grocery',
    },
    {
      type: 'premium_upgrade' as const,
      title: 'Artisan Reserve Showstopper Upgrade',
      name: `Handcrafted Artisan Reserve ${itemName}`,
      estimatedPrice: premiumPrice,
      savingsOrDifference: `+$${(premiumPrice - price).toFixed(2)}`,
      whyPickThis: `Elevated display and gourmet presentation tailored for a memorable ${theme || 'party'} centerpiece.`,
      storeCategory: 'Bakery / Specialty Market',
    },
    {
      type: 'dietary_eco' as const,
      title: 'Allergen-Safe & 100% Compostable Choice',
      name: `Organic Plant-Based / Eco-Friendly ${itemName}`,
      estimatedPrice: ecoPrice,
      savingsOrDifference: `+$${(ecoPrice - price).toFixed(2)}`,
      whyPickThis: 'Certified non-GMO, allergen-conscious, and packaged in zero-plastic compostable materials.',
      storeCategory: 'Supermarket / Grocery',
    },
  ];
}

// 4. Smart Item Alternatives & Budget Swaps
app.post('/api/suggest-alternatives', async (req, res) => {
  try {
    const { item, theme, budgetTier } = req.body;

    const ai = getAIClient();

    if (ai) {
      try {
        const prompt = `
Given this party shopping item:
- Name: "${item.name}"
- Category: "${item.category}"
- Current Estimated Price: $${item.estimatedPrice} (Quantity: ${item.quantity} ${item.unit})
- Party Theme: "${theme || 'General'}"
- Budget Tier: "${budgetTier || 'balanced'}"

Suggest 3 smart alternatives:
1. "Budget Saver Swap": Lower cost store brand or DIY option that saves 30-50%
2. "Gourmet / Premium Upgrade": Higher-end artisan or visual showstopper upgrade
3. "Dietary / Eco-Friendly Option": Allergen-friendly, vegan, or compostable sustainable version

Provide JSON array of 3 alternatives.
`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ['budget_saver', 'premium_upgrade', 'dietary_eco'] },
                  title: { type: Type.STRING },
                  name: { type: Type.STRING },
                  estimatedPrice: { type: Type.NUMBER },
                  savingsOrDifference: { type: Type.STRING },
                  whyPickThis: { type: Type.STRING },
                  storeCategory: { type: Type.STRING },
                },
                required: ['type', 'title', 'name', 'estimatedPrice', 'savingsOrDifference', 'whyPickThis'],
              },
            },
          },
        });

        const alternatives = JSON.parse(response.text || '[]');
        return res.json({ success: true, alternatives });
      } catch (geminiErr: any) {
        console.warn('Gemini alternatives error, falling back to heuristics:', geminiErr.message);
      }
    }

    const fallbackAlts = generateAlgorithmicAlternatives(item, theme);
    return res.json({ success: true, alternatives: fallbackAlts });
  } catch (error: any) {
    console.error('Error in /api/suggest-alternatives:', error);
    const fallbackAlts = generateAlgorithmicAlternatives(req.body?.item || {}, req.body?.theme);
    res.json({ success: true, alternatives: fallbackAlts });
  }
});

// Helper for Party Readiness Audit fallback
function generateAlgorithmicAudit(plan: any) {
  const items = plan?.items || [];
  const guests = (plan?.guestCount?.adults || 10) + (plan?.guestCount?.kids || 0);
  const drinkers = plan?.guestCount?.drinkers || 8;
  const targetBudget = plan?.budgetTarget || 250;
  const currentTotal = items.reduce((sum: number, it: any) => sum + (Number(it.estimatedPrice) || 0), 0);

  const missing: string[] = [];
  const optimizations: string[] = [];

  const hasIce = items.some((i: any) => i.name.toLowerCase().includes('ice') || i.category === 'Ice & Logistics');
  const hasCups = items.some((i: any) => i.name.toLowerCase().includes('cup'));
  const hasTrash = items.some((i: any) => i.name.toLowerCase().includes('trash') || i.name.toLowerCase().includes('bag'));
  const hasNapkins = items.some((i: any) => i.name.toLowerCase().includes('napkin'));

  if (!hasIce) missing.push('Party Ice Bags (1.5 lbs per drinking guest)');
  if (!hasCups) missing.push('Extra Disposable Cups (2x guest buffer)');
  if (!hasTrash) missing.push('Heavy Duty 33-Gallon Trash Bags for Fast Cleanup');
  if (!hasNapkins) missing.push('3-Ply Dinner Napkins (2.5 per guest)');

  if (currentTotal > targetBudget * 1.1) {
    optimizations.push(`Estimated total ($${currentTotal.toFixed(2)}) exceeds target ($${targetBudget}). Swap premium name brands for Cymbal Value items to save ~$35.`);
  } else {
    optimizations.push('Budget balance is in the sweet spot! Good ratio of essentials to entertainment.');
  }

  optimizations.push('Pre-batch your signature cocktail in a beverage dispenser to reduce bartending time during the party.');

  const dietaryCoverage = (plan?.dietaryRestrictions || []).map((tag: string) => {
    const matchingCount = items.filter((it: any) => 
      (it.dietaryTags || []).some((t: string) => t.toLowerCase().includes(tag.toLowerCase()))
    ).length;
    return {
      tag,
      itemCount: Math.max(1, matchingCount),
      status: (matchingCount >= 1 ? 'covered' : 'needs_more') as 'covered' | 'needs_more',
    };
  });

  const score = Math.max(78, 100 - missing.length * 8 - (currentTotal > targetBudget * 1.15 ? 10 : 0));

  return {
    score,
    status: (score >= 90 ? 'Ready to Party' : score >= 80 ? 'Good with minor tweaks' : 'Needs Attention') as 'Ready to Party' | 'Good with minor tweaks' | 'Needs Attention',
    criticalMissing: missing,
    budgetOptimizations: optimizations,
    dietaryCoverage: dietaryCoverage.length > 0 ? dietaryCoverage : [{ tag: 'General Crowd', itemCount: items.length, status: 'covered' as const }],
    proTips: [
      'Set out ice in an insulated cooler 30 minutes before arrival so cubes are dry and easy to scoop.',
      'Group tableware, plates, and napkins near the food buffet start point.',
      'Queue your Spotify/Apple Music playlist offline in advance to prevent dead air if Wi-Fi drops.',
    ],
  };
}

// 5. Party Readiness Audit
app.post('/api/audit-party', async (req, res) => {
  try {
    const { plan } = req.body;

    const ai = getAIClient();

    if (ai) {
      try {
        const prompt = `
Conduct a thorough Party Readiness & Shopping Audit for this event:
- Title: ${plan.title}
- Guests: ${plan.guestCount.adults} adults, ${plan.guestCount.kids} kids (${plan.guestCount.drinkers} drinkers, ${plan.guestCount.nonDrinkers} non-drinkers)
- Duration: ${plan.durationHours} hours
- Target Budget: $${plan.budgetTarget}
- Items: ${(plan.items || []).map((i: any) => `${i.name} (Qty: ${i.quantity} ${i.unit}, $${i.estimatedPrice})`).join(', ')}
- Dietary Restrictions: ${(plan.dietaryRestrictions || []).join(', ') || 'None'}

Evaluate:
1. Critical missing essentials (e.g. ice, bottle openers, napkins, trash bags, tongs, allergen signs)
2. Budget optimizations & potential waste areas
3. Dietary coverage check
4. Party readiness score (0-100)
`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER },
                status: {
                  type: Type.STRING,
                  enum: ['Ready to Party', 'Good with minor tweaks', 'Needs Attention'],
                },
                criticalMissing: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                budgetOptimizations: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                dietaryCoverage: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      tag: { type: Type.STRING },
                      itemCount: { type: Type.NUMBER },
                      status: { type: Type.STRING, enum: ['covered', 'needs_more'] },
                    },
                    required: ['tag', 'itemCount', 'status'],
                  },
                },
                proTips: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['score', 'status', 'criticalMissing', 'budgetOptimizations', 'dietaryCoverage', 'proTips'],
            },
          },
        });

        const audit = JSON.parse(response.text || '{}');
        return res.json({ success: true, audit });
      } catch (geminiErr: any) {
        console.warn('Gemini audit error, falling back to algorithmic auditor:', geminiErr.message);
      }
    }

    const fallbackAudit = generateAlgorithmicAudit(plan);
    return res.json({ success: true, audit: fallbackAudit });
  } catch (error: any) {
    console.error('Error in /api/audit-party:', error);
    const fallbackAudit = generateAlgorithmicAudit(req.body?.plan || {});
    res.json({ success: true, audit: fallbackAudit });
  }
});

// Setup Vite / Static handling
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Party Planner Shopping Agent server running on http://0.0.0.0:${PORT}`);
  });
}

start();
