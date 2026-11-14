import { useMemo, useState } from "react";

const products = [
  { id: 1, name: "Classic Student Card", category: "Personalized", price: 450, tag: "Bestseller", description: "A clean, personalized student-themed card design.", tone: "olive", mark: "C" },
  { id: 2, name: "Minimal Campus Card", category: "Minimal", price: 550, tag: "New", description: "A modern layout with a calm, minimal finish.", tone: "sand", mark: "M" },
  { id: 3, name: "Study Planner Card Set", category: "Stationery", price: 650, tag: "Set of 3", description: "Coordinated study and desk cards for everyday use.", tone: "brown", mark: "S" }
];

function App() {
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState("All");
  const [notice, setNotice] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const visible = useMemo(() => category === "All" ? products : products.filter(p => p.category === category), [category]);

  function addToCart(product) {
    setCart(current => {
      const found = current.find(item => item.id === product.id);
      return found
        ? current.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { ...product, quantity: 1 }];
    });
    setNotice(product.name + " added to your bag.");
    window.setTimeout(() => setNotice(""), 2600);
  }

  function changeQuantity(id, delta) {
    setCart(current => current.map(item => item.id === id ? { ...item, quantity: item.quantity + delta } : item).filter(item => item.quantity > 0));
  }

  return (
    <div>
      <div className="announcement">Thoughtful designs for your campus life <span>✦</span> Made personal, made simple</div>
      <header className="header">
        <a className="brand" href="#home" aria-label="Cardora home"><span className="brand-mark">C</span><span>CARDORA<small>IDENTITY, DESIGNED WITH ELEGANCE</small></span></a>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">☰</button>
        <nav className={menuOpen ? "nav open" : "nav"}>
          <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#shop" onClick={() => setMenuOpen(false)}>Shop</a>
          <a href="#custom" onClick={() => setMenuOpen(false)}>Custom design</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>Our story</a>
        </nav>
        <a className="bag" href="#bag">Bag <span>{count}</span></a>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-copy">
            <p className="eyebrow">THE CARDORA COLLECTION</p>
            <h1>A little detail.<br/><em>A lot of identity.</em></h1>
            <p className="hero-text">Discover thoughtfully designed personalized cards and stationery that bring a little more personality to your everyday campus life.</p>
            <a className="button button-dark" href="#shop">Explore the collection <span>↗</span></a>
            <div className="hero-note"><span>✳</span> Made for your moments, your way.</div>
          </div>
          <div className="hero-art" aria-label="Decorative preview of Cardora personalized cards">
            <div className="art-stamp">C<br/><small>STUDIO</small></div>
            <div className="card-back"></div>
            <div className="display-card">
              <div className="card-top">CARDORA <span>✳</span></div>
              <div className="card-orbit">C</div>
              <div className="card-bottom"><span>YOUR NAME HERE</span><span>PERSONAL COLLECTION · 01</span></div>
            </div>
            <div className="art-caption">THE PERSONAL<br/>COLLECTION — 01</div>
          </div>
        </section>

        <section className="trust-strip">
          <div><b>01</b><span>Personalized designs</span></div><div><b>02</b><span>Thoughtful details</span></div><div><b>03</b><span>Simple ordering</span></div>
        </section>

        <section className="shop section" id="shop">
          <div className="section-heading"><div><p className="eyebrow">CURATED FOR YOU</p><h2>Find your <em>everyday favorite.</em></h2></div><p>Considered designs, warm colors, and little details that make each piece feel like yours.</p></div>
          <div className="filters">
            {["All", "Personalized", "Minimal", "Stationery"].map(item => <button key={item} className={category === item ? "filter active" : "filter"} onClick={() => setCategory(item)}>{item}</button>)}
          </div>
          <div className="product-grid">
            {visible.map(product => <article className="product" key={product.id}>
              <div className={"product-art " + product.tone}>
                <span className="product-tag">{product.tag}</span>
                <div className="mini-card"><span>CARDORA <b>✳</b></span><strong>{product.mark}</strong><small>MADE PERSONAL</small></div>
              </div>
              <div className="product-info"><div><h3>{product.name}</h3><p>{product.description}</p></div><strong>Rs. {product.price.toLocaleString("en-PK")}</strong></div>
              <button className="add-button" onClick={() => addToCart(product)}>Add to bag <span>＋</span></button>
            </article>)}
          </div>
        </section>

        <section className="custom section" id="custom">
          <div className="custom-ornament">✳</div>
          <div><p className="eyebrow">YOUR IDEA, OUR CANVAS</p><h2>Make it <em>personal.</em></h2><p>Have a color, name, or theme in mind? Tell us what you imagine and we’ll help shape a design that feels like you.</p><a className="button button-light" href="mailto:hello@cardora.example?subject=Custom%20Card%20Enquiry">Request a custom design <span>↗</span></a></div>
          <div className="custom-side-note">A thoughtful<br/>little something<br/>made just for you.</div>
        </section>

        <section className="about section" id="about"><p className="eyebrow">A NOTE FROM CARDORA</p><h2>Designed with care.<br/><em>Chosen by you.</em></h2><p>We believe everyday things can feel special. CARDORA is a small design-led concept for personalized student-themed cards and stationery, made to celebrate your style and campus moments.</p></section>

        <section className="bag-section section" id="bag">
          <div className="section-heading"><div><p className="eyebrow">YOUR SELECTION</p><h2>Your shopping <em>bag.</em></h2></div><span className="bag-count">{count} item{count === 1 ? "" : "s"}</span></div>
          {cart.length === 0 ? <div className="empty-bag">Your bag is waiting for something lovely. <a href="#shop">Explore the collection ↗</a></div> :
            <div className="bag-content"><div>{cart.map(item => <div className="bag-item" key={item.id}><div className={"bag-thumb " + item.tone}>{item.mark}</div><div className="bag-item-name"><b>{item.name}</b><small>Rs. {item.price.toLocaleString("en-PK")}</small></div><div className="quantity"><button onClick={() => changeQuantity(item.id, -1)} aria-label="Decrease quantity">−</button><span>{item.quantity}</span><button onClick={() => changeQuantity(item.id, 1)} aria-label="Increase quantity">＋</button></div><b>Rs. {(item.price * item.quantity).toLocaleString("en-PK")}</b></div>)}</div><aside className="summary"><h3>Order summary</h3><div><span>Subtotal</span><b>Rs. {total.toLocaleString("en-PK")}</b></div><p>Delivery charges are confirmed after your location is provided.</p><button className="button button-dark" onClick={() => setNotice("Checkout is a demo at this stage. Online orders will be enabled after payment and delivery setup.")}>Continue to checkout ↗</button></aside></div>}
        </section>
      </main>

      <footer className="footer"><a className="brand footer-brand" href="#home"><span className="brand-mark">C</span><span>CARDORA<small>IDENTITY, DESIGNED WITH ELEGANCE</small></span></a><p>Thoughtful little details for everyday moments.</p><div><a href="#shop">Shop</a><a href="#custom">Custom design</a><a href="mailto:hello@cardora.example">Contact</a></div><small>© {new Date().getFullYear()} CARDORA. All rights reserved.</small></footer>
      {notice && <div className="toast" role="status">{notice}</div>}
      <p className="legal-note">CARDORA offers personalized designs and student-themed merchandise. Official institutional ID cards may only be issued by, or with written authorization from, the relevant educational institution.</p>
    </div>
  );
}

export default App;