import { useState } from 'react';
import { Search, MapPin, Clock, Shield, Package, Award, Phone, User, Star } from 'lucide-react';
import { PageContainer } from '@/components/Layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/common/Tabs';
import { Badge } from '@/components/common/Badge';
import { SupplierRating } from '@/components/business/SupplierRating';
import { mockSuppliers, mockReviews } from '@/data/mockSuppliers';
import { mockParts } from '@/data/mockParts';
import type { Supplier, SupplierStats, Review } from '@/types';
import { formatDate } from '@/utils/format';

export default function SupplierPage() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('list');

  const filteredSuppliers = mockSuppliers.filter(s => {
    if (!searchKeyword) return true;
    const keyword = searchKeyword.toLowerCase();
    return (
      s.companyName.toLowerCase().includes(keyword) ||
      s.location.toLowerCase().includes(keyword) ||
      s.description?.toLowerCase().includes(keyword)
    );
  });

  const selectedSupplier = selectedSupplierId
    ? mockSuppliers.find(s => s.id === selectedSupplierId)
    : null;

  const supplierReviews = selectedSupplierId
    ? mockReviews.filter(r => r.supplierId === selectedSupplierId)
    : [];

  const supplierParts = selectedSupplierId
    ? mockParts.filter(p => p.supplierId === selectedSupplierId)
    : [];

  const getSupplierStats = (supplier: Supplier): SupplierStats => {
    const reviews = mockReviews.filter(r => r.supplierId === supplier.id);
    const avgResponse = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.responseScore, 0) / reviews.length
      : supplier.responseTime / 10;
    const avgQuality = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.qualityScore, 0) / reviews.length
      : 4.5;
    const avgDelivery = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.deliveryScore, 0) / reviews.length
      : 4.5;

    return {
      averageResponseTime: avgResponse,
      averageQualityScore: avgQuality,
      averageDeliveryScore: avgDelivery,
      totalReviews: reviews.length,
      fulfillmentRate: supplier.fulfillmentRate / 100,
      monthlyOrders: Math.round(supplier.totalOrders / (supplier.joinedDays / 30)),
    };
  };

  const handleBack = () => {
    setSelectedSupplierId(null);
    setActiveTab('list');
  };

  if (selectedSupplier) {
    const stats = getSupplierStats(selectedSupplier);
    const avgScore = ((stats.averageResponseTime + stats.averageQualityScore + stats.averageDeliveryScore) / 3).toFixed(1);

    return (
      <PageContainer
        title={selectedSupplier.companyName}
        subtitle={selectedSupplier.location}
        actions={
          <Button variant="outline" onClick={handleBack}>
            返回列表
          </Button>
        }
      >
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-24 h-24 bg-primary-100 flex items-center justify-center text-4xl flex-shrink-0">
                {selectedSupplier.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedSupplier.companyName}
                  </h2>
                  {selectedSupplier.certified && (
                    <Badge variant="accent" size="sm">
                      <Award className="w-3 h-3 mr-1" />
                      {selectedSupplier.certificationType}
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600 mb-4">{selectedSupplier.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">联系人: {selectedSupplier.contact}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{selectedSupplier.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 truncate">{selectedSupplier.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">入驻 {selectedSupplier.joinedDays} 天</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6">
                <div className="text-4xl font-bold text-primary-600">{avgScore}</div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(Number(avgScore))
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-500">{stats.totalReviews} 条评价</div>
                <Button variant="accent" size="sm" className="mt-2">
                  进入店铺
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="info" badge={supplierParts.length}>
              <Package className="w-4 h-4 mr-2" />
              在售配件
            </TabsTrigger>
            <TabsTrigger value="rating" badge={stats.totalReviews}>
              <Star className="w-4 h-4 mr-2" />
              评价详情
            </TabsTrigger>
            <TabsTrigger value="stats">
              <Shield className="w-4 h-4 mr-2" />
              数据统计
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {supplierParts.map((part) => (
                <Card key={part.id} className="hover:border-primary-300 transition-colors">
                  <CardContent className="p-0">
                    <div className="flex items-stretch">
                      <img
                        src={part.images[0]}
                        alt=""
                        className="w-28 h-28 object-cover flex-shrink-0"
                      />
                      <div className="flex-1 p-3">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                          {part.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">OEM: {part.oemNumber}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="default" size="sm">
                            里程 {part.mileage.toLocaleString()}km
                          </Badge>
                          <Badge variant="success" size="sm">
                            质保 {part.warrantyMonths}个月
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-lg font-bold text-accent-600">
                            ¥{part.price}
                          </span>
                          <Button variant="outline" size="sm">查看</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rating">
            <SupplierRating
              stats={stats}
              reviews={supplierReviews}
              showSubmit={false}
            />
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>核心指标</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary-500" />
                        <span className="text-gray-600">平均响应时间</span>
                      </div>
                      <span className="font-semibold">{selectedSupplier.responseTime} 分钟</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2">
                      <div
                        className="bg-primary-500 h-2"
                        style={{ width: `${Math.min(100, (60 - selectedSupplier.responseTime) / 60 * 100 + 20)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-green-500" />
                        <span className="text-gray-600">履约率</span>
                      </div>
                      <span className="font-semibold">{selectedSupplier.fulfillmentRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2">
                      <div
                        className="bg-green-500 h-2"
                        style={{ width: `${selectedSupplier.fulfillmentRate}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-accent-500" />
                        <span className="text-gray-600">配件库存量</span>
                      </div>
                      <span className="font-semibold">{selectedSupplier.totalParts.toLocaleString()} 件</span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-500" />
                        <span className="text-gray-600">累计成交</span>
                      </div>
                      <span className="font-semibold">{selectedSupplier.totalOrders.toLocaleString()} 单</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>近30天表现</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50">
                      <span className="text-gray-600">接单量</span>
                      <span className="font-semibold text-primary-600">
                        {Math.round(selectedSupplier.totalOrders / (selectedSupplier.joinedDays / 30))} 单
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50">
                      <span className="text-gray-600">好评率</span>
                      <span className="font-semibold text-green-600">
                        {stats.totalReviews > 0
                          ? ((supplierReviews.filter(r => r.qualityScore >= 4).length / stats.totalReviews) * 100).toFixed(1)
                          : '95.0'}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50">
                      <span className="text-gray-600">平均发货时效</span>
                      <span className="font-semibold text-accent-600">1.8 天</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50">
                      <span className="text-gray-600">售后率</span>
                      <span className="font-semibold text-red-600">2.3%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="供应商管理"
      subtitle="选择优质供应商，保障配件品质"
    >
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Input
              placeholder="搜索供应商名称、地区、主营车型..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              icon={Search}
              wrapperClassName="flex-1 min-w-[300px]"
            />
            <Button variant="outline">
              <Shield className="w-4 h-4 mr-2" />
              仅显示认证
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredSuppliers.map((supplier) => {
          const stats = getSupplierStats(supplier);
          const avgScore = ((stats.averageResponseTime + stats.averageQualityScore + stats.averageDeliveryScore) / 3).toFixed(1);

          return (
            <Card
              key={supplier.id}
              className="hover:border-primary-300 transition-colors cursor-pointer"
              onClick={() => setSelectedSupplierId(supplier.id)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-primary-100 flex items-center justify-center text-2xl flex-shrink-0">
                    {supplier.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {supplier.companyName}
                      </h3>
                      {supplier.certified && (
                        <Badge variant="accent" size="sm">
                          认证
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate">{supplier.location}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-semibold">{avgScore}</span>
                      </div>
                      <span className="text-sm text-gray-400">
                        {stats.totalReviews} 条评价
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-primary-600">
                      {supplier.responseTime}
                    </div>
                    <div className="text-xs text-gray-500">响应(分钟)</div>
                  </div>
                  <div className="text-center border-x border-gray-100">
                    <div className="text-lg font-semibold text-green-600">
                      {supplier.fulfillmentRate}%
                    </div>
                    <div className="text-xs text-gray-500">履约率</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-accent-600">
                      {supplier.totalParts.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">库存件</div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    查看店铺
                  </Button>
                  <Button variant="primary" size="sm" className="flex-1">
                    联系供应商
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredSuppliers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">🏭</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">未找到匹配的供应商</h3>
            <p className="text-gray-500">请尝试修改搜索条件</p>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
