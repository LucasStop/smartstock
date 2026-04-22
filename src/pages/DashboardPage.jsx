import { useMemo } from "react";
import { Icons } from "../utils/icons.jsx";
import { useData } from "../context/DataContext.jsx";
import { formatCurrency, formatDate } from "../utils/storage.js";

export default function DashboardPage() {
  const { stats, movements, getProduct } = useData();

  const criticalItem = useMemo(() => {
    if (!stats.lowStockItems.length) return null;
    return [...stats.lowStockItems].sort((a, b) => a.quantity - b.quantity)[0];
  }, [stats.lowStockItems]);

  const chartData = useMemo(() => {
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const buckets = Array.from({ length: 7 }, () => ({ entry: 0, exit: 0 }));
    const now = new Date();
    movements.forEach((m) => {
      const d = new Date(m.date);
      const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
      if (diff < 7 && diff >= 0) {
        const idx = d.getDay();
        if (m.quantity > 0) buckets[idx].entry += m.quantity;
        else buckets[idx].exit += Math.abs(m.quantity);
      }
    });
    return days.map((day, i) => ({ day, ...buckets[i] }));
  }, [movements]);

  const maxVal = Math.max(70, ...chartData.flatMap((d) => [d.entry, d.exit]));

  return (
    <div className="main-content">
      <div className="page-header">
        <div><h1>Dashboard</h1><p className="page-desc">Visão geral do seu estoque</p></div>
      </div>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon blue"><Icons.Box /></div><div className="stat-info"><h3>{stats.totalProducts}</h3><p>Total de Produtos</p></div></div>
        <div className="stat-card"><div className="stat-icon purple"><Icons.Tag /></div><div className="stat-info"><h3>{stats.totalCategories}</h3><p>Categorias</p></div></div>
        <div className="stat-card"><div className="stat-icon teal"><Icons.Truck /></div><div className="stat-info"><h3>{stats.totalSuppliers}</h3><p>Fornecedores</p></div></div>
        <div className="stat-card"><div className="stat-icon green"><Icons.DollarSign /></div><div className="stat-info"><h3>{formatCurrency(stats.stockValue)}</h3><p>Valor em Estoque</p></div></div>
        <div className="stat-card"><div className="stat-icon red"><Icons.AlertTriangle /></div><div className="stat-info"><h3>{stats.lowStockCount}</h3><p>Estoque Baixo</p></div></div>
        <div className="stat-card"><div className="stat-icon blue"><Icons.Repeat /></div><div className="stat-info"><h3>{stats.monthMovements}</h3><p>Movimentações do Mês</p></div></div>
      </div>
      {criticalItem && (
        <div className="stock-alert-banner">
          <div className="stock-alert-banner-icon"><Icons.AlertTriangle /></div>
          <div className="stock-alert-banner-body">
            <h3>Estoque de: {criticalItem.name} — BAIXO</h3>
            <p>Quantidade atual: <strong>{criticalItem.quantity}</strong> &nbsp;|&nbsp; Mínimo: <strong>{criticalItem.minQuantity}</strong></p>
          </div>
        </div>
      )}
      <div className="two-col">
        <div className="card">
          <div className="card-header"><h3><Icons.BarChart /> Movimentações — Últimos 7 dias</h3></div>
          <div className="mini-chart">
            {chartData.map((d) => (
              <div key={d.day} className="bar-group">
                <div className="bars">
                  <div className="bar entry" style={{ height: `${(d.entry / maxVal) * 80}px` }} title={`Entradas: ${d.entry}`} />
                  <div className="bar exit" style={{ height: `${(d.exit / maxVal) * 80}px` }} title={`Saídas: ${d.exit}`} />
                </div>
                <span className="bar-label">{d.day}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: "0 24px 16px", display: "flex", gap: 16, fontSize: 12, color: "var(--text-muted)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--accent)" }} /> Entradas</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(255,255,255,0.1)" }} /> Saídas</span>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3><Icons.AlertTriangle /> Alertas de Estoque Baixo</h3><span style={{ fontSize: 12, color: "var(--danger)", fontWeight: 600 }}>{stats.lowStockItems.length} itens</span></div>
          <div className="alert-list">
            {stats.lowStockItems.length === 0 ? (
              <div className="empty-state"><Icons.Check /><h3>Tudo em ordem!</h3><p>Nenhum produto abaixo do mínimo.</p></div>
            ) : stats.lowStockItems.map((p) => (
              <div key={p.id} className="alert-item">
                <span className="alert-dot" />
                <span className="product-name">{p.name}</span>
                <span className="qty-current">{p.quantity}</span>
                <span className="qty-min">/ {p.minQuantity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header"><h3><Icons.Repeat /> Últimas Movimentações</h3></div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Data</th><th>Produto</th><th>Tipo</th><th>Quantidade</th><th>Motivo</th></tr></thead>
            <tbody>
              {movements.slice(0, 5).map((m) => {
                const prod = getProduct(m.productId);
                const badge = m.quantity > 0 ? "badge-entry" : m.type === "SAIDA" ? "badge-exit" : "badge-adjust";
                return (
                  <tr key={m.id}>
                    <td style={{ color: "var(--text-muted)", fontSize: 13 }}>{formatDate(m.date)}</td>
                    <td style={{ fontWeight: 500 }}>{prod?.name || "—"}</td>
                    <td><span className={`badge ${badge}`}>{m.type}</span></td>
                    <td className={`qty-cell ${m.quantity < 0 ? "low" : ""}`}>{m.quantity > 0 ? `+${m.quantity}` : m.quantity}</td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{m.reason}</td>
                  </tr>
                );
              })}
              {movements.length === 0 && <tr><td colSpan={5}><div className="empty-state"><p>Nenhuma movimentação registrada.</p></div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
