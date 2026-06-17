import { useState } from 'react';
import { Plus, Search, Send, FileText, Users, ChevronRight, Check } from 'lucide-react';
import { PageContainer } from '@/components/Layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/Tabs';
import { Badge } from '@/components/common/Badge';
import { Upload } from '@/components/common/Upload';
import { Select } from '@/components/common/Select';
import { Modal } from '@/components/common/Modal';
import { VehicleSelector } from '@/components/business/VehicleSelector';
import { PartsCategory } from '@/components/business/PartsCategory';
import { mockInquiries, mockBrands, mockBuyer } from '@/data/mockVehicles';
import { mockSuppliers } from '@/data/mockSuppliers';
import type { Vehicle, PartItem, Inquiry } from '@/types';
import { formatDateTime } from '@/utils/format';

const statusLabels: Record<string, string> = {
  draft: '草稿',
  sent: '已发送',
  quoted: '已报价',
  ordered: '已下单',
};

const statusVariants: Record<string, 'default' | 'primary' | 'accent' | 'success'> = {
  draft: 'default',
  sent: 'primary',
  quoted: 'accent',
  ordered: 'success',
};

export default function InquiryPage() {
  const [activeTab, setActiveTab] = useState('list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vin, setVin] = useState('');
  const [description, setDescription] = useState('');
  const [faultCodes, setFaultCodes] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [partItems, setPartItems] = useState<PartItem[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [showSupplierSelect, setShowSupplierSelect] = useState(false);
  const [inquiries, setInquiries] = useState<Inquiry[]>(mockInquiries);

  const handleCreateInquiry = () => {
    if (!selectedVehicle || partItems.length === 0) {
      alert('请选择车辆并添加配件需求');
      return;
    }

    const newInquiry: Inquiry = {
      id: `inq${Date.now()}`,
      vin,
      vehicle: selectedVehicle,
      buyer: mockBuyer,
      description,
      faultCodes: faultCodes.split(',').map(c => c.trim()).filter(Boolean),
      images,
      partItems,
      selectedSupplierIds: selectedSuppliers,
      createdAt: new Date(),
      status: 'sent',
    };

    setInquiries([newInquiry, ...inquiries]);
    setShowCreateModal(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedVehicle(null);
    setVin('');
    setDescription('');
    setFaultCodes('');
    setImages([]);
    setPartItems([]);
    setSelectedSuppliers([]);
  };

  const toggleSupplier = (supplierId: string) => {
    setSelectedSuppliers(prev =>
      prev.includes(supplierId)
        ? prev.filter(id => id !== supplierId)
        : [...prev, supplierId]
    );
  };

  return (
    <PageContainer
      title="询价单管理"
      subtitle="发起配件询价，一键群发给多个拆车商"
      actions={
        <Button
          variant="accent"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setShowCreateModal(true)}
        >
          发起询价
        </Button>
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list" badge={inquiries.length}>
            <FileText className="w-4 h-4 mr-2" />
            全部询价单
          </TabsTrigger>
          <TabsTrigger value="draft" badge={inquiries.filter(i => i.status === 'draft').length}>
            草稿
          </TabsTrigger>
          <TabsTrigger value="sent" badge={inquiries.filter(i => i.status === 'sent').length}>
            已发送
          </TabsTrigger>
          <TabsTrigger value="quoted" badge={inquiries.filter(i => i.status === 'quoted').length}>
            已报价
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <div className="space-y-4">
            {inquiries.map((inquiry) => (
              <Card key={inquiry.id} className="hover:border-primary-300 transition-colors">
                <CardContent className="p-0">
                  <div className="flex items-stretch">
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-gray-900">
                              {inquiry.vehicle.brand} {inquiry.vehicle.series} {inquiry.vehicle.year} {inquiry.vehicle.model}
                            </h3>
                            <Badge variant={statusVariants[inquiry.status]}>
                              {statusLabels[inquiry.status]}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            VIN: {inquiry.vin} · 询价单号: {inquiry.id.toUpperCase()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">{formatDateTime(inquiry.createdAt)}</div>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {inquiry.description}
                      </p>

                      {inquiry.faultCodes.length > 0 && (
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs text-gray-500">故障码:</span>
                          {inquiry.faultCodes.map((code, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-red-50 text-red-600 text-xs border border-red-200">
                              {code}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span>{inquiry.partItems.length} 项配件</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>已发送 {inquiry.selectedSupplierIds.length} 家供应商</span>
                        </div>
                        {inquiry.images.length > 0 && (
                          <div className="flex items-center gap-2">
                            {inquiry.images.slice(0, 3).map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt=""
                                className="w-10 h-10 object-cover border border-gray-200"
                              />
                            ))}
                            {inquiry.images.length > 3 && (
                              <span className="text-xs text-gray-500">+{inquiry.images.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="w-px bg-gray-100" />

                    <div className="w-48 flex flex-col justify-center items-center gap-2 p-5">
                      {inquiry.status === 'quoted' ? (
                        <Button variant="accent" size="sm" className="w-full">
                          查看报价
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      ) : inquiry.status === 'sent' ? (
                        <Button variant="outline" size="sm" className="w-full">
                          等待报价中...
                        </Button>
                      ) : (
                        <Button variant="primary" size="sm" className="w-full">
                          继续编辑
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="draft">
          <div className="space-y-4">
            {inquiries.filter(i => i.status === 'draft').map((inquiry) => (
              <Card key={inquiry.id}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">
                        {inquiry.vehicle.brand} {inquiry.vehicle.series}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{inquiry.description}</p>
                    </div>
                    <Button variant="primary" size="sm">继续编辑</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="发起询价"
        size="xl"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          <Card>
            <CardHeader>
              <CardTitle>1. 选择车辆</CardTitle>
            </CardHeader>
            <CardContent>
              <VehicleSelector
                brands={mockBrands}
                onSelect={setSelectedVehicle}
                selectedVehicle={selectedVehicle}
              />
              {selectedVehicle && (
                <div className="mt-4 p-4 bg-primary-50 border border-primary-200">
                  <div className="font-medium text-primary-700">
                    已选择: {selectedVehicle.brand} {selectedVehicle.series} {selectedVehicle.year} {selectedVehicle.model}
                  </div>
                  {selectedVehicle.vin && (
                    <div className="text-sm text-primary-600 mt-1">VIN: {selectedVehicle.vin}</div>
                  )}
                </div>
              )}
              <div className="mt-4">
                <Input
                  label="VIN 码（选填，精准匹配配件）"
                  value={vin}
                  onChange={(e) => setVin(e.target.value)}
                  placeholder="请输入17位VIN码"
                  icon={Search}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. 故障描述</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="故障码（多个用逗号分隔）"
                value={faultCodes}
                onChange={(e) => setFaultCodes(e.target.value)}
                placeholder="例: P0300, P0301"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  故障详细描述
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="请详细描述故障现象、发生条件等信息，帮助供应商准确报价..."
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  旧件照片 / 故障现场照片
                </label>
                <Upload
                  maxFiles={9}
                  initialImages={images}
                  onChange={(files) => {
                    const urls = files.map(f => URL.createObjectURL(f));
                    setImages(urls);
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. 配件需求</CardTitle>
            </CardHeader>
            <CardContent>
              <PartsCategory
                items={partItems}
                onChange={setPartItems}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. 选择供应商</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSupplierSelect(true)}
                  icon={<Users className="w-4 h-4" />}
                >
                  选择发送供应商 ({selectedSuppliers.length} 家已选)
                </Button>

                {selectedSuppliers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {mockSuppliers
                      .filter(s => selectedSuppliers.includes(s.id))
                      .map(supplier => (
                        <div
                          key={supplier.id}
                          className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 text-sm border border-primary-200"
                        >
                          {supplier.companyName}
                          {supplier.certified && (
                            <Badge variant="accent" size="sm">认证</Badge>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            取消
          </Button>
          <Button variant="outline" onClick={resetForm}>
            重置
          </Button>
          <Button
            variant="accent"
            onClick={handleCreateInquiry}
            icon={<Send className="w-4 h-4" />}
            disabled={!selectedVehicle || partItems.length === 0}
          >
            发送询价
          </Button>
        </div>
      </Modal>

      <Modal
        open={showSupplierSelect}
        onClose={() => setShowSupplierSelect(false)}
        title="选择供应商"
        size="lg"
      >
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {mockSuppliers.map((supplier) => (
            <div
              key={supplier.id}
              onClick={() => toggleSupplier(supplier.id)}
              className={`p-4 border-2 cursor-pointer transition-all ${
                selectedSuppliers.includes(supplier.id)
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-6 h-6 border-2 flex items-center justify-center ${
                  selectedSuppliers.includes(supplier.id)
                    ? 'bg-primary-500 border-primary-500'
                    : 'border-gray-300'
                }`}>
                  {selectedSuppliers.includes(supplier.id) && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{supplier.companyName}</span>
                    {supplier.certified && (
                      <Badge variant="accent" size="sm">平台认证</Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {supplier.location} · 入驻 {supplier.joinedDays} 天 · 履约率 {(supplier.fulfillmentRate * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div className="text-gray-600">平均响应 {supplier.responseTime} 分钟</div>
                  <div className="text-gray-500">库存 {supplier.totalParts} 件</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={() => setShowSupplierSelect(false)}>
            确定
          </Button>
        </div>
      </Modal>
    </PageContainer>
  );
}
