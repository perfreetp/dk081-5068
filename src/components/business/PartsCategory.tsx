import { useState } from 'react';
import { Plus, Trash2, Edit3, Check, X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { PartCategoryLabels, type PartCategory, type PartItem } from '@/types';

interface PartsCategoryProps {
  items: PartItem[];
  onChange?: (items: PartItem[]) => void;
}

const categoryOptions = [
  { value: 'all', label: '全部分类' },
  { value: 'engine', label: '发动机件' },
  { value: 'body', label: '钣金件' },
  { value: 'electrical', label: '电器件' },
  { value: 'chassis', label: '底盘件' },
  { value: 'transmission', label: '变速箱件' },
  { value: 'other', label: '其他配件' },
];

export function PartsCategory({ items, onChange }: PartsCategoryProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<PartItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<PartItem>({
    id: '',
    name: '',
    oemNumber: '',
    category: 'engine',
    quantity: 1,
    notes: '',
  });

  const groupedItems = items.reduce((acc, item) => {
    const cat = item.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, PartItem[]>);

  const filteredItems = activeCategory === 'all' ? items : items.filter(i => i.category === activeCategory);

  const handleAdd = () => {
    if (!newItem.name.trim()) return;
    const item: PartItem = {
      ...newItem,
      id: `pi_${Date.now()}`,
    };
    onChange?.([...items, item]);
    setNewItem({ id: '', name: '', oemNumber: '', category: 'engine', quantity: 1, notes: '' });
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    onChange?.(items.filter(i => i.id !== id));
  };

  const handleEdit = (item: PartItem) => {
    setEditingId(item.id);
    setEditValue({ ...item });
  };

  const handleSave = () => {
    if (!editValue) return;
    onChange?.(items.map(i => (i.id === editingId ? editValue : i)));
    setEditingId(null);
    setEditValue(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue(null);
  };

  const autoCategorize = () => {
    const keywords: Record<string, string[]> = {
      engine: ['发动机', '气门室盖', '缸体', '曲轴', '活塞', '气门', '喷油嘴', '油泵'],
      body: ['保险杠', '大灯', '尾灯', '翼子板', '车门', '机盖', '后盖', '叶子板'],
      electrical: ['电脑板', '传感器', '电机', '开关', '线束', '保险', '继电器'],
      chassis: ['减震器', '摆臂', '球头', '半轴', '刹车', '方向机'],
      transmission: ['变速箱', '阀体', '离合器', '差速器'],
    };

    const updated = items.map(item => {
      for (const [cat, words] of Object.entries(keywords)) {
        if (words.some(w => item.name.includes(w))) {
          return { ...item, category: cat as PartCategory };
        }
      }
      return item;
    });
    onChange?.(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">需求清单</h3>
          <span className="text-sm text-gray-500">共 {items.length} 件配件</span>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={autoCategorize}>
            智能分类
          </Button>
          <Button variant="accent" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setShowAddForm(true)}>
            添加配件
          </Button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categoryOptions.map(opt => {
          const count = opt.value === 'all' ? items.length : (groupedItems[opt.value]?.length || 0);
          return (
            <button
              key={opt.value}
              onClick={() => setActiveCategory(opt.value)}
              className={`px-4 py-2 text-sm font-medium border-2 transition-colors ${
                activeCategory === opt.value
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {opt.label}
              <span className={`ml-2 ${activeCategory === opt.value ? 'text-primary-200' : 'text-gray-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {showAddForm && (
        <div className="p-4 bg-gray-50 border border-gray-200 space-y-4">
          <h4 className="font-medium text-gray-900">添加配件</h4>
          <div className="grid grid-cols-5 gap-4">
            <Input
              label="配件名称"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              placeholder="如：气门室盖"
            />
            <Input
              label="原厂件号"
              value={newItem.oemNumber}
              onChange={(e) => setNewItem({ ...newItem, oemNumber: e.target.value })}
              placeholder="可选"
            />
            <Select
              label="配件分类"
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value as PartCategory })}
              options={categoryOptions.filter(o => o.value !== 'all')}
            />
            <Input
              label="数量"
              type="number"
              min={1}
              value={newItem.quantity.toString()}
              onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
            />
            <Input
              label="备注"
              value={newItem.notes}
              onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
              placeholder="如：需要喷漆"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowAddForm(false)}>
              取消
            </Button>
            <Button variant="primary" size="sm" onClick={handleAdd}>
              确定添加
            </Button>
          </div>
        </div>
      )}

      <div className="border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">配件名称</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">原厂件号</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">分类</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">数量</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">备注</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                {editingId === item.id ? (
                  <>
                    <td className="px-4 py-3">
                      <Input
                        value={editValue?.name || ''}
                        onChange={(e) => setEditValue({ ...editValue!, name: e.target.value })}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        value={editValue?.oemNumber || ''}
                        onChange={(e) => setEditValue({ ...editValue!, oemNumber: e.target.value })}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={editValue?.category || 'engine'}
                        onChange={(e) => setEditValue({ ...editValue!, category: e.target.value as PartCategory })}
                        options={categoryOptions.filter(o => o.value !== 'all')}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        min={1}
                        value={editValue?.quantity.toString() || '1'}
                        onChange={(e) => setEditValue({ ...editValue!, quantity: parseInt(e.target.value) || 1 })}
                        className="text-center"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        value={editValue?.notes || ''}
                        onChange={(e) => setEditValue({ ...editValue!, notes: e.target.value })}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={handleSave} className="p-1 text-green-600 hover:bg-green-50">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={handleCancel} className="p-1 text-gray-400 hover:bg-gray-100">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 font-mono">{item.oemNumber || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="badge bg-gray-100 text-gray-700">
                        {PartCategoryLabels[item.category as PartCategory] || item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-center">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{item.notes || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleEdit(item)} className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  暂无配件需求，点击"添加配件"开始
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
