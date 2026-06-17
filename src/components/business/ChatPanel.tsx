import { useState, useRef, useEffect } from 'react';
import { Send, Image, Paperclip, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import type { ChatMessage, Supplier } from '@/types';
import { formatDateTime } from '@/utils/format';
import { mockBuyer } from '@/data/mockVehicles';

interface ChatPanelProps {
  supplier?: Supplier;
  orderId?: string;
  messages?: ChatMessage[];
  supplierName?: string;
  onSend?: (content: string, isPromise: boolean) => void;
  onUploadImage?: (file: File) => void;
}

export function ChatPanel({ supplier, orderId, messages = [], supplierName, onSend, onUploadImage }: ChatPanelProps) {
  const displayName = supplierName || supplier?.companyName || '供应商';
  const [newMessage, setNewMessage] = useState('');
  const [isPromise, setIsPromise] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    onSend?.(newMessage, isPromise);
    setNewMessage('');
    setIsPromise(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadImage?.(file);
    }
    e.target.value = '';
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-lg">
            🏭
          </div>
          <div>
            <div className="font-medium text-gray-900">{displayName}</div>
            <div className="text-xs text-green-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              在线
            </div>
          </div>
        </div>
        <Badge variant="info">聊天记录已永久保存</Badge>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((msg) => {
          const isBuyer = msg.senderType === 'buyer';
          const isSystem = msg.senderType === 'system';

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center">
                <div className="px-4 py-1.5 bg-gray-200 text-gray-600 text-xs rounded-full">
                  {msg.content}
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className={`flex gap-3 ${isBuyer ? 'flex-row-reverse' : ''}`}>
              <div className="flex-shrink-0">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg ${
                  isBuyer ? 'bg-primary-100' : 'bg-accent-100'
                }`}>
                  {isBuyer ? mockBuyer.avatar : '🏭'}
                </div>
              </div>
              <div className={`max-w-[70%] ${isBuyer ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`text-xs text-gray-500 mb-1 ${isBuyer ? 'text-right' : ''}`}>
                  {msg.senderName} · {formatDateTime(msg.createdAt)}
                </div>
                {msg.isPromise && (
                  <div className="mb-1">
                    <Badge variant="accent" size="sm" icon={<ShieldCheck className="w-3 h-3 mr-1" />}>
                      承诺内容
                    </Badge>
                  </div>
                )}
                <div className={`px-4 py-2 ${
                  isBuyer
                    ? 'bg-primary-600 text-white rounded-br-none'
                    : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  {msg.images.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {msg.images.map((img, idx) => (
                        <img key={idx} src={img} alt="" className="w-24 h-24 object-cover border border-white/20" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPromise}
              onChange={(e) => setIsPromise(e.target.checked)}
              className="w-4 h-4 text-accent-600 focus:ring-accent-500"
            />
            <span className="text-sm text-gray-600">标记为承诺</span>
          </label>
          {isPromise && (
            <span className="text-xs text-accent-600">承诺内容将作为纠纷仲裁依据</span>
          )}
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入消息，按 Enter 发送..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title="上传图片"
            >
              <Image className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title="附件"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <Button variant="primary" onClick={handleSend} disabled={!newMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
