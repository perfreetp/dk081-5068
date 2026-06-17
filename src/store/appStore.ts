import { create } from 'zustand';
import type { Quote, Order, AfterSale, PartCondition, PartCategory } from '@/types';
import { mockQuotes, mockParts } from '@/data/mockParts';
import { mockOrders } from '@/data/mockOrders';
import { mockAfterSales } from '@/data/mockAfterSales';
import { mockInquiries } from '@/data/mockVehicles';
import type { Inquiry } from '@/types';

interface AppState {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  
  quotes: Quote[];
  selectedQuotes: string[];
  toggleQuoteSelection: (quoteId: string) => void;
  clearQuoteSelection: () => void;
  
  orders: Order[];
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
  
  afterSales: AfterSale[];
  selectedAfterSaleId: string | null;
  setSelectedAfterSaleId: (id: string | null) => void;
  
  inquiries: Inquiry[];
  
  filters: {
    condition: PartCondition | 'all';
    category: PartCategory | 'all';
    maxPrice: number | null;
    minWarranty: number;
    maxDeliveryDays: number | null;
    sortBy: 'price' | 'warranty' | 'delivery' | 'supplier';
    sortOrder: 'asc' | 'desc';
  };
  setFilter: (key: keyof AppState['filters'], value: any) => void;
  resetFilters: () => void;
  
  getFilteredQuotes: () => Quote[];
  
  showNegotiationModal: boolean;
  negotiationQuoteId: string | null;
  openNegotiationModal: (quoteId: string) => void;
  closeNegotiationModal: () => void;
  
  showPartDetailModal: boolean;
  detailPartId: string | null;
  openPartDetailModal: (partId: string) => void;
  closePartDetailModal: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentPage: 'inquiry',
  setCurrentPage: (page) => set({ currentPage: page }),
  
  quotes: mockQuotes,
  selectedQuotes: [],
  toggleQuoteSelection: (quoteId) => {
    set((state) => ({
      selectedQuotes: state.selectedQuotes.includes(quoteId)
        ? state.selectedQuotes.filter(id => id !== quoteId)
        : [...state.selectedQuotes, quoteId],
    }));
  },
  clearQuoteSelection: () => set({ selectedQuotes: [] }),
  
  orders: mockOrders,
  selectedOrderId: null,
  setSelectedOrderId: (id) => set({ selectedOrderId: id }),
  
  afterSales: mockAfterSales,
  selectedAfterSaleId: null,
  setSelectedAfterSaleId: (id) => set({ selectedAfterSaleId: id }),
  
  inquiries: mockInquiries,
  
  filters: {
    condition: 'all',
    category: 'all',
    maxPrice: null,
    minWarranty: 0,
    maxDeliveryDays: null,
    sortBy: 'price',
    sortOrder: 'asc',
  },
  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    }));
  },
  resetFilters: () => {
    set({
      filters: {
        condition: 'all',
        category: 'all',
        maxPrice: null,
        minWarranty: 0,
        maxDeliveryDays: null,
        sortBy: 'price',
        sortOrder: 'asc',
      },
    });
  },
  
  getFilteredQuotes: () => {
    const state = get();
    let filtered = [...state.quotes];
    
    if (state.filters.condition !== 'all') {
      filtered = filtered.filter(q => q.part.condition === state.filters.condition);
    }
    if (state.filters.category !== 'all') {
      filtered = filtered.filter(q => q.part.category === state.filters.category);
    }
    if (state.filters.maxPrice !== null) {
      filtered = filtered.filter(q => q.price <= state.filters.maxPrice!);
    }
    if (state.filters.minWarranty > 0) {
      filtered = filtered.filter(q => q.warrantyMonths >= state.filters.minWarranty);
    }
    if (state.filters.maxDeliveryDays !== null) {
      filtered = filtered.filter(q => q.deliveryDays <= state.filters.maxDeliveryDays!);
    }
    
    const sortBy = state.filters.sortBy;
    const sortOrder = state.filters.sortOrder;
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'warranty':
          comparison = a.warrantyMonths - b.warrantyMonths;
          break;
        case 'delivery':
          comparison = a.deliveryDays - b.deliveryDays;
          break;
        case 'supplier':
          comparison = a.supplier.fulfillmentRate - b.supplier.fulfillmentRate;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  },
  
  showNegotiationModal: false,
  negotiationQuoteId: null,
  openNegotiationModal: (quoteId) => set({ showNegotiationModal: true, negotiationQuoteId: quoteId }),
  closeNegotiationModal: () => set({ showNegotiationModal: false, negotiationQuoteId: null }),
  
  showPartDetailModal: false,
  detailPartId: null,
  openPartDetailModal: (partId) => set({ showPartDetailModal: true, detailPartId: partId }),
  closePartDetailModal: () => set({ showPartDetailModal: false, detailPartId: null }),
}));

export function getPartById(partId: string) {
  return mockParts.find(p => p.id === partId);
}

export function getQuoteById(quoteId: string) {
  return mockQuotes.find(q => q.id === quoteId);
}

export function getOrderById(orderId: string) {
  return mockOrders.find(o => o.id === orderId);
}

export function getAfterSaleById(afterSaleId: string) {
  return mockAfterSales.find(a => a.id === afterSaleId);
}
