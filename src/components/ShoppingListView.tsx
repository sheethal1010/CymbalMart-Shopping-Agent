import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Sparkles, 
  ShoppingBag, 
  Check, 
  Store,
} from 'lucide-react';
import { ShoppingItem, ItemCategory, StoreCategory, ItemPriority } from '../types';
import { formatCurrency } from '../utils/storage';

interface ShoppingListViewProps {
  items: ShoppingItem[];
  onTogglePurchased: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onUpdatePrice: (id: string, newPrice: number) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (item: Omit<ShoppingItem, 'id' | 'isPurchased'>) => void;
  onOpenAlternatives: (item: ShoppingItem) => void;
  onBulkMarkPurchased: (purchased: boolean) => void;
}

const CATEGORIES: ItemCategory[] = [
  'Food & Snacks',
  'Beverages & Mixers',
  'Alcohol & Spirits',
  'Tableware & Disposables',
  'Decor & Lighting',
  'Entertainment & Games',
  'Ice & Logistics',
];

const STORE_CATEGORIES: StoreCategory[] = [
  'Supermarket / Grocery',
  'Wholesale / Warehouse Club',
  'Party Supply Store',
  'Beverage & Liquor Depot',
  'Dollar / General Store',
  'Bakery / Specialty Market',
];

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  items,
  onTogglePurchased,
  onUpdateQuantity,
  onDeleteItem,
  onAddItem,
  onOpenAlternatives,
  onBulkMarkPurchased,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'purchased'>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'category' | 'store' | 'price_high' | 'price_low' | 'name'>('category');

  // Quick Add Item Bar state
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<ItemCategory>('Food & Snacks');
  const [newItemStore, setNewItemStore] = useState<StoreCategory>('Supermarket / Grocery');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState('pack');
  const [newItemPrice, setNewItemPrice] = useState(10.0);
  const [newItemPriority, setNewItemPriority] = useState<ItemPriority>('essential');
  const [showAddForm, setShowAddForm] = useState(false);

  // Quick Add Submission
  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    onAddItem({
      name: newItemName.trim(),
      category: newItemCategory,
      storeCategory: newItemStore,
      quantity: Math.max(1, newItemQty),
      unit: newItemUnit.trim() || 'item',
      estimatedPrice: Math.max(0, newItemPrice),
      priority: newItemPriority,
      notes: '',
    });

    setNewItemName('');
    setShowAddForm(false);
  };

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchCat = item.category.toLowerCase().includes(q);
        const matchStore = item.storeCategory.toLowerCase().includes(q);
        const matchDiet = item.dietaryTags?.some(d => d.toLowerCase().includes(q));
        if (!matchName && !matchCat && !matchStore && !matchDiet) return false;
      }
      // Category
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      // Store
      if (selectedStore !== 'all' && item.storeCategory !== selectedStore) return false;
      // Status
      if (selectedStatus === 'pending' && item.isPurchased) return false;
      if (selectedStatus === 'purchased' && !item.isPurchased) return false;
      // Priority
      if (selectedPriority !== 'all' && item.priority !== selectedPriority) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_high') return b.estimatedPrice - a.estimatedPrice;
      if (sortBy === 'price_low') return a.estimatedPrice - b.estimatedPrice;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'store') return a.storeCategory.localeCompare(b.storeCategory);
      return a.category.localeCompare(b.category);
    });
  }, [items, searchQuery, selectedCategory, selectedStore, selectedStatus, selectedPriority, sortBy]);

  // Totals for current filtered list
  const totalFilteredCost = filteredItems.reduce((sum, i) => sum + i.estimatedPrice, 0);
  const purchasedFilteredCost = filteredItems.filter(i => i.isPurchased).reduce((sum, i) => sum + i.estimatedPrice, 0);

  const getPriorityBadge = (p: ItemPriority) => {
    switch (p) {
      case 'essential':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#FAECE8] text-[#A85344] border border-[#F0CEC7]">Must Have</span>;
      case 'recommended':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#FDF6EB] text-[#A06C28] border border-[#F2E0C4]">Recommended</span>;
      case 'optional':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#F5F2EB] text-[#7D756D] border border-[#E6DFD5]">Optional</span>;
    }
  };

  const getCategoryColor = (cat: ItemCategory) => {
    switch (cat) {
      case 'Food & Snacks': return 'text-[#8C5D39] bg-[#F7EFE9] border-[#EAD8C7]';
      case 'Beverages & Mixers': return 'text-[#4F6B56] bg-[#EDF3EF] border-[#D4E3D8]';
      case 'Alcohol & Spirits': return 'text-[#7A5B69] bg-[#F5EDF1] border-[#E7D6E0]';
      case 'Tableware & Disposables': return 'text-[#5E7356] bg-[#E8EFE6] border-[#D0E0CC]';
      case 'Decor & Lighting': return 'text-[#9E644D] bg-[#FBF0EB] border-[#F2DACF]';
      case 'Entertainment & Games': return 'text-[#5B6D7A] bg-[#EEF3F6] border-[#D6E2E9]';
      case 'Ice & Logistics': return 'text-[#4E707A] bg-[#EAF2F4] border-[#CFE2E6]';
      default: return 'text-[#7D756D] bg-[#F5F2EB] border-[#E6DFD5]';
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Controls / Filter Bar */}
      <div className="bg-[#FFFFFF] border border-[#E6DFD5] rounded-2xl p-4 shadow-sm space-y-3">
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8C857D] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-items-input"
              type="text"
              placeholder="Search items, ingredients, stores, dietary tags..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F8F6F0] border border-[#E6DFD5] rounded-xl text-xs sm:text-sm text-[#3D3A35] placeholder-[#8C857D] focus:outline-none focus:border-[#5E7356]"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8C857D] hover:text-[#3D3A35]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              id="toggle-add-item-form-btn"
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#5E7356] hover:bg-[#4F6448] text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Item</span>
            </button>

            <div className="flex items-center bg-[#F8F6F0] border border-[#E6DFD5] rounded-xl p-1 text-xs">
              <button
                onClick={() => onBulkMarkPurchased(true)}
                className="px-2.5 py-1 text-[#5C564F] hover:text-[#3D3A35] hover:bg-[#EFECE6] rounded-lg transition-colors font-medium"
                title="Mark all filtered items as purchased"
              >
                Check All
              </button>
              <div className="w-px h-3.5 bg-[#E6DFD5] mx-1" />
              <button
                onClick={() => onBulkMarkPurchased(false)}
                className="px-2.5 py-1 text-[#5C564F] hover:text-[#3D3A35] hover:bg-[#EFECE6] rounded-lg transition-colors font-medium"
                title="Uncheck all items"
              >
                Uncheck
              </button>
            </div>
          </div>

        </div>

        {/* Dropdown Filters & Sorting Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-[#F8F6F0] border border-[#E6DFD5] rounded-lg text-[#3D3A35] focus:outline-none focus:border-[#5E7356]"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Store Filter */}
          <select
            value={selectedStore}
            onChange={e => setSelectedStore(e.target.value)}
            className="px-2.5 py-1.5 bg-[#F8F6F0] border border-[#E6DFD5] rounded-lg text-[#3D3A35] focus:outline-none focus:border-[#5E7356]"
          >
            <option value="all">All Stores</option>
            {STORE_CATEGORIES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value as any)}
            className="px-2.5 py-1.5 bg-[#F8F6F0] border border-[#E6DFD5] rounded-lg text-[#3D3A35] focus:outline-none focus:border-[#5E7356]"
          >
            <option value="all">All Status</option>
            <option value="pending">To Buy (Unchecked)</option>
            <option value="purchased">Purchased (Checked)</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={e => setSelectedPriority(e.target.value)}
            className="px-2.5 py-1.5 bg-[#F8F6F0] border border-[#E6DFD5] rounded-lg text-[#3D3A35] focus:outline-none focus:border-[#5E7356]"
          >
            <option value="all">All Priorities</option>
            <option value="essential">Must Have</option>
            <option value="recommended">Recommended</option>
            <option value="optional">Optional</option>
          </select>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[#8C857D] text-[11px] hidden sm:inline font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 bg-[#F8F6F0] border border-[#E6DFD5] rounded-lg text-[#3D3A35] focus:outline-none focus:border-[#5E7356]"
            >
              <option value="category">Category</option>
              <option value="store">Store Route</option>
              <option value="price_high">Price: High to Low</option>
              <option value="price_low">Price: Low to High</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>

        </div>

      </div>

      {/* Quick Add Custom Item Form */}
      {showAddForm && (
        <form 
          onSubmit={handleCreateItem}
          className="p-4 rounded-2xl bg-[#F8F6F0] border border-[#D0E0CC] shadow-sm space-y-3"
        >
          <div className="flex items-center justify-between text-xs font-bold text-[#4F6448]">
            <span className="flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Add Item to Shopping List
            </span>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-[#8C857D] hover:text-[#3D3A35]"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="sm:col-span-2">
              <input
                type="text"
                placeholder="Item name (e.g. Lime Slices, Sparkling Water 12pk)"
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E6DFD5] rounded-xl text-xs sm:text-sm text-[#3D3A35] placeholder-[#8C857D] focus:outline-none focus:border-[#5E7356]"
              />
            </div>
            <div>
              <input
                type="number"
                step="0.5"
                min="0"
                placeholder="Estimated Price ($)"
                value={newItemPrice}
                onChange={e => setNewItemPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E6DFD5] rounded-xl text-xs sm:text-sm text-[#3D3A35] placeholder-[#8C857D] focus:outline-none focus:border-[#5E7356]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div>
              <label className="text-[10px] text-[#8C857D] block mb-1 font-medium">Category</label>
              <select
                value={newItemCategory}
                onChange={e => setNewItemCategory(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E6DFD5] rounded-lg text-[#3D3A35]"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-[#8C857D] block mb-1 font-medium">Target Store</label>
              <select
                value={newItemStore}
                onChange={e => setNewItemStore(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E6DFD5] rounded-lg text-[#3D3A35]"
              >
                {STORE_CATEGORIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-[#8C857D] block mb-1 font-medium">Quantity & Unit</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  min="1"
                  value={newItemQty}
                  onChange={e => setNewItemQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-14 px-2 py-1.5 bg-[#FFFFFF] border border-[#E6DFD5] rounded-lg text-[#3D3A35] text-center font-bold"
                />
                <input
                  type="text"
                  placeholder="pack/lbs"
                  value={newItemUnit}
                  onChange={e => setNewItemUnit(e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#FFFFFF] border border-[#E6DFD5] rounded-lg text-[#3D3A35] text-xs"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-[#8C857D] block mb-1 font-medium">Priority</label>
              <select
                value={newItemPriority}
                onChange={e => setNewItemPriority(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E6DFD5] rounded-lg text-[#3D3A35]"
              >
                <option value="essential">Must Have</option>
                <option value="recommended">Recommended</option>
                <option value="optional">Optional</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#5E7356] hover:bg-[#4F6448] text-white text-xs font-semibold shadow-sm transition-colors"
            >
              Save Item
            </button>
          </div>
        </form>
      )}

      {/* Items List */}
      <div className="bg-[#FFFFFF] border border-[#E6DFD5] rounded-2xl overflow-hidden shadow-sm">
        
        {/* Table / List Header */}
        <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-3 bg-[#F8F6F0] border-b border-[#E6DFD5] text-[11px] font-semibold uppercase tracking-wider text-[#7D756D]">
          <div className="col-span-5 flex items-center gap-2">Item & Details</div>
          <div className="col-span-2">Store Route</div>
          <div className="col-span-2 text-center">Quantity</div>
          <div className="col-span-2 text-right">Est. Price</div>
          <div className="col-span-1 text-center">Actions</div>
        </div>

        {/* Item Rows */}
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-[#8C857D] space-y-3">
            <ShoppingBag className="w-10 h-10 mx-auto text-[#C7BFB5] opacity-80" />
            <div className="text-sm font-semibold text-[#3D3A35]">No items match your active filters</div>
            <p className="text-xs text-[#8C857D] max-w-sm mx-auto">
              Try clearing your search query, or use the "Add Custom Item" button above to add custom grocery or party supplies.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E6DFD5]/80">
            {filteredItems.map((item) => {
              const isPurchased = item.isPurchased;
              return (
                <div 
                  key={item.id}
                  className={`p-3.5 sm:px-4 sm:py-3 transition-colors ${
                    isPurchased ? 'bg-[#F8F6F0]/60 opacity-75' : 'hover:bg-[#FAF9F6]'
                  }`}
                >
                  <div className="flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:gap-3 items-start sm:items-center">
                    
                    {/* Item Checkbox, Title & Badges */}
                    <div className="sm:col-span-5 flex items-start gap-3 w-full">
                      <button
                        onClick={() => onTogglePurchased(item.id)}
                        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                          isPurchased 
                            ? 'bg-[#5E7356] border-[#4F6448] text-white shadow-xs' 
                            : 'border-[#D0C9BE] hover:border-[#5E7356] bg-[#FFFFFF]'
                        }`}
                        title={isPurchased ? 'Mark unpurchased' : 'Mark as purchased'}
                      >
                        {isPurchased && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`text-xs sm:text-sm font-medium transition-all ${
                            isPurchased ? 'line-through text-[#8C857D]' : 'text-[#3D3A35]'
                          }`}>
                            {item.name}
                          </span>
                          {getPriorityBadge(item.priority)}
                        </div>

                        {/* Category & Dietary Tags */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px]">
                          <span className={`px-2 py-0.5 rounded border text-[10px] font-medium ${getCategoryColor(item.category)}`}>
                            {item.category}
                          </span>
                          
                          {item.dietaryTags?.map(tag => (
                            <span key={tag} className="px-1.5 py-0.5 rounded bg-[#E8EFE6] text-[#4F6448] border border-[#D0E0CC] text-[10px] font-medium">
                              {tag}
                            </span>
                          ))}

                          {item.notes && (
                            <span className="text-[10px] text-[#8C857D] italic truncate max-w-[200px]" title={item.notes}>
                              💬 {item.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Store Category */}
                    <div className="sm:col-span-2 flex items-center gap-1.5 text-xs text-[#5C564F]">
                      <Store className="w-3.5 h-3.5 text-[#7A6453] flex-shrink-0" />
                      <span className="truncate">{item.storeCategory.replace(' / ', '/')}</span>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="sm:col-span-2 flex items-center justify-start sm:justify-center gap-2">
                      <div className="flex items-center bg-[#F8F6F0] border border-[#E6DFD5] rounded-lg">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          disabled={item.quantity <= 1}
                          className="px-2 py-1 text-[#7D756D] hover:text-[#3D3A35] disabled:opacity-30 text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-bold text-[#3D3A35]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="px-2 py-1 text-[#7D756D] hover:text-[#3D3A35] text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-[11px] text-[#8C857D]">{item.unit}</span>
                    </div>

                    {/* Estimated Price */}
                    <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                      <div className="sm:hidden text-xs text-[#8C857D]">Est. Price:</div>
                      <div className="text-right">
                        <div className="text-xs sm:text-sm font-bold text-[#4F6448]">
                          {formatCurrency(item.estimatedPrice)}
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-[10px] text-[#8C857D]">
                            {formatCurrency(item.estimatedPrice / item.quantity)} / {item.unit}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions: AI Swaps & Delete */}
                    <div className="sm:col-span-1 flex items-center justify-end sm:justify-center gap-1 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E6DFD5]">
                      
                      {/* AI Alternatives & Budget Swapper */}
                      <button
                        onClick={() => onOpenAlternatives(item)}
                        className="p-1.5 rounded-lg bg-[#F8F6F0] hover:bg-[#F2EAE1] text-[#7A6453] border border-[#E6DFD5] transition-colors"
                        title="AI Smart Swaps & Budget Alternatives"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete item */}
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1.5 rounded-lg bg-[#F8F6F0] hover:bg-[#FAECE8] text-[#8C857D] hover:text-[#A85344] border border-[#E6DFD5] transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Subtotal */}
        {filteredItems.length > 0 && (
          <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-[#F8F6F0] border-t border-[#E6DFD5] text-xs text-[#5C564F]">
            <div>
              Showing <span className="font-bold text-[#3D3A35]">{filteredItems.length}</span> items
            </div>
            <div className="flex items-center gap-4">
              <div>
                Purchased: <span className="font-bold text-[#4F6448]">{formatCurrency(purchasedFilteredCost)}</span>
              </div>
              <div className="font-semibold">
                Filtered Total: <span className="font-bold text-[#3D3A35] text-sm">{formatCurrency(totalFilteredCost)}</span>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
