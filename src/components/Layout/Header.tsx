import { Bell, Search, User } from 'lucide-react';
import { mockBuyer } from '@/data/mockVehicles';

export function Header() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary-600 flex items-center justify-center text-white font-bold text-lg">
            配
          </div>
          <span className="text-xl font-bold text-gray-900">汽配询价平台</span>
        </div>
        <div className="relative ml-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索配件名称、OEM号、VIN码..."
            className="w-96 pl-10 pr-4 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{mockBuyer.name}</div>
            <div className="text-xs text-gray-500">{mockBuyer.shopName}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
