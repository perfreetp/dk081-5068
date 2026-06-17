export function formatPrice(price: number): string {
  return `¥${price.toFixed(2)}`;
}

export function formatDate(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateTime(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function formatMileage(mileage: number): string {
  if (mileage === 0) return '全新';
  if (mileage >= 10000) {
    return `${(mileage / 10000).toFixed(1)}万公里`;
  }
  return `${mileage}公里`;
}

export function formatWarranty(months: number): string {
  if (months === 0) return '无质保';
  if (months < 12) return `${months}个月`;
  const years = Math.floor(months / 12);
  const remainMonths = months % 12;
  if (remainMonths === 0) return `${years}年`;
  return `${years}年${remainMonths}个月`;
}

export function formatDeliveryDays(days: number): string {
  if (days === 0) return '当日达';
  if (days === 1) return '次日达';
  return `${days}天到货`;
}

export function formatDaysAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return `${days}天前`;
  if (days < 30) return `${Math.floor(days / 7)}周前`;
  if (days < 365) return `${Math.floor(days / 30)}个月前`;
  return `${Math.floor(days / 365)}年前`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function maskPhone(phone: string): string {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

export function maskVin(vin: string): string {
  if (vin.length <= 8) return vin;
  return vin.slice(0, 6) + '****' + vin.slice(-4);
}
