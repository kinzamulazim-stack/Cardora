import { useEffect, useMemo, useState } from "react";

const sampleProducts = [
  { _id: "sample-1", name: "Classic Student Card", category: "Personalized", price: 450, tag: "Bestseller", description: "A clean, personalized student-themed card design.", tone: "olive", mark: "C" },
  { _id: "sample-2", name: "Minimal Campus Card", category: "Minimal", price: 550, tag: "New", description: "A modern layout with a calm, minimal finish.", tone: "sand", mark: "M" },
  { _id: "sample-3", name: "Study Planner Card Set", category: "Stationery", price: 650, tag: "Set of 3", description: "Coordinated study and desk cards for everyday use.", tone: "brown", mark: "S" }
];
const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [products, setProducts] = useState(sampleProducts);
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState("All");
  const [notice, setNotice] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem("cardora_admin_token") || "");
  const [adminUser, setAdminUser] = useState(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminBusy, setAdminBusy] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [orders, setOrders] = useState([]);
  const [draft, setDraft] = useState({ name: "", description: "", price: "", category: "Personalized" });
  const [editingId, setEditingId] = useState("");
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const visible = useMemo(() => category === "All" ? products : products.filter(p => p.category === category), [category, products]);

  useEffect(() => {
    fetch(API + "/api/products")
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(data => { if (Array.isArray(data) && data.length) setProducts(data.map((p, i) => ({ ...p, _id: p._id || String(i), tone: ["olive", "sand", "brown"][i % 3], mark: p.name?.[0]?.toUpperCase() || "C", tag: "CARDORA" })); })
      .catch(() => {});
  }, []);

  function notify(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  }

  function addToCart(product) {
    setCart(current => {
      const found = current.find(item => item._id === product._id);
      return found
        ? current.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { ...product, quantity: 1 }];
    });
    notify(product.name + " added to your bag.");
  }

  function changeQuantity(id, delta) {
    setCart(current => current.map(item => item._id === id ? { ...item, quantity: item.quantity + delta } : item).filter(item => item.quantity > 0));
  }

  async function adminRequest(path, options = {}) {
    const response = await fetch(API + path, {
      ...options,
      headers: { "Content-Type": "application/json", ...(adminToken ? { Authorization: "Bearer " + adminToken } : {}), ...(options.headers || {}) }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || "Request could not be completed.");
    return data;
  }

  async function adminLogin(event) {
    event.preventDefault();
    setAdminBusy(true); setAdminError("");
    try {
      const data = await adminRequest("/api/auth/login", { method: "POST", body: JSON.stringify({ email: adminEmail, password: adminPassword }) });
      if (data.user?.role !== "admin") throw new Error("This account does not have administrator access.");
      sessionStorage.setItem("cardora_admin_token", data.token);
      setAdminToken(data.token); setAdminUser(data.user); setAdminPassword("");
      await loadAdminData(data.token);
    } catch (error) { setAdminError(error.message); }
    finally { setAdminBusy(false); }
  }

  async function loadAdminData(token = adminToken) {
    const headers = { Authorization: "Bearer " + token };
    const [productResponse, orderResponse] = await Promise.all([
      fetch(API + "/api/admin/products", { headers }),
      fetch(API + "/api/admin/orders", { headers })
    ]);
    if (!productResponse.ok || !orderResponse.ok) throw new Error("Admin session expired or access denied. Please sign in again.");
    const [productData, orderData] = await Promise.all([productResponse.json(), orderResponse.json()]);
    setProducts(productData.map((p, i) => ({ ...p, tone: ["olive", "sand", "brown"][i % 3], mark: p.name?.[0]?.toUpperCase() || "C", tag: "CARDORA" })));
    setOrders(orderData);
  }

  async function openAdmin() {
    setAdminOpen(true); setAdminError("");
    if (adminToken) {
      try { await loadAdminData(); }
      catch (error) { setAdminError(error.message); logoutAdmin(); }
    }
  }

  function logoutAdmin() {
    sessionStorage.removeItem("cardora_admin_token");
    setAdminToken(""); setAdminUser(null); setOrders([]);
  }

  async function saveProduct(event) {
    event.preventDefault(); setAdminError("");
    try {
      const payload = { ...draft, price: Number(draft.price) };
      const isEditing = Boolean(editingId);
      await adminRequest(isEditing ? "/api/admin/products/" + editingId : "/api/admin/products", {
        method: isEditing ? "PUT" : "POST", body: JSON.stringify(payload)
      });
      setDraft({ name: "", description: "", price: "", category: "Personalized" }); setEditingId("");
      await loadAdminData(); notify(isEditing ? "Product updated." : "Product added.");
    } catch (error) { setAdminError(error.message); }
  }

  async function deleteProduct(id) {
    if (!window.confirm("Delete this product from the store?")) return;
    try { await adminRequest("/api/admin/products/" + id, { method: "DELETE" }); await loadAdminData(); notify("Product deleted."); }
    catch (error) { setAdminError(error.message); }
  }

  async function updateOrderStatus(id, status) {
    try { await adminRequest("/api/admin/orders/" + id, { method: "PATCH", body: JSON.stringify({ status }) }); await loadAdminData(); }
    catch (error) { setAdminError(error.message); }
  }

  return (
    <div>
      <div className="announcement">Thoughtful designs for your campus life <span>✦</span> Made personal, made simple</div>
      <header className="header">
        <a className="brand" href="#home" aria-label="Cardora home"><span className="brand-mark">C</span><span>CARDORA<small>IDENTITY, DESIGNED WITH ELEGANCE</small></span></a>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">☰</button>
        <nav className={menuOpen ? "nav open" : "nav"}>
          <a href="#home" onClick={() => setMenuOpen(false)}>Home</a><a href="#shop" onClick={() => setMenuOpen(false)}>Shop</a>
          <a href="#custom" onClick={() => setMenuOpen(false)}>Custom design</a><a href="#about" onClick={() => setMenuOpen(false)}>Our story</a>
        </nav>
        <a className="bag" href="#bag">Bag <span>{count}</span></a>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-copy"><p className="eyebrow">THE CARDORA COLLECTION</p><h1>A little detail.<br/><em>A lot of identity.</em></h1>
            <p className="hero-text">Discover thoughtfully designed personalized cards and stationery that bring a little more personality to your everyday campus life.</p>
            <a className="button button-dark" href="#shop">Explore the collection <span>↗</span></a><div className="hero-note"><span>✳</span> Made for your moments, your way.</div>
          </div>
          <div className="hero-art" aria-label="Decorative preview of Cardora personalized cards"><div className="art-stamp">C<br/><small>STUDIO</small></div><div className="card-back"></div>
            <div className="display-card"><div className="card-top">CARDORA <span>✳</span></div><div className="card-orbit">C</div><div className="card-bottom"><span>YOUR NAME HERE</span><span>PERSONAL COLLECTION · 01</span></div></div>
            <div className="art-caption">THE PERSONAL<br/>COLLECTION — 01</div>
          </div>
        </section>
        <section className="trust-strip"><div><b>01</b><span>Personalized designs</span></div><div><b>02</b><span>Thoughtful details</span></div><div><b>03</b><span>Simple ordering</span></div></section>
        <section className="shop section" id="shop">
          <div className="section-heading"><div><p className="eyebrow">CURATED FOR YOU</p><h2>Find your <em>everyday favorite.</em></h2></div><p>Considered designs, warm colors, and little details that make each piece feel like yours.</p></div>
          <div className="filters">{["All", "Personalized", "Minimal", "Stationery"].map(item => <button key={item} className={category === item ? "filter active" : "filter"} onClick={() => setCategory(item)}>{item}</button>)}</div>
          <div className="product-grid">{visible.map(product => <article className="product" key={product._id}>
            <div className={"product-art " + (product.tone || "olive")}><span className="product-tag">{product.tag || "CARDORA"}</span><div className="mini-card"><span>CARDORA <b>✳</b></span><strong>{product.mark || product.name?.[0] || "C"}</strong><small>MADE PERSONAL</small></div></div>
            <div className="product-info"><div><h3>{product.name}</h3><p>{product.description}</p></div><strong>Rs. {Number(product.price).toLocaleString("en-PK")}</strong></div>
            <button className="add-button" onClick={() => addToCart(product)}>Add to bag <span>＋</span></button>
          </article>)}</div>
        </section>
        <section className="custom section" id="custom"><div className="custom-ornament">✳</div><div><p className="eyebrow">YOUR IDEA, OUR CANVAS</p><h2>Make it <em>personal.</em></h2><p>Have a color, name, or theme in mind? Tell us what you imagine and we’ll help shape a design that feels like you.</p><a className="button button-light" href="mailto:hello@cardora.example?subject=Custom%20Card%20Enquiry">Request a custom design <span>↗</span></a></div><div className="custom-side-note">A thoughtful<br/>little something<br/>made just for you.</div></section>
        <section className="about section" id="about"><p className="eyebrow">A NOTE FROM CARDORA</p><h2>Designed with care.<br/><em>Chosen by you.</em></h2><p>We believe everyday things can feel special. CARDORA is a small design-led concept for personalized student-themed cards and stationery, made to celebrate your style and campus moments.</p></section>
        <section className="bag-section section" id="bag"><div className="section-heading"><div><p className="eyebrow">YOUR SELECTION</p><h2>Your shopping <em>bag.</em></h2></div><span className="bag-count">{count} item{count === 1 ? "" : "s"}</span></div>
          {cart.length === 0 ? <div className="empty-bag">Your bag is waiting for something lovely. <a href="#shop">Explore the collection ↗</a></div> :
            <div className="bag-content"><div>{cart.map(item => <div className="bag-item" key={item._id}><div className={"bag-thumb " + (item.tone || "olive")}>{item.mark || item.name?.[0]}</div><div className="bag-item-name"><b>{item.name}</b><small>Rs. {Number(item.price).toLocaleString("en-PK")}</small></div><div className="quantity"><button onClick={() => changeQuantity(item._id, -1)} aria-label="Decrease quantity">−</button><span>{item.quantity}</span><button onClick={() => changeQuantity(item._id, 1)} aria-label="Increase quantity">＋</button></div><b>Rs. {(item.price * item.quantity).toLocaleString("en-PK")}</b></div>)}</div>
              <aside className="summary"><h3>Order summary</h3><div><span>Subtotal</span><b>Rs. {total.toLocaleString("en-PK")}</b></div><p>Delivery charges are confirmed after your location is provided.</p><button className="button button-dark" onClick={() => notify("Checkout is a demo. Connect payment and delivery services before accepting live orders.")}>Continue to checkout ↗</button></aside></div>}
        </section>
      </main>
      <footer className="footer"><a className="brand footer-brand" href="#home"><span className="brand-mark">C</span><span>CARDORA<small>IDENTITY, DESIGNED WITH ELEGANCE</small></span></a><p>Thoughtful little details for everyday moments.</p><div><a href="#shop">Shop</a><a href="#custom">Custom design</a><a href="mailto:hello@cardora.example">Contact</a><button className="admin-link" onClick={openAdmin}>Admin dashboard</button></div><small>© {new Date().getFullYear()} CARDORA. All rights reserved.</small></footer>
      <p className="legal-note">CARDORA offers personalized designs and student-themed merchandise. Official institutional ID cards may only be issued by, or with written authorization from, the relevant educational institution.</p>

      {adminOpen && <div className="admin-overlay" role="dialog" aria-modal="true" aria-label="CARDORA admin dashboard">
        <section className="admin-panel">
          <div className="admin-heading"><div><p className="eyebrow">CARDORA MANAGEMENT</p><h2>Admin <em>dashboard.</em></h2></div><button className="admin-close" onClick={() => setAdminOpen(false)} aria-label="Close admin dashboard">×</button></div>
          {adminError && <p className="admin-error" role="alert">{adminError}</p>}
          {!adminToken || !adminUser ? <form className="admin-login" onSubmit={adminLogin}><h3>Administrator sign in</h3><p>Use the administrator account configured by the site owner.</p>
            <label>Email<input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} required autoComplete="username"/></label>
            <label>Password<input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} required autoComplete="current-password"/></label>
            <button className="button button-dark" disabled={adminBusy}>{adminBusy ? "Signing in…" : "Sign in to dashboard"}</button>
          </form> : <div className="admin-content">
            <div className="admin-toolbar"><span>Signed in as <b>{adminUser.email}</b></span><button className="filter" onClick={logoutAdmin}>Sign out</button></div>
            <div className="admin-stats"><div><small>Products</small><strong>{products.length}</strong></div><div><small>Total orders</small><strong>{orders.length}</strong></div><div><small>Pending orders</small><strong>{orders.filter(o => o.status === "pending").length}</strong></div></div>
            <div className="admin-columns">
              <form className="admin-form" onSubmit={saveProduct}><h3>{editingId ? "Edit product" : "Add a product"}</h3>
                <label>Product name<input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} required maxLength="100"/></label>
                <label>Description<textarea value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} maxLength="1000" rows="3"/></label>
                <label>Price (PKR)<input type="number" min="1" step="1" value={draft.price} onChange={e => setDraft({ ...draft, price: e.target.value })} required/></label>
                <label>Category<select value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value })}><option>Personalized</option><option>Minimal</option><option>Stationery</option></select></label>
                <div className="admin-form-actions"><button className="button button-dark">{editingId ? "Save changes" : "Add product"}</button>{editingId && <button type="button" className="filter" onClick={() => { setEditingId(""); setDraft({ name: "", description: "", price: "", category: "Personalized" }); }}>Cancel</button>}</div>
              </form>
              <div className="admin-products"><h3>Manage products</h3>{products.map(product => <div className="admin-row" key={product._id}><div><b>{product.name}</b><small>Rs. {Number(product.price).toLocaleString("en-PK")} · {product.category}</small></div><button className="text-action" onClick={() => { setEditingId(product._id); setDraft({ name: product.name, description: product.description || "", price: String(product.price), category: product.category || "Personalized" }); }}>Edit</button><button className="text-action danger" onClick={() => deleteProduct(product._id)}>Delete</button></div>)}</div>
            </div>
            <div className="admin-orders"><h3>Customer orders</h3>{orders.length === 0 ? <p className="admin-muted">No customer orders yet.</p> : orders.map(order => <div className="admin-order" key={order._id}><div><b>Order #{order._id.slice(-7)}</b><small>{order.customer?.email || "Customer"} · Rs. {Number(order.total).toLocaleString("en-PK")}</small><small>{order.items?.map(item => item.name + " × " + item.quantity).join(", ")}</small></div><select value={order.status} onChange={e => updateOrderStatus(order._id, e.target.value)}><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></div>)}</div>
          </div>}
        </section>
      </div>}
      {notice && <div className="toast" role="status">{notice}</div>}
    </div>
  );
}
export default App;
