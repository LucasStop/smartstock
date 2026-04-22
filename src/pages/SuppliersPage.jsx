import { useState } from "react";
import { Icons } from "../utils/icons.jsx";
import Modal from "../components/Modal.jsx";
import { useData } from "../context/DataContext.jsx";
import { isValidCNPJ, maskCNPJ, maskPhone } from "../utils/storage.js";

const emptyForm = { name: "", cnpj: "", email: "", phone: "" };

export default function SuppliersPage() {
  const { suppliers, createSupplier, updateSupplier, removeSupplier } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [cnpjError, setCnpjError] = useState(false);

  function openNew() { setEditing(null); setForm(emptyForm); setFormError(""); setCnpjError(false); setModalOpen(true); }
  function openEdit(s) { setEditing(s); setForm({ name: s.name, cnpj: s.cnpj, email: s.email, phone: s.phone }); setFormError(""); setCnpjError(false); setModalOpen(true); }
  function handleDelete(s) { if (confirm(`Excluir o fornecedor "${s.name}"?`)) removeSupplier(s.id); }

  function handleSubmit(e) {
    e.preventDefault();
    setFormError(""); setCnpjError(false);
    if (!form.name.trim()) { setFormError("Nome é obrigatório."); return; }
    if (!isValidCNPJ(form.cnpj)) { setCnpjError(true); setFormError("CNPJ inválido. Verifique os dígitos."); return; }
    const data = { name: form.name.trim(), cnpj: maskCNPJ(form.cnpj), email: form.email.trim(), phone: form.phone.trim() };
    const result = editing ? updateSupplier(editing.id, data) : createSupplier(data);
    if (!result.ok) { setFormError(result.error); return; }
    setModalOpen(false);
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <div><h1>Fornecedores</h1><p className="page-desc">Gerencie seus fornecedores</p></div>
        <button className="btn btn-sm btn-primary" onClick={openNew}><Icons.Plus /> Novo Fornecedor</button>
      </div>
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Nome</th><th>CNPJ</th><th>Email</th><th>Telefone</th><th>Ações</th></tr></thead>
            <tbody>
              {suppliers.length === 0 ? (
                <tr><td colSpan={5}><div className="empty-state"><Icons.Truck /><h3>Nenhum fornecedor</h3><p>Comece cadastrando um novo fornecedor.</p></div></td></tr>
              ) : suppliers.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td><span className="sku-cell">{s.cnpj}</span></td>
                  <td style={{ color: "var(--text-secondary)" }}>{s.email}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{s.phone}</td>
                  <td><div className="table-actions">
                    <button className="action-btn" title="Editar" onClick={() => openEdit(s)}><Icons.Edit /></button>
                    <button className="action-btn danger" title="Excluir" onClick={() => handleDelete(s)}><Icons.Trash /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal open={modalOpen} title={editing ? "Editar Fornecedor" : "Novo Fornecedor"} onClose={() => setModalOpen(false)}
        footer={<>
          <button className="btn btn-sm btn-outline" onClick={() => setModalOpen(false)}>Cancelar</button>
          <button className="btn btn-sm btn-primary" onClick={handleSubmit}>{editing ? "Salvar" : "Cadastrar"}</button>
        </>}>
        <form onSubmit={handleSubmit}>
          <div className="form-field" style={{ marginBottom: 14 }}><label>Nome / Razão Social</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="form-field" style={{ marginBottom: 14 }}>
            <label>CNPJ</label>
            <input className={cnpjError ? "input-error" : ""} value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: maskCNPJ(e.target.value) })} placeholder="00.000.000/0000-00" maxLength={18} required />
            {cnpjError && <div className="error-text">CNPJ inválido.</div>}
          </div>
          <div className="form-row">
            <div className="form-field"><label>Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="form-field"><label>Telefone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: maskPhone(e.target.value) })} placeholder="(11) 98765-4321" maxLength={16} /></div>
          </div>
          {formError && !cnpjError && <div className="error-text">{formError}</div>}
        </form>
      </Modal>
    </div>
  );
}
