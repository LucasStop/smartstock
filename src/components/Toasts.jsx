import { useData } from "../context/DataContext.jsx";

export default function Toasts() {
  const { toasts } = useData();
  if (!toasts?.length) return null;
  return (
    <div className="toast-container">
      {toasts.map((t) => <div key={t.id} className={`toast ${t.type}`}>{t.message}</div>)}
    </div>
  );
}
