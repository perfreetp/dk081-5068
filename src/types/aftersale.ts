import type { AfterSaleStatus, AfterSaleType, InspectionCategory } from './index';

export interface InspectionItem {
  id: string;
  name: string;
  category: InspectionCategory;
  passed: boolean | null;
  note: string;
  images: string[];
}

export interface AfterSaleTimelineItem {
  id: string;
  status: string;
  description: string;
  operator?: string;
  time: Date;
}

export interface AfterSale {
  id: string;
  orderId: string;
  orderNumber: string;
  partName: string;
  partImage: string;
  type: AfterSaleType;
  reason: string;
  description: string;
  evidenceImages: string[];
  inspectionItems: InspectionItem[];
  status: AfterSaleStatus;
  refundAmount?: number;
  refundReason?: string;
  timeline: AfterSaleTimelineItem[];
  buyerName: string;
  supplierName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AfterSaleReview {
  id: string;
  afterSaleId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}
