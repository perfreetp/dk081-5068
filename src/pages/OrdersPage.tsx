import { useState } from 'react';
import { Search, Package, Clock, Truck, CheckCircle, AlertTriangle, MessageSquare, FileText, Truck as TruckIcon } from 'lucide-react';
import { PageContainer } from '@/components/Layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/Tabs';
import { Modal } from '@/components/common/Modal';
import { Badge } from '@/components/common/Badge';
import { OrderCard } from '@/components/business/OrderCard';
import { ChatPanel } from '@/components/business/ChatPanel';
import { Timeline } from '@/components/business/Timeline';
import { InspectionList } from '@/components/business/InspectionList';
import { SupplierRating } from '@/components/business/SupplierRating';
import { useAppStore, getOrderById } from '@/store/appStore';
import { mockOrders, mockLogisticsInfo } from '@/data/mockOrders';
import { inspectionTemplates } from '@/data/mockAfterSales';
import { OrderStatusLabels, type Order, type OrderStatus, type InspectionItem } from '@/types';
import { formatPrice, formatDateTime } from '@/utils/format';

export default function OrdersPage() {
  const { orders, setSelectedOrderId, selectedOrderId } = useAppStore();
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState('info');

  const filteredOrders = orders.filter(order => {
    const matchesStatus = activeTab === 'all' || order.status === activeTab;
    if (!searchKeyword) return matchesStatus;
    const keyword = searchKeyword.toLowerCase();
    return matchesStatus && (
      order.id.toLowerCase().includes(keyword) ||
      order.quote.part.name.toLowerCase().includes(keyword) ||
      order.quote.supplier.companyName.toLowerCase().includes(keyword)
    );
  });

  const selectedOrder = selectedOrderId ? getOrderById(selectedOrderId) : null;

  const getInspectionItems = (order: Order): InspectionItem[] => {
    const category = order.quote.part.category;
    const template = inspectionTemplates[category as keyof typeof inspectionTemplates] || inspectionTemplates.default;
    return template.map((item, idx) => ({
      id: `inspect_${order.id}_${idx}`,
      name: item.name,
      category: item.category,
      passed: null,
      note: '',
      images: [],
    }));
  };

  const handleOrderClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowDetailModal(true);
  };

  const handleChat = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowChatModal(true);
  };

  const handleInspection = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowInspectionModal(true);
  };

  const handleRating = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowRatingModal(true);
  };

  const tabItems = [
    { value: 'all', label: '全部订单', icon: FileText, count: orders.length },
    { value: 'pending_payment', label: '待付款', icon: Clock, count: orders.filter(o => o.status === 'pending_payment').length },
    { value: 'pending_shipment', label: '待发货', icon: Package, count: orders.filter(o => o.status === 'pending_shipment').length },
    { value: 'shipped', label: '运输中', icon: Truck, count: orders.filter(o => o.status === 'shipped').length },
    { value: 'delivered', label: '待核验', icon: CheckCircle, count: orders.filter(o => o.status === 'delivered').length },
    { value: 'completed', label: '已完成', icon: CheckCircle, count: orders.filter(o => o.status === 'completed').length },
    { value: 'after_sale', label: '售后中', icon: AlertTriangle, count: orders.filter(o => o.status === 'after_sale').length },
  ] as const;

  return (
    <PageContainer
      title="订单管理"
      subtitle="查看和管理您的采购订单"
    >
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Input
              placeholder="搜索订单号、配件名称、供应商..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              icon={Search}
              wrapperClassName="flex-1 min-w-[300px]"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as OrderStatus | 'all')}>
        <TabsList>
          {tabItems.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.value} value={tab.value} badge={tab.count}>
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={() => handleOrderClick(order.id)}
                onChat={() => handleChat(order.id)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无相关订单</h3>
            <p className="text-gray-500">请尝试切换订单状态或修改搜索条件</p>
          </CardContent>
        </Card>
      )}

      <Modal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="订单详情"
        size="xl"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">订单号：</span>
                  <span className="font-mono font-medium">{selectedOrder.id}</span>
                  <Badge variant={selectedOrder.status === 'after_sale' ? 'danger' : 'info'}>
                    {OrderStatusLabels[selectedOrder.status]}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  下单时间：{formatDateTime(selectedOrder.createdAt)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">实付金额</div>
                <div className="text-2xl font-bold text-accent-600">{formatPrice(selectedOrder.finalPrice)}</div>
              </div>
            </div>

            <Tabs value={activeDetailTab} onValueChange={setActiveDetailTab}>
              <TabsList>
                <TabsTrigger value="info">订单信息</TabsTrigger>
                <TabsTrigger value="logistics">物流信息</TabsTrigger>
                <TabsTrigger value="chat">聊天记录</TabsTrigger>
                <TabsTrigger value="adjustment">价格调整</TabsTrigger>
              </TabsList>

              <TabsContent value="info">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-start gap-6">
                      <img
                        src={selectedOrder.quote.part.images[0]}
                        alt=""
                        className="w-32 h-32 object-cover border border-gray-200"
                      />
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {selectedOrder.quote.part.name}
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="text-gray-500">
                            OEM号：<span className="text-gray-700 font-mono">{selectedOrder.quote.part.oemNumber}</span>
                          </div>
                          <div className="text-gray-500">
                            供应商：<span className="text-gray-700">{selectedOrder.quote.supplier.companyName}</span>
                          </div>
                          <div className="text-gray-500">
                            成色：<span className="text-gray-700">{selectedOrder.quote.part.condition === 'used' ? '拆车件' : selectedOrder.quote.part.condition === 'new' ? '全新件' : '再制造件'}</span>
                          </div>
                          <div className="text-gray-500">
                            里程：<span className="text-gray-700">{selectedOrder.quote.part.mileage.toLocaleString()} km</span>
                          </div>
                          <div className="text-gray-500">
                            质保：<span className="text-gray-700">{selectedOrder.quote.warrantyMonths} 个月</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h5 className="font-medium text-gray-900 mb-4">价格明细</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">商品金额</span>
                          <span className="text-gray-900">{formatPrice(selectedOrder.quote.price)}</span>
                        </div>
                        {selectedOrder.priceAdjustments.map((adj) => (
                          <div key={adj.id} className="flex justify-between text-sm">
                            <span className="text-gray-500">
                              {adj.reason} ({adj.type === 'supplement' ? '补差' : '优惠'})
                            </span>
                            <span className={adj.type === 'supplement' ? 'text-red-600' : 'text-green-600'}>
                              {adj.type === 'supplement' ? '+' : '-'}{formatPrice(adj.amount)}
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between pt-3 border-t border-gray-200 font-semibold">
                          <span>实付金额</span>
                          <span className="text-accent-600 text-lg">{formatPrice(selectedOrder.finalPrice)}</span>
                        </div>
                      </div>
                    </div>

                    {selectedOrder.notes && (
                      <div className="border-t border-gray-200 pt-6">
                        <h5 className="font-medium text-gray-900 mb-2">订单备注</h5>
                        <p className="text-sm text-gray-600">{selectedOrder.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="logistics">
                <Card>
                  <CardContent className="p-6">
                    {selectedOrder.trackingNumber ? (
                      <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-primary-50 border border-primary-200">
                          <TruckIcon className="w-8 h-8 text-primary-600" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {selectedOrder.trackingCompany}
                            </div>
                            <div className="text-sm text-gray-600 font-mono">
                              {selectedOrder.trackingNumber}
                            </div>
                          </div>
                        </div>
                        <Timeline
                          items={mockLogisticsInfo.nodes.map(node => ({
                            id: node.id,
                            title: node.status,
                            description: `${node.location} - ${node.description}`,
                            time: node.time,
                            status: 'completed' as const,
                          }))}
                        />
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>卖家尚未发货，暂无物流信息</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="chat">
                <ChatPanel
                  supplier={selectedOrder.quote.supplier}
                  orderId={selectedOrder.id}
                  messages={selectedOrder.chatMessages}
                />
              </TabsContent>

              <TabsContent value="adjustment">
                <Card>
                  <CardContent className="p-6">
                    {selectedOrder.priceAdjustments.length > 0 ? (
                      <div className="space-y-4">
                        {selectedOrder.priceAdjustments.map((adj) => (
                          <div key={adj.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200">
                            <div>
                              <div className="font-medium text-gray-900">{adj.reason}</div>
                              <div className="text-sm text-gray-500">
                                {adj.type === 'supplement' ? '补差价' : '优惠减免'} · {formatDateTime(adj.createdAt)}
                              </div>
                            </div>
                            <div className={`text-xl font-bold ${adj.type === 'supplement' ? 'text-red-600' : 'text-green-600'}`}>
                              {adj.type === 'supplement' ? '+' : '-'}{formatPrice(adj.amount)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>暂无价格调整记录</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                关闭
              </Button>
              {selectedOrder.status === 'pending_payment' && (
                <Button variant="accent">立即付款</Button>
              )}
              {selectedOrder.status === 'delivered' && (
                <>
                  <Button variant="outline" onClick={() => { setShowDetailModal(false); handleInspection(selectedOrder.id); }}>
                    收货核验
                  </Button>
                  <Button variant="accent" onClick={() => { setShowDetailModal(false); handleInspection(selectedOrder.id); }}>
                    发起售后
                  </Button>
                </>
              )}
              {selectedOrder.status === 'completed' && (
                <Button variant="primary" onClick={() => { setShowDetailModal(false); handleRating(selectedOrder.id); }}>
                  评价供应商
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={showChatModal}
        onClose={() => setShowChatModal(false)}
        title="订单聊天"
        size="lg"
      >
        {selectedOrder && (
          <ChatPanel
            supplier={selectedOrder.quote.supplier}
            orderId={selectedOrder.id}
            messages={selectedOrder.chatMessages}
          />
        )}
      </Modal>

      <Modal
        open={showInspectionModal}
        onClose={() => setShowInspectionModal(false)}
        title="收货核验"
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200">
              <img
                src={selectedOrder.quote.part.images[0]}
                alt=""
                className="w-20 h-20 object-cover border border-gray-200"
              />
              <div>
                <h4 className="font-semibold text-gray-900">{selectedOrder.quote.part.name}</h4>
                <p className="text-sm text-gray-500">OEM: {selectedOrder.quote.part.oemNumber}</p>
                <p className="text-sm text-gray-500">供应商: {selectedOrder.quote.supplier.companyName}</p>
              </div>
            </div>
            <InspectionList
              items={getInspectionItems(selectedOrder)}
              onChange={() => {}}
            />
          </div>
        )}
      </Modal>

      <Modal
        open={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        title="评价供应商"
        size="lg"
      >
        {selectedOrder && (
          <SupplierRating
            showSubmit={true}
            onSubmit={(review) => {
              alert(`评价已提交！\n响应: ${review.responseScore}分\n质量: ${review.qualityScore}分\n发货: ${review.deliveryScore}分\n评价: ${review.comment}`);
              setShowRatingModal(false);
            }}
          />
        )}
      </Modal>
    </PageContainer>
  );
}
