import { NavLink, useNavigate } from "react-router-dom";
import { Icons } from "../utils/icons.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Sidebar() {
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const sections = [
    { title: "Menu", items: [{ to: "/", label: "Dashboard", icon: <Icons.Grid />, end: true }] },
    { title: "Cadastros", items: [
      { to: "/produtos", label: "Produtos", icon: <Icons.Box /> },
      { to: "/categorias", label: "Categorias", icon: <Icons.Tag /> },
      { to: "/fornecedores", label: "Fornecedores", icon: <Icons.Truck /> },
    ]},
    { title: "Operações", items: [
      { to: "/movimentacoes", label: "Movimentações", icon: <Icons.Repeat /> },
      { to: "/estoque", label: "Estoque", icon: <Icons.Archive /> },
    ]},
  ];
  if (isAdmin) sections.push({ title: "Sistema", items: [{ to: "/usuarios", label: "Usuários", icon: <Icons.Users /> }] });

  const initials = (currentUser?.name || "?").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  function handleLogout() { logout(); navigate("/login"); }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo"><Icons.Box /></div>
        <span className="sidebar-brand">SmartStock</span>
      </div>
      <nav className="sidebar-nav">
        {sections.map((sec) => (
          <div key={sec.title}>
            <div className="nav-section-title">{sec.title}</div>
            {sec.items.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="user-card" onClick={handleLogout} title="Sair">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="name">{currentUser?.name}</div>
            <div className="role">{currentUser?.role === "ADMIN" ? "Admin" : "Usuário"}</div>
          </div>
          <span style={{ color: "var(--text-muted)" }}><Icons.LogOut /></span>
        </button>
      </div>
    </aside>
  );
}
