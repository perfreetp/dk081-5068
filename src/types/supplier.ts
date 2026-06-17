export interface Supplier {
  id: string;
  companyName: string;
  contact: string;
  phone: string;
  location: string;
  avatar?: string;
  responseTime: number;
  fulfillmentRate: number;
  totalParts: number;
  totalOrders: number;
  joinedDays: number;
  certified: boolean;
  certificationType?: string;
  description?: string;
  coverImage?: string;
}

export interface Review {
  id: string;
  supplierId: string;
  buyerId: string;
  buyerName: string;
  buyerShop?: string;
  responseScore: number;
  qualityScore: number;
  deliveryScore: number;
  comment: string;
  images?: string[];
  partName?: string;
  createdAt: Date;
}

export interface SupplierStats {
  averageResponseTime: number;
  averageQualityScore: number;
  averageDeliveryScore: number;
  totalReviews: number;
  fulfillmentRate: number;
  monthlyOrders: number;
}
