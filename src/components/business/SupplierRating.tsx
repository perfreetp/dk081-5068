import { useState } from 'react';
import { Star, Clock, Truck, Shield, User } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card, CardContent } from '@/components/common/Card';
import { Textarea } from '@/components/common/Input';
import type { Review, SupplierStats } from '@/types';
import { formatDate } from '@/utils/format';

interface SupplierRatingProps {
  stats?: SupplierStats;
  reviews?: Review[];
  onSubmit?: (review: Omit<Review, 'id' | 'supplierId' | 'createdAt'>) => void;
  showSubmit?: boolean;
}

const ratingLabels = ['非常差', '差', '一般', '好', '非常好'];

export function SupplierRating({ stats, reviews = [], onSubmit, showSubmit = false }: SupplierRatingProps) {
  const [responseScore, setResponseScore] = useState(5);
  const [qualityScore, setQualityScore] = useState(5);
  const [deliveryScore, setDeliveryScore] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredResponse, setHoveredResponse] = useState(0);
  const [hoveredQuality, setHoveredQuality] = useState(0);
  const [hoveredDelivery, setHoveredDelivery] = useState(0);

  const handleSubmit = () => {
    onSubmit?.({
      buyerId: 'buyer001',
      buyerName: '张师傅',
      buyerShop: '速达汽修厂',
      responseScore,
      qualityScore,
      deliveryScore,
      comment,
    });
    setComment('');
  };

  const renderStars = (
    value: number,
    hovered: number,
    onChange: (v: number) => void,
    onHover: (v: number) => void,
    readOnly: boolean = false
  ) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !readOnly && onChange(star)}
            onMouseEnter={() => !readOnly && onHover(star)}
            onMouseLeave={() => !readOnly && onHover(0)}
            className={readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'}
            disabled={readOnly}
          >
            <Star
              className={`w-5 h-5 ${
                star <= (hovered || value)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {ratingLabels[(hovered || value) - 1]} ({hovered || value}分)
        </span>
      </div>
    );
  };

  const getAverageScore = () => {
    if (!stats) return null;
    return ((stats.averageResponseTime + stats.averageQualityScore + stats.averageDeliveryScore) / 3).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {stats && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600 mb-1">
                  {getAverageScore()}
                </div>
                <div className="flex justify-center mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(Number(getAverageScore() || 0))
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-500">综合评分</div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-primary-500" />
                  <span className="text-sm text-gray-600">响应速度</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-semibold">{stats.averageResponseTime.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">分</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">平均响应 {stats.averageResponseTime > 4 ? '快' : stats.averageResponseTime > 3 ? '较快' : '一般'}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-primary-500" />
                  <span className="text-sm text-gray-600">配件质量</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-semibold">{stats.averageQualityScore.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">分</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  履约率 {(stats.fulfillmentRate * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-4 h-4 text-primary-500" />
                  <span className="text-sm text-gray-600">发货速度</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-semibold">{stats.averageDeliveryScore.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">分</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">月均 {stats.monthlyOrders} 单</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showSubmit && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">发表评价</h3>
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4" />
                  响应速度
                </label>
                {renderStars(responseScore, hoveredResponse, setResponseScore, setHoveredResponse)}
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Shield className="w-4 h-4" />
                  配件质量
                </label>
                {renderStars(qualityScore, hoveredQuality, setQualityScore, setHoveredQuality)}
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Truck className="w-4 h-4" />
                  发货速度
                </label>
                {renderStars(deliveryScore, hoveredDelivery, setDeliveryScore, setHoveredDelivery)}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  评价内容
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="请分享您的采购体验，帮助其他汽修厂做出更好的选择..."
                  rows={4}
                />
              </div>
              <div className="flex justify-end">
                <Button variant="primary" onClick={handleSubmit} disabled={!comment.trim()}>
                  提交评价
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {reviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">用户评价 ({reviews.length})</h3>
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-medium text-gray-900">{review.buyerName}</span>
                        {review.buyerShop && (
                          <span className="text-sm text-gray-500 ml-2">{review.buyerShop}</span>
                        )}
                      </div>
                      <span className="text-sm text-gray-400">{formatDate(review.createdAt)}</span>
                    </div>
                    {review.partName && (
                      <div className="text-sm text-gray-500 mb-2">
                        采购配件：<span className="text-gray-700">{review.partName}</span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-4 mb-3 text-sm">
                      <span className="text-gray-600">
                        响应：<span className="text-yellow-600">{review.responseScore}分</span>
                      </span>
                      <span className="text-gray-600">
                        质量：<span className="text-yellow-600">{review.qualityScore}分</span>
                      </span>
                      <span className="text-gray-600">
                        发货：<span className="text-yellow-600">{review.deliveryScore}分</span>
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {review.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt=""
                            className="w-16 h-16 object-cover border border-gray-200"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
