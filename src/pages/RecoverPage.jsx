import { useState } from "react";
import { Link } from "react-router-dom";
import { Icons } from "../utils/icons.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function RecoverPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { recover } = useAuth();

  function handleSubmit(e) {
    e.preventDefault();
    setError(""); setMessage("");
    setLoading(true);
    setTimeout(() => {
      const result = recover(email);
      setLoading(false);
      if (!result.ok) setError(result.error);
      else setMessage(result.message);
    }, 300);
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-hero">
        <div className="auth-logo">
          <div className="auth-logo-icon"><Icons.Box /></div>
          <h1>SmartStock</h1>
          <p>Sistema de Gerenciamento de Estoque Inteligente</p>
        </div>
      </div>
      <div className="auth-form-side">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Recuperar Senha</h2>
          <p className="subtitle">Informe seu email e enviaremos um link para redefinir sua senha</p>
          <div className="form-group">
            <label>Email</label>
            <div className="input-wrapper">
              <span className="input-icon"><Icons.Mail /></span>
              <input className="form-input" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>
          {error && <div className="error-text" style={{ marginBottom: 16 }}>{error}</div>}
          {message && <div style={{ padding: 12, background: "var(--success-bg)", color: "var(--success)", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{message}</div>}
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? "Enviando..." : "Enviar Link"}</button>
          <div className="auth-info">O link de redefinição terá validade de 1 hora.</div>
          <div className="auth-link"><Link to="/login">Voltar ao login</Link></div>
        </form>
      </div>
    </div>
  );
}
