import { useMemo, useState } from "react";
import { Icons } from "../utils/icons.jsx";
import { useData } from "../context/DataContext.jsx";
import { formatCurrency, formatDate } from "../utils/storage.js";

function toISODate(d) { return d.toISOString().slice(0, 10); }

const PIE_COLORS = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#14B8A6", "#EF4444"];

function polarToCartesian(cx, cy, r, angleDeg) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function arcPath(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const large = endAngle - startAngle <= 180 ? 0 : 1;
  return ["M", cx, cy, "L", start.x, start.y, "A", r, r, 0, large, 0, end.x, end.y, "Z"].join(" ");
}

function SupplierPie() {
  const { products, suppliers } = useData();
  const data = useMemo(() => {
    const totals = new Map();
    products.forEach((p) => {
      totals.set(p.supplierId, (totals.get(p.supplierId) || 0) + p.quantity);
    });
    const entries = [...totals.entries()]
      .map(([id, total]) => ({ supplier: suppliers.find((s) => s.id === id), total }))
      .filter((e) => e.supplier && e.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
    const sum = entries.reduce((acc, e) => acc + e.total, 0);
    return { entries, sum };
  }, [products, suppliers]);

  if (data.entries.length === 0) {
    return <div className="empty-state" style={{ padding: "40px 20px" }}><Icons.Truck /><h3>Sem fornecedores</h3><p>Cadastre produtos vinculados a fornecedores.</p></div>;
  }

  let cursor = 0;
  const slices = data.entries.map((e, i) => {
    const angle = (e.total / data.sum) * 360;
    const path = arcPath(100, 100, 90, cursor, cursor + angle);
    const slice = { path, color: PIE_COLORS[i % PIE_COLORS.length], entry: e };
    cursor += angle;
    return slice;
  });

  return (
    <div className="pie-wrap">
      <svg className="pie-svg" viewBox="0 0 200 200" width="200" height="200">
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} stroke="var(--bg-card)" strokeWidth="2">
            <title>{s.entry.supplier.name}: {s.entry.total}</title>
          </path>
        ))}
        <circle cx="100" cy="100" r="42" fill="var(--bg-card)" />
        <text x="100" y="96" textAnchor="middle" fill="var(--text-primary)" fontSize="22" fontWeight="800">{data.sum}</text>
        <text x="100" y="114" textAnchor="middle" fill="var(--text-muted)" fontSize="10" letterSpacing="0.5" style={{ textTransform: "uppercase" }}>itens</text>
      </svg>
      <div className="pie-legend">
        {slices.map((s, i) => {
          const pct = ((s.entry.total / data.sum) * 100).toFixed(1);
          return (
            <div key={i} className="pie-legend-item">
              <span className="pie-dot" style={{ background: s.color }} />
              <span className="pie-legend-name">{s.entry.supplier.name}</span>
              <span className="pie-legend-pct">{pct}%</span>
              <span className="pie-legend-value">{s.entry.total}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { stats, movements, getProduct } = useData();

  const today = new Date();
  const sevenDaysAgo = new Date(today); sevenDaysAgo.setDate(today.getDate() - 6);
  const [dateFrom, setDateFrom] = useState(toISODate(sevenDaysAgo));
  const [dateTo, setDateTo] = useState(toISODate(today));

  const criticalItem = useMemo(() => {
    if (!stats.lowStockItems.length) return null;
    return [...stats.lowStockItems].sort((a, b) => a.quantity - b.quantity)[0];
  }, [stats.lowStockItems]);

  const chartData = useMemo(() => {
    const from = new Date(dateFrom + "T00:00:00");
    const to = new Date(dateTo + "T23:59:59");
    if (from > to) return [];
    const spanDays = Math.min(30, Math.floor((to - from) / (1000 * 60 * 60 * 24)) + 1);
    const buckets = Array.from({ length: spanDays }, (_, i) => {
      const d = new Date(from);
      d.setDate(from.getDate() + i);
      return { key: toISODate(d), label: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), entry: 0, exit: 0 };
    });
    const index = Object.fromEntries(buckets.map((b, i) => [b.key, i]));
    movements.forEach((m) => {
      const d = new Date(m.date);
      if (d < from || d > to) return;
      const i = index[toISODate(d)];
      if (i === undefined) return;
      if (m.quantity > 0) buckets[i].entry += m.quantity;
      else buckets[i].exit += Math.abs(m.quantity);
    });
    return buckets;
  }, [movements, dateFrom, dateTo]);

  const maxVal = Math.max(70, ...chartData.flatMap((d) => [d.entry, d.exit]));

  const topMoved = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const totals = new Map();
    movements.forEach((m) => {
      if (new Date(m.date) < thirtyDaysAgo) return;
      totals.set(m.productId, (totals.get(m.productId) || 0) + Math.abs(m.quantity));
    });
    const entries = [...totals.entries()]
      .map(([productId, total]) => ({ product: getProduct(productId), total }))
      .filter((e) => e.product)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
    const max = entries[0]?.total || 1;
    return { entries, max };
  }, [movements, getProduct]);

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
          <div className="card-header">
            <h3><Icons.BarChart /> Movimentações — Período</h3>
            <div className="date-range">
              <label>De <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} /></label>
              <label>Até <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} /></label>
            </div>
          </div>
          <div className="mini-chart">
            {chartData.length === 0 ? (
              <div style={{ width: "100%", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Intervalo inválido</div>
            ) : chartData.map((d) => (
              <div key={d.key} className="bar-group">
                <div className="bars">
                  <div className="bar entry" style={{ height: `${(d.entry / maxVal) * 80}px` }} title={`Entradas: ${d.entry}`} />
                  <div className="bar exit" style={{ height: `${(d.exit / maxVal) * 80}px` }} title={`Saídas: ${d.exit}`} />
                </div>
                <span className="bar-label">{d.label}</span>
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
      <div className="two-col" style={{ marginTop: 0 }}>
        <div className="card">
          <div className="card-header">
            <h3><Icons.BarChart /> Itens mais Movimentados</h3>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Últimos 30 dias</span>
          </div>
          <div className="top-bars">
            {topMoved.entries.length === 0 ? (
              <div className="empty-state" style={{ padding: "40px 20px" }}>
                <Icons.BarChart />
                <h3>Sem movimentações</h3>
                <p>Ainda não há registros no período.</p>
              </div>
            ) : topMoved.entries.map((e, i) => (
              <div key={e.product.id} className="top-bar-row">
                <span className="top-bar-rank">#{i + 1}</span>
                <span className="top-bar-name">{e.product.name}</span>
                <div className="top-bar-track">
                  <div className="top-bar-fill" style={{ width: `${(e.total / topMoved.max) * 100}%` }} />
                </div>
                <span className="top-bar-value">{e.total}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3><Icons.Truck /> Melhores Fornecedores</h3>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Por volume em estoque</span>
          </div>
          <SupplierPie />
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
