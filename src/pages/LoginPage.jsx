import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Icons } from "../utils/icons.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const [email, setEmail] = useState("ana@smartstock.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const result = login(email, password);
      setLoading(false);
      if (!result.ok) setError(result.error);
      else navigate(from, { replace: true });
    }, 300);
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-hero">
        <div className="auth-logo">
          <div className="auth-logo-icon"><Icons.Box /></div>
          <h1>SmartStock</h1>
          <p>Controle seu estoque de forma inteligente</p>
        </div>
      </div>
      <div className="auth-form-side">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Entrar</h2>
          <p className="subtitle">Acesse sua conta para continuar</p>
          <div className="form-group">
            <label>Email</label>
            <div className="input-wrapper">
              <span className="input-icon"><Icons.Mail /></span>
              <input className="form-input" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label>Senha</label>
            <div className="input-wrapper">
              <span className="input-icon"><Icons.Lock /></span>
              <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>
          {error && <div className="error-text" style={{ marginBottom: 16 }}>{error}</div>}
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>
          <div className="auth-link"><Link to="/recuperar">Esqueceu a senha?</Link></div>
          <div className="auth-link">Não tem conta? <Link to="/cadastro">Cadastre-se</Link></div>
          <div className="auth-info" style={{ marginTop: 24 }}><strong>Demo:</strong> ana@smartstock.com / admin123</div>
        </form>
      </div>
    </div>
  );
}
