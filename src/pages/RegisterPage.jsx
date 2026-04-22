import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icons } from "../utils/icons.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("As senhas não coincidem."); return; }
    setLoading(true);
    setTimeout(() => {
      const result = register({ name: form.name, email: form.email, password: form.password });
      setLoading(false);
      if (!result.ok) setError(result.error);
      else navigate("/", { replace: true });
    }, 300);
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-hero">
        <div className="auth-logo">
          <div className="auth-logo-icon"><Icons.Box /></div>
          <h1>SmartStock</h1>
          <p>Sistema de Gerenciamento de Estoque</p>
        </div>
      </div>
      <div className="auth-form-side">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Criar Conta</h2>
          <p className="subtitle">Preencha os dados para começar</p>
          <div className="form-group">
            <label>Nome Completo</label>
            <div className="input-wrapper">
              <span className="input-icon"><Icons.User /></span>
              <input className="form-input" type="text" placeholder="Digite seu nome completo" value={form.name} onChange={update("name")} required />
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <div className="input-wrapper">
              <span className="input-icon"><Icons.Mail /></span>
              <input className="form-input" type="email" placeholder="seu@email.com" value={form.email} onChange={update("email")} required />
            </div>
          </div>
          <div className="form-group">
            <label>Senha</label>
            <div className="input-wrapper">
              <span className="input-icon"><Icons.Lock /></span>
              <input className="form-input" type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={update("password")} required minLength={6} />
            </div>
          </div>
          <div className="form-group">
            <label>Confirmar Senha</label>
            <div className="input-wrapper">
              <span className="input-icon"><Icons.Lock /></span>
              <input className="form-input" type="password" placeholder="Repita a senha" value={form.confirm} onChange={update("confirm")} required />
            </div>
          </div>
          {error && <div className="error-text" style={{ marginBottom: 16 }}>{error}</div>}
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? "Criando..." : "Criar Conta"}</button>
          <div className="auth-link">Já tem conta? <Link to="/login">Faça login</Link></div>
        </form>
      </div>
    </div>
  );
}
