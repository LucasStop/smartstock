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
  return (<div className="app-layout"><Sidebar />{children}</div>);
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
