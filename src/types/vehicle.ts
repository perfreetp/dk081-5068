export interface Vehicle {
  id: string;
  brand: string;
  series: string;
  year: number;
  model: string;
  vin?: string;
  engine?: string;
  transmission?: string;
}

export interface VehicleBrand {
  id: string;
  name: string;
  logo: string;
  series: VehicleSeries[];
}

export interface VehicleSeries {
  id: string;
  name: string;
  brandId: string;
  years: number[];
  models: string[];
}

export interface Buyer {
  id: string;
  name: string;
  shopName: string;
  phone: string;
  address?: string;
  avatar?: string;
}

export interface PartItem {
  id: string;
  inquiryId?: string;
  name: string;
  oemNumber?: string;
  category: string;
  quantity: number;
  notes?: string;
  images?: string[];
}

export interface Inquiry {
  id: string;
  vin?: string;
  vehicle: Vehicle;
  buyer: Buyer;
  description: string;
  faultCodes: string[];
  images: string[];
  partItems: PartItem[];
  selectedSupplierIds: string[];
  createdAt: Date;
  status: 'draft' | 'sent' | 'quoted' | 'ordered';
}
