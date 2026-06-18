import { X, ChevronDown, ChevronUp, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { useAppStore, getQuoteById } from '@/store/appStore';
import { formatPrice, formatMileage, formatWarranty, formatDeliveryDays } from '@/utils/format';
import { PartConditionLabels } from '@/types';
import type { Quote } from '@/types';

interface ComparePanelProps {
  quoteIds?: string[];
  onClose?: () => void;
  onRemove?: (quoteId: string) => void;
  onOrder?: (quoteId: string) => void;
  onBatchOrder?: (quoteIds: string[]) => void;
}

export function ComparePanel({ quoteIds, onClose, onRemove, onOrder, onBatchOrder }: ComparePanelProps) {
  const { selectedQuotes, clearQuoteSelection, toggleQuoteSelection, createOrdersFromQuotes } = useAppStore();
  const finalQuoteIds = quoteIds ?? selectedQuotes;
  const selectedQuoteObjects = finalQuoteIds.map(id => getQuoteById(id)).filter(Boolean) as Quote[];

  if (finalQuoteIds.length === 0) return null;

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      clearQuoteSelection();
    }
  };

  const handleRemove = (quoteId: string) => {
    if (onRemove) {
      onRemove(quoteId);
    } else {
      toggleQuoteSelection(quoteId);
    }
  };

  const handleOrder = (quoteId: string) => {
    if (onOrder) {
      onOrder(quoteId);
    }
  };

  const handleBatchOrder = () => {
    if (onBatchOrder) {
      onBatchOrder(finalQuoteIds);
    }
  };

  const compareFields = [
    { key: 'supplier', label: '供应商' },
    { key: 'price', label: '价格' },
    { key: 'condition', label: '成色' },
    { key: 'mileage', label: '里程' },
    { key: 'warranty', label: '质保' },
    { key: 'delivery', label: '到货时效' },
    { key: 'shipping', label: '物流方式' },
    { key: 'location', label: '发货地' },
    { key: 'fulfillment', label: '履约率' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30 animate-slide-up">
      <div className="px-6 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h4 className="font-semibold text-gray-900">
            已选择 {finalQuoteIds.length} 个报价进行对比
          </h4>
          <button
            onClick={handleClose}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            清空选择
          </button>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm">
            <ChevronDown className="w-4 h-4 mr-1" />
            收起对比
          </Button>
          <Button variant="accent" size="sm" icon={<ShoppingCart className="w-4 h-4" />} onClick={handleBatchOrder}>
            批量下单 ({finalQuoteIds.length})
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-max">
          <thead>
            <tr className="bg-white">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 bg-gray-50 border-r border-gray-100 sticky left-0 z-10 w-32">
                对比项
              </th>
              {selectedQuoteObjects.map(quote => (
                quote && (
                  <th key={quote.id} className="px-4 py-3 text-center min-w-[180px] border-r border-gray-100">
                    <div className="relative">
                      <button
                        onClick={() => handleRemove(quote.id)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-gray-200 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <img
                        src={quote.part.images[0]}
                        alt={quote.part.name}
                        className="w-16 h-16 object-cover mx-auto mb-2 border border-gray-200"
                      />
                      <div className="text-sm font-medium text-gray-900">{quote.part.name}</div>
                      <div className="text-xs text-gray-500 font-mono">{quote.part.oemNumber}</div>
                    </div>
                  </th>
                )
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {compareFields.map(field => (
              <tr key={field.key} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-500 bg-gray-50 border-r border-gray-100 sticky left-0 z-10">
                  {field.label}
                </td>
                {selectedQuoteObjects.map(quote => {
                  if (!quote) return null;
                  let value: React.ReactNode = '-';
                  let highlight = false;

                  switch (field.key) {
                    case 'supplier':
                      value = (
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-900">{quote.supplier.companyName}</div>
                          {quote.supplier.certified && (
                            <Badge variant="success" size="sm" className="mt-1">认证</Badge>
                          )}
                        </div>
                      );
                      break;
                    case 'price':
                      const minPrice = Math.min(...selectedQuoteObjects.map(q => q?.price || Infinity));
                      highlight = quote.price === minPrice;
                      value = (
                        <span className={`text-lg font-bold ${highlight ? 'text-accent-600' : 'text-gray-900'}`}>
                          {formatPrice(quote.price)}
                          {highlight && <span className="ml-1 text-xs text-accent-500">最低</span>}
                        </span>
                      );
                      break;
                    case 'condition':
                      value = PartConditionLabels[quote.part.condition];
                      break;
                    case 'mileage':
                      value = formatMileage(quote.part.mileage);
                      break;
                    case 'warranty':
                      const maxWarranty = Math.max(...selectedQuoteObjects.map(q => q?.warrantyMonths || 0));
                      highlight = quote.warrantyMonths === maxWarranty;
                      value = (
                        <span className={highlight ? 'text-green-600 font-medium' : ''}>
                          {formatWarranty(quote.warrantyMonths)}
                          {highlight && <span className="ml-1 text-xs">最长</span>}
                        </span>
                      );
                      break;
                    case 'delivery':
                      const minDays = Math.min(...selectedQuoteObjects.map(q => q?.deliveryDays || Infinity));
                      highlight = quote.deliveryDays === minDays;
                      value = (
                        <span className={highlight ? 'text-primary-600 font-medium' : ''}>
                          {formatDeliveryDays(quote.deliveryDays)}
                          {highlight && <span className="ml-1 text-xs">最快</span>}
                        </span>
                      );
                      break;
                    case 'shipping':
                      value = quote.shippingMethod;
                      break;
                    case 'location':
                      value = quote.part.location;
                      break;
                    case 'fulfillment':
                      const maxRate = Math.max(...selectedQuoteObjects.map(q => q?.supplier.fulfillmentRate || 0));
                      highlight = quote.supplier.fulfillmentRate === maxRate;
                      value = (
                        <span className={highlight ? 'text-green-600 font-medium' : ''}>
                          {quote.supplier.fulfillmentRate}%
                        </span>
                      );
                      break;
                  }

                  return (
                    <td key={quote.id} className="px-4 py-2 text-center text-sm text-gray-700 border-r border-gray-100">
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <td className="px-4 py-3 bg-gray-50 border-r border-gray-100 sticky left-0 z-10"></td>
              {selectedQuoteObjects.map(quote => (
                quote && (
                  <td key={quote.id} className="px-4 py-3 text-center border-r border-gray-100">
                    <Button variant="accent" size="sm" className="w-full" onClick={() => handleOrder(quote.id)}>
                      立即下单
                    </Button>
                  </td>
                )
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
