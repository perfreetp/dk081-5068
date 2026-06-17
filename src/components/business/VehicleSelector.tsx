import { useState } from 'react';
import { Car, Search, ChevronRight } from 'lucide-react';
import { Select } from '@/components/common/Select';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { mockBrands, mockVehicles } from '@/data/mockVehicles';
import type { Vehicle, VehicleBrand } from '@/types';

interface VehicleSelectorProps {
  value?: Vehicle | null;
  selectedVehicle?: Vehicle;
  brands?: VehicleBrand[];
  onChange?: (vehicle: Vehicle) => void;
  onSelect?: (vehicle: Vehicle) => void;
}

export function VehicleSelector({ value, selectedVehicle, brands, onChange, onSelect }: VehicleSelectorProps) {
  const vehicle = value ?? selectedVehicle;
  const brandList = brands ?? mockBrands;
  
  const [brand, setBrand] = useState(vehicle?.brand || '');
  const [series, setSeries] = useState(vehicle?.series || '');
  const [year, setYear] = useState<string>(vehicle?.year.toString() || '');
  const [model, setModel] = useState(vehicle?.model || '');
  const [vin, setVin] = useState(vehicle?.vin || '');
  const [searchMode, setSearchMode] = useState<'select' | 'vin'>('select');

  const currentBrand = brandList.find(b => b.id === brand);
  const currentSeries = currentBrand?.series.find(s => s.id === series);

  const handleSelect = (v: Vehicle) => {
    if (onSelect) {
      onSelect(v);
    } else if (onChange) {
      onChange(v);
    }
  };

  const handleVinSearch = () => {
    if (vin.length === 17) {
      const matched = mockVehicles.find(v => v.vin === vin);
      if (matched) {
        handleSelect(matched);
        setBrand(matched.brand);
        setSeries(matched.series);
        setYear(matched.year.toString());
        setModel(matched.model);
      }
    }
  };

  const handleConfirm = () => {
    const matched = mockVehicles.find(
      v => v.brand === currentBrand?.name && v.series === currentSeries?.name && v.year.toString() === year && v.model === model
    );
    if (matched) {
      handleSelect(matched);
    }
  };

  const brandOptions = [
    { value: '', label: '请选择品牌' },
    ...brandList.map(b => ({ value: b.id, label: `${b.logo} ${b.name}` })),
  ];

  const seriesOptions = [
    { value: '', label: '请选择车系' },
    ...(currentBrand?.series.map(s => ({ value: s.id, label: s.name })) || []),
  ];

  const yearOptions = [
    { value: '', label: '请选择年份' },
    ...(currentSeries?.years.map(y => ({ value: y.toString(), label: `${y}款` })) || []),
  ];

  const modelOptions = [
    { value: '', label: '请选择型号' },
    ...(currentSeries?.models.map(m => ({ value: m, label: m })) || []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex bg-gray-100 p-1">
          <button
            onClick={() => setSearchMode('select')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              searchMode === 'select' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600'
            }`}
          >
            按车型选择
          </button>
          <button
            onClick={() => setSearchMode('vin')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              searchMode === 'vin' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600'
            }`}
          >
            VIN码查询
          </button>
        </div>
      </div>

      {searchMode === 'vin' ? (
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                label="车辆VIN码"
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
                placeholder="请输入17位VIN码"
                maxLength={17}
                icon={Car}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleVinSearch} icon={<Search className="w-4 h-4" />}>
                解析
              </Button>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            VIN码位于前挡风玻璃左下角或驾驶员侧B柱铭牌上
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          <Select label="品牌" value={brand} onChange={(e) => { setBrand(e.target.value); setSeries(''); setYear(''); setModel(''); }} options={brandOptions} />
          <Select label="车系" value={series} onChange={(e) => { setSeries(e.target.value); setYear(''); setModel(''); }} options={seriesOptions} disabled={!brand} />
          <Select label="年款" value={year} onChange={(e) => { setYear(e.target.value); setModel(''); }} options={yearOptions} disabled={!series} />
          <Select label="型号" value={model} onChange={(e) => setModel(e.target.value)} options={modelOptions} disabled={!year} />
        </div>
      )}

      {vehicle && (
        <div className="p-4 bg-primary-50 border border-primary-200">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white border border-primary-200 flex items-center justify-center">
              <Car className="w-8 h-8 text-primary-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2">
                {vehicle.brand} {vehicle.series} {vehicle.year} {vehicle.model}
              </h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">VIN：</span>
                  <span className="text-gray-900 font-mono">{vehicle.vin}</span>
                </div>
                <div>
                  <span className="text-gray-500">发动机：</span>
                  <span className="text-gray-900">{vehicle.engine}</span>
                </div>
                <div>
                  <span className="text-gray-500">变速箱：</span>
                  <span className="text-gray-900">{vehicle.transmission}</span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-primary-600" />
          </div>
        </div>
      )}

      {!vehicle && brand && series && year && model && (
        <div className="flex justify-end">
          <Button onClick={handleConfirm} variant="accent">
            确认车型
          </Button>
        </div>
      )}
    </div>
  );
}
