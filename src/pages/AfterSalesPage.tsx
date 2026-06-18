import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RefreshCw, AlertTriangle, CheckCircle, Clock, XCircle, ArrowRight, MessageSquare, Plus, Check, X, ThumbsUp, ThumbsDown, ArrowLeft } from 'lucide-react';
import { PageContainer } from '@/components/Layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input, Textarea } from '@/components/common/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/Tabs';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { Select } from '@/components/common/Select';
import { Upload } from '@/components/common/Upload';
import { InspectionList } from '@/components/business/InspectionList';
import { Timeline } from '@/components/business/Timeline';
import { SupplierRating } from '@/components/business/SupplierRating';
import { useAppStore, getAfterSaleById } from '@/store/appStore';
import { AfterSaleStatusLabels, AfterSaleTypeLabels, type AfterSaleStatus, type AfterSaleType } from '@/types';
import { formatPrice, formatDate, formatDateTime } from '@/utils/format';

export default function AfterSalesPage() {
  const navigate = useNavigate();
  const { afterSales, selectedAfterSaleId, setSelectedAfterSaleId, orders, createAfterSale, acceptAfterSale, rejectAfterSale, completeAfterSale, pendingAfterSaleOrderId, setPendingAfterSaleOrderId } = useAppStore();
  const [activeTab, setActiveTab] = useState<AfterSaleStatus | 'all'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState('info');
  const [afterSaleType, setAfterSaleType] = useState<AfterSaleType>('return');
  const [afterSaleReason, setAfterSaleReason] = useState('');
  const [afterSaleDescription, setAfterSaleDescription] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [evidenceImages, setEvidenceImages] = useState<string[]>([]);
  const [rejectReason, setRejectReason] = useState('');
  const [handleNote, setHandleNote] = useState('');

  useEffect(() => {
    if (pendingAfterSaleOrderId) {
      setSelectedOrderId(pendingAfterSaleOrderId);
      setShowCreateModal(true);
      setPendingAfterSaleOrderId(null);
    }
  }, [pendingAfterSaleOrderId, setPendingAfterSaleOrderId]);

  const filteredAfterSales = afterSales.filter(afterSale => {
    const matchesStatus = activeTab === 'all' || afterSale.status === activeTab;
    if (!searchKeyword) return matchesStatus;
    const keyword = searchKeyword.toLowerCase();
    return matchesStatus && (
      afterSale.id.toLowerCase().includes(keyword) ||
      afterSale.orderNumber.toLowerCase().includes(keyword) ||
      afterSale.partName.toLowerCase().includes(keyword) ||
      afterSale.supplierName.toLowerCase().includes(keyword)
    );
  });

  const selectedAfterSale = selectedAfterSaleId ? getAfterSaleById(selectedAfterSaleId) : null;

  const handleAfterSaleClick = (afterSaleId: string) => {
    setSelectedAfterSaleId(afterSaleId);
    setShowDetailModal(true);
  };

  const handleCreateAfterSale = () => {
    if (!selectedOrderId || !afterSaleReason || !afterSaleDescription) {
      alert('请选择订单并填写售后原因和详细描述');
      return;
    }
    const newId = createAfterSale({
      orderId: selectedOrderId,
      type: afterSaleType,
      reason: afterSaleReason,
      description: afterSaleDescription,
      evidenceImages,
    });
    setShowCreateModal(false);
    setAfterSaleType('return');
    setAfterSaleReason('');
    setAfterSaleDescription('');
    setSelectedOrderId('');
    setEvidenceImages([]);
    setActiveTab('all');
    setSelectedAfterSaleId(newId);
    setShowDetailModal(true);
  };

  const handleAccept = (afterSaleId: string) => {
    setSelectedAfterSaleId(afterSaleId);
    setHandleNote('');
    setShowAcceptModal(true);
  };

  const handleConfirmAccept = () => {
    if (selectedAfterSaleId) {
      acceptAfterSale(selectedAfterSaleId, handleNote || undefined);
      setShowAcceptModal(false);
    }
  };

  const handleReject = (afterSaleId: string) => {
    setSelectedAfterSaleId(afterSaleId);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleConfirmReject = () => {
    if (selectedAfterSaleId && rejectReason) {
      rejectAfterSale(selectedAfterSaleId, rejectReason);
      setShowRejectModal(false);
    }
  };

  const handleComplete = (afterSaleId: string) => {
    setSelectedAfterSaleId(afterSaleId);
    setHandleNote('');
    setShowCompleteModal(true);
  };

  const handleConfirmComplete = () => {
    if (selectedAfterSaleId) {
      completeAfterSale(selectedAfterSaleId, handleNote || undefined);
      setShowCompleteModal(false);
    }
  };

  const statusConfig: Record<string, { icon: typeof Clock; color: string; variant: 'default' | 'primary' | 'accent' | 'success' | 'danger' }> = {
    pending: { icon: Clock, color: 'text-yellow-600', variant: 'default' },
    processing: { icon: AlertTriangle, color: 'text-blue-600', variant: 'primary' },
    accepted: { icon: CheckCircle, color: 'text-green-600', variant: 'success' },
    rejected: { icon: XCircle, color: 'text-red-600', variant: 'danger' },
    completed: { icon: CheckCircle, color: 'text-gray-600', variant: 'default' },
  };

  const tabItems = [
    { value: 'all', label: '全部售后', count: afterSales.length },
    { value: 'pending', label: '待处理', count: afterSales.filter(a => a.status === 'pending').length },
    { value: 'processing', label: '处理中', count: afterSales.filter(a => a.status === 'processing').length },
    { value: 'completed', label: '已完成', count: afterSales.filter(a => a.status === 'completed').length },
  ] as const;

  return (
    <PageContainer
      title="售后服务"
      subtitle="管理售后申请，保障您的权益"
      actions={
        <Button
          variant="accent"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setShowCreateModal(true)}
        >
          发起售后
        </Button>
      }
    >
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Input
              placeholder="搜索售后单号、订单号、配件名称..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              icon={Search}
              wrapperClassName="flex-1 min-w-[300px]"
            />
            <Button
              variant="outline"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={() => setSearchKeyword('')}
            >
              重置
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AfterSaleStatus | 'all')}>
        <TabsList>
          {tabItems.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} badge={tab.count}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="space-y-4">
            {filteredAfterSales.map((afterSale) => {
            const config = statusConfig[afterSale.status];
            const StatusIcon = config.icon;
            return (
              <Card
                key={afterSale.id}
                className="hover:border-primary-300 transition-colors cursor-pointer"
                onClick={() => handleAfterSaleClick(afterSale.id)}
              >
                <CardContent className="p-0">
                  <div className="flex items-stretch">
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">
                            售后单号: {afterSale.id.toUpperCase()}
                          </h3>
                          <Badge variant={config.variant}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {AfterSaleStatusLabels[afterSale.status]}
                          </Badge>
                          <Badge variant="default">
                            {AfterSaleTypeLabels[afterSale.type]}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            申请时间: {formatDateTime(afterSale.createdAt)}
                          </div>
                          {afterSale.refundAmount && (
                            <div className="text-lg font-bold text-accent-600 mt-1">
                            退款金额: {formatPrice(afterSale.refundAmount)}
                          </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <img
                          src={afterSale.partImage}
                          alt={afterSale.partName}
                          className="w-20 h-20 object-cover border border-gray-200 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {afterSale.partName}
                          </h4>
                          <div className="text-sm text-gray-500 mb-2">
                            订单号: {afterSale.orderNumber}
                          </div>
                          <div className="text-sm text-gray-600 line-clamp-2">
                            {afterSale.description}
                          </div>
                          {afterSale.evidenceImages.length > 0 && (
                            <div className="flex gap-2 mt-3">
                              {afterSale.evidenceImages.slice(0, 4).map((img, idx) => (
                                <img
                                  key={idx}
                                  src={img}
                                  alt=""
                                  className="w-16 h-16 object-cover border border-gray-200"
                                />
                              ))}
                              {afterSale.evidenceImages.length > 4 && (
                                <div className="w-16 h-16 bg-gray-100 flex items-center justify-center text-sm text-gray-500 border border-gray-200">
                                  +{afterSale.evidenceImages.length - 4}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <div className="text-sm text-gray-500">
                          供应商: <span className="text-gray-700">{afterSale.supplierName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {afterSale.status === 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAfterSaleId(afterSale.id);
                                setShowRatingModal(true);
                              }}
                            >
                              评价服务
                            </Button>
                          )}
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAfterSaleClick(afterSale.id);
                            }}
                          >
                            查看详情
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          </div>
        </TabsContent>
      </Tabs>

      {filteredAfterSales.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">🔧</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无售后记录</h3>
          <p className="text-gray-500">您还没有发起过售后申请</p>
        </CardContent>
        </Card>
      )}

      <Modal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="售后详情"
        size="xl"
      >
        {selectedAfterSale && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">售后单号：</span>
                  <span className="font-mono font-medium">{selectedAfterSale.id.toUpperCase()}</span>
                  <Badge variant={statusConfig[selectedAfterSale.status].variant}>
                    {AfterSaleStatusLabels[selectedAfterSale.status]}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  申请时间：{formatDateTime(selectedAfterSale.createdAt)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  {selectedAfterSale.refundAmount ? '预计退款' : '处理中'}
                </div>
                {selectedAfterSale.refundAmount && (
                  <div className="text-2xl font-bold text-accent-600">
                    {formatPrice(selectedAfterSale.refundAmount)}
                  </div>
                )}
              </div>
            </div>

            <Tabs value={activeDetailTab} onValueChange={setActiveDetailTab}>
              <TabsList>
                <TabsTrigger value="info">基本信息</TabsTrigger>
                <TabsTrigger value="inspection">核验记录</TabsTrigger>
                <TabsTrigger value="timeline">处理进度</TabsTrigger>
              </TabsList>

              <TabsContent value="info">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-start gap-6">
                      <img
                        src={selectedAfterSale.partImage}
                        alt=""
                        className="w-32 h-32 object-cover border border-gray-200"
                      />
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {selectedAfterSale.partName}
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="text-gray-500">
                            订单号：<span className="text-gray-700 font-mono">{selectedAfterSale.orderNumber}</span>
                          </div>
                          <div className="text-gray-500">
                            供应商：<span className="text-gray-700">{selectedAfterSale.supplierName}</span>
                          </div>
                          <div className="text-gray-500">
                            售后类型：<span className="text-gray-700">{AfterSaleTypeLabels[selectedAfterSale.type]}</span>
                          </div>
                          <div className="text-gray-500">
                            售后原因：<span className="text-gray-700">{selectedAfterSale.reason}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h5 className="font-medium text-gray-900 mb-3">问题描述</h5>
                      <p className="text-gray-600">{selectedAfterSale.description}</p>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h5 className="font-medium text-gray-900 mb-3">凭证照片</h5>
                      <div className="flex flex-wrap gap-3">
                        {selectedAfterSale.evidenceImages.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt=""
                            className="w-24 h-24 object-cover border border-gray-200"
                          />
                        ))}
                      </div>
                    </div>

                    {selectedAfterSale.refundReason && (
                      <div className="border-t border-gray-200 pt-6">
                        <h5 className="font-medium text-gray-900 mb-2">退款说明</h5>
                        <p className="text-gray-600">{selectedAfterSale.refundReason}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="inspection">
                <Card>
                  <CardContent className="p-6">
                    <InspectionList
                      items={selectedAfterSale.inspectionItems}
                      readOnly={true}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline">
                <Card>
                  <CardContent className="p-6">
                    <Timeline
                      items={selectedAfterSale.timeline.map(item => ({
                      id: item.id,
                      title: item.status,
                      description: item.description + (item.operator ? ` - ${item.operator}` : ''),
                      time: item.time,
                      status: 'completed' as const,
                    }))}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                关闭
              </Button>
              <Button variant="ghost" onClick={() => { setShowDetailModal(false); navigate('/orders'); }} icon={<ArrowLeft className="w-4 h-4" />}>
                返回订单
              </Button>
              {(selectedAfterSale.status === 'pending' || selectedAfterSale.status === 'processing') && (
                <>
                  <Button variant="danger" onClick={() => { setShowDetailModal(false); handleReject(selectedAfterSale.id); }} icon={<ThumbsDown className="w-4 h-4" />}>
                    拒绝申请
                  </Button>
                  <Button variant="success" onClick={() => { setShowDetailModal(false); handleAccept(selectedAfterSale.id); }} icon={<ThumbsUp className="w-4 h-4" />}>
                    同意{selectedAfterSale.type === 'return' ? '退货' : selectedAfterSale.type === 'exchange' ? '换货' : '退款'}
                  </Button>
                </>
              )}
              {selectedAfterSale.status === 'accepted' && (
                <>
                  <Button variant="danger" onClick={() => { setShowDetailModal(false); handleReject(selectedAfterSale.id); }} icon={<ThumbsDown className="w-4 h-4" />}>
                    驳回
                  </Button>
                  <Button variant="accent" onClick={() => { setShowDetailModal(false); handleComplete(selectedAfterSale.id); }} icon={<Check className="w-4 h-4" />}>
                    确认{selectedAfterSale.type === 'return' ? '退款' : selectedAfterSale.type === 'exchange' ? '换货发货' : '退款'}完成
                  </Button>
                </>
              )}
              {selectedAfterSale.status === 'completed' && (
                <Button
                  variant="primary"
                  onClick={() => { setShowDetailModal(false); setShowRatingModal(true); }}
                >
                  评价服务
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="发起售后"
        size="lg"
      >
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>选择售后类型</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
              {(['return', 'exchange', 'refund'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setAfterSaleType(type)}
                  className={`p-4 border-2 text-left transition-all ${
                    afterSaleType === type
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <div className="font-medium text-gray-900 mb-1">
                    {AfterSaleTypeLabels[type]}
                  </div>
                  <div className="text-xs text-gray-500">
                    {type === 'return' ? '将商品退回，全额退款' : type === 'exchange' ? '更换同型号商品' : '不退货，仅退款'}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

          <Card>
            <CardHeader>
              <CardTitle>选择订单信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                label="选择订单"
                options={[
                  { value: '', label: '请选择订单' },
                  ...orders.map(o => ({
                    value: o.id,
                    label: `${o.id} - ${o.quote.part.name} - ${formatPrice(o.finalPrice)}`,
                  })),
                ]}
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
              />
              <Select
                label="售后原因"
                options={[
                  { value: '配件与描述不符', label: '配件与描述不符' },
                  { value: '配件质量问题', label: '配件质量问题' },
                  { value: '配件损坏', label: '配件损坏' },
                  { value: '发错配件', label: '发错配件' },
                  { value: '其他原因', label: '其他原因' },
                ]}
                value={afterSaleReason}
                onChange={(e) => setAfterSaleReason(e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  详细描述
                </label>
                <textarea
                  value={afterSaleDescription}
                  onChange={(e) => setAfterSaleDescription(e.target.value)}
                  placeholder="请详细描述问题情况，包括发现的问题、相关照片等信息..."
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  上传凭证照片
                </label>
                <Upload
                  maxFiles={6}
                  initialImages={evidenceImages}
                  onChange={(files) => setEvidenceImages(files.map(f => URL.createObjectURL(f)))}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              取消
            </Button>
            <Button
              variant="accent"
              onClick={handleCreateAfterSale}
              disabled={!selectedOrderId || !afterSaleReason || !afterSaleDescription}
            >
              提交申请
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        title="评价售后服务"
        size="lg"
      >
        <SupplierRating
          showSubmit={true}
          onSubmit={(review) => {
            alert(`评价已提交！\n响应: ${review.responseScore}分\n质量: ${review.qualityScore}分\n发货: ${review.deliveryScore}分\n评价: ${review.comment}`);
            setShowRatingModal(false);
          }}
        />
      </Modal>

      <Modal
        open={showAcceptModal}
        onClose={() => setShowAcceptModal(false)}
        title="同意售后申请"
        size="md"
      >
        {selectedAfterSaleId && getAfterSaleById(selectedAfterSaleId) && (
          <div className="space-y-6">
            <div className="p-4 bg-green-50 border border-green-200">
              <div className="flex items-start gap-3">
                <ThumbsUp className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-medium text-gray-900 mb-1">
                    {getAfterSaleById(selectedAfterSaleId)!.type === 'return' ? '同意退货退款' :
                     getAfterSaleById(selectedAfterSaleId)!.type === 'exchange' ? '同意换货' : '同意仅退款'}
                  </div>
                  <div className="text-sm text-gray-600">
                    售后单: {getAfterSaleById(selectedAfterSaleId)!.id.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-600">
                    配件: {getAfterSaleById(selectedAfterSaleId)!.partName}
                  </div>
                  {getAfterSaleById(selectedAfterSaleId)!.refundAmount && (
                    <div className="text-lg font-bold text-accent-600 mt-2">
                      退款金额: {formatPrice(getAfterSaleById(selectedAfterSaleId)!.refundAmount!)}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Textarea
              label="备注（可选）"
              placeholder="填写处理备注，如退款时间、退货地址等信息..."
              value={handleNote}
              onChange={(e) => setHandleNote(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowAcceptModal(false)}>
                取消
              </Button>
              <Button variant="success" onClick={handleConfirmAccept}>
                确认同意
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="拒绝售后申请"
        size="md"
      >
        {selectedAfterSaleId && getAfterSaleById(selectedAfterSaleId) && (
          <div className="space-y-6">
            <div className="p-4 bg-red-50 border border-red-200">
              <div className="flex items-start gap-3">
                <ThumbsDown className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-medium text-gray-900 mb-1">拒绝售后申请</div>
                  <div className="text-sm text-gray-600">
                    售后单: {getAfterSaleById(selectedAfterSaleId)!.id.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-600">
                    配件: {getAfterSaleById(selectedAfterSaleId)!.partName}
                  </div>
                </div>
              </div>
            </div>
            <Textarea
              label="拒绝原因 *"
              placeholder="请详细说明拒绝售后申请的原因..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
                取消
              </Button>
              <Button variant="danger" onClick={handleConfirmReject} disabled={!rejectReason}>
                确认拒绝
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="确认售后完成"
        size="md"
      >
        {selectedAfterSaleId && getAfterSaleById(selectedAfterSaleId) && (
          <div className="space-y-6">
            <div className="p-4 bg-accent-50 border border-accent-200">
              <div className="flex items-start gap-3">
                <Check className="w-8 h-8 text-accent-600 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-medium text-gray-900 mb-1">
                    {getAfterSaleById(selectedAfterSaleId)!.type === 'return' ? '确认退款完成' :
                     getAfterSaleById(selectedAfterSaleId)!.type === 'exchange' ? '确认换货完成' : '确认退款完成'}
                  </div>
                  <div className="text-sm text-gray-600">
                    售后单: {getAfterSaleById(selectedAfterSaleId)!.id.toUpperCase()}
                  </div>
                  {getAfterSaleById(selectedAfterSaleId)!.refundAmount && (
                    <div className="text-lg font-bold text-accent-600 mt-2">
                      退款金额: {formatPrice(getAfterSaleById(selectedAfterSaleId)!.refundAmount!)}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Textarea
              label="备注（可选）"
              placeholder="填写处理备注..."
              value={handleNote}
              onChange={(e) => setHandleNote(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowCompleteModal(false)}>
                取消
              </Button>
              <Button variant="accent" onClick={handleConfirmComplete}>
                确认完成
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
