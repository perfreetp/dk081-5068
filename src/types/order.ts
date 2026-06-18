import type { OrderStatus } from './index';
import type { Quote } from './parts';

export interface PriceAdjustment {
  id: string;
  type: 'supplement' | 'refund';
  amount: number;
  reason: string;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  orderId?: string;
  senderType: 'buyer' | 'supplier' | 'system';
  senderName: string;
  content: string;
  images: string[];
  isPromise: boolean;
  createdAt: Date;
}

export interface Order {
  id: string;
  quote: Quote;
  finalPrice: number;
  status: OrderStatus;
  trackingNumber?: string;
  trackingCompany?: string;
  estimatedDelivery: Date;
  actualDeliveryDate?: Date;
  priceAdjustments: PriceAdjustment[];
  chatMessages: ChatMessage[];
  createdAt: Date;
  paidAt?: Date;
  shippedAt?: Date;
  notes?: string;
}

export type OrderEventType =
  | 'created'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'inspected'
  | 'after_sale'
  | 'completed';

export interface OrderEvent {
  id: string;
  orderId: string;
  type: OrderEventType;
  title: string;
  description: string;
  operator: string;
  time: Date;
}

export interface LogisticsNode {
  id: string;
  status: string;
  location: string;
  description: string;
  time: Date;
}

export interface LogisticsInfo {
  trackingNumber: string;
  company: string;
  status: 'pending' | 'in_transit' | 'delivered';
  estimatedDelivery: Date;
  nodes: LogisticsNode[];
}
