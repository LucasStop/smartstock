import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { loadState, saveState, uid } from "../utils/storage.js";
import { seedCategories, seedMovements, seedProducts, seedSuppliers } from "../data/seedData.js";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [products, setProducts] = useState(() => loadState("products", seedProducts));
  const [categories, setCategories] = useState(() => loadState("categories", seedCategories));
  const [suppliers, setSuppliers] = useState(() => loadState("suppliers", seedSuppliers));
  const [movements, setMovements] = useState(() => loadState("movements", seedMovements));
  const [toasts, setToasts] = useState([]);

  useEffect(() => { saveState("products", products); }, [products]);
  useEffect(() => { saveState("categories", categories); }, [categories]);
  useEffect(() => { saveState("suppliers", suppliers); }, [suppliers]);
  useEffect(() => { saveState("movements", movements); }, [movements]);

  const toast = useCallback((message, type = "info") => {
    const id = uid();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  }, []);

  function createProduct(data) {
    if (products.some((p) => p.sku.toLowerCase() === data.sku.toLowerCase())) return { ok: false, error: "Já existe um produto com este SKU." };
    setProducts((prev) => [...prev, { id: uid(), createdAt: new Date().toISOString(), ...data }]);
    toast("Produto cadastrado com sucesso!", "success");
    return { ok: true };
  }
  function updateProduct(id, patch) {
    if (patch.sku && products.some((p) => p.id !== id && p.sku.toLowerCase() === patch.sku.toLowerCase())) return { ok: false, error: "Já existe outro produto com este SKU." };
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    toast("Produto atualizado.", "success");
    return { ok: true };
  }
  function removeProduct(id) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setMovements((prev) => prev.filter((m) => m.productId !== id));
    toast("Produto removido.", "success");
  }

  function createCategory(data) {
    if (categories.some((c) => c.name.toLowerCase() === data.name.toLowerCase())) return { ok: false, error: "Já existe uma categoria com este nome." };
    setCategories((prev) => [...prev, { id: uid(), createdAt: new Date().toISOString(), ...data }]);
    toast("Categoria criada.", "success");
    return { ok: true };
  }
  function updateCategory(id, patch) {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    toast("Categoria atualizada.", "success");
    return { ok: true };
  }
  function removeCategory(id) {
    if (products.some((p) => p.categoryId === id)) { toast("Não é possível remover: existem produtos nesta categoria.", "error"); return; }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    toast("Categoria removida.", "success");
  }

  function createSupplier(data) {
    if (suppliers.some((s) => s.cnpj === data.cnpj)) return { ok: false, error: "Já existe um fornecedor com este CNPJ." };
    setSuppliers((prev) => [...prev, { id: uid(), createdAt: new Date().toISOString(), ...data }]);
    toast("Fornecedor cadastrado.", "success");
    return { ok: true };
  }
  function updateSupplier(id, patch) {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    toast("Fornecedor atualizado.", "success");
    return { ok: true };
  }
  function removeSupplier(id) {
    if (products.some((p) => p.supplierId === id)) { toast("Não é possível remover: existem produtos deste fornecedor.", "error"); return; }
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    toast("Fornecedor removido.", "success");
  }

  function createMovement({ productId, type, quantity, reason, userId }) {
    const qty = Number(quantity);
    if (!productId) return { ok: false, error: "Selecione um produto." };
    if (!qty || qty === 0) return { ok: false, error: "Quantidade deve ser diferente de zero." };
    const product = products.find((p) => p.id === productId);
    if (!product) return { ok: false, error: "Produto não encontrado." };
    let delta = 0;
    if (type === "ENTRADA") delta = Math.abs(qty);
    else if (type === "SAIDA") delta = -Math.abs(qty);
    else delta = qty;
    const newQty = product.quantity + delta;
    if (newQty < 0) return { ok: false, error: "Estoque insuficiente para esta saída." };
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, quantity: newQty } : p)));
    setMovements((prev) => [{ id: uid(), date: new Date().toISOString(), productId, type, quantity: delta, reason: reason?.trim() || "—", userId }, ...prev]);
    toast("Movimentação registrada.", "success");
    return { ok: true };
  }

  const getCategoryName = useCallback((id) => categories.find((c) => c.id === id)?.name || "—", [categories]);
  const getSupplierName = useCallback((id) => suppliers.find((s) => s.id === id)?.name || "—", [suppliers]);
  const getProduct = useCallback((id) => products.find((p) => p.id === id), [products]);

  const stats = useMemo(() => {
    const lowStock = products.filter((p) => p.quantity < p.minQuantity);
    const stockValue = products.reduce((sum, p) => sum + p.quantity * p.price, 0);
    const now = new Date();
    const monthMovs = movements.filter((m) => { const d = new Date(m.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
    return { totalProducts: products.length, totalCategories: categories.length, totalSuppliers: suppliers.length, stockValue, lowStockCount: lowStock.length, lowStockItems: lowStock, monthMovements: monthMovs.length };
  }, [products, categories, suppliers, movements]);

  const value = { products, categories, suppliers, movements, createProduct, updateProduct, removeProduct, createCategory, updateCategory, removeCategory, createSupplier, updateSupplier, removeSupplier, createMovement, getCategoryName, getSupplierName, getProduct, stats, toast, toasts };
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData deve ser usado dentro do DataProvider");
  return ctx;
}
