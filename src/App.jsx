import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Overview from "./pages/Overview";
import SalesAnalysis from "./pages/SalesAnalysis";
import ReceivablePayable from "./pages/ReceivablePayable";
import Inventory from "./pages/Inventory";
import Freight from "./pages/Freight";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="sales" element={<SalesAnalysis />} />
          <Route path="ar-ap" element={<ReceivablePayable />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="freight" element={<Freight />} />
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
