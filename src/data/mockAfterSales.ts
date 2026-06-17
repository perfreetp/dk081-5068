import type { AfterSale, InspectionItem, AfterSaleTimelineItem } from '@/types';

const mockInspectionItems: InspectionItem[] = [
  { id: 'ii1', name: '外观完整性', category: 'appearance', passed: false, note: '左侧有3cm划痕，与描述不符', images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=car%20bumper%20scratch%20damage&image_size=square'] },
  { id: 'ii2', name: '安装接口匹配', category: 'interface', passed: true, note: '接口完好，安装孔位正确', images: [] },
  { id: 'ii3', name: '固定卡扣完整性', category: 'interface', passed: false, note: '右下角卡扣断裂', images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=broken%20plastic%20clip%20car%20part&image_size=square'] },
  { id: 'ii4', name: '表面漆面完好度', category: 'appearance', passed: null, note: '', images: [] },
  { id: 'ii5', name: '线束插头完好', category: 'interface', passed: null, note: '', images: [] },
];

const mockTimeline: AfterSaleTimelineItem[] = [
  { id: 't1', status: '售后申请已提交', description: '买家提交了退换货申请', operator: '张师傅', time: new Date('2024-01-18T14:00:00') },
  { id: 't2', status: '等待商家处理', description: '系统已通知商家处理', operator: '系统', time: new Date('2024-01-18T14:01:00') },
  { id: 't3', status: '商家审核中', description: '商家正在核验相关证据', operator: '李经理', time: new Date('2024-01-18T15:30:00') },
];

export const mockAfterSales: AfterSale[] = [
  {
    id: 'as001',
    orderId: 'ORD202401120001',
    orderNumber: 'ORD202401120001',
    partName: '前保险杠蒙皮',
    partImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=car%20front%20bumper%20black%20plastic&image_size=square',
    type: 'return',
    reason: '配件与描述不符',
    description: '收到的保险杠左侧有明显划痕，并且右下角卡扣断裂，无法正常安装。商家描述说只有轻微划痕，但实际情况要严重很多。',
    evidenceImages: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=car%20bumper%20scratch%20damage&image_size=square',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=broken%20plastic%20clip%20car%20part&image_size=square',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=car%20part%20damage%20comparison&image_size=square',
    ],
    inspectionItems: mockInspectionItems,
    status: 'processing',
    refundAmount: 450,
    refundReason: '商品与描述不符，支持全额退款',
    timeline: mockTimeline,
    buyerName: '张师傅',
    supplierName: '鑫源拆车件商行',
    createdAt: new Date('2024-01-18T14:00:00'),
    updatedAt: new Date('2024-01-18T15:30:00'),
  },
  {
    id: 'as002',
    orderId: 'ORD202401080001',
    orderNumber: 'ORD202401080001',
    partName: '发动机机脚胶',
    partImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=car%20engine%20mount%20bushing&image_size=square',
    type: 'refund',
    reason: '配件质量问题',
    description: '装机后发现怠速抖动严重，检查发现机脚胶缓冲块已经老化开裂。',
    evidenceImages: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cracked%20rubber%20engine%20mount&image_size=square',
    ],
    inspectionItems: [
      { id: 'ii6', name: '橡胶件完整性', category: 'function', passed: false, note: '缓冲块有明显裂纹', images: [] },
      { id: 'ii7', name: '金属件完整性', category: 'appearance', passed: true, note: '金属支架完好', images: [] },
    ],
    status: 'completed',
    refundAmount: 280,
    refundReason: '质量问题，全额退款',
    timeline: [
      { id: 't4', status: '售后申请已提交', description: '买家提交了退款申请', operator: '张师傅', time: new Date('2024-01-12T10:00:00') },
      { id: 't5', status: '商家同意退款', description: '商家已审核通过', operator: '刘老板', time: new Date('2024-01-12T14:00:00') },
      { id: 't6', status: '退款已完成', description: '¥280.00 已退回原支付账户', operator: '系统', time: new Date('2024-01-12T16:00:00') },
    ],
    buyerName: '张师傅',
    supplierName: '众诚拆车件总汇',
    createdAt: new Date('2024-01-12T10:00:00'),
    updatedAt: new Date('2024-01-12T16:00:00'),
  },
];

export const inspectionTemplates = {
  default: [
    { name: '外观完整性', category: 'appearance' as const },
    { name: '表面无破损', category: 'appearance' as const },
    { name: '漆面完好度', category: 'appearance' as const },
    { name: '安装接口匹配', category: 'interface' as const },
    { name: '固定卡扣完好', category: 'interface' as const },
    { name: '线束插头完好', category: 'interface' as const },
    { name: '功能测试正常', category: 'function' as const },
  ],
  engine: [
    { name: '外观无漏油', category: 'appearance' as const },
    { name: '缸体无裂痕', category: 'appearance' as const },
    { name: '接口密封完好', category: 'interface' as const },
    { name: '传感器插头完好', category: 'interface' as const },
    { name: '转动顺畅', category: 'function' as const },
    { name: '缸压测试', category: 'function' as const },
  ],
  electrical: [
    { name: '外壳无破损', category: 'appearance' as const },
    { name: '插头针脚完好', category: 'interface' as const },
    { name: '线束无破损', category: 'interface' as const },
    { name: '通电测试正常', category: 'function' as const },
    { name: '功能测试正常', category: 'function' as const },
  ],
  body: [
    { name: '表面无凹陷', category: 'appearance' as const },
    { name: '漆面完好度', category: 'appearance' as const },
    { name: '安装孔位正确', category: 'interface' as const },
    { name: '卡扣完好', category: 'interface' as const },
  ],
};
