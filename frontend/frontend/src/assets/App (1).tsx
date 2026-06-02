import { useState, useEffect } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "https://inventory-backend-71mk.onrender.com",
});

type Product = { id: number; name: string; description: string; price: number; stock_quantity: number; sku: string };
type Customer = { id: number; name: string; email: string; phone: string };
type Order = { id: number; customer_id: number; product_id: number; quantity: number; total_price: number };

const NAV = ["Dashboard", "Products", "Customers", "Orders"];

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  const colors: Record<string, string> = {
    green: "background:#eaf3de;color:#3b6d11",
    red: "background:#fcebeb;color:#a32d2d",
    blue: "background:#e6f1fb;color:#185fa5",
    amber: "background:#faeeda;color:#854f0b",
  };
  return (
    <span style={{
      ...Object.fromEntries(colors[color].split(";").map(s => s.split(":") as [string,string])),
      fontSize: 12, padding: "2px 10px", borderRadius: 99, fontWeight: 500
    }}>{children}</span>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: number | string; color: string }) {
  const bg: Record<string, string> = { blue: "#e6f1fb", green: "#eaf3de", amber: "#faeeda", purple: "#eeedfe" };
  const fg: Record<string, string> = { blue: "#185fa5", green: "#3b6d11", amber: "#854f0b", purple: "#533ab7" };
  return (
    <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: bg[color], display: "flex", alignItems: "center", justifyContent: "center" }}>
        <i className={`ti ti-${icon}`} style={{ fontSize: 22, color: fg[color] }} aria-hidden="true" />
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)" }}>{label}</p>
        <p style={{ margin: 0, fontSize: 22, fontWeight: 500, color: "var(--color-text-primary)" }}>{value}</p>
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
      <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 14, padding: "1.5rem", width: 420, maxWidth: "90vw" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "var(--color-text-secondary)" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function InputField({ label, type = "text", value, onChange, placeholder }: { label: string; type?: string; value: string | number; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 5 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", padding: "8px 12px", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, fontSize: 14, background: "var(--color-background-primary)", color: "var(--color-text-primary)", boxSizing: "border-box" }} />
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
      await api.post("/products/", {
        sku,
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        stock_quantity: parseInt(form.stock)
      });
      setShowAdd(false); setForm({ name: "", description: "", price: "", stock: "" }); load();
    } catch { setError("Failed to add product"); }
  };

  const del = async (id: number) => { await api.delete(`/products/${id}`); load(); };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 500 }}>Products</h2>
        <button onClick={() => { setError(""); setShowAdd(true); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "var(--color-text-primary)", color: "var(--color-background-primary)", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14 }}>
          + Add Product
        </button>
      </div>
      {error && <p style={{ color: "#a32d2d", fontSize: 13 }}>{error}</p>}
      {loading ? <p style={{ color: "var(--color-text-secondary)" }}>Loading…</p> : (
        <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "var(--color-background-secondary)" }}>
                {["SKU", "Name", "Description", "Price", "Stock", ""].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", color: "var(--color-text-secondary)" }}>No products yet</td></tr>
              ) : products.map((p, i) => (
                <tr key={p.id} style={{ borderTop: i > 0 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                  <td style={{ padding: "12px 16px", color: "var(--color-text-secondary)", fontSize: 12 }}>{p.sku}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 500 }}>{p.name}</td>
                  <td style={{ padding: "12px 16px", color: "var(--color-text-secondary)" }}>{p.description}</td>
                  <td style={{ padding: "12px 16px" }}>₹{p.price?.toFixed(2)}</td>
                  <td style={{ padding: "12px 16px" }}><Badge color={p.stock_quantity > 10 ? "green" : p.stock_quantity > 0 ? "amber" : "red"}>{p.stock_quantity} units</Badge></td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <button onClick={() => del(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#a32d2d", fontSize: 16 }}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showAdd && (
        <Modal title="Add Product" onClose={() => setShowAdd(false)}>
          <InputField label="Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />
          <InputField label="Description" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} />
          <InputField label="Price" type="number" value={form.price} onChange={v => setForm(f => ({ ...f, price: v }))} />
          <InputField label="Stock" type="number" value={form.stock} onChange={v => setForm(f => ({ ...f, stock: v }))} />
          <button onClick={add} style={{ width: "100%", padding: "10px", background: "var(--color-text-primary)", color: "var(--color-background-primary)", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, marginTop: 6 }}>Add Product</button>
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 500 }}>Customers</h2>
        <button onClick={() => { setError(""); setShowAdd(true); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "var(--color-text-primary)", color: "var(--color-background-primary)", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14 }}>
          + Add Customer
        </button>
      </div>
      {error && <p style={{ color: "#a32d2d", fontSize: 13 }}>{error}</p>}
      {loading ? <p style={{ color: "var(--color-text-secondary)" }}>Loading…</p> : (
        <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "var(--color-background-secondary)" }}>
                {["Name", "Email", "Phone", ""].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: 24, textAlign: "center", color: "var(--color-text-secondary)" }}>No customers yet</td></tr>
              ) : customers.map((c, i) => (
                <tr key={c.id} style={{ borderTop: i > 0 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#e6f1fb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500, color: "#185fa5" }}>
                        {c.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 500 }}>{c.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--color-text-secondary)" }}>{c.email}</td>
                  <td style={{ padding: "12px 16px", color: "var(--color-text-secondary)" }}>{c.phone}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <button onClick={() => del(c.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#a32d2d", fontSize: 16 }}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showAdd && (
        <Modal title="Add Customer" onClose={() => setShowAdd(false)}>
          <InputField label="Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />
          <InputField label="Email" type="email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
          <InputField label="Phone" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} />
          <button onClick={add} style={{ width: "100%", padding: "10px", background: "var(--color-text-primary)", color: "var(--color-background-primary)", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, marginTop: 6 }}>Add Customer</button>
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 500 }}>Orders</h2>
        <button onClick={() => { setError(""); setShowAdd(true); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "var(--color-text-primary)", color: "var(--color-background-primary)", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14 }}>
          + New Order
        </button>
      </div>
      {error && <p style={{ color: "#a32d2d", fontSize: 13 }}>{error}</p>}
      {loading ? <p style={{ color: "var(--color-text-secondary)" }}>Loading…</p> : (
        <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "var(--color-background-secondary)" }}>
                {["Order ID", "Customer", "Product", "Qty", "Total"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 24, textAlign: "center", color: "var(--color-text-secondary)" }}>No orders yet</td></tr>
              ) : orders.map((o, i) => (
                <tr key={o.id} style={{ borderTop: i > 0 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                  <td style={{ padding: "12px 16px" }}><Badge color="blue">#{o.id}</Badge></td>
                  <td style={{ padding: "12px 16px", fontWeight: 500 }}>{customerName(o.customer_id)}</td>
                  <td style={{ padding: "12px 16px", color: "var(--color-text-secondary)" }}>{productName(o.product_id)}</td>
                  <td style={{ padding: "12px 16px" }}>{o.quantity}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 500 }}>₹{o.total_price?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showAdd && (
        <Modal title="New Order" onClose={() => setShowAdd(false)}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 5 }}>Customer</label>
            <select value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))}
              style={{ width: "100%", padding: "8px 12px", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, fontSize: 14, background: "var(--color-background-primary)", color: "var(--color-text-primary)" }}>
              <option value="">Select customer</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 5 }}>Product</label>
            <select value={form.product_id} onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))}
              style={{ width: "100%", padding: "8px 12px", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, fontSize: 14, background: "var(--color-background-primary)", color: "var(--color-text-primary)" }}>
              <option value="">Select product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} (stock: {p.stock_quantity})</option>)}
            </select>
          </div>
          <InputField label="Quantity" type="number" value={form.quantity} onChange={v => setForm(f => ({ ...f, quantity: v }))} />
          <button onClick={add} style={{ width: "100%", padding: "10px", background: "var(--color-text-primary)", color: "var(--color-background-primary)", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, marginTop: 6 }}>Place Order</button>
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
      });
  }, []);

  return (
    <div>
      <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 500 }}>Dashboard</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 28 }}>
        <StatCard icon="package" label="Products" value={stats.products} color="blue" />
        <StatCard icon="users" label="Customers" value={stats.customers} color="purple" />
        <StatCard icon="shopping-cart" label="Orders" value={stats.orders} color="amber" />
        <StatCard icon="currency-rupee" label="Revenue" value={`₹${stats.revenue.toFixed(0)}`} color="green" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        {[
          { label: "Manage Products", desc: "Add, update, track stock", tab: "Products" },
          { label: "Manage Customers", desc: "View and add customers", tab: "Customers" },
          { label: "Manage Orders", desc: "Create and view orders", tab: "Orders" },
        ].map(card => (
          <button key={card.tab} onClick={() => setTab(card.tab)}
            style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "1.25rem", textAlign: "left", cursor: "pointer" }}>
            <p style={{ margin: "0 0 4px", fontWeight: 500, fontSize: 15 }}>{card.label}</p>
            <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)" }}>{card.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("Dashboard");

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-background-tertiary, #f5f5f3)", fontFamily: "system-ui, sans-serif" }}>
      <nav style={{ background: "var(--color-background-primary)", borderBottom: "0.5px solid var(--color-border-tertiary)", padding: "0 24px", display: "flex", alignItems: "center", gap: 8, height: 56 }}>
        <span style={{ fontWeight: 500, fontSize: 15, marginRight: 24 }}>Inventory</span>
        {NAV.map(n => (
          <button key={n} onClick={() => setTab(n)}
            style={{ padding: "6px 14px", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: tab === n ? 500 : 400, background: tab === n ? "var(--color-background-secondary)" : "transparent", color: tab === n ? "var(--color-text-primary)" : "var(--color-text-secondary)" }}>
            {n}
          </button>
        ))}
      </nav>
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "28px 24px" }}>
        {tab === "Dashboard" && <Dashboard setTab={setTab} />}
        {tab === "Products" && <Products />}
        {tab === "Customers" && <Customers />}
        {tab === "Orders" && <Orders />}
      </main>
    </div>
  );
}
