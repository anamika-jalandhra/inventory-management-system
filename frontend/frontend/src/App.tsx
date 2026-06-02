import { useState, useEffect } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "https://inventory-backend-71mk.onrender.com",
});

type Product = { id: number; name: string; description: string; price: number; stock_quantity: number; sku: string };
type Customer = { id: number; name: string; email: string; phone: string };
type Order = { id: number; customer_id: number; product_id: number; quantity: number; total_price: number };

const NAV = ["Dashboard", "Products", "Customers", "Orders"];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0a0f;
    --surface: #111118;
    --surface2: #1a1a24;
    --border: #2a2a38;
    --accent: #7c6af7;
    --accent2: #f7c26a;
    --accent3: #6af7c2;
    --text: #f0eff8;
    --muted: #6b6a7e;
    --danger: #f76a6a;
    --success: #6af7c2;
  }

  body { background: var(--bg); color: var(--text); font-family: 'Syne', sans-serif; }

  .app { min-height: 100vh; display: flex; flex-direction: column; }

  .nav {
    display: flex; align-items: center; gap: 4px;
    padding: 0 32px; height: 60px;
    border-bottom: 1px solid var(--border);
    background: rgba(10,10,15,0.9);
    backdrop-filter: blur(12px);
    position: sticky; top: 0; z-index: 100;
  }

  .nav-logo {
    font-size: 18px; font-weight: 800; letter-spacing: -0.5px;
    color: var(--text); margin-right: 24px;
    display: flex; align-items: center; gap: 8px;
  }

  .nav-logo span {
    width: 28px; height: 28px; border-radius: 8px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
  }

  .nav-btn {
    padding: 6px 16px; border-radius: 8px; border: none;
    cursor: pointer; font-family: 'Syne', sans-serif;
    font-size: 13px; font-weight: 500; transition: all 0.15s;
    background: transparent; color: var(--muted);
  }

  .nav-btn:hover { color: var(--text); background: var(--surface2); }
  .nav-btn.active { color: var(--accent); background: rgba(124,106,247,0.12); }

  .main { max-width: 1100px; margin: 0 auto; padding: 40px 32px; width: 100%; }

  .page-title {
    font-size: 32px; font-weight: 800; letter-spacing: -1px;
    margin-bottom: 28px; color: var(--text);
  }

  .page-title span { color: var(--accent); }

  .stat-grid {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 16px; margin-bottom: 32px;
  }

  .stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px; padding: 20px 24px;
    transition: border-color 0.2s;
  }

  .stat-card:hover { border-color: var(--accent); }

  .stat-label {
    font-family: 'DM Mono', monospace;
    font-size: 11px; color: var(--muted);
    text-transform: uppercase; letter-spacing: 1px;
    margin-bottom: 8px;
  }

  .stat-value {
    font-size: 28px; font-weight: 800;
    letter-spacing: -1px; color: var(--text);
  }

  .stat-icon {
    font-size: 20px; margin-bottom: 12px;
  }

  .quick-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .quick-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px; padding: 24px;
    cursor: pointer; text-align: left;
    transition: all 0.2s; font-family: 'Syne', sans-serif;
  }

  .quick-card:hover {
    border-color: var(--accent);
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(124,106,247,0.15);
  }

  .quick-card-icon { font-size: 24px; margin-bottom: 12px; }
  .quick-card-title { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
  .quick-card-desc { font-size: 12px; color: var(--muted); }

  .section-header {
    display: flex; justify-content: space-between;
    align-items: center; margin-bottom: 20px;
  }

  .add-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 10px 20px; border-radius: 10px; border: none;
    background: var(--accent); color: white;
    font-family: 'Syne', sans-serif; font-size: 13px;
    font-weight: 600; cursor: pointer; transition: all 0.15s;
  }

  .add-btn:hover { background: #6a58e6; transform: translateY(-1px); }

  .table-wrap {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px; overflow: hidden;
  }

  table { width: 100%; border-collapse: collapse; }

  thead tr { background: var(--surface2); }

  th {
    padding: 12px 20px; text-align: left;
    font-family: 'DM Mono', monospace;
    font-size: 10px; color: var(--muted);
    text-transform: uppercase; letter-spacing: 1.5px;
    border-bottom: 1px solid var(--border);
    font-weight: 500;
  }

  td { padding: 14px 20px; font-size: 14px; }

  tr:not(:last-child) td { border-bottom: 1px solid var(--border); }

  tr:hover td { background: rgba(124,106,247,0.04); }

  .badge {
    display: inline-flex; align-items: center;
    padding: 3px 10px; border-radius: 99px;
    font-family: 'DM Mono', monospace;
    font-size: 11px; font-weight: 500;
  }

  .badge-green { background: rgba(106,247,194,0.12); color: var(--accent3); }
  .badge-amber { background: rgba(247,194,106,0.12); color: var(--accent2); }
  .badge-red { background: rgba(247,106,106,0.12); color: var(--danger); }
  .badge-blue { background: rgba(124,106,247,0.15); color: var(--accent); }

  .del-btn {
    background: none; border: none; cursor: pointer;
    color: var(--muted); font-size: 15px;
    padding: 4px 8px; border-radius: 6px;
    transition: all 0.15s;
  }

  .del-btn:hover { color: var(--danger); background: rgba(247,106,106,0.1); }

  .empty-row td {
    text-align: center; padding: 40px;
    color: var(--muted); font-family: 'DM Mono', monospace;
    font-size: 13px;
  }

  .error-msg {
    color: var(--danger); font-size: 13px;
    margin-bottom: 12px; padding: 10px 16px;
    background: rgba(247,106,106,0.1);
    border-radius: 8px; border: 1px solid rgba(247,106,106,0.2);
    font-family: 'DM Mono', monospace;
  }

  .loading { color: var(--muted); font-family: 'DM Mono', monospace; font-size: 13px; padding: 20px 0; }

  .overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    z-index: 999;
  }

  .modal {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px; padding: 28px;
    width: 440px; max-width: 90vw;
    box-shadow: 0 24px 80px rgba(0,0,0,0.6);
  }

  .modal-header {
    display: flex; justify-content: space-between;
    align-items: center; margin-bottom: 24px;
  }

  .modal-title { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }

  .close-btn {
    background: var(--surface2); border: 1px solid var(--border);
    width: 32px; height: 32px; border-radius: 8px;
    cursor: pointer; color: var(--muted);
    font-size: 16px; display: flex; align-items: center;
    justify-content: center; transition: all 0.15s;
  }

  .close-btn:hover { color: var(--text); border-color: var(--accent); }

  .field { margin-bottom: 16px; }

  .field label {
    display: block; font-family: 'DM Mono', monospace;
    font-size: 11px; color: var(--muted);
    text-transform: uppercase; letter-spacing: 1px;
    margin-bottom: 6px;
  }

  .field input, .field select {
    width: 100%; padding: 10px 14px;
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 10px; color: var(--text);
    font-family: 'Syne', sans-serif; font-size: 14px;
    transition: border-color 0.15s; outline: none;
  }

  .field input:focus, .field select:focus { border-color: var(--accent); }
  .field select option { background: var(--surface2); }

  .submit-btn {
    width: 100%; padding: 12px;
    background: linear-gradient(135deg, var(--accent), #9b8cf9);
    border: none; border-radius: 10px; color: white;
    font-family: 'Syne', sans-serif; font-size: 14px;
    font-weight: 700; cursor: pointer; margin-top: 8px;
    transition: all 0.15s; letter-spacing: 0.3px;
  }

  .submit-btn:hover { opacity: 0.9; transform: translateY(-1px); }

  .avatar {
    width: 34px; height: 34px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    color: white; flex-shrink: 0;
  }

  .name-cell { display: flex; align-items: center; gap: 10px; }
  .name-cell .name { font-weight: 600; }
  .mono { font-family: 'DM Mono', monospace; font-size: 12px; }
`;

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return <span className={`badge badge-${color}`}>{children}</span>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, type = "text", value, onChange }: { label: string; type?: string; value: string | number; onChange: (v: string) => void }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: "", stock: "" });
  const [error, setError] = useState("");

  const load = () => { setLoading(true); api.get("/products/").then(r => setProducts(r.data)).catch(() => setError("Failed to load")).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const add = async () => {
    try {
      const sku = form.name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
      await api.post("/products/", { sku, name: form.name, description: form.description, price: parseFloat(form.price), stock_quantity: parseInt(form.stock) });
      setShowAdd(false); setForm({ name: "", description: "", price: "", stock: "" }); load();
    } catch { setError("Failed to add product"); }
  };

  const del = async (id: number) => { await api.delete(`/products/${id}`); load(); };

  return (
    <div>
      <div className="section-header">
        <h1 className="page-title">Prod<span>ucts</span></h1>
        <button className="add-btn" onClick={() => { setError(""); setShowAdd(true); }}>+ Add Product</button>
      </div>
      {error && <div className="error-msg">{error}</div>}
      {loading ? <p className="loading">Loading products...</p> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>SKU</th><th>Name</th><th>Description</th><th>Price</th><th>Stock</th><th></th></tr></thead>
            <tbody>
              {products.length === 0
                ? <tr className="empty-row"><td colSpan={6}>— no products yet —</td></tr>
                : products.map((p, i) => (
                  <tr key={p.id}>
                    <td><span className="mono" style={{ color: "var(--muted)" }}>{p.sku}</span></td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td style={{ color: "var(--muted)", fontSize: 13 }}>{p.description}</td>
                    <td><span className="mono">₹{p.price?.toFixed(2)}</span></td>
                    <td><Badge color={p.stock_quantity > 10 ? "green" : p.stock_quantity > 0 ? "amber" : "red"}>{p.stock_quantity} units</Badge></td>
                    <td><button className="del-btn" onClick={() => del(p.id)}>🗑</button></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
      {showAdd && (
        <Modal title="New Product" onClose={() => setShowAdd(false)}>
          <Field label="Product Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />
          <Field label="Description" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} />
          <Field label="Price (₹)" type="number" value={form.price} onChange={v => setForm(f => ({ ...f, price: v }))} />
          <Field label="Stock Quantity" type="number" value={form.stock} onChange={v => setForm(f => ({ ...f, stock: v }))} />
          <button className="submit-btn" onClick={add}>Create Product →</button>
        </Modal>
      )}
    </div>
  );
}

function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [error, setError] = useState("");

  const load = () => { setLoading(true); api.get("/customers/").then(r => setCustomers(r.data)).catch(() => setError("Failed to load")).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const add = async () => {
    try {
      await api.post("/customers/", form);
      setShowAdd(false); setForm({ name: "", email: "", phone: "" }); load();
    } catch { setError("Failed to add customer"); }
  };

  const del = async (id: number) => { await api.delete(`/customers/${id}`); load(); };

  return (
    <div>
      <div className="section-header">
        <h1 className="page-title">Custo<span>mers</span></h1>
        <button className="add-btn" onClick={() => { setError(""); setShowAdd(true); }}>+ Add Customer</button>
      </div>
      {error && <div className="error-msg">{error}</div>}
      {loading ? <p className="loading">Loading customers...</p> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th></th></tr></thead>
            <tbody>
              {customers.length === 0
                ? <tr className="empty-row"><td colSpan={4}>— no customers yet —</td></tr>
                : customers.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div className="name-cell">
                        <div className="avatar">{c.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}</div>
                        <span className="name">{c.name}</span>
                      </div>
                    </td>
                    <td style={{ color: "var(--muted)", fontSize: 13 }}>{c.email}</td>
                    <td><span className="mono" style={{ color: "var(--muted)" }}>{c.phone}</span></td>
                    <td><button className="del-btn" onClick={() => del(c.id)}>🗑</button></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
      {showAdd && (
        <Modal title="New Customer" onClose={() => setShowAdd(false)}>
          <Field label="Full Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />
          <Field label="Email Address" type="email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
          <Field label="Phone Number" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} />
          <button className="submit-btn" onClick={add}>Add Customer →</button>
        </Modal>
      )}
    </div>
  );
}

function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ customer_id: "", product_id: "", quantity: "" });
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([api.get("/orders/"), api.get("/customers/"), api.get("/products/")])
      .then(([o, c, p]) => { setOrders(o.data); setCustomers(c.data); setProducts(p.data); })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    try {
      await api.post("/orders/", { customer_id: parseInt(form.customer_id), product_id: parseInt(form.product_id), quantity: parseInt(form.quantity) });
      setShowAdd(false); setForm({ customer_id: "", product_id: "", quantity: "" }); load();
    } catch { setError("Not enough stock or invalid data"); }
  };

  const customerName = (id: number) => customers.find(c => c.id === id)?.name ?? `#${id}`;
  const productName = (id: number) => products.find(p => p.id === id)?.name ?? `#${id}`;

  return (
    <div>
      <div className="section-header">
        <h1 className="page-title">Ord<span>ers</span></h1>
        <button className="add-btn" onClick={() => { setError(""); setShowAdd(true); }}>+ New Order</button>
      </div>
      {error && <div className="error-msg">{error}</div>}
      {loading ? <p className="loading">Loading orders...</p> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Order ID</th><th>Customer</th><th>Product</th><th>Qty</th><th>Total</th></tr></thead>
            <tbody>
              {orders.length === 0
                ? <tr className="empty-row"><td colSpan={5}>— no orders yet —</td></tr>
                : orders.map(o => (
                  <tr key={o.id}>
                    <td><Badge color="blue">#{o.id}</Badge></td>
                    <td style={{ fontWeight: 600 }}>{customerName(o.customer_id)}</td>
                    <td style={{ color: "var(--muted)" }}>{productName(o.product_id)}</td>
                    <td><span className="mono">{o.quantity}</span></td>
                    <td><span className="mono" style={{ color: "var(--accent3)", fontWeight: 600 }}>₹{o.total_price?.toFixed(2)}</span></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
      {showAdd && (
        <Modal title="New Order" onClose={() => setShowAdd(false)}>
          <div className="field">
            <label>Customer</label>
            <select value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))}>
              <option value="">Select customer</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Product</label>
            <select value={form.product_id} onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))}>
              <option value="">Select product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} (stock: {p.stock_quantity})</option>)}
            </select>
          </div>
          <Field label="Quantity" type="number" value={form.quantity} onChange={v => setForm(f => ({ ...f, quantity: v }))} />
          <button className="submit-btn" onClick={add}>Place Order →</button>
        </Modal>
      )}
    </div>
  );
}

