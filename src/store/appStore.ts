import { create } from 'zustand';
import type { Quote, Order, AfterSale, PartCondition, PartCategory, InspectionItem, ChatMessage, AfterSaleType, OrderStatus, NegotiationRecord, AfterSaleTimelineItem } from '@/types';
import { mockQuotes, mockParts } from '@/data/mockParts';
import { mockOrders } from '@/data/mockOrders';
import { mockAfterSales } from '@/data/mockAfterSales';
import { mockInquiries, mockBuyer } from '@/data/mockVehicles';
import type { Inquiry } from '@/types';

interface CreateAfterSaleInput {
  orderId: string;
  type: AfterSaleType;
  reason: string;
  description: string;
  evidenceImages: string[];
  inspectionItems?: InspectionItem[];
}

interface AppState {
  currentPage: string;
  setCurrentPage: (page: string) => void;

  quotes: Quote[];
  selectedQuotes: string[];
  toggleQuoteSelection: (quoteId: string) => void;
  clearQuoteSelection: () => void;
  addNegotiationRecord: (quoteId: string, price: number, message: string) => void;

  orders: Order[];
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
  createOrderFromQuote: (quoteId: string) => string;
  addChatMessage: (orderId: string, content: string, isPromise: boolean, images?: string[]) => void;

  inspections: Record<string, InspectionItem[]>;
  saveInspection: (orderId: string, items: InspectionItem[]) => void;

  afterSales: AfterSale[];
  selectedAfterSaleId: string | null;
  setSelectedAfterSaleId: (id: string | null) => void;
  createAfterSale: (input: CreateAfterSaleInput) => string;
  createAfterSaleFromInspection: (orderId: string, items: InspectionItem[]) => string;

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

let idCounter = 1000;
const genId = (prefix: string) => `${prefix}${Date.now()}${idCounter++}`;

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
  addNegotiationRecord: (quoteId, price, message) => {
    set((state) => ({
      quotes: state.quotes.map(q => {
        if (q.id !== quoteId) return q;
        const record: NegotiationRecord = {
          id: genId('neg'),
          initiator: 'buyer',
          price,
          message,
          createdAt: new Date(),
        };
        return {
          ...q,
          status: 'negotiating',
          negotiationHistory: [...(q.negotiationHistory || []), record],
        };
      }),
    }));
  },

  orders: mockOrders,
  selectedOrderId: null,
  setSelectedOrderId: (id) => set({ selectedOrderId: id }),
  createOrderFromQuote: (quoteId) => {
    const quote = get().quotes.find(q => q.id === quoteId);
    if (!quote) return '';
    const orderId = `ORD${Date.now()}`;
    const newOrder: Order = {
      id: orderId,
      quote,
      finalPrice: quote.price,
      status: 'pending_payment',
      estimatedDelivery: new Date(Date.now() + quote.deliveryDays * 24 * 60 * 60 * 1000),
      priceAdjustments: [],
      chatMessages: [
        {
          id: genId('m'),
          orderId,
          senderType: 'system',
          senderName: '系统',
          content: `订单已创建，配件：${quote.part.name}，供应商：${quote.supplier.companyName}，金额 ${quote.price.toFixed(2)} 元，物流方式：${quote.shippingMethod}`,
          images: [],
          isPromise: false,
          createdAt: new Date(),
        },
      ],
      createdAt: new Date(),
      notes: `物流方式：${quote.shippingMethod}，预计${quote.deliveryDays}天到货`,
    };
    set((state) => ({
      orders: [newOrder, ...state.orders],
      selectedOrderId: orderId,
    }));
    return orderId;
  },
  addChatMessage: (orderId, content, isPromise, images = []) => {
    const buyer = mockBuyer;
    const msg: ChatMessage = {
      id: genId('m'),
      orderId,
      senderType: 'buyer',
      senderName: buyer.name,
      content,
      images,
      isPromise,
      createdAt: new Date(),
    };
    set((state) => ({
      orders: state.orders.map(o =>
        o.id === orderId
          ? { ...o, chatMessages: [...o.chatMessages, msg] }
          : o
      ),
    }));
  },

  inspections: {},
  saveInspection: (orderId, items) => {
    set((state) => ({
      inspections: { ...state.inspections, [orderId]: items },
    }));
  },

  afterSales: mockAfterSales,
  selectedAfterSaleId: null,
  setSelectedAfterSaleId: (id) => set({ selectedAfterSaleId: id }),
  createAfterSale: (input) => {
    const order = get().orders.find(o => o.id === input.orderId);
    const id = `AS${Date.now()}`;
    const now = new Date();
    const timeline: AfterSaleTimelineItem[] = [
      {
        id: genId('t'),
        status: '售后申请已提交',
        description: `买家提交了${input.type === 'return' ? '退货退款' : input.type === 'exchange' ? '换货' : '仅退款'}申请`,
        operator: mockBuyer.name,
        time: now,
      },
      {
        id: genId('t'),
        status: '等待商家处理',
        description: '系统已通知商家处理',
        operator: '系统',
        time: now,
      },
    ];
    const newAfterSale: AfterSale = {
      id,
      orderId: input.orderId,
      orderNumber: input.orderId,
      partName: order?.quote.part.name || '未知配件',
      partImage: order?.quote.part.images[0] || '',
      type: input.type,
      reason: input.reason,
      description: input.description,
      evidenceImages: input.evidenceImages,
      inspectionItems: input.inspectionItems || [],
      status: 'pending',
      refundAmount: input.type === 'refund' || input.type === 'return' ? order?.finalPrice : undefined,
      timeline,
      buyerName: mockBuyer.name,
      supplierName: order?.quote.supplier.companyName || '未知供应商',
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({
      afterSales: [newAfterSale, ...state.afterSales],
      selectedAfterSaleId: id,
    }));
    if (order) {
      set((state) => ({
        orders: state.orders.map(o =>
          o.id === input.orderId ? { ...o, status: 'after_sale' as OrderStatus } : o
        ),
      }));
    }
    return id;
  },
  createAfterSaleFromInspection: (orderId, items) => {
    const failedItems = items.filter(i => i.passed === false);
    const evidenceImages = failedItems.flatMap(i => i.images);
    const reasonText = failedItems.map(i => i.name).join('、') || '收货核验不通过';
    const descText = failedItems.map(i => `${i.name}：${i.note || '不合格'}`).join('；');
    return get().createAfterSale({
      orderId,
      type: 'return',
      reason: reasonText,
      description: `收货核验发现以下问题：${descText}`,
      evidenceImages,
      inspectionItems: items,
    });
  },

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
  return useAppStore.getState().quotes.find(q => q.id === quoteId);
}

export function getOrderById(orderId: string) {
  return useAppStore.getState().orders.find(o => o.id === orderId);
}

export function getAfterSaleById(afterSaleId: string) {
  return useAppStore.getState().afterSales.find(a => a.id === afterSaleId);
}

export function getInspectionByOrderId(orderId: string) {
  return useAppStore.getState().inspections[orderId];
}
