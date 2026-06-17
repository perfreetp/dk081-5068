import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Header } from "@/components/Layout/Header";
import { Sidebar } from "@/components/Layout/Sidebar";
import InquiryPage from "@/pages/InquiryPage";
import PartsHallPage from "@/pages/PartsHallPage";
import SupplierPage from "@/pages/SupplierPage";
import OrdersPage from "@/pages/OrdersPage";
import AfterSalesPage from "@/pages/AfterSalesPage";

function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/inquiry" replace />} />
            <Route path="/inquiry" element={<InquiryPage />} />
            <Route path="/parts-hall" element={<PartsHallPage />} />
            <Route path="/supplier" element={<SupplierPage />} />
            <Route path="/supplier/:id" element={<SupplierPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/after-sales" element={<AfterSalesPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </Router>
  );
}
