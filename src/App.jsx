import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import RecoverPage from "./pages/RecoverPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import CategoriesPage from "./pages/CategoriesPage.jsx";
import SuppliersPage from "./pages/SuppliersPage.jsx";
import MovementsPage from "./pages/MovementsPage.jsx";
import StockPage from "./pages/StockPage.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import Sidebar from "./components/Sidebar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Toasts from "./components/Toasts.jsx";
import { useAuth } from "./context/AuthContext.jsx";

function AppLayout({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="app-layout">
      <button className="sidebar-toggle" onClick={() => setOpen(true)} aria-label="Abrir menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <div className={`sidebar-overlay ${open ? "open" : ""}`} onClick={() => setOpen(false)} />
      <Sidebar open={open} onClose={() => setOpen(false)} />
      {children}
    </div>
  );
}

function AuthRedirect({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<AuthRedirect><LoginPage /></AuthRedirect>} />
        <Route path="/cadastro" element={<AuthRedirect><RegisterPage /></AuthRedirect>} />
        <Route path="/recuperar" element={<AuthRedirect><RecoverPage /></AuthRedirect>} />
        <Route path="/" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
        <Route path="/produtos" element={<ProtectedRoute><AppLayout><ProductsPage /></AppLayout></ProtectedRoute>} />
        <Route path="/categorias" element={<ProtectedRoute><AppLayout><CategoriesPage /></AppLayout></ProtectedRoute>} />
        <Route path="/fornecedores" element={<ProtectedRoute><AppLayout><SuppliersPage /></AppLayout></ProtectedRoute>} />
        <Route path="/movimentacoes" element={<ProtectedRoute><AppLayout><MovementsPage /></AppLayout></ProtectedRoute>} />
        <Route path="/estoque" element={<ProtectedRoute><AppLayout><StockPage /></AppLayout></ProtectedRoute>} />
        <Route path="/usuarios" element={<ProtectedRoute adminOnly><AppLayout><UsersPage /></AppLayout></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toasts />
    </>
  );
}