function Dashboard({ setTab }: { setTab: (t: string) => void }) {
  const [stats, setStats] = useState({ products: 0, customers: 0, orders: 0, revenue: 0 });
  useEffect(() => {
    Promise.all([api.get("/products/"), api.get("/customers/"), api.get("/orders/")])
      .then(([p, c, o]) => {
        const revenue = o.data.reduce((sum: number, ord: Order) => sum + (ord.total_price ?? 0), 0);
        setStats({ products: p.data.length, customers: c.data.length, orders: o.data.length, revenue });
      }).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="page-title">Over<span>view</span></h1>
      <div className="stat-grid">
        {[
          { icon: "📦", label: "Products", value: stats.products },
          { icon: "👥", label: "Customers", value: stats.customers },
          { icon: "🛒", label: "Orders", value: stats.orders },
          { icon: "💰", label: "Revenue", value: `₹${stats.revenue.toFixed(0)}` },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>
      <div className="quick-grid">
        {[
          { icon: "📦", title: "Products", desc: "Manage your inventory stock", tab: "Products" },
          { icon: "👥", title: "Customers", desc: "View and manage customers", tab: "Customers" },
          { icon: "🛒", title: "Orders", desc: "Track and create orders", tab: "Orders" },
        ].map(c => (
          <button className="quick-card" key={c.tab} onClick={() => setTab(c.tab)}>
            <div className="quick-card-icon">{c.icon}</div>
            <div className="quick-card-title">{c.title}</div>
            <div className="quick-card-desc">{c.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("Dashboard");

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <nav className="nav">
          <div className="nav-logo">
            <span>⬡</span>
            INVNT
          </div>
          {NAV.map(n => (
            <button key={n} className={`nav-btn ${tab === n ? "active" : ""}`} onClick={() => setTab(n)}>{n}</button>
          ))}
        </nav>
        <main className="main">
          {tab === "Dashboard" && <Dashboard setTab={setTab} />}
          {tab === "Products" && <Products />}
          {tab === "Customers" && <Customers />}
          {tab === "Orders" && <Orders />}
        </main>
      </div>
    </>
  );
}
