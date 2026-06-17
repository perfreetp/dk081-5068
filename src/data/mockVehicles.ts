import type { Vehicle, VehicleBrand, Buyer, Inquiry, PartItem } from '@/types';

export const mockBrands: VehicleBrand[] = [
  {
    id: 'b1',
    name: '大众',
    logo: '🚗',
    series: [
      { id: 's1', name: '帕萨特', brandId: 'b1', years: [2019, 2020, 2021, 2022, 2023], models: ['330TSI 豪华版', '380TSI 旗舰版'] },
      { id: 's2', name: '迈腾', brandId: 'b1', years: [2020, 2021, 2022, 2023], models: ['330TSI 领先版', '380TSI 尊贵版'] },
    ],
  },
  {
    id: 'b2',
    name: '丰田',
    logo: '🚙',
    series: [
      { id: 's3', name: '凯美瑞', brandId: 'b2', years: [2020, 2021, 2022, 2023], models: ['2.5G 豪华版', '2.5S 锋尚版'] },
      { id: 's4', name: '汉兰达', brandId: 'b2', years: [2021, 2022, 2023], models: ['2.0T 四驱尊贵版', '2.5L 双擎尊贵版'] },
    ],
  },
  {
    id: 'b3',
    name: '宝马',
    logo: '🚘',
    series: [
      { id: 's5', name: '3系', brandId: 'b3', years: [2020, 2021, 2022, 2023], models: ['325Li M运动套装', '330Li xDrive'] },
      { id: 's6', name: '5系', brandId: 'b3', years: [2021, 2022, 2023], models: ['525Li M运动套装', '530Li 尊享型'] },
    ],
  },
  {
    id: 'b4',
    name: '奔驰',
    logo: '🏎️',
    series: [
      { id: 's7', name: 'C级', brandId: 'b4', years: [2020, 2021, 2022, 2023], models: ['C200L 运动版', 'C260L 星耀臻藏版'] },
      { id: 's8', name: 'E级', brandId: 'b4', years: [2021, 2022, 2023], models: ['E300L 豪华型', 'E300L 尊贵型'] },
    ],
  },
  {
    id: 'b5',
    name: '奥迪',
    logo: '🚕',
    series: [
      { id: 's9', name: 'A4L', brandId: 'b5', years: [2020, 2021, 2022, 2023], models: ['40 TFSI 时尚动感型', '45 TFSI 臻选动感型'] },
      { id: 's10', name: 'A6L', brandId: 'b5', years: [2021, 2022, 2023], models: ['45 TFSI 臻选动感型', '55 TFSI quattro 旗舰动感型'] },
    ],
  },
];

export const mockVehicles: Vehicle[] = [
  { id: 'v1', brand: '大众', series: '帕萨特', year: 2021, model: '330TSI 豪华版', vin: 'LFV2A21K8M4000001', engine: 'EA888-DPL', transmission: '7速双离合' },
  { id: 'v2', brand: '丰田', series: '凯美瑞', year: 2022, model: '2.5G 豪华版', vin: 'LVGBE40K8NG000002', engine: 'A25A', transmission: '8AT' },
  { id: 'v3', brand: '宝马', series: '3系', year: 2022, model: '325Li M运动套装', vin: 'LBV3G3108NM000003', engine: 'B48B20B', transmission: '8AT' },
];

export const mockBuyer: Buyer = {
  id: 'buyer1',
  name: '张师傅',
  shopName: '诚信汽修厂',
  phone: '138****8888',
  address: '北京市朝阳区青年路128号',
  avatar: '👨‍🔧',
};

const mockPartItems: PartItem[] = [
  { id: 'pi1', name: '发动机气门室盖', oemNumber: '06K103469L', category: 'engine', quantity: 1, notes: '有轻微渗油' },
  { id: 'pi2', name: '前保险杠蒙皮', oemNumber: '3G0807217GRU', category: 'body', quantity: 1, notes: '需要喷漆' },
  { id: 'pi3', name: '前大灯总成（左）', oemNumber: '3G0941035C', category: 'electrical', quantity: 1, notes: 'LED大灯' },
];

export const mockInquiries: Inquiry[] = [
  {
    id: 'inq001',
    vin: 'LFV2A21K8M4000001',
    vehicle: mockVehicles[0],
    buyer: mockBuyer,
    description: '车辆高速行驶时发动机有异响，气门室盖渗油，前保险杠有剐蹭需要更换',
    faultCodes: ['P0300', 'P0301', 'P0302'],
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=car%20engine%20valve%20cover%20oil%20leak&image_size=square',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=car%20front%20bumper%20scratch&image_size=square',
    ],
    partItems: mockPartItems,
    selectedSupplierIds: ['sup1', 'sup2', 'sup3'],
    createdAt: new Date('2024-01-15T10:30:00'),
    status: 'quoted',
  },
  {
    id: 'inq002',
    vin: 'LVGBE40K8NG000002',
    vehicle: mockVehicles[1],
    buyer: mockBuyer,
    description: '变速箱顿挫，需要检查阀体',
    faultCodes: ['P0700', 'P0730'],
    images: [],
    partItems: [{ id: 'pi4', name: '变速箱阀体', oemNumber: '3541006010', category: 'transmission', quantity: 1 }],
    selectedSupplierIds: ['sup1', 'sup4'],
    createdAt: new Date('2024-01-16T14:20:00'),
    status: 'sent',
  },
];
