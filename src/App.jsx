import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Underwriting from "./pages/Underwriting";
import Dashboard from "./pages/Dashboard";
import Cases from "./pages/Cases";

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Underwriting />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cases" element={<Cases />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}
