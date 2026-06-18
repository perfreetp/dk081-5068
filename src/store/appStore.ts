import { create } from 'zustand';
import type { Quote, Order, AfterSale, PartCondition, PartCategory, InspectionItem, ChatMessage, AfterSaleType, OrderStatus, NegotiationRecord, AfterSaleTimelineItem, OrderEvent, OrderEventType } from '@/types';
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
  createOrdersFromQuotes: (quoteIds: string[]) => string[];
  addChatMessage: (orderId: string, content: string, isPromise: boolean, images?: string[]) => void;
  payOrder: (orderId: string) => void;
  shipOrder: (orderId: string, trackingCompany: string, trackingNumber: string) => void;
  deliverOrder: (orderId: string) => void;
  completeOrder: (orderId: string) => void;

  inspections: Record<string, InspectionItem[]>;
  saveInspection: (orderId: string, items: InspectionItem[]) => void;

  orderEvents: Record<string, OrderEvent[]>;
  addOrderEvent: (orderId: string, type: OrderEventType, title: string, description: string, operator?: string) => void;

  afterSales: AfterSale[];
  selectedAfterSaleId: string | null;
  setSelectedAfterSaleId: (id: string | null) => void;
  pendingAfterSaleOrderId: string | null;
  setPendingAfterSaleOrderId: (id: string | null) => void;
  createAfterSale: (input: CreateAfterSaleInput) => string;
  createAfterSaleFromInspection: (orderId: string, items: InspectionItem[]) => string;
  acceptAfterSale: (afterSaleId: string, note?: string) => void;
  rejectAfterSale: (afterSaleId: string, reason: string) => void;
  completeAfterSale: (afterSaleId: string, note?: string) => void;

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
let orderCounter = 0;
const genOrderId = () => {
  orderCounter += 1;
  const ts = Date.now().toString().slice(-8);
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `ORD${ts}${rand}${orderCounter.toString().padStart(3, '0')}`;
};

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
    const orderId = genOrderId();
    const now = new Date();
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
          createdAt: now,
        },
      ],
      createdAt: now,
      notes: `物流方式：${quote.shippingMethod}，预计${quote.deliveryDays}天到货`,
    };
    const createEvent: OrderEvent = {
      id: genId('e'),
      orderId,
      type: 'created',
      title: '订单创建',
      description: `下单配件：${quote.part.name}，供应商：${quote.supplier.companyName}，金额 ${quote.price.toFixed(2)} 元`,
      operator: mockBuyer.name,
      time: now,
    };
    set((state) => ({
      orders: [newOrder, ...state.orders],
      selectedOrderId: orderId,
      orderEvents: { ...state.orderEvents, [orderId]: [createEvent] },
    }));
    return orderId;
  },
  createOrdersFromQuotes: (quoteIds) => {
    const orderIds: string[] = [];
    quoteIds.forEach(quoteId => {
      const orderId = get().createOrderFromQuote(quoteId);
      if (orderId) orderIds.push(orderId);
    });
    return orderIds;
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

  payOrder: (orderId) => {
    const now = new Date();
    set((state) => ({
      orders: state.orders.map(o =>
        o.id === orderId
          ? {
              ...o,
              status: 'pending_shipment' as OrderStatus,
              paidAt: now,
              chatMessages: [
                ...o.chatMessages,
                {
                  id: genId('m'),
                  orderId,
                  senderType: 'system',
                  senderName: '系统',
                  content: '订单已支付，等待商家发货',
                  images: [],
                  isPromise: false,
                  createdAt: now,
                },
              ],
            }
          : o
      ),
      orderEvents: {
        ...state.orderEvents,
        [orderId]: [
          ...(state.orderEvents[orderId] || []),
          { id: genId('e'), orderId, type: 'paid' as OrderEventType, title: '买家付款', description: `支付金额 ${get().orders.find(o => o.id === orderId)?.finalPrice.toFixed(2) ?? ''} 元`, operator: mockBuyer.name, time: now },
        ],
      },
    }));
  },
  shipOrder: (orderId, trackingCompany, trackingNumber) => {
    const now = new Date();
    const order = get().orders.find(o => o.id === orderId);
    if (!order) return;
    const newLogistics: ChatMessage = {
      id: genId('m'),
      orderId,
      senderType: 'system',
      senderName: '系统',
      content: `商家已发货，物流公司：${trackingCompany}，运单号：${trackingNumber}`,
      images: [],
      isPromise: false,
      createdAt: now,
    };
    set((state) => ({
      orders: state.orders.map(o =>
        o.id === orderId
          ? {
              ...o,
              status: 'shipped' as OrderStatus,
              trackingCompany,
              trackingNumber,
              shippedAt: now,
              chatMessages: [...o.chatMessages, newLogistics],
            }
          : o
      ),
      orderEvents: {
        ...state.orderEvents,
        [orderId]: [
          ...(state.orderEvents[orderId] || []),
          { id: genId('e'), orderId, type: 'shipped' as OrderEventType, title: '商家发货', description: `物流公司：${trackingCompany}，运单号：${trackingNumber}`, operator: order.quote.supplier.companyName, time: now },
        ],
      },
    }));
  },
  deliverOrder: (orderId) => {
    const now = new Date();
    set((state) => ({
      orders: state.orders.map(o =>
        o.id === orderId
          ? {
              ...o,
              status: 'delivered' as OrderStatus,
              actualDeliveryDate: now,
              chatMessages: [
                ...o.chatMessages,
                {
                  id: genId('m'),
                  orderId,
                  senderType: 'system',
                  senderName: '系统',
                  content: '商品已送达，请进行收货核验',
                  images: [],
                  isPromise: false,
                  createdAt: now,
                },
              ],
            }
          : o
      ),
      orderEvents: {
        ...state.orderEvents,
        [orderId]: [
          ...(state.orderEvents[orderId] || []),
          { id: genId('e'), orderId, type: 'delivered' as OrderEventType, title: '确认签收', description: '商品已送达，等待收货核验', operator: mockBuyer.name, time: now },
        ],
      },
    }));
  },
  completeOrder: (orderId) => {
    const now = new Date();
    set((state) => ({
      orders: state.orders.map(o =>
        o.id === orderId
          ? {
              ...o,
              status: 'completed' as OrderStatus,
              chatMessages: [
                ...o.chatMessages,
                {
                  id: genId('m'),
                  orderId,
                  senderType: 'system',
                  senderName: '系统',
                  content: '订单已完成',
                  images: [],
                  isPromise: false,
                  createdAt: now,
                },
              ],
            }
          : o
      ),
      orderEvents: {
        ...state.orderEvents,
        [orderId]: [
          ...(state.orderEvents[orderId] || []),
          { id: genId('e'), orderId, type: 'completed' as OrderEventType, title: '订单完成', description: '订单已完成', operator: mockBuyer.name, time: now },
        ],
      },
    }));
  },

  inspections: {},
  saveInspection: (orderId, items) => {
    const passCount = items.filter(i => i.passed === true).length;
    const failCount = items.filter(i => i.passed === false).length;
    const now = new Date();
    set((state) => ({
      inspections: { ...state.inspections, [orderId]: items },
      orderEvents: {
        ...state.orderEvents,
        [orderId]: [
          ...(state.orderEvents[orderId] || []),
          { id: genId('e'), orderId, type: 'inspected' as OrderEventType, title: '收货核验', description: `通过 ${passCount} 项，不通过 ${failCount} 项`, operator: mockBuyer.name, time: now },
        ],
      },
    }));
  },

  orderEvents: {},
  addOrderEvent: (orderId, type, title, description, operator = '系统') => {
    const now = new Date();
    set((state) => ({
      orderEvents: {
        ...state.orderEvents,
        [orderId]: [
          ...(state.orderEvents[orderId] || []),
          { id: genId('e'), orderId, type, title, description, operator, time: now },
        ],
      },
    }));
  },

  afterSales: mockAfterSales,
  selectedAfterSaleId: null,
  setSelectedAfterSaleId: (id) => set({ selectedAfterSaleId: id }),
  pendingAfterSaleOrderId: null,
  setPendingAfterSaleOrderId: (id) => set({ pendingAfterSaleOrderId: id }),
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
      const typeLabel = input.type === 'return' ? '退货退款' : input.type === 'exchange' ? '换货' : '仅退款';
      set((state) => ({
        orders: state.orders.map(o =>
          o.id === input.orderId ? { ...o, status: 'after_sale' as OrderStatus } : o
        ),
        orderEvents: {
          ...state.orderEvents,
          [input.orderId]: [
            ...(state.orderEvents[input.orderId] || []),
            { id: genId('e'), orderId: input.orderId, type: 'after_sale' as OrderEventType, title: '发起售后', description: `发起${typeLabel}申请，售后单号 ${id.toUpperCase()}，原因：${input.reason}`, operator: mockBuyer.name, time: now },
          ],
        },
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

  acceptAfterSale: (afterSaleId, note) => {
    const now = new Date();
    const afterSale = get().afterSales.find(a => a.id === afterSaleId);
    if (!afterSale) return;
    const typeLabel = afterSale.type === 'return' ? '退货退款' : afterSale.type === 'exchange' ? '换货' : '仅退款';
    const timelineItem: AfterSaleTimelineItem = {
      id: genId('t'),
      status: '商家已同意',
      description: afterSale.type === 'return'
        ? `商家已同意退货退款${note ? `，备注：${note}` : '，请寄回商品'}`
        : afterSale.type === 'exchange'
        ? `商家已同意换货${note ? `，备注：${note}` : '，将尽快安排发货'}`
        : `商家已同意仅退款${note ? `，备注：${note}` : ''}`,
      operator: afterSale.supplierName,
      time: now,
    };
    set((state) => ({
      afterSales: state.afterSales.map(a =>
        a.id === afterSaleId
          ? { ...a, status: 'accepted', timeline: [...a.timeline, timelineItem], updatedAt: now }
          : a
      ),
      orderEvents: {
        ...state.orderEvents,
        [afterSale.orderId]: [
          ...(state.orderEvents[afterSale.orderId] || []),
          { id: genId('e'), orderId: afterSale.orderId, type: 'after_sale' as OrderEventType, title: '商家同意售后', description: `商家同意${typeLabel}申请${note ? `，备注：${note}` : ''}`, operator: afterSale.supplierName, time: now },
        ],
      },
    }));
  },
  rejectAfterSale: (afterSaleId, reason) => {
    const now = new Date();
    const afterSale = get().afterSales.find(a => a.id === afterSaleId);
    if (!afterSale) return;
    const timelineItem: AfterSaleTimelineItem = {
      id: genId('t'),
      status: '商家已拒绝',
      description: `商家拒绝了售后申请，原因：${reason}`,
      operator: afterSale.supplierName,
      time: now,
    };
    set((state) => ({
      afterSales: state.afterSales.map(a =>
        a.id === afterSaleId
          ? { ...a, status: 'rejected', timeline: [...a.timeline, timelineItem], updatedAt: now }
          : a
      ),
      orders: state.orders.map(o =>
        o.id === afterSale.orderId ? { ...o, status: 'completed' as OrderStatus } : o
      ),
      orderEvents: {
        ...state.orderEvents,
        [afterSale.orderId]: [
          ...(state.orderEvents[afterSale.orderId] || []),
          { id: genId('e'), orderId: afterSale.orderId, type: 'after_sale' as OrderEventType, title: '商家驳回售后', description: `商家驳回了售后申请，原因：${reason}`, operator: afterSale.supplierName, time: now },
        ],
      },
    }));
  },
  completeAfterSale: (afterSaleId, note) => {
    const now = new Date();
    const afterSale = get().afterSales.find(a => a.id === afterSaleId);
    if (!afterSale) return;
    const typeLabel = afterSale.type === 'return' ? '退款' : afterSale.type === 'exchange' ? '换货' : '退款';
    const timelineItem: AfterSaleTimelineItem = {
      id: genId('t'),
      status: '售后已完成',
      description: afterSale.type === 'return'
        ? `退款已完成${note ? `，备注：${note}` : ''}`
        : afterSale.type === 'exchange'
        ? `换货已完成${note ? `，备注：${note}` : ''}`
        : `退款已完成${note ? `，备注：${note}` : ''}`,
      operator: '系统',
      time: now,
    };
    set((state) => ({
      afterSales: state.afterSales.map(a =>
        a.id === afterSaleId
          ? { ...a, status: 'completed', timeline: [...a.timeline, timelineItem], updatedAt: now }
          : a
      ),
      orders: state.orders.map(o =>
        o.id === afterSale.orderId ? { ...o, status: 'completed' as OrderStatus } : o
      ),
      orderEvents: {
        ...state.orderEvents,
        [afterSale.orderId]: [
          ...(state.orderEvents[afterSale.orderId] || []),
          { id: genId('e'), orderId: afterSale.orderId, type: 'after_sale' as OrderEventType, title: `${typeLabel}完成`, description: `售后${typeLabel}已完成${note ? `，备注：${note}` : ''}`, operator: '系统', time: now },
        ],
      },
    }));
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

export function getAfterSalesByOrderId(orderId: string) {
  return useAppStore.getState().afterSales.filter(a => a.orderId === orderId);
}

export function getInspectionByOrderId(orderId: string) {
  return useAppStore.getState().inspections[orderId];
}

export function getOrderEventsByOrderId(orderId: string): OrderEvent[] {
  const events = useAppStore.getState().orderEvents[orderId] || [];
  if (events.length > 0) return events;
  const order = useAppStore.getState().orders.find(o => o.id === orderId);
  if (!order) return [];
  const derived: OrderEvent[] = [
    { id: 'd1', orderId, type: 'created', title: '订单创建', description: `下单配件：${order.quote.part.name}，供应商：${order.quote.supplier.companyName}`, operator: mockBuyer.name, time: order.createdAt },
  ];
  if (order.paidAt) {
    derived.push({ id: 'd2', orderId, type: 'paid', title: '买家付款', description: `支付金额 ${order.finalPrice.toFixed(2)} 元`, operator: mockBuyer.name, time: order.paidAt });
  }
  if (order.shippedAt) {
    derived.push({ id: 'd3', orderId, type: 'shipped', title: '商家发货', description: order.trackingNumber ? `物流公司：${order.trackingCompany}，运单号：${order.trackingNumber}` : '商家已发货', operator: order.quote.supplier.companyName, time: order.shippedAt });
  }
  if (order.actualDeliveryDate) {
    derived.push({ id: 'd4', orderId, type: 'delivered', title: '确认签收', description: '商品已送达', operator: mockBuyer.name, time: order.actualDeliveryDate });
  }
  if (order.status === 'completed') {
    derived.push({ id: 'd5', orderId, type: 'completed', title: '订单完成', description: '订单已完成', operator: mockBuyer.name, time: order.actualDeliveryDate || order.createdAt });
  }
  return derived;
}
