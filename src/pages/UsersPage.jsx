import { useState } from "react";
import { Icons } from "../utils/icons.jsx";
import Modal from "../components/Modal.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useData } from "../context/DataContext.jsx";
import { formatDate } from "../utils/storage.js";

const emptyForm = { name: "", email: "", password: "", role: "USER", active: true };

export default function UsersPage() {
  const { users, currentUser, updateUser, createUser, removeUser } = useAuth();
  const { toast } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  function openNew() { setEditing(null); setForm(emptyForm); setFormError(""); setModalOpen(true); }
  function openEdit(u) { setEditing(u); setForm({ name: u.name, email: u.email, password: "", role: u.role, active: u.active }); setFormError(""); setModalOpen(true); }

  function handleDelete(u) {
    if (u.id === currentUser.id) { toast("Você não pode excluir a si mesmo.", "error"); return; }
    if (confirm(`Excluir o usuário "${u.name}"?`)) { removeUser(u.id); toast("Usuário removido.", "success"); }
  }
  function toggleActive(u) {
    if (u.id === currentUser.id) { toast("Você não pode desativar a si mesmo.", "error"); return; }
    updateUser(u.id, { active: !u.active });
    toast(`Usuário ${u.active ? "desativado" : "ativado"}.`, "success");
  }

  function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    if (!form.name.trim() || !form.email.trim()) { setFormError("Nome e email são obrigatórios."); return; }
    if (!editing && !form.password) { setFormError("Defina uma senha inicial."); return; }
    if (editing) {
      const patch = { name: form.name.trim(), email: form.email.trim(), role: form.role, active: form.active };
      if (form.password) patch.password = form.password;
      updateUser(editing.id, patch);
      toast("Usuário atualizado.", "success");
    } else {
      const result = createUser({ name: form.name.trim(), email: form.email.trim(), password: form.password, role: form.role, active: form.active });
      if (!result.ok) { setFormError(result.error); return; }
      toast("Usuário cadastrado.", "success");
    }
    setModalOpen(false);
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <div><h1>Usuários</h1><p className="page-desc">Gerencie os acessos do sistema</p></div>
        <button className="btn btn-sm btn-primary" onClick={openNew}><Icons.Plus /> Novo Usuário</button>
      </div>
      <div className="restricted-banner"><Icons.AlertTriangle /> Área Restrita — Acesso apenas para Administradores</div>
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Nome</th><th>Email</th><th>Perfil</th><th>Status</th><th>Cadastrado em</th><th>Ações</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: u.role === "ADMIN" ? "linear-gradient(135deg, var(--accent), var(--purple))" : "var(--bg-card-hover)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: u.role === "ADMIN" ? "white" : "var(--text-secondary)" }}>
                        {u.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <span style={{ fontWeight: 600 }}>{u.name}</span>
                      {u.id === currentUser.id && <span className="badge badge-user" style={{ fontSize: 10 }}>Você</span>}
                    </div>
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>{u.email}</td>
                  <td><span className={`badge ${u.role === "ADMIN" ? "badge-admin" : "badge-user"}`}>{u.role}</span></td>
                  <td>
                    <button onClick={() => toggleActive(u)} style={{ border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }} title="Clique para alternar">
                      <span className={`status-dot ${u.active ? "active" : "inactive"}`} />
                      <span style={{ fontSize: 13, color: u.active ? "var(--success)" : "var(--text-muted)" }}>{u.active ? "Ativo" : "Inativo"}</span>
                    </button>
                  </td>
                  <td style={{ color: "var(--text-muted)", fontSize: 13 }}>{formatDate(u.createdAt)}</td>
                  <td><div className="table-actions">
                    <button className="action-btn" title="Editar" onClick={() => openEdit(u)}><Icons.Edit /></button>
                    <button className="action-btn danger" title="Excluir" onClick={() => handleDelete(u)}><Icons.Trash /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal open={modalOpen} title={editing ? "Editar Usuário" : "Novo Usuário"} onClose={() => setModalOpen(false)}
        footer={<>
          <button className="btn btn-sm btn-outline" onClick={() => setModalOpen(false)}>Cancelar</button>
          <button className="btn btn-sm btn-primary" onClick={handleSubmit}>{editing ? "Salvar" : "Cadastrar"}</button>
        </>}>
        <form onSubmit={handleSubmit}>
          <div className="form-field" style={{ marginBottom: 14 }}><label>Nome</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="form-field" style={{ marginBottom: 14 }}><label>Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div className="form-field" style={{ marginBottom: 14 }}><label>{editing ? "Nova senha (opcional)" : "Senha"}</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editing ? "Deixe em branco para manter" : "Mínimo 6 caracteres"} /></div>
          <div className="form-row">
            <div className="form-field"><label>Perfil</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="USER">Usuário</option><option value="ADMIN">Administrador</option>
              </select>
            </div>
            <div className="form-field"><label>Status</label>
              <select value={form.active ? "1" : "0"} onChange={(e) => setForm({ ...form, active: e.target.value === "1" })}>
                <option value="1">Ativo</option><option value="0">Inativo</option>
              </select>
            </div>
          </div>
          {formError && <div className="error-text">{formError}</div>}
        </form>
      </Modal>
    </div>
  );
}
