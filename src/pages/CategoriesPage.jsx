import { useMemo, useState } from "react";
import { Icons } from "../utils/icons.jsx";
import Modal from "../components/Modal.jsx";
import { useData } from "../context/DataContext.jsx";
import { formatDate } from "../utils/storage.js";

export default function CategoriesPage() {
  const { categories, products, createCategory, updateCategory, removeCategory } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [formError, setFormError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const categoriesWithCount = useMemo(() => categories.map((c) => ({ ...c, count: products.filter((p) => p.categoryId === c.id).length })), [categories, products]);

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase();
    return categoriesWithCount.filter((c) => {
      const matchesSearch = !term || c.name.toLowerCase().includes(term) || (c.description || "").toLowerCase().includes(term);
      const matchesFilter = filter === "all" || (filter === "with" && c.count > 0) || (filter === "empty" && c.count === 0);
      return matchesSearch && matchesFilter;
    });
  }, [categoriesWithCount, search, filter]);

  function openNew() { setEditing(null); setForm({ name: "", description: "" }); setFormError(""); setModalOpen(true); }
  function openEdit(cat) { setEditing(cat); setForm({ name: cat.name, description: cat.description || "" }); setFormError(""); setModalOpen(true); }
  function handleDelete(cat) { if (confirm(`Excluir a categoria "${cat.name}"?`)) removeCategory(cat.id); }

  function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    if (!form.name.trim()) { setFormError("O nome é obrigatório."); return; }
    const data = { name: form.name.trim(), description: form.description.trim() };
    const result = editing ? updateCategory(editing.id, data) : createCategory(data);
    if (!result.ok) { setFormError(result.error); return; }
    setModalOpen(false);
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <div><h1>Categorias</h1><p className="page-desc">Organize seus produtos por categorias</p></div>
        <button className="btn btn-sm btn-primary" onClick={openNew}><Icons.Plus /> Nova Categoria</button>
      </div>
      <div className="toolbar">
        <div className="search-box">
          <span className="search-icon"><Icons.Search /></span>
          <input placeholder="Buscar categoria..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Todas</option>
          <option value="with">Com produtos</option>
          <option value="empty">Vazias</option>
        </select>
      </div>
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Nome</th><th>Descrição</th><th>Produtos</th><th>Criado em</th><th>Ações</th></tr></thead>
            <tbody>
              {filteredCategories.length === 0 ? (
                <tr><td colSpan={5}><div className="empty-state"><Icons.Tag /><h3>Nenhuma categoria</h3><p>Comece cadastrando uma nova categoria.</p></div></td></tr>
              ) : filteredCategories.map((c) => (
                <tr key={c.id}>
                  <td data-label="Nome" style={{ fontWeight: 600 }}>{c.name}</td>
                  <td data-label="Descrição" style={{ color: "var(--text-secondary)" }}>{c.description || "—"}</td>
                  <td data-label="Produtos"><span className="badge badge-user">{c.count} {c.count === 1 ? "item" : "itens"}</span></td>
                  <td data-label="Criado em" style={{ color: "var(--text-muted)", fontSize: 13 }}>{formatDate(c.createdAt)}</td>
                  <td data-label="Ações"><div className="table-actions">
                    <button className="action-btn" title="Editar" onClick={() => openEdit(c)}><Icons.Edit /></button>
                    <button className="action-btn danger" title="Excluir" onClick={() => handleDelete(c)}><Icons.Trash /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal open={modalOpen} title={editing ? "Editar Categoria" : "Nova Categoria"} onClose={() => setModalOpen(false)}
        footer={<>
          <button className="btn btn-sm btn-outline" onClick={() => setModalOpen(false)}>Cancelar</button>
          <button className="btn btn-sm btn-primary" onClick={handleSubmit}>{editing ? "Salvar" : "Cadastrar"}</button>
        </>}>
        <form onSubmit={handleSubmit}>
          <div className="form-field" style={{ marginBottom: 16 }}><label>Nome</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="form-field"><label>Descrição</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição opcional..." /></div>
          {formError && <div className="error-text" style={{ marginTop: 12 }}>{formError}</div>}
        </form>
      </Modal>
    </div>
  );
}
