export * from './vehicle';
export * from './supplier';
export * from './parts';
export * from './order';
export * from './aftersale';

export type PartCondition = 'new' | 'used' | 'remanufactured';
export type PartCategory = 'engine' | 'body' | 'electrical' | 'chassis' | 'transmission' | 'other';
export type OrderStatus = 'pending_payment' | 'pending_shipment' | 'shipped' | 'delivered' | 'completed' | 'after_sale';
export type AfterSaleStatus = 'pending' | 'processing' | 'accepted' | 'rejected' | 'completed';
export type AfterSaleType = 'return' | 'exchange' | 'refund';
export type InspectionCategory = 'appearance' | 'interface' | 'function';

export const PartConditionLabels: Record<PartCondition, string> = {
  new: '全新件',
  used: '拆车件',
  remanufactured: '再制造',
};

export const PartCategoryLabels: Record<PartCategory, string> = {
  engine: '发动机件',
  body: '钣金件',
  electrical: '电器件',
  chassis: '底盘件',
  transmission: '变速箱件',
  other: '其他配件',
};

export const OrderStatusLabels: Record<OrderStatus, string> = {
  pending_payment: '待付款',
  pending_shipment: '待发货',
  shipped: '运输中',
  delivered: '待核验',
  completed: '已完成',
  after_sale: '售后中',
};

export const AfterSaleStatusLabels: Record<AfterSaleStatus, string> = {
  pending: '待处理',
  processing: '处理中',
  accepted: '已同意',
  rejected: '已拒绝',
  completed: '已完成',
};

export const AfterSaleTypeLabels: Record<AfterSaleType, string> = {
  return: '退货退款',
  exchange: '换货',
  refund: '仅退款',
};
