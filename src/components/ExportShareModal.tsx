import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Printer, 
  Download, 
  MessageSquare,
} from 'lucide-react';
import { PartyPlan } from '../types';
import { formatCurrency } from '../utils/storage';

interface ExportShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PartyPlan;
}

export const ExportShareModal: React.FC<ExportShareModalProps> = ({
  isOpen,
  onClose,
  plan,
}) => {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<'text' | 'store_breakdown' | 'json'>('text');

  if (!isOpen) return null;

  // Generate plain text shopping manifest
  const generateTextManifest = () => {
    let text = `🎉 SHOPPING LIST FOR: ${plan.title.toUpperCase()}\n`;
    text += `Theme: ${plan.theme} (${plan.vibe})\n`;
    text += `Guests: ${plan.guestCount.adults} Adults, ${plan.guestCount.kids} Kids | Budget: $${plan.budgetTarget}\n`;
    text += `Estimated Total: ${formatCurrency(plan.items.reduce((s, i) => s + i.estimatedPrice, 0))}\n\n`;

    // Group by category
    const categories: string[] = Array.from(new Set(plan.items.map(i => i.category)));
    categories.forEach((cat: string) => {
      text += `--- ${cat.toUpperCase()} ---\n`;
      const catItems = plan.items.filter(i => i.category === cat);
      catItems.forEach(item => {
        const check = item.isPurchased ? '[X]' : '[ ]';
        text += `${check} ${item.name} (${item.quantity} ${item.unit}) - ${formatCurrency(item.estimatedPrice)} [${item.storeCategory.split('/')[0].trim()}]\n`;
      });
      text += '\n';
    });

    text += `Generated with Party Planner Shopping Agent\n`;
    return text;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateTextManifest());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(plan, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${plan.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_party_plan.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3D3A35]/60 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-2xl bg-[#FFFFFF] border border-[#E6DFD5] rounded-3xl shadow-2xl overflow-hidden text-[#3D3A35] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#FAF9F6] border-b border-[#E6DFD5]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F2EAE1] text-[#7A6453] border border-[#E0D1C1] flex items-center justify-center">
              <Share2 className="w-4 h-4 text-[#7A6453]" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-[#3D3A35]">
                Export & Share Shopping Manifest
              </h2>
              <p className="text-xs text-[#7D756D]">
                Send to helpers via SMS/WhatsApp, print physical paper checklist, or export JSON
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

        {/* Tab Controls */}
        <div className="flex bg-[#FAF9F6] border-b border-[#E6DFD5] px-6 gap-2 text-xs">
          <button
            onClick={() => setTab('text')}
            className={`py-3 px-3 font-semibold border-b-2 transition-all ${
              tab === 'text' ? 'text-[#5E7356] border-[#5E7356]' : 'text-[#7D756D] border-transparent hover:text-[#3D3A35]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> SMS & Chat Format
            </span>
          </button>
          <button
            onClick={() => setTab('json')}
            className={`py-3 px-3 font-semibold border-b-2 transition-all ${
              tab === 'json' ? 'text-[#5E7356] border-[#5E7356]' : 'text-[#7D756D] border-transparent hover:text-[#3D3A35]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> Raw JSON Backup
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {tab === 'text' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#7D756D]">
                <span>Formatted text ready to copy or message:</span>
                <span className="text-[11px] text-[#8C857D]">{plan.items.length} items total</span>
              </div>
              <textarea
                readOnly
                value={generateTextManifest()}
                rows={12}
                className="w-full p-4 bg-[#F8F6F0] border border-[#E6DFD5] rounded-2xl text-xs font-mono text-[#3D3A35] leading-relaxed focus:outline-none"
              />
            </div>
          )}

          {tab === 'json' && (
            <div className="space-y-3">
              <div className="text-xs text-[#7D756D]">
                Complete data object including catering formulas, timeline run-of-show, and store routes.
              </div>
              <pre className="p-4 bg-[#F8F6F0] border border-[#E6DFD5] rounded-2xl text-[11px] font-mono text-[#3D3A35] overflow-x-auto max-h-72">
                {JSON.stringify(plan, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#FAF9F6] border-t border-[#E6DFD5] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#F5F2EB] text-[#3D3A35] text-xs font-medium border border-[#E6DFD5] transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#7D756D]" />
              <span>Print Checklist</span>
            </button>

            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#F5F2EB] text-[#3D3A35] text-xs font-medium border border-[#E6DFD5] transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-[#7D756D]" />
              <span>Download JSON</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5E7356] hover:bg-[#4F6448] text-white text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy to Clipboard</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
