import type { PartCondition, PartCategory } from './index';
import type { Supplier } from './supplier';

export interface DonorVehicle {
  id: string;
  vin: string;
  brand: string;
  year: number;
  mileage: number;
  accidentHistory: string;
  images?: string[];
}

export interface Part {
  id: string;
  supplierId: string;
  supplier?: Supplier;
  name: string;
  oemNumber?: string;
  category: PartCategory;
  condition: PartCondition;
  mileage: number;
  warrantyMonths: number;
  price: number;
  originalPrice?: number;
  images: string[];
  donorVehicleId?: string;
  donorVehicle?: DonorVehicle;
  description?: string;
  location?: string;
  deliveryDays: number;
  shippingMethod: string;
  createdAt: Date;
  stock: number;
}

export interface Quote {
  id: string;
  inquiryId: string;
  supplier: Supplier;
  part: Part;
  price: number;
  originalPrice?: number;
  deliveryDays: number;
  shippingMethod: string;
  warrantyMonths: number;
  createdAt: Date;
  status: 'pending' | 'negotiating' | 'accepted' | 'rejected';
  negotiationHistory?: NegotiationRecord[];
  notes?: string;
}

export interface NegotiationRecord {
  id: string;
  initiator: 'buyer' | 'supplier';
  price: number;
  message: string;
  createdAt: Date;
}
