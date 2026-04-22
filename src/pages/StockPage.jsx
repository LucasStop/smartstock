import { useMemo, useState } from "react";
import { Icons } from "../utils/icons.jsx";
import { useData } from "../context/DataContext.jsx";
import { formatCurrency } from "../utils/storage.js";

export default function StockPage() {
  const { products, categories, getCategoryName, stats } = useData();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [viewMode, setViewMode] = useState("cards");

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return products.filter((p) => {
      if (s && !p.name.toLowerCase().includes(s) && !p.sku.toLowerCase().includes(s)) return false;
      if (catFilter !== "all" && p.categoryId !== catFilter) return false;
      return true;
    });
  }, [products, search, catFilter]);

  function exportCSV() {
    const header = "Produto;SKU;Categoria;Quantidade;Mínimo;Preço Unit.;Valor Total;Situação";
    const rows = filtered.map((p) => [p.name, p.sku, getCategoryName(p.categoryId), p.quantity, p.minQuantity, p.price, p.quantity * p.price, p.quantity < p.minQuantity ? "BAIXO" : "OK"].join(";"));
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = "estoque.csv"; link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <div><h1>Estoque Atual</h1><p className="page-desc">Controle completo do inventário</p></div>
        <div className="header-actions">
          <div className="view-toggle">
            <button className={`view-toggle-btn ${viewMode === "cards" ? "active" : ""}`} onClick={() => setViewMode("cards")} title="Ver como cards"><Icons.Grid /></button>
            <button className={`view-toggle-btn ${viewMode === "table" ? "active" : ""}`} onClick={() => setViewMode("table")} title="Ver como tabela"><Icons.Archive /></button>
          </div>
          <button className="btn btn-sm btn-outline" onClick={exportCSV}><Icons.Download /> Exportar</button>
        </div>
      </div>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon blue"><Icons.Box /></div><div className="stat-info"><h3>{stats.totalProducts}</h3><p>Total de itens</p></div></div>
        <div className="stat-card"><div className="stat-icon green"><Icons.DollarSign /></div><div className="stat-info"><h3>{formatCurrency(stats.stockValue)}</h3><p>Valor em estoque</p></div></div>
        <div className="stat-card"><div className="stat-icon red"><Icons.AlertTriangle /></div><div className="stat-info"><h3>{stats.lowStockCount}</h3><p>Produtos em baixa</p></div></div>
      </div>
      <div className="toolbar">
        <div className="search-box"><span className="search-icon"><Icons.Search /></span><input placeholder="Buscar produto ou SKU..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <select className="filter-select" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option value="all">Todas categorias</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {viewMode === "cards" ? (
        filtered.length === 0 ? (
          <div className="card"><div className="empty-state"><Icons.Archive /><h3>Sem resultados</h3><p>Ajuste os filtros.</p></div></div>
        ) : (
          <div className="stock-grid">
            {filtered.map((p) => {
              const ok = p.quantity >= p.minQuantity;
              const pct = Math.min(100, (p.quantity / Math.max(1, p.minQuantity * 2)) * 100);
              return (
                <div key={p.id} className={`stock-card ${!ok ? "low" : ""}`}>
                  <div className="stock-card-head">
                    <div className="stock-card-icon"><Icons.Box /></div>
                    <span className={`badge ${ok ? "badge-ok" : "badge-low"}`}>{ok ? "OK" : "BAIXO"}</span>
                  </div>
                  <h4 className="stock-card-name">{p.name}</h4>
                  <span className="sku-cell" style={{ marginBottom: 12 }}>{p.sku}</span>
                  <span className="badge badge-user" style={{ alignSelf: "flex-start", marginBottom: 14 }}>{getCategoryName(p.categoryId)}</span>
                  <div className="stock-card-bar">
                    <div className={`stock-card-bar-fill ${!ok ? "low" : ""}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="stock-card-qty">
                    <span className={`qty-cell ${!ok ? "low" : ""}`} style={{ fontSize: 22 }}>{p.quantity}</span>
                    <span style={{ color: "var(--text-muted)", fontSize: 13 }}>mín: {p.minQuantity}</span>
                  </div>
                  <div className="stock-card-footer">
                    <div><span style={{ fontSize: 11, color: "var(--text-muted)" }}>Unit.</span><div className="currency" style={{ fontSize: 13 }}>{formatCurrency(p.price)}</div></div>
                    <div style={{ textAlign: "right" }}><span style={{ fontSize: 11, color: "var(--text-muted)" }}>Total</span><div className="currency" style={{ fontSize: 13 }}>{formatCurrency(p.quantity * p.price)}</div></div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Produto</th><th>SKU</th><th>Categoria</th><th>Qtd</th><th>Qtd Mín</th><th>Preço Unit.</th><th>Valor Total</th><th>Situação</th></tr></thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8}><div className="empty-state"><Icons.Archive /><h3>Sem resultados</h3><p>Ajuste os filtros.</p></div></td></tr>
                ) : filtered.map((p) => {
                  const ok = p.quantity >= p.minQuantity;
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 500 }}>{p.name}</td>
                      <td><span className="sku-cell">{p.sku}</span></td>
                      <td><span className="badge badge-user">{getCategoryName(p.categoryId)}</span></td>
                      <td className={`qty-cell ${!ok ? "low" : ""}`}>{p.quantity}</td>
                      <td style={{ color: "var(--text-muted)" }}>{p.minQuantity}</td>
                      <td className="currency">{formatCurrency(p.price)}</td>
                      <td className="currency">{formatCurrency(p.quantity * p.price)}</td>
                      <td><span className={`badge ${ok ? "badge-ok" : "badge-low"}`}>{ok ? "OK" : "BAIXO"}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
