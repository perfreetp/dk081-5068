import { FileText, Warehouse, Store, ShoppingCart, Headphones } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';

const menuItems = [
  { id: 'inquiry', label: '询价单', icon: FileText, path: '/inquiry' },
  { id: 'parts-hall', label: '件源大厅', icon: Warehouse, path: '/parts-hall' },
  { id: 'supplier', label: '供应商', icon: Store, path: '/supplier' },
  { id: 'orders', label: '订单管理', icon: ShoppingCart, path: '/orders' },
  { id: 'after-sales', label: '售后服务', icon: Headphones, path: '/after-sales' },
];

export function Sidebar() {
  const { currentPage, setCurrentPage } = useAppStore();
  const location = useLocation();

  const getCurrentPageId = () => {
    const path = location.pathname;
    if (path.includes('inquiry')) return 'inquiry';
    if (path.includes('parts-hall')) return 'parts-hall';
    if (path.includes('supplier')) return 'supplier';
    if (path.includes('orders')) return 'orders';
    if (path.includes('after-sales')) return 'after-sales';
    return 'inquiry';
  };

  const activePage = currentPage || getCurrentPageId();

  return (
    <aside className="w-60 bg-white border-r border-gray-200 h-[calc(100vh-4rem)] sticky top-16">
      <nav className="py-4">
        <div className="px-4 mb-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">功能导航</h3>
        </div>
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                  {item.label}
                  {item.id === 'orders' && (
                    <span className="ml-auto bg-accent-500 text-white text-xs px-2 py-0.5">5</span>
                  )}
                  {item.id === 'after-sales' && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5">2</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-8 px-6">
          <div className="p-4 bg-primary-50 border border-primary-100">
            <h4 className="text-sm font-semibold text-primary-700 mb-2">新手上路</h4>
            <p className="text-xs text-primary-600 mb-3">3分钟学会使用平台快速采购配件</p>
            <button className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium">
              查看教程 →
            </button>
          </div>
        </div>
      </nav>
    </aside>
  );
}
