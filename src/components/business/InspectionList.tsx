import { useState } from 'react';
import { Check, X, ImagePlus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Upload } from '@/components/common/Upload';
import type { InspectionItem, InspectionCategory } from '@/types';

interface InspectionListProps {
  items: InspectionItem[];
  onChange?: (items: InspectionItem[]) => void;
  onSave?: (items: InspectionItem[]) => void;
  onSubmit?: (items: InspectionItem[], hasFailures: boolean) => void;
  readOnly?: boolean;
}

const categoryLabels: Record<InspectionCategory, string> = {
  appearance: '外观检查',
  interface: '接口检查',
  function: '功能检查',
};

const categoryColors: Record<InspectionCategory, string> = {
  appearance: 'bg-blue-50 text-blue-700 border-blue-200',
  interface: 'bg-green-50 text-green-700 border-green-200',
  function: 'bg-purple-50 text-purple-700 border-purple-200',
};

export function InspectionList({ items: initialItems, onChange, onSave, onSubmit, readOnly = false }: InspectionListProps) {
  const [items, setItems] = useState<InspectionItem[]>(initialItems);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const handleStatusChange = (id: string, passed: boolean | null) => {
    if (readOnly) return;
    const newItems = items.map(item =>
      item.id === id ? { ...item, passed } : item
    );
    setItems(newItems);
    onChange?.(newItems);
  };

  const handleNoteChange = (id: string, note: string) => {
    if (readOnly) return;
    const newItems = items.map(item =>
      item.id === id ? { ...item, note } : item
    );
    setItems(newItems);
    onChange?.(newItems);
  };

  const handleImagesChange = (id: string, images: string[]) => {
    if (readOnly) return;
    const newItems = items.map(item =>
      item.id === id ? { ...item, images } : item
    );
    setItems(newItems);
    onChange?.(newItems);
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<InspectionCategory, InspectionItem[]>);

  const getStatusIcon = (passed: boolean | null) => {
    if (passed === true) {
      return <Check className="w-4 h-4 text-white" />;
    }
    if (passed === false) {
      return <X className="w-4 h-4 text-white" />;
    }
    return null;
  };

  const getStatusStyle = (passed: boolean | null) => {
    if (passed === true) {
      return 'bg-green-500 border-green-500 hover:bg-green-600';
    }
    if (passed === false) {
      return 'bg-red-500 border-red-500 hover:bg-red-600';
    }
    return 'bg-gray-200 border-gray-300 hover:bg-gray-300';
  };

  const allChecked = items.every(item => item.passed !== null);
  const hasFailures = items.some(item => item.passed === false);
  const passCount = items.filter(item => item.passed === true).length;
  const failCount = items.filter(item => item.passed === false).length;
  const pendingCount = items.filter(item => item.passed === null).length;

  return (
    <div className="space-y-6">
      {!readOnly && (
        <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500"></div>
            <span className="text-sm text-gray-600">通过 {passCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500"></div>
            <span className="text-sm text-gray-600">不通过 {failCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-300"></div>
            <span className="text-sm text-gray-600">待核验 {pendingCount}</span>
          </div>
          {hasFailures && (
            <div className="ml-auto flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">存在不合格项，将自动发起售后</span>
            </div>
          )}
        </div>
      )}

      {(Object.keys(groupedItems) as InspectionCategory[]).map(category => (
        <div key={category} className="space-y-3">
          <div className={`inline-flex items-center px-3 py-1 text-xs font-medium border ${categoryColors[category]}`}>
            {categoryLabels[category]}
          </div>
          <div className="space-y-2">
            {groupedItems[category].map(item => (
              <div
                key={item.id}
                className={`border border-gray-200 bg-white transition-colors ${
                  item.passed === false ? 'border-red-200 bg-red-50/30' : ''
                } ${item.passed === true ? 'border-green-200 bg-green-50/30' : ''}`}
              >
                <div className="flex items-center gap-4 p-4">
                  {!readOnly ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusChange(item.id, true)}
                        className={`w-8 h-8 flex items-center justify-center border-2 transition-colors ${getStatusStyle(item.passed === true ? true : item.passed === false ? false : null)}`}
                      >
                        <Check className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(item.id, false)}
                        className={`w-8 h-8 flex items-center justify-center border-2 transition-colors ${getStatusStyle(item.passed === false ? false : item.passed === true ? true : null)}`}
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  ) : (
                    <div className={`w-8 h-8 flex items-center justify-center ${
                      item.passed === true ? 'bg-green-500' : item.passed === false ? 'bg-red-500' : 'bg-gray-300'
                    }`}>
                      {getStatusIcon(item.passed)}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    {item.note && readOnly && (
                      <div className="text-sm text-gray-500 mt-1">{item.note}</div>
                    )}
                  </div>
                  {!readOnly && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                    >
                      {expandedItem === item.id ? '收起' : '详情'}
                    </Button>
                  )}
                  {readOnly && item.images.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                    >
                      查看图片 ({item.images.length})
                    </Button>
                  )}
                </div>

                {expandedItem === item.id && (
                  <div className="px-4 pb-4 pt-0 space-y-4 border-t border-gray-100">
                    {!readOnly && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          备注说明
                        </label>
                        <textarea
                          value={item.note}
                          onChange={(e) => handleNoteChange(item.id, e.target.value)}
                          placeholder="请描述检查情况..."
                          className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          rows={3}
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <ImagePlus className="w-4 h-4 inline mr-1" />
                        凭证照片
                      </label>
                      {readOnly ? (
                        <div className="flex flex-wrap gap-2">
                          {item.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt=""
                              className="w-20 h-20 object-cover border border-gray-200"
                            />
                          ))}
                          {item.images.length === 0 && (
                            <span className="text-sm text-gray-400">暂无照片</span>
                          )}
                        </div>
                      ) : (
                        <Upload
                          maxFiles={5}
                          initialImages={item.images}
                          onChange={(files) => {
                            const urls = files.map(f => URL.createObjectURL(f));
                            handleImagesChange(item.id, urls);
                          }}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {!readOnly && (
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" disabled={!allChecked} onClick={() => onSave?.(items)}>
            保存核验记录
          </Button>
          <Button variant="accent" disabled={!allChecked} onClick={() => onSubmit?.(items, hasFailures)}>
            {hasFailures ? '提交异常并发起售后' : '确认核验通过'}
          </Button>
        </div>
      )}
    </div>
  );
}
