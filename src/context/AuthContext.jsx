import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loadState, saveState, uid } from "../utils/storage.js";
import { seedUsers } from "../data/seedData.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => loadState("users", seedUsers));
  const [currentUserId, setCurrentUserId] = useState(() => loadState("currentUserId", null));

  useEffect(() => { saveState("users", users); }, [users]);
  useEffect(() => { saveState("currentUserId", currentUserId); }, [currentUserId]);

  const currentUser = useMemo(() => users.find((u) => u.id === currentUserId) || null, [users, currentUserId]);

  function login(email, password) {
    const user = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase() && u.password === password);
    if (!user) return { ok: false, error: "Email ou senha incorretos." };
    if (!user.active) return { ok: false, error: "Usuário inativo. Contate o administrador." };
    setCurrentUserId(user.id);
    return { ok: true };
  }

  function register({ name, email, password }) {
    if (!name?.trim() || !email?.trim() || !password) return { ok: false, error: "Preencha todos os campos." };
    if (password.length < 6) return { ok: false, error: "A senha deve ter no mínimo 6 caracteres." };
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) return { ok: false, error: "Já existe um usuário com este email." };
    const newUser = { id: uid(), name: name.trim(), email: email.trim(), password, role: "USER", active: true, createdAt: new Date().toISOString() };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUserId(newUser.id);
    return { ok: true };
  }

  function logout() { setCurrentUserId(null); }

  function recover(email) {
    const user = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
    if (!user) return { ok: false, error: "Email não encontrado na base." };
    return { ok: true, message: "Link de recuperação enviado (simulação). Validade: 1 hora." };
  }

  function updateUser(id, patch) { setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u))); }

  function createUser(data) {
    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) return { ok: false, error: "Já existe um usuário com este email." };
    setUsers((prev) => [...prev, { id: uid(), ...data, createdAt: new Date().toISOString() }]);
    return { ok: true };
  }

  function removeUser(id) { setUsers((prev) => prev.filter((u) => u.id !== id)); }

  const value = { users, currentUser, isAuthenticated: !!currentUser, isAdmin: currentUser?.role === "ADMIN", login, register, logout, recover, updateUser, createUser, removeUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro do AuthProvider");
  return ctx;
}
