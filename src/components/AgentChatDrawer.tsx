import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Plus, 
  Check, 
} from 'lucide-react';
import { PartyPlan, ChatMessage, ShoppingItem } from '../types';
import { formatCurrency } from '../utils/storage';

interface AgentChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PartyPlan;
  onApplyListAdjustments: (adjustments: {
    itemsToAdd?: Omit<ShoppingItem, 'id' | 'isPurchased'>[];
    itemIdsToRemove?: string[];
    priceAdjustments?: { id: string; newPrice: number; reason: string }[];
  }) => void;
}

const QUICK_PROMPTS = [
  { label: '💰 Trim $50 from order', prompt: 'How can I trim $50 from my CymbalMart shopping list without degrading the party experience? Give specific item swaps.' },
  { label: '🌱 Vegan & Gluten-Free items', prompt: 'Two of my guests are vegan and gluten-free. Recommend and add 2 crowd-pleasing CymbalMart snacks/drinks for them.' },
  { label: '🍹 Signature Cocktail & Mocktail', prompt: 'Design a unique signature cocktail and a matching virgin mocktail that fits my theme, with exact ingredients from CymbalMart.' },
  { label: '👥 Update for +6 Guests', prompt: 'We just had 6 more adult guests RSVP yes. How should my food, ice, and beverage quantities increase?' },
  { label: '🛒 CymbalMart Aisle Guide', prompt: 'What is the fastest order to navigate CymbalMart aisles and what should I buy in bulk vs standard supermarket?' },
  { label: '📦 Delivery & Pickup options', prompt: 'How does 2-hour express delivery and curbside pickup work at CymbalMart for this order?' },
];

export const AgentChatDrawer: React.FC<AgentChatDrawerProps> = ({
  isOpen,
  onClose,
  plan,
  onApplyListAdjustments,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'agent',
      text: `Hello! I am your CymbalMart Assistant. I am here to help you plan, budget, find products across our aisles, and optimize your shopping list for "${plan.title}" (${plan.guestCount.adults + plan.guestCount.kids} guests, $${plan.budgetTarget} budget). How can I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [appliedAdjustmentIds, setAppliedAdjustmentIds] = useState<string[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/agent-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          plan,
          history: messages,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Chat request failed');
      }

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: data.actions || [],
        listAdjustments: data.listAdjustments || undefined,
      };

      setMessages(prev => [...prev, agentMsg]);
    } catch (err: any) {
      console.error('Chat error', err);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'agent',
          text: "I ran into a temporary issue connecting to the AI assistant. Please try again in a moment.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyAdjustments = (msgId: string, adj: any) => {
    onApplyListAdjustments(adj);
    setAppliedAdjustmentIds(prev => [...prev, msgId]);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-[#FFFFFF] border-l border-[#E6DFD5] shadow-2xl flex flex-col text-[#3D3A35]">
      
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-[#FAF9F6] border-b border-[#E6DFD5]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#5E7356] text-white border border-[#4F6448] flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-serif text-sm font-bold text-[#3D3A35]">CymbalMart Assistant</h3>
              <span className="w-2 h-2 rounded-full bg-[#5E7356] animate-pulse" />
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#E8EFE6] text-[#4F6448]">Online</span>
            </div>
            <p className="text-[11px] text-[#7D756D]">
              Customer party planning, aisle advice & budget co-pilot
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

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#FFFFFF]">
        
        {/* Quick Suggestion Pills at top */}
        <div className="space-y-1.5 pb-2">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[#7D756D]">
            ⚡ Quick Agent Prompts
          </div>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp.prompt)}
                disabled={loading}
                className="px-2.5 py-1 rounded-full bg-[#F8F6F0] hover:bg-[#F5F2EB] border border-[#E6DFD5] hover:border-[#5E7356]/40 text-[11px] text-[#5C564F] hover:text-[#3D3A35] transition-all text-left truncate max-w-full font-medium"
              >
                {qp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message stream */}
        {messages.map((msg) => {
          const isAgent = msg.sender === 'agent';
          const hasAdjustments = msg.listAdjustments && (
            (msg.listAdjustments.itemsToAdd && msg.listAdjustments.itemsToAdd.length > 0) ||
            (msg.listAdjustments.priceAdjustments && msg.listAdjustments.priceAdjustments.length > 0)
          );
          const isApplied = appliedAdjustmentIds.includes(msg.id);

          return (
            <div 
              key={msg.id}
              className={`flex gap-2.5 ${isAgent ? 'items-start' : 'items-start flex-row-reverse'}`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${
                isAgent 
                  ? 'bg-[#E8EFE6] text-[#5E7356] border border-[#D0E0CC]' 
                  : 'bg-[#C29B7F] text-white'
              }`}>
                {isAgent ? <Bot className="w-4 h-4" /> : <User className="w-3.5 h-3.5" />}
              </div>

              <div className="max-w-[85%] space-y-2">
                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  isAgent 
                    ? 'bg-[#F8F6F0] text-[#3D3A35] border border-[#E6DFD5] rounded-tl-sm' 
                    : 'bg-[#5E7356] text-white rounded-tr-sm shadow-sm'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <div className={`text-[9px] mt-1.5 text-right ${isAgent ? 'text-[#8C857D]' : 'text-white/80'}`}>
                    {msg.timestamp}
                  </div>
                </div>

                {/* List Adjustments Card with 1-Click Apply */}
                {hasAdjustments && (
                  <div className="p-3.5 rounded-2xl bg-[#F2EAE1] border border-[#E0D1C1] text-xs space-y-2">
                    <div className="flex items-center justify-between text-[#7A6453] font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#C29B7F]" /> Proposed Adjustments
                      </span>
                      {isApplied && (
                        <span className="flex items-center gap-1 text-[10px] text-[#4F6448] font-bold">
                          <Check className="w-3 h-3" /> Applied to Cart
                        </span>
                      )}
                    </div>

                    {/* Items to add preview */}
                    {msg.listAdjustments?.itemsToAdd && msg.listAdjustments.itemsToAdd.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[10px] text-[#7D756D] uppercase tracking-wider font-semibold">Items to Add:</div>
                        {msg.listAdjustments.itemsToAdd.map((it, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-[#FFFFFF] border border-[#E6DFD5] text-[11px]">
                            <span className="text-[#3D3A35] font-medium truncate">{it.name} ({it.quantity} {it.unit})</span>
                            <span className="font-bold text-[#4F6448]">{formatCurrency(it.estimatedPrice)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Apply Button */}
                    {!isApplied && (
                      <button
                        onClick={() => handleApplyAdjustments(msg.id, msg.listAdjustments)}
                        className="w-full py-2 px-3 rounded-xl bg-[#5E7356] hover:bg-[#4F6448] text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Apply Changes to Shopping List</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#E8EFE6] text-[#5E7356] border border-[#D0E0CC] flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 rounded-2xl bg-[#F8F6F0] border border-[#E6DFD5] text-xs text-[#7D756D] flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-[#5E7356] border-t-transparent rounded-full animate-spin" />
              <span>Analyzing party context and calculating ratios...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-[#FAF9F6] border-t border-[#E6DFD5]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask agent (e.g. 'Add signature mocktail', 'Trim $40')..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E6DFD5] rounded-xl text-xs sm:text-sm text-[#3D3A35] placeholder-[#8C857D] focus:outline-none focus:border-[#5E7356]"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-[#5E7356] hover:bg-[#4F6448] disabled:opacity-40 text-white font-semibold shadow-sm transition-all active:scale-95 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
