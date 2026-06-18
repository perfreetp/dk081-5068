import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, Clock, Truck, CheckCircle, AlertTriangle, MessageSquare, FileText, Truck as TruckIcon, ClipboardCheck, CreditCard, Ship, ArrowRight, Download } from 'lucide-react';
import { PageContainer } from '@/components/Layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input, Textarea } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/Tabs';
import { Modal } from '@/components/common/Modal';
import { Badge } from '@/components/common/Badge';
import { OrderCard } from '@/components/business/OrderCard';
import { ChatPanel } from '@/components/business/ChatPanel';
import { Timeline } from '@/components/business/Timeline';
import { InspectionList } from '@/components/business/InspectionList';
import { SupplierRating } from '@/components/business/SupplierRating';
import { useAppStore, getOrderById, getInspectionByOrderId, getOrderEventsByOrderId } from '@/store/appStore';
import { mockLogisticsInfo } from '@/data/mockOrders';
import { inspectionTemplates } from '@/data/mockAfterSales';
import { OrderStatusLabels, type Order, type OrderStatus, type InspectionItem } from '@/types';
import { formatPrice, formatDateTime } from '@/utils/format';

export default function OrdersPage() {
  const navigate = useNavigate();
  const { orders, setSelectedOrderId, selectedOrderId, addChatMessage, saveInspection, createAfterSaleFromInspection, payOrder, shipOrder, deliverOrder, completeOrder, setPendingAfterSaleOrderId } = useAppStore();
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showShipModal, setShowShipModal] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState('info');
  const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>([]);
  const [trackingCompany, setTrackingCompany] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [payDateFrom, setPayDateFrom] = useState('');
  const [payDateTo, setPayDateTo] = useState('');

  const filteredOrders = orders.filter(order => {
    const matchesStatus = activeTab === 'all' || order.status === activeTab;
    const matchesSupplier = supplierFilter === 'all' || order.quote.supplier.id === supplierFilter;
    let matchesPayDate = true;
    if (order.paidAt) {
      if (payDateFrom && order.paidAt < new Date(payDateFrom)) matchesPayDate = false;
      if (payDateTo) {
        const toDate = new Date(payDateTo);
        toDate.setHours(23, 59, 59, 999);
        if (order.paidAt > toDate) matchesPayDate = false;
      }
    } else if (payDateFrom || payDateTo) {
      matchesPayDate = false;
    }
    const matchesKeyword = !searchKeyword ||
      order.id.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      order.quote.part.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      order.quote.supplier.companyName.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchesStatus && matchesSupplier && matchesPayDate && matchesKeyword;
  });

  const supplierOptions = [
    { value: 'all', label: '全部供应商' },
    ...Array.from(new Set(orders.map(o => o.quote.supplier.id))).map(sid => {
      const o = orders.find(o => o.quote.supplier.id === sid);
      return { value: sid, label: o!.quote.supplier.companyName };
    }),
  ];

  const handleExportCSV = () => {
    const headers = ['订单号', '配件名称', 'OEM号', '供应商', '订单状态', '实付金额', '下单时间', '付款时间', '发货时间', '物流公司', '运单号'];
    const rows = filteredOrders.map(o => [
      o.id,
      o.quote.part.name,
      o.quote.part.oemNumber || '',
      o.quote.supplier.companyName,
      OrderStatusLabels[o.status],
      o.finalPrice.toFixed(2),
      formatDateTime(o.createdAt),
      o.paidAt ? formatDateTime(o.paidAt) : '未付款',
      o.shippedAt ? formatDateTime(o.shippedAt) : '未发货',
      o.trackingCompany || '',
      o.trackingNumber || '',
    ]);
    const csvContent = '\uFEFF' + [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `订单对账_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

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
    const order = getOrderById(orderId);
    if (order) {
      setInspectionItems(getInspectionItems(order));
    }
    setShowInspectionModal(true);
  };

  const handleSaveInspection = (items: InspectionItem[]) => {
    if (selectedOrderId) {
      saveInspection(selectedOrderId, items);
    }
    setShowInspectionModal(false);
    setActiveDetailTab('inspection');
    setShowDetailModal(true);
  };

  const handleSubmitInspection = (items: InspectionItem[], hasFailures: boolean) => {
    if (!selectedOrderId) return;
    saveInspection(selectedOrderId, items);
    setShowInspectionModal(false);
    if (hasFailures) {
      createAfterSaleFromInspection(selectedOrderId, items);
      navigate('/after-sales');
    } else {
      setActiveDetailTab('inspection');
      setShowDetailModal(true);
    }
  };

  const handleRating = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowRatingModal(true);
  };

  const handlePay = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowPayModal(true);
  };

  const handleConfirmPay = () => {
    if (selectedOrderId) {
      payOrder(selectedOrderId);
      setShowPayModal(false);
    }
  };

  const handleShip = (orderId: string) => {
    setSelectedOrderId(orderId);
    setTrackingCompany('');
    setTrackingNumber('');
    setShowShipModal(true);
  };

  const handleConfirmShip = () => {
    if (selectedOrderId && trackingCompany && trackingNumber) {
      shipOrder(selectedOrderId, trackingCompany, trackingNumber);
      setShowShipModal(false);
    }
  };

  const handleDeliver = (orderId: string) => {
    deliverOrder(orderId);
  };

  const handleComplete = (orderId: string) => {
    completeOrder(orderId);
  };

  const handleAfterSale = (orderId: string) => {
    setPendingAfterSaleOrderId(orderId);
    navigate('/after-sales');
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
            <Select
              options={supplierOptions}
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="min-w-[160px]"
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 whitespace-nowrap">付款时间</span>
              <input
                type="date"
                value={payDateFrom}
                onChange={(e) => setPayDateFrom(e.target.value)}
                className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-gray-400">至</span>
              <input
                type="date"
                value={payDateTo}
                onChange={(e) => setPayDateTo(e.target.value)}
                className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <Button
              variant="outline"
              size="md"
              icon={<Download className="w-4 h-4" />}
              onClick={handleExportCSV}
              disabled={filteredOrders.length === 0}
            >
              导出CSV ({filteredOrders.length})
            </Button>
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
                onPay={() => handlePay(order.id)}
                onShip={() => handleShip(order.id)}
                onDeliver={() => handleDeliver(order.id)}
                onComplete={() => handleOrderClick(order.id)}
                onInspection={() => handleInspection(order.id)}
                onAfterSale={() => handleAfterSale(order.id)}
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
                <TabsTrigger value="events">事件流</TabsTrigger>
                <TabsTrigger value="chat">聊天记录</TabsTrigger>
                <TabsTrigger value="inspection">收货核验</TabsTrigger>
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
                            {selectedOrder.shippedAt && (
                              <div className="text-xs text-gray-500 mt-1">
                                发货时间：{formatDateTime(selectedOrder.shippedAt)}
                              </div>
                            )}
                            {selectedOrder.actualDeliveryDate && (
                              <div className="text-xs text-gray-500 mt-1">
                                签收时间：{formatDateTime(selectedOrder.actualDeliveryDate)}
                              </div>
                            )}
                          </div>
                          <div className="ml-auto">
                            <Badge variant={selectedOrder.actualDeliveryDate ? 'success' : 'info'}>
                              {selectedOrder.actualDeliveryDate ? '已签收' : '运输中'}
                            </Badge>
                          </div>
                        </div>
                        <Timeline
                          items={(() => {
                            const nodes = [];
                            if (selectedOrder.shippedAt) {
                              nodes.push({
                                id: 'ln1',
                                title: '商家已发货',
                                description: `${selectedOrder.quote.supplier.companyName} 已发货，物流公司：${selectedOrder.trackingCompany}`,
                                time: selectedOrder.shippedAt,
                                status: 'completed' as const,
                              });
                            }
                            if (selectedOrder.actualDeliveryDate) {
                              nodes.push({
                                id: 'ln2',
                                title: '已签收',
                                description: `商品已送达，运单号 ${selectedOrder.trackingNumber}`,
                                time: selectedOrder.actualDeliveryDate,
                                status: 'completed' as const,
                              });
                            }
                            if (nodes.length === 0) {
                              nodes.push({
                                id: 'ln0',
                                title: '等待发货',
                                description: '订单已支付，等待商家发货',
                                time: selectedOrder.paidAt || selectedOrder.createdAt,
                                status: 'completed' as const,
                              });
                            }
                            return nodes;
                          })()}
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

              <TabsContent value="events">
                <Card>
                  <CardContent className="p-6">
                    <Timeline
                      items={getOrderEventsByOrderId(selectedOrder.id).map(event => ({
                        id: event.id,
                        title: event.title,
                        description: `${event.description} · 操作人：${event.operator}`,
                        time: event.time,
                        status: 'completed' as const,
                      }))}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="chat">
                <ChatPanel
                  supplier={selectedOrder.quote.supplier}
                  orderId={selectedOrder.id}
                  messages={selectedOrder.chatMessages}
                  onSend={(content, isPromise) => addChatMessage(selectedOrder.id, content, isPromise)}
                />
              </TabsContent>

              <TabsContent value="inspection">
                <Card>
                  <CardContent className="p-6">
                    {(() => {
                      const savedInspection = getInspectionByOrderId(selectedOrder.id);
                      if (savedInspection && savedInspection.length > 0) {
                        const passCount = savedInspection.filter(i => i.passed === true).length;
                        const failCount = savedInspection.filter(i => i.passed === false).length;
                        const hasFailures = failCount > 0;
                        return (
                          <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200">
                              <ClipboardCheck className={`w-8 h-8 ${hasFailures ? 'text-red-500' : 'text-green-500'}`} />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">
                                  核验结果：{hasFailures ? '存在不合格项' : '全部通过'}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  通过 {passCount} 项 · 不通过 {failCount} 项 · 共 {savedInspection.length} 项
                                </div>
                              </div>
                              {hasFailures && (
                                <Button
                                  variant="accent"
                                  size="sm"
                                  onClick={() => {
                                    createAfterSaleFromInspection(selectedOrder.id, savedInspection);
                                    navigate('/after-sales');
                                  }}
                                >
                                  发起售后
                                </Button>
                              )}
                            </div>
                            <InspectionList items={savedInspection} readOnly />
                          </div>
                        );
                      }
                      return (
                        <div className="text-center py-12 text-gray-500">
                          <ClipboardCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p className="mb-4">暂无核验记录</p>
                          {selectedOrder.status === 'delivered' && (
                            <Button
                              variant="primary"
                              onClick={() => { setShowDetailModal(false); handleInspection(selectedOrder.id); }}
                            >
                              开始收货核验
                            </Button>
                          )}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
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
                <Button variant="accent" onClick={() => { setShowDetailModal(false); handlePay(selectedOrder.id); }}>
                  立即付款
                </Button>
              )}
              {selectedOrder.status === 'pending_shipment' && (
                <Button variant="accent" onClick={() => { setShowDetailModal(false); handleShip(selectedOrder.id); }}>
                  模拟发货
                </Button>
              )}
              {selectedOrder.status === 'shipped' && (
                <Button variant="accent" onClick={() => { handleDeliver(selectedOrder.id); }}>
                  确认收货
                </Button>
              )}
              {selectedOrder.status === 'delivered' && (
                <>
                  <Button variant="outline" onClick={() => { setShowDetailModal(false); handleInspection(selectedOrder.id); }}>
                    收货核验
                  </Button>
                  <Button variant="accent" onClick={() => { setShowDetailModal(false); handleAfterSale(selectedOrder.id); }}>
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
            onSend={(content, isPromise) => addChatMessage(selectedOrder.id, content, isPromise)}
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
              items={inspectionItems}
              onChange={setInspectionItems}
              onSave={handleSaveInspection}
              onSubmit={handleSubmitInspection}
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

      <Modal
        open={showPayModal}
        onClose={() => setShowPayModal(false)}
        title="确认支付"
        size="md"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="p-6 bg-yellow-50 border border-yellow-200 text-center">
              <div className="text-sm text-gray-500 mb-2">订单金额</div>
              <div className="text-4xl font-bold text-accent-600">{formatPrice(selectedOrder.finalPrice)}</div>
              <div className="text-sm text-gray-500 mt-2">订单号: {selectedOrder.id}</div>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <img src={selectedOrder.quote.part.images[0]} alt="" className="w-16 h-16 object-cover border border-gray-200" />
                <div>
                  <div className="font-medium text-gray-900">{selectedOrder.quote.part.name}</div>
                  <div className="text-sm text-gray-500">供应商: {selectedOrder.quote.supplier.companyName}</div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowPayModal(false)}>
                取消
              </Button>
              <Button variant="accent" onClick={handleConfirmPay} icon={<CreditCard className="w-4 h-4" />}>
                确认支付
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={showShipModal}
        onClose={() => setShowShipModal(false)}
        title="模拟商家发货"
        size="md"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-3">
                <Ship className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900">订单: {selectedOrder.id}</div>
                  <div className="text-sm text-gray-500">{selectedOrder.quote.part.name}</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <Select
                label="物流公司"
                options={[
                  { value: '', label: '请选择物流公司' },
                  { value: '顺丰速运', label: '顺丰速运' },
                  { value: '京东物流', label: '京东物流' },
                  { value: '德邦快递', label: '德邦快递' },
                  { value: '壹米滴答', label: '壹米滴答' },
                  { value: '中通快运', label: '中通快运' },
                ]}
                value={trackingCompany}
                onChange={(e) => setTrackingCompany(e.target.value)}
              />
              <Input
                label="运单号"
                placeholder="请输入运单号"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowShipModal(false)}>
                取消
              </Button>
              <Button variant="accent" onClick={handleConfirmShip} icon={<Truck className="w-4 h-4" />} disabled={!trackingCompany || !trackingNumber}>
                确认发货
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
