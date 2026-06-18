import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowUpDown, RefreshCw, MessageSquare, Check, X, ShoppingCart, CheckCircle } from 'lucide-react';
import { PageContainer } from '@/components/Layout/PageContainer';
import { Card, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { QuoteCard } from '@/components/business/QuoteCard';
import { ComparePanel } from '@/components/business/ComparePanel';
import { ChatPanel } from '@/components/business/ChatPanel';
import { useAppStore, getQuoteById } from '@/store/appStore';
import { mockInquiries } from '@/data/mockVehicles';
import { PartConditionLabels, PartCategoryLabels } from '@/types';
import type { PartCondition, PartCategory } from '@/types';
import { formatPrice } from '@/utils/format';
import { Layers, TrendingUp } from 'lucide-react';

export default function PartsHallPage() {
  const navigate = useNavigate();
  const {
    filters,
    setFilter,
    resetFilters,
    getFilteredQuotes,
    selectedQuotes,
    toggleQuoteSelection,
    clearQuoteSelection,
    showNegotiationModal,
    negotiationQuoteId,
    openNegotiationModal,
    closeNegotiationModal,
    addNegotiationRecord,
    createOrderFromQuote,
    createOrdersFromQuotes,
    setSelectedOrderId,
  } = useAppStore();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [showChatModal, setShowChatModal] = useState(false);
  const [negotiatePrice, setNegotiatePrice] = useState('');
  const [negotiateMessage, setNegotiateMessage] = useState('');
  const [batchOrderResult, setBatchOrderResult] = useState<{ orderId: string; partName: string; supplier: string; price: number }[] | null>(null);

  const filteredQuotes = getFilteredQuotes().filter(q => {
    if (!searchKeyword) return true;
    const keyword = searchKeyword.toLowerCase();
    return (
      q.part.name.toLowerCase().includes(keyword) ||
      q.part.oemNumber?.toLowerCase().includes(keyword) ||
      q.supplier.companyName.toLowerCase().includes(keyword)
    );
  });

  const currentQuote = negotiationQuoteId ? getQuoteById(negotiationQuoteId) : null;

  const handleSubmitNegotiation = () => {
    if (!negotiatePrice || !currentQuote) return;
    addNegotiationRecord(currentQuote.id, Number(negotiatePrice), negotiateMessage);
    setNegotiatePrice('');
    setNegotiateMessage('');
    closeNegotiationModal();
  };

  const handleOrder = (quoteId: string) => {
    const orderId = createOrderFromQuote(quoteId);
    if (orderId) {
      navigate('/orders');
    }
  };

  const conditionOptions = [
    { value: 'all', label: '全部成色' },
    { value: 'new', label: PartConditionLabels.new },
    { value: 'used', label: PartConditionLabels.used },
    { value: 'remanufactured', label: PartConditionLabels.remanufactured },
  ];

  const categoryOptions = [
    { value: 'all', label: '全部分类' },
    { value: 'engine', label: PartCategoryLabels.engine },
    { value: 'body', label: PartCategoryLabels.body },
    { value: 'electrical', label: PartCategoryLabels.electrical },
    { value: 'chassis', label: PartCategoryLabels.chassis },
    { value: 'transmission', label: PartCategoryLabels.transmission },
    { value: 'other', label: PartCategoryLabels.other },
  ];

  const sortOptions = [
    { value: 'price', label: '价格优先' },
    { value: 'warranty', label: '质保优先' },
    { value: 'delivery', label: '时效优先' },
    { value: 'supplier', label: '履约率优先' },
  ];

  const inquiryOptions = [
    { value: 'all', label: '全部询价单' },
    ...mockInquiries.map(i => ({
      value: i.id,
      label: `${i.vehicle.brand} ${i.vehicle.series} - ${i.partItems.length}项配件`,
    })),
  ];

  return (
    <PageContainer
      title="件源大厅"
      subtitle="多供应商报价对比，智能筛选最优件源"
      actions={
        <Button
          variant="outline"
          icon={<RefreshCw className="w-4 h-4" />}
          onClick={resetFilters}
        >
          重置筛选
        </Button>
      }
    >
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <Input
              placeholder="搜索配件名称、OEM号、供应商..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              icon={Search}
              wrapperClassName="flex-1 min-w-[240px]"
            />
            <Select
              options={inquiryOptions}
              value="all"
              onChange={() => {}}
              className="min-w-[200px]"
            />
            <Select
              options={conditionOptions}
              value={filters.condition}
              onChange={(e) => setFilter('condition', e.target.value as PartCondition | 'all')}
              className="min-w-[140px]"
            />
            <Select
              options={categoryOptions}
              value={filters.category}
              onChange={(e) => setFilter('category', e.target.value as PartCategory | 'all')}
              className="min-w-[140px]"
            />
            <Select
              options={sortOptions}
              value={filters.sortBy}
              onChange={(e) => setFilter('sortBy', e.target.value as any)}
              className="min-w-[140px]"
            />
            <Button
              variant={filters.sortOrder === 'asc' ? 'secondary' : 'primary'}
              size="sm"
              onClick={() => setFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
              icon={<ArrowUpDown className="w-4 h-4" />}
            >
              {filters.sortOrder === 'asc' ? '升序' : '降序'}
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 items-center mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">高级筛选:</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">最高价格</span>
              <Input
                type="number"
                placeholder="不限"
                value={filters.maxPrice || ''}
                onChange={(e) => setFilter('maxPrice', e.target.value ? Number(e.target.value) : null)}
                className="w-28"
              />
              <span className="text-sm text-gray-500">元</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">最少质保</span>
              <Select
                options={[
                  { value: '0', label: '不限' },
                  { value: '1', label: '1个月' },
                  { value: '3', label: '3个月' },
                  { value: '6', label: '6个月' },
                  { value: '12', label: '12个月' },
                ]}
                value={String(filters.minWarranty)}
                onChange={(v) => setFilter('minWarranty', Number(v))}
                className="w-28"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">最长时效</span>
              <Select
                options={[
                  { value: '0', label: '不限' },
                  { value: '1', label: '1天内' },
                  { value: '2', label: '2天内' },
                  { value: '3', label: '3天内' },
                  { value: '5', label: '5天内' },
                ]}
                value={String(filters.maxDeliveryDays || 0)}
                onChange={(v) => setFilter('maxDeliveryDays', Number(v) || null)}
                className="w-28"
              />
            </div>
            <div className="ml-auto text-sm text-gray-500">
              共 <span className="font-semibold text-primary-600">{filteredQuotes.length}</span> 条报价
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedQuotes.length > 0 && (
        <div className="mb-4 flex items-center justify-between p-3 bg-primary-50 border border-primary-200">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-primary-600" />
            <span className="text-primary-700">
              已选择 <strong>{selectedQuotes.length}</strong> 个报价进行对比
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearQuoteSelection}
            icon={<X className="w-4 h-4" />}
          >
            清空选择
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredQuotes.map((quote) => (
          <QuoteCard
            key={quote.id}
            quote={quote}
            selected={selectedQuotes.includes(quote.id)}
            onSelect={() => toggleQuoteSelection(quote.id)}
            onNegotiate={() => openNegotiationModal(quote.id)}
            onChat={() => setShowChatModal(true)}
            onOrder={() => handleOrder(quote.id)}
          />
        ))}
      </div>

      {filteredQuotes.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无符合条件的报价</h3>
            <p className="text-gray-500 mb-4">请尝试调整筛选条件或降低搜索关键词</p>
            <Button variant="outline" onClick={resetFilters}>重置筛选条件</Button>
          </CardContent>
        </Card>
      )}

      {selectedQuotes.length > 0 && (
        <ComparePanel
          quoteIds={selectedQuotes}
          onClose={clearQuoteSelection}
          onRemove={toggleQuoteSelection}
          onOrder={(quoteId) => handleOrder(quoteId)}
          onBatchOrder={(quoteIds) => {
            const orderIds = createOrdersFromQuotes(quoteIds);
            const results = orderIds.map(oid => {
              const order = useAppStore.getState().orders.find(o => o.id === oid);
              return {
                orderId: oid,
                partName: order?.quote.part.name || '未知配件',
                supplier: order?.quote.supplier.companyName || '未知供应商',
                price: order?.finalPrice || 0,
              };
            });
            setBatchOrderResult(results);
            clearQuoteSelection();
          }}
        />
      )}

      <Modal
        open={showNegotiationModal}
        onClose={closeNegotiationModal}
        title="发起议价"
        size="md"
      >
        {currentQuote && (
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 bg-gray-50 border border-gray-200">
              <img
                src={currentQuote.part.images[0]}
                alt=""
                className="w-20 h-20 object-cover border border-gray-200"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{currentQuote.part.name}</h4>
                <p className="text-sm text-gray-500 mt-1">OEM: {currentQuote.part.oemNumber}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-lg font-bold text-accent-600">
                    {formatPrice(currentQuote.price)}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    {currentQuote.originalPrice && formatPrice(currentQuote.originalPrice)}
                  </span>
                </div>
              </div>
            </div>

            {currentQuote.negotiationHistory && currentQuote.negotiationHistory.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">议价历史</h4>
                {currentQuote.negotiationHistory.map((record) => (
                  <div
                    key={record.id}
                    className={`p-3 border ${
                      record.initiator === 'buyer'
                        ? 'bg-primary-50 border-primary-200 ml-8'
                        : 'bg-gray-50 border-gray-200 mr-8'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">
                        {record.initiator === 'buyer' ? '我' : currentQuote.supplier.companyName}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(record.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-accent-600">
                      报价: {formatPrice(record.price)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{record.message}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  我的出价 (元)
                </label>
                <Input
                  type="number"
                  placeholder="请输入您期望的价格"
                  value={negotiatePrice}
                  onChange={(e) => setNegotiatePrice(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  建议出价不要低于当前价格的70%，以提高议价成功率
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  留言说明 (选填)
                </label>
                <textarea
                  value={negotiateMessage}
                  onChange={(e) => setNegotiateMessage(e.target.value)}
                  placeholder="例如：长期合作，量大从优；请确认配件成色..."
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="secondary" onClick={closeNegotiationModal}>
                取消
              </Button>
              <Button
                variant="accent"
                onClick={handleSubmitNegotiation}
                icon={<MessageSquare className="w-4 h-4" />}
                disabled={!negotiatePrice}
              >
                发送议价
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={showChatModal}
        onClose={() => setShowChatModal(false)}
        title="与供应商沟通"
        size="lg"
      >
        {currentQuote && (
          <ChatPanel
            supplier={currentQuote.supplier}
            orderId={currentQuote.inquiryId}
          />
        )}
      </Modal>

      <Modal
        open={!!batchOrderResult}
        onClose={() => setBatchOrderResult(null)}
        title="批量下单结果"
        size="lg"
      >
        {batchOrderResult && (
          <div className="space-y-6">
            <div className="p-4 bg-green-50 border border-green-200 flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  成功生成 {batchOrderResult.length} 个订单
                </div>
                <div className="text-sm text-gray-600">
                  总金额：{formatPrice(batchOrderResult.reduce((sum, r) => sum + r.price, 0))}
                </div>
              </div>
            </div>

            {(() => {
              const bySupplier = batchOrderResult.reduce((acc, r) => {
                if (!acc[r.supplier]) acc[r.supplier] = { count: 0, total: 0 };
                acc[r.supplier].count += 1;
                acc[r.supplier].total += r.price;
                return acc;
              }, {} as Record<string, { count: number; total: number }>);
              const supplierEntries = Object.entries(bySupplier).sort((a, b) => b[1].total - a[1].total);
              const maxTotal = supplierEntries[0]?.[1].total || 1;
              return (
                <div className="p-4 bg-gray-50 border border-gray-200">
                  <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary-600" />
                    按供应商汇总
                  </h5>
                  <div className="space-y-2">
                    {supplierEntries.map(([supplier, info]) => (
                      <div key={supplier} className="flex items-center gap-3">
                        <span className="text-sm text-gray-700 w-40 truncate">{supplier}</span>
                        <div className="flex-1 h-6 bg-gray-200 relative">
                          <div className="h-full bg-primary-500" style={{ width: `${(info.total / maxTotal) * 100}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 w-16 text-right">{info.count} 单</span>
                        <span className="text-sm font-medium text-accent-600 w-24 text-right">{formatPrice(info.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div>
              <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary-600" />
                订单明细（点击查看详情）
              </h5>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {batchOrderResult.map((r, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedOrderId(r.orderId);
                      setBatchOrderResult(null);
                      navigate('/orders');
                    }}
                    className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm truncate">{r.partName}</div>
                      <div className="text-xs text-gray-500">
                        <span className="font-mono">{r.orderId}</span> · {r.supplier}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-3">
                      <span className="text-sm font-bold text-accent-600">
                        {formatPrice(r.price)}
                      </span>
                      <ShoppingCart className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setBatchOrderResult(null)}>
                留在件源大厅
              </Button>
              <Button variant="accent" icon={<ShoppingCart className="w-4 h-4" />} onClick={() => {
                setBatchOrderResult(null);
                navigate('/orders');
              }}>
                去订单页查看全部
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
