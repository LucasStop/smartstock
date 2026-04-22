import { useMemo, useState } from "react";
import { Icons } from "../utils/icons.jsx";
import { useData } from "../context/DataContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { formatDate } from "../utils/storage.js";

export default function MovementsPage() {
  const { movements, products, createMovement, getProduct } = useData();
  const { currentUser, users } = useAuth();
  const [moveType, setMoveType] = useState("ENTRADA");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return movements.filter((m) => {
      const prod = getProduct(m.productId);
      if (s && !(prod?.name.toLowerCase().includes(s) || prod?.sku.toLowerCase().includes(s))) return false;
      if (typeFilter !== "all" && m.type !== typeFilter) return false;
      const d = new Date(m.date);
      if (dateFrom && d < new Date(dateFrom + "T00:00:00")) return false;
      if (dateTo && d > new Date(dateTo + "T23:59:59")) return false;
      return true;
    });
  }, [movements, search, typeFilter, dateFrom, dateTo, getProduct]);

  const badgeClass = (type) => type === "ENTRADA" ? "badge-entry" : type === "SAIDA" ? "badge-exit" : "badge-adjust";

  function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    const result = createMovement({ productId, type: moveType, quantity, reason, userId: currentUser?.id });
    if (!result.ok) { setFormError(result.error); return; }
    setProductId(""); setQuantity(""); setReason("");
  }

  const getUserName = (id) => users.find((u) => u.id === id)?.name || "—";

  return (
    <div className="main-content">
      <div className="page-header"><div><h1>Movimentações</h1><p className="page-desc">Registre entradas, saídas e ajustes de estoque</p></div></div>
      <div className="toolbar">
        <div className="search-box">
          <span className="search-icon"><Icons.Search /></span>
          <input placeholder="Buscar produto..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">Todos os tipos</option><option value="ENTRADA">Entrada</option><option value="SAIDA">Saída</option><option value="AJUSTE">Ajuste</option>
        </select>
        <input type="date" className="filter-select" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ width: 160 }} />
        <input type="date" className="filter-select" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ width: 160 }} />
      </div>
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Data</th><th>Produto</th><th>SKU</th><th>Tipo</th><th>Qtd</th><th>Motivo</th><th>Usuário</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><Icons.Repeat /><h3>Nenhuma movimentação</h3><p>Registre a primeira abaixo.</p></div></td></tr>
              ) : filtered.map((m) => {
                const prod = getProduct(m.productId);
                return (
                  <tr key={m.id}>
                    <td style={{ color: "var(--text-muted)", fontSize: 13 }}>{formatDate(m.date)}</td>
                    <td style={{ fontWeight: 500 }}>{prod?.name || "—"}</td>
                    <td><span className="sku-cell">{prod?.sku || "—"}</span></td>
                    <td><span className={`badge ${badgeClass(m.type)}`}>{m.type}</span></td>
                    <td className={`qty-cell ${m.quantity < 0 ? "low" : ""}`}>{m.quantity > 0 ? `+${m.quantity}` : m.quantity}</td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{m.reason}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{getUserName(m.userId)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3>Registrar Movimentação</h3></div>
        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 8 }}>Tipo</label>
            <div className="radio-group">
              <button type="button" className={`radio-pill ${moveType === "ENTRADA" ? "selected-entry" : ""}`} onClick={() => setMoveType("ENTRADA")}>Entrada</button>
              <button type="button" className={`radio-pill ${moveType === "SAIDA" ? "selected-exit" : ""}`} onClick={() => setMoveType("SAIDA")}>Saída</button>
              <button type="button" className={`radio-pill ${moveType === "AJUSTE" ? "selected-adjust" : ""}`} onClick={() => setMoveType("AJUSTE")}>Ajuste</button>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field"><label>Produto</label>
              <select value={productId} onChange={(e) => setProductId(e.target.value)} required>
                <option value="">Selecione um produto</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name} (estoque: {p.quantity})</option>)}
              </select>
            </div>
            <div className="form-field" style={{ maxWidth: 200 }}><label>Quantidade {moveType === "AJUSTE" ? "(±)" : ""}</label>
              <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder={moveType === "AJUSTE" ? "Ex: -3 ou 5" : "Ex: 10"} required />
            </div>
          </div>
          <div className="form-field"><label>Motivo</label><textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Descreva o motivo..." /></div>
          {formError && <div className="error-text" style={{ marginTop: 8 }}>{formError}</div>}
          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <button className="btn btn-sm btn-primary" type="submit">Registrar</button>
            <button className="btn btn-sm btn-outline" type="button" onClick={() => { setProductId(""); setQuantity(""); setReason(""); setFormError(""); }}>Limpar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
