import { useMemo, useState } from "react";
import { Icons } from "../utils/icons.jsx";
import Modal from "../components/Modal.jsx";
import { useData } from "../context/DataContext.jsx";
import { formatCurrency } from "../utils/storage.js";

const emptyForm = { name: "", sku: "", price: "", cost: "", quantity: "", minQuantity: "", categoryId: "", supplierId: "", description: "" };

export default function ProductsPage() {
  const { products, categories, suppliers, createProduct, updateProduct, removeProduct, getCategoryName } = useData();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return products.filter((p) => {
      if (s && !p.name.toLowerCase().includes(s) && !p.sku.toLowerCase().includes(s)) return false;
      if (catFilter !== "all" && p.categoryId !== catFilter) return false;
      if (stockFilter === "low" && p.quantity >= p.minQuantity) return false;
      if (stockFilter === "ok" && p.quantity < p.minQuantity) return false;
      return true;
    });
  }, [products, search, catFilter, stockFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  function openNew() {
    setEditing(null);
    setForm({ ...emptyForm, categoryId: categories[0]?.id || "", supplierId: suppliers[0]?.id || "" });
    setFormError(""); setModalOpen(true);
  }
  function openEdit(product) {
    setEditing(product);
    setForm({ name: product.name, sku: product.sku, price: product.price, cost: product.cost, quantity: product.quantity, minQuantity: product.minQuantity, categoryId: product.categoryId, supplierId: product.supplierId, description: product.description || "" });
    setFormError(""); setModalOpen(true);
  }
  function handleDelete(p) { if (confirm(`Excluir "${p.name}"? Esta ação também remove suas movimentações.`)) removeProduct(p.id); }

  function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    if (!form.name.trim() || !form.sku.trim()) { setFormError("Nome e SKU são obrigatórios."); return; }
    const data = {
      name: form.name.trim(), sku: form.sku.trim().toUpperCase(),
      price: Number(form.price) || 0, cost: Number(form.cost) || 0,
      quantity: Math.max(0, parseInt(form.quantity, 10) || 0),
      minQuantity: Math.max(0, parseInt(form.minQuantity, 10) || 0),
      categoryId: form.categoryId, supplierId: form.supplierId,
      description: form.description.trim(),
    };
    const result = editing ? updateProduct(editing.id, data) : createProduct(data);
    if (!result.ok) { setFormError(result.error); return; }
    setModalOpen(false);
  }

  function exportCSV() {
    const header = "Nome;SKU;Preço;Custo;Quantidade;Mínimo;Categoria";
    const rows = filtered.map((p) => [p.name, p.sku, p.price, p.cost, p.quantity, p.minQuantity, getCategoryName(p.categoryId)].join(";"));
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "produtos.csv"; link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <div><h1>Produtos</h1><p className="page-desc">Gerencie o catálogo de produtos</p></div>
        <div className="header-actions">
          <button className="btn btn-sm btn-outline" onClick={exportCSV}><Icons.Download /> Exportar</button>
          <button className="btn btn-sm btn-primary" onClick={openNew}><Icons.Plus /> Novo Produto</button>
        </div>
      </div>
      <div className="toolbar">
        <div className="search-box">
          <span className="search-icon"><Icons.Search /></span>
          <input placeholder="Buscar por nome ou SKU..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="filter-select" value={catFilter} onChange={(e) => { setCatFilter(e.target.value); setPage(1); }}>
          <option value="all">Todas categorias</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="filter-select" value={stockFilter} onChange={(e) => { setStockFilter(e.target.value); setPage(1); }}>
          <option value="all">Todos</option><option value="ok">Estoque OK</option><option value="low">Estoque Baixo</option>
        </select>
      </div>
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Produto</th><th>SKU</th><th>Preço</th><th>Custo</th><th>Qtd</th><th>Qtd Mín</th><th>Categoria</th><th>Ações</th></tr></thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr><td colSpan={8}><div className="empty-state"><Icons.Box /><h3>Nenhum produto encontrado</h3><p>Ajuste os filtros ou cadastre um novo produto.</p></div></td></tr>
              ) : pageItems.map((p) => {
                const low = p.quantity < p.minQuantity;
                return (
                  <tr key={p.id}>
                    <td><div style={{ display: "flex", alignItems: "center", gap: 8 }}>{p.name}{low && <span className="badge badge-low" style={{ fontSize: 10, padding: "2px 6px" }}>Baixo</span>}</div></td>
                    <td><span className="sku-cell">{p.sku}</span></td>
                    <td className="currency">{formatCurrency(p.price)}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{formatCurrency(p.cost)}</td>
                    <td className={`qty-cell ${low ? "low" : ""}`}>{p.quantity}</td>
                    <td style={{ color: "var(--text-muted)" }}>{p.minQuantity}</td>
                    <td><span className="badge badge-user">{getCategoryName(p.categoryId)}</span></td>
                    <td><div className="table-actions">
                      <button className="action-btn" title="Editar" onClick={() => openEdit(p)}><Icons.Edit /></button>
                      <button className="action-btn danger" title="Excluir" onClick={() => handleDelete(p)}><Icons.Trash /></button>
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>«</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} className={`page-btn ${n === page ? "active" : ""}`} onClick={() => setPage(n)}>{n}</button>
            ))}
            <button className="page-btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>»</button>
          </div>
        )}
      </div>

      <Modal open={modalOpen} title={editing ? "Editar Produto" : "Novo Produto"} onClose={() => setModalOpen(false)} large
        footer={<>
          <button className="btn btn-sm btn-outline" onClick={() => setModalOpen(false)}>Cancelar</button>
          <button className="btn btn-sm btn-primary" onClick={handleSubmit}>{editing ? "Salvar" : "Cadastrar"}</button>
        </>}>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-field" style={{ flex: 2 }}><label>Nome</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="form-field"><label>SKU</label><input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required /></div>
          </div>
          <div className="form-row">
            <div className="form-field"><label>Preço de Venda (R$)</label><input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
            <div className="form-field"><label>Custo (R$)</label><input type="number" step="0.01" min="0" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-field"><label>Quantidade</label><input type="number" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div>
            <div className="form-field"><label>Qtd Mínima</label><input type="number" min="0" value={form.minQuantity} onChange={(e) => setForm({ ...form, minQuantity: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-field"><label>Categoria</label>
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">—</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-field"><label>Fornecedor</label>
              <select value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
                <option value="">—</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-field" style={{ marginTop: 4 }}>
            <label>Descrição</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detalhes do produto, observações, especificações..." />
          </div>
          {formError && <div className="error-text">{formError}</div>}
        </form>
      </Modal>
    </div>
  );
}
