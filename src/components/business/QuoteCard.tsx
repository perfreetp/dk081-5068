import { Clock, ShieldCheck, Truck, MapPin, Star, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { useAppStore } from '@/store/appStore';
import { formatPrice, formatMileage, formatWarranty, formatDeliveryDays } from '@/utils/format';
import { PartConditionLabels, type Quote } from '@/types';

interface QuoteCardProps {
  quote: Quote;
  showActions?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  onNegotiate?: () => void;
  onChat?: () => void;
  onOrder?: () => void;
}

export function QuoteCard({ quote, showActions = true, selected, onSelect, onNegotiate, onChat, onOrder }: QuoteCardProps) {
  const { selectedQuotes, toggleQuoteSelection, openNegotiationModal } = useAppStore();
  const isSelected = selected !== undefined ? selected : selectedQuotes.includes(quote.id);

  const conditionColors = {
    new: 'success',
    used: 'info',
    remanufactured: 'warning',
  } as const;

  const handleSelect = () => {
    if (onSelect) {
      onSelect();
    } else {
      toggleQuoteSelection(quote.id);
    }
  };

  return (
    <div className={`bg-white border-2 transition-all ${
      isSelected ? 'border-primary-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <img
              src={quote.part.images[0]}
              alt={quote.part.name}
              className="w-28 h-28 object-cover border border-gray-200"
            />
            {isSelected && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary-500 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{quote.part.name}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {quote.part.oemNumber && (
                    <span className="font-mono">OEM: {quote.part.oemNumber}</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-accent-600">
                  {formatPrice(quote.price)}
                </div>
                {quote.originalPrice && (
                  <div className="text-sm text-gray-400 line-through">
                    {formatPrice(quote.originalPrice)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <Badge variant={conditionColors[quote.part.condition]}>
                {PartConditionLabels[quote.part.condition]}
              </Badge>
              <Badge variant="info">
                {formatMileage(quote.part.mileage)}
              </Badge>
              <Badge variant="success" icon={<ShieldCheck className="w-3 h-3 mr-1" />}>
                {formatWarranty(quote.part.warrantyMonths)}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm mb-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Truck className="w-4 h-4 text-gray-400" />
                <span>{formatDeliveryDays(quote.deliveryDays)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{quote.part.location}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{quote.shippingMethod}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-lg">
                  {quote.supplier.avatar}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{quote.supplier.companyName}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      {quote.supplier.fulfillmentRate}%
                    </span>
                    <span>响应 {quote.supplier.responseTime}分钟</span>
                    {quote.supplier.certified && (
                      <Badge variant="success" size="sm">认证</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {quote.notes && (
          <div className="mt-3 p-3 bg-gray-50 text-sm text-gray-600">
            <span className="text-gray-500">商家备注：</span>{quote.notes}
          </div>
        )}

        {quote.part.donorVehicle && (
          <div className="mt-3 p-3 bg-primary-50/50 text-sm">
            <div className="text-gray-500 mb-1">拆解车辆信息：</div>
            <div className="flex items-center gap-4 text-gray-700">
              <span>{quote.part.donorVehicle.brand} {quote.part.donorVehicle.year}款</span>
              <span>VIN: <span className="font-mono">{quote.part.donorVehicle.vin.slice(0, 8)}****</span></span>
              <span>里程 {formatMileage(quote.part.donorVehicle.mileage)}</span>
              <span className={quote.part.donorVehicle.accidentHistory === '无事故' ? 'text-green-600' : 'text-yellow-600'}>
                {quote.part.donorVehicle.accidentHistory}
              </span>
            </div>
          </div>
        )}
      </div>

      {showActions && (
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-t border-gray-200">
          <Button
            variant={isSelected ? 'primary' : 'secondary'}
            size="sm"
            onClick={handleSelect}
            className="flex-1"
          >
            {isSelected ? '已加入对比' : '加入对比'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<MessageSquare className="w-4 h-4" />}
            onClick={() => {
              openNegotiationModal(quote.id);
              onNegotiate?.();
            }}
          >
            议价
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={onOrder}
          >
            立即下单
          </Button>
        </div>
      )}

      {quote.status === 'negotiating' && quote.negotiationHistory && quote.negotiationHistory.length > 0 && (
        <div className="px-4 py-3 bg-yellow-50 border-t border-yellow-100">
          <div className="text-sm font-medium text-yellow-800 mb-2">议价中</div>
          <div className="space-y-1">
            {quote.negotiationHistory.slice(-2).map(record => (
              <div key={record.id} className="flex items-center gap-2 text-sm">
                <span className={record.initiator === 'buyer' ? 'text-primary-600' : 'text-accent-600'}>
                  {record.initiator === 'buyer' ? '我' : '商家'}：
                </span>
                <span className="font-medium">{formatPrice(record.price)}</span>
                <span className="text-gray-500">- {record.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
