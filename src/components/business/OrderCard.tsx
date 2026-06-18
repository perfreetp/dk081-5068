import { Package, Truck, CheckCircle, Clock, AlertTriangle, MessageSquare, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { formatPrice, formatDateTime } from '@/utils/format';
import { OrderStatusLabels, type Order } from '@/types';

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
  onChat?: () => void;
  onPay?: () => void;
  onShip?: () => void;
  onDeliver?: () => void;
  onComplete?: () => void;
  onInspection?: () => void;
  onAfterSale?: () => void;
}

const statusConfig: Record<string, { icon: typeof Package; color: string; bgColor: string }> = {
  pending_payment: { icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  pending_shipment: { icon: Package, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  shipped: { icon: Truck, color: 'text-primary-600', bgColor: 'bg-primary-50' },
  delivered: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
  completed: { icon: CheckCircle, color: 'text-gray-600', bgColor: 'bg-gray-50' },
  after_sale: { icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50' },
};

export function OrderCard({ order, onClick, onChat, onPay, onShip, onDeliver, onComplete, onInspection, onAfterSale }: OrderCardProps) {
  const config = statusConfig[order.status] || statusConfig.pending_payment;
  const StatusIcon = config.icon;

  const progressSteps = [
    { status: 'pending_payment', label: '待付款' },
    { status: 'pending_shipment', label: '待发货' },
    { status: 'shipped', label: '运输中' },
    { status: 'delivered', label: '待核验' },
    { status: 'completed', label: '已完成' },
  ];

  const currentStepIndex = progressSteps.findIndex(s => s.status === order.status);

  return (
    <div className="bg-white border border-gray-200 hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">订单号：</span>
            <span className="text-sm font-mono text-gray-900">{order.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">下单时间：</span>
            <span className="text-sm text-gray-700">{formatDateTime(order.createdAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={order.status === 'after_sale' ? 'danger' : order.status === 'completed' ? 'default' : 'info'}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {OrderStatusLabels[order.status]}
          </Badge>
          <Button variant="ghost" size="sm" icon={<MessageSquare className="w-4 h-4" />} onClick={(e) => { e.stopPropagation(); onChat?.(); }}>
            聊天
          </Button>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start gap-6">
          <img
            src={order.quote.part.images[0]}
            alt={order.quote.part.name}
            className="w-24 h-24 object-cover border border-gray-200 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 mb-2">{order.quote.part.name}</h4>
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
              {order.quote.part.oemNumber && (
                <span className="font-mono">OEM: {order.quote.part.oemNumber}</span>
              )}
              <span>供应商：{order.quote.supplier.companyName}</span>
            </div>

            <div className="flex items-center gap-6 mb-4">
              <div>
                <span className="text-sm text-gray-500">商品金额</span>
                <div className="text-lg font-bold text-gray-900">{formatPrice(order.quote.price)}</div>
              </div>
              {order.priceAdjustments.length > 0 && (
                <div>
                  <span className="text-sm text-gray-500">价格调整</span>
                  <div className={`text-lg font-bold ${
                    order.priceAdjustments.some(a => a.type === 'supplement') ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {order.priceAdjustments.some(a => a.type === 'supplement') ? '+' : ''}
                    {formatPrice(order.priceAdjustments.reduce((sum, a) => sum + (a.type === 'supplement' ? a.amount : -a.amount), 0))}
                  </div>
                </div>
              )}
              <div>
                <span className="text-sm text-gray-500">实付金额</span>
                <div className="text-xl font-bold text-accent-600">{formatPrice(order.finalPrice)}</div>
              </div>
            </div>

            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-primary-600 transition-all duration-500"
                style={{ width: `${(currentStepIndex / (progressSteps.length - 1)) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              {progressSteps.map((step, index) => (
                <div key={step.status} className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    index <= currentStepIndex ? 'bg-primary-600' : 'bg-gray-300'
                  }`} />
                  <span className={`text-xs ${
                    index <= currentStepIndex ? 'text-gray-700' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 flex-shrink-0">
            {order.status === 'pending_payment' && (
              <Button variant="accent" size="sm" onClick={(e) => { e.stopPropagation(); onPay?.(); }}>
                立即付款
              </Button>
            )}
            {order.status === 'pending_shipment' && (
              <Button variant="accent" size="sm" onClick={(e) => { e.stopPropagation(); onShip?.(); }}>
                模拟发货
              </Button>
            )}
            {order.status === 'shipped' && (
              <Button variant="accent" size="sm" onClick={(e) => { e.stopPropagation(); onDeliver?.(); }}>
                确认收货
              </Button>
            )}
            {order.status === 'delivered' && (
              <>
                <Button variant="accent" size="sm" onClick={(e) => { e.stopPropagation(); onInspection?.(); }}>
                  收货核验
                </Button>
                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onAfterSale?.(); }}>
                  申请售后
                </Button>
              </>
            )}
            {order.status === 'completed' && (
              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onComplete?.(); }}>
                查看详情
              </Button>
            )}
            {order.trackingNumber && (
              <div className="text-sm text-gray-500">
                物流：{order.trackingCompany} {order.trackingNumber}
              </div>
            )}
            <button className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              查看详情 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {order.chatMessages.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center gap-4">
          <MessageSquare className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            最新消息：{order.chatMessages[order.chatMessages.length - 1].content}
          </span>
          <span className="text-xs text-gray-400">
            {formatDateTime(order.chatMessages[order.chatMessages.length - 1].createdAt)}
          </span>
        </div>
      )}
    </div>
  );
}
