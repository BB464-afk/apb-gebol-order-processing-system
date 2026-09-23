import React from 'react';
import { Package, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { LineItem } from '../types/po';
import { useTheme } from '../context/ThemeContext';

interface LineItemsTableProps {
  items: LineItem[];
  onChangeItems: (items: LineItem[]) => void;
}

const COMMON_GEBOL_ARTICLES = [
  { gebolNo: 'GEB-50129-L', name: 'GEBOL Master Flex Work Glove Size 10/L', contractPrice: 2.85 },
  { gebolNo: 'GEB-50129-XL', name: 'GEBOL Master Flex Work Glove Size 11/XL', contractPrice: 2.85 },
  { gebolNo: 'GEB-70882-M', name: 'GEBOL Cut Protect Level D Glove Size 9/M', contractPrice: 7.20 },
  { gebolNo: 'GEB-10200-M', name: 'GEBOL Fine Grip Precision Assembly Glove Size 9/M', contractPrice: 1.95 },
  { gebolNo: 'GEB-80010-U', name: 'GEBOL Multi-Usage Heavy Leather Work Glove Universal', contractPrice: 4.50 },
  { gebolNo: 'GEB-40012-M', name: 'GEBOL Lady Rose Floral Garden Glove Pink Size 7/M', contractPrice: 2.10 },
  { gebolNo: 'GEB-90110-L', name: 'GEBOL Impact Pro Heavy Duty Mechanic Gloves Size 10/L', contractPrice: 12.50 },
  { gebolNo: 'GEB-20050-10', name: 'GEBOL Thermo Winter Grip Glove Cold Protection Size 10', contractPrice: 3.40 },
];

export const LineItemsTable: React.FC<LineItemsTableProps> = ({
  items,
  onChangeItems,
}) => {
  const { isThemeB } = useTheme();
  const handleItemChange = (id: string, updatedFields: Partial<LineItem>) => {
    const newItems = items.map((item) => {
      if (item.id === id) {
        const merged = { ...item, ...updatedFields };
        // Recalculate line total automatically
        merged.lineTotal = merged.quantity * merged.unitPrice;
        // Re-evaluate price variance
        if (merged.contractPrice > 0) {
          merged.priceVariance = Math.abs(merged.unitPrice - merged.contractPrice) > 0.01;
        }
        // Re-evaluate SKU matched
        merged.skuMatched = merged.gebolArticleNo !== 'UNMAPPED-SKU' && merged.gebolArticleNo.trim() !== '';
        return merged;
      }
      return item;
    });
    onChangeItems(newItems);
  };

  const handleAddItem = () => {
    const nextPos = (items.length + 1) * 10;
    const newItem: LineItem = {
      id: `li-user-${Date.now()}`,
      itemPos: nextPos,
      customerArticleNo: 'CUST-SKU-NEW',
      gebolArticleNo: 'GEB-50129-L',
      description: 'GEBOL Master Flex Work Glove Size 10/L',
      quantity: 500,
      unit: 'PAIR',
      unitPrice: 2.85,
      contractPrice: 2.85,
      taxRatePercentage: 20,
      lineTotal: 1425.0,
      skuMatched: true,
      priceVariance: false,
    };
    onChangeItems([...items, newItem]);
  };

  const handleDeleteItem = (id: string) => {
    onChangeItems(items.filter((item) => item.id !== id));
  };

  const handleQuickResolveSku = (id: string, selectedGebolNo: string) => {
    const catalogItem = COMMON_GEBOL_ARTICLES.find((a) => a.gebolNo === selectedGebolNo);
    if (catalogItem) {
      handleItemChange(id, {
        gebolArticleNo: catalogItem.gebolNo,
        description: catalogItem.name,
        contractPrice: catalogItem.contractPrice,
        skuMatched: true,
      });
    }
  };

  return (
    <div className="bg-white rounded-none border border-[#E0E0E0] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-[#1A1A1A] text-white px-4 py-3 flex flex-wrap items-center justify-between border-b border-[#333333] gap-2">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-[#F8B800]" />
          <h3 className="font-bold text-xs uppercase tracking-wider">
            4. Line Items Business Object ({items.length} Positions)
          </h3>
        </div>

        <button
          onClick={handleAddItem}
          className="bg-[#F8B800] text-[#1A1A1A] hover:bg-[#e0a400] font-bold px-3 py-1 rounded text-xs flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Line Position</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr
              className={`${
                isThemeB
                  ? 'bg-[#161922] text-white border-[#262A36] text-xs'
                  : 'bg-[#F5F5F5] text-[#1A1A1A] border-[#E0E0E0] text-xs'
              } font-bold border-b`}
            >
              <th className={`${isThemeB ? 'py-1.5 px-2.5' : 'py-2 px-3'} font-bold`}>Pos.</th>
              <th className={`${isThemeB ? 'py-1.5 px-2.5' : 'py-2 px-3'} font-bold`}>Customer SKU / Article</th>
              <th className={`${isThemeB ? 'py-1.5 px-2.5' : 'py-2 px-3'} font-bold`}>GEBOL Internal Material ID</th>
              <th className={`${isThemeB ? 'py-1.5 px-2.5' : 'py-2 px-3'} font-bold`}>Article Description</th>
              <th className={`${isThemeB ? 'py-1.5 px-2.5' : 'py-2 px-3'} text-center font-bold`}>Qty & Unit</th>
              <th className={`${isThemeB ? 'py-1.5 px-2.5' : 'py-2 px-3'} text-center font-bold`}>Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E0E0E0] text-[#1A1A1A] text-xs">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-gray-500 italic">
                  No line positions registered. Click "Add Line Position" to insert.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const isUnmapped = !item.skuMatched || item.gebolArticleNo === 'UNMAPPED-SKU';

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      isUnmapped ? 'bg-red-50/60' : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Position */}
                    <td className={`${isThemeB ? 'py-1 px-2.5' : 'py-2.5 px-3'} font-mono font-bold text-gray-700`}>
                      {item.itemPos}
                    </td>

                    {/* Customer SKU */}
                    <td className={`${isThemeB ? 'py-1 px-2.5' : 'py-2.5 px-3'}`}>
                      <input
                        type="text"
                        value={item.customerArticleNo}
                        onChange={(e) => handleItemChange(item.id, { customerArticleNo: e.target.value })}
                        className="w-32 p-1 border border-[#E0E0E0] rounded font-mono font-bold text-xs bg-white focus:outline-none focus:border-[#F8B800]"
                      />
                    </td>

                    {/* GEBOL Article No + SKU Resolver */}
                    <td className={`${isThemeB ? 'py-1 px-2.5' : 'py-2.5 px-3'}`}>
                      <div className="space-y-1">
                        {isUnmapped ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-[#D32F2F] bg-red-100 border border-red-300 px-1.5 py-0.5 rounded font-mono shrink-0">
                              UNMAPPED
                            </span>
                            <select
                              onChange={(e) => handleQuickResolveSku(item.id, e.target.value)}
                              className="p-1 border border-[#D32F2F] rounded text-xs bg-white text-[#D32F2F] font-semibold focus:outline-none cursor-pointer"
                              defaultValue=""
                            >
                              <option value="" disabled>
                                ⚡ Resolve GEBOL SKU...
                              </option>
                              {COMMON_GEBOL_ARTICLES.map((art) => (
                                <option key={art.gebolNo} value={art.gebolNo}>
                                  {art.gebolNo} — {art.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={item.gebolArticleNo}
                              onChange={(e) => handleItemChange(item.id, { gebolArticleNo: e.target.value })}
                              className="w-32 p-1 border border-[#E0E0E0] rounded font-mono font-bold text-xs bg-white focus:outline-none focus:border-[#F8B800]"
                            />
                            {!isThemeB && <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Description */}
                    <td className={`${isThemeB ? 'py-1 px-2.5' : 'py-2.5 px-3'}`}>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, { description: e.target.value })}
                        className="w-full min-w-[200px] p-1 border border-[#E0E0E0] rounded text-xs bg-white focus:outline-none focus:border-[#F8B800]"
                      />
                    </td>

                    {/* Quantity & Unit */}
                    <td className={`${isThemeB ? 'py-1 px-2.5' : 'py-2.5 px-3'} text-center`}>
                      <div className="inline-flex items-center gap-1">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, { quantity: Number(e.target.value) || 0 })}
                          className="w-16 p-1 border border-[#E0E0E0] rounded font-mono font-semibold text-center text-xs bg-white focus:outline-none focus:border-[#F8B800]"
                        />
                        <select
                          value={item.unit}
                          onChange={(e) => handleItemChange(item.id, { unit: e.target.value as any })}
                          className="p-1 border border-[#E0E0E0] rounded font-mono text-[11px] bg-white focus:outline-none"
                        >
                          <option value="PAIR">PAIR</option>
                          <option value="PCC">PCC</option>
                          <option value="BOX">BOX</option>
                          <option value="CTN">CTN</option>
                          <option value="PAL">PAL</option>
                        </select>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className={`${isThemeB ? 'py-1 px-2.5' : 'py-2.5 px-3'} text-center`}>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        title="Remove position"
                        className={`p-1 text-gray-400 hover:text-[#D32F2F] rounded hover:bg-red-50 cursor-pointer transition-colors ${
                          isThemeB ? 'text-xs font-semibold px-2 py-0.5' : ''
                        }`}
                      >
                        {isThemeB ? <span className="text-[11px] font-semibold text-red-600 hover:underline">Del</span> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Line Count Info */}
      <div className="p-3 bg-[#F5F5F5] border-t border-[#E0E0E0] flex justify-between items-center text-xs text-gray-600">
        <span>Total Article Line Positions: <strong className="text-[#1A1A1A]">{items.length}</strong></span>
        <span className="font-mono text-[11px] text-gray-500">Master Catalog Matched</span>
      </div>
    </div>
  );
};
