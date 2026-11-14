import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "20kb" }));

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, default: "", maxlength: 1000 },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, default: "Personalized" },
  active: { type: Boolean, default: true }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true }
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [{ productId: String, name: String, quantity: { type: Number, min: 1 }, unitPrice: { type: Number, min: 0 } }],
  total: { type: Number, required: true, min: 0 },
  deliveryDetails: { type: String, required: true, maxlength: 1000 },
  status: { type: String, enum: ["pending", "confirmed", "processing", "shipped", "completed", "cancelled"], default: "pending" }
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
const User = mongoose.model("User", userSchema);
const Order = mongoose.model("Order", orderSchema);

function auth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ message: "Sign in is required." });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { return res.status(401).json({ message: "Session expired. Please sign in again." }); }
}

app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "CARDORA API" }));
app.get("/api/products", async (_req, res) => {
  try {
    const products = await Product.find({ active: true }).select("name description price category").sort({ createdAt: -1 });
    res.json(products);
  } catch { res.status(500).json({ message: "Could not load products." }); }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || typeof password !== "string" || password.length < 8) return res.status(400).json({ message: "Enter your name, a valid email, and a password of at least 8 characters." });
    const normalizedEmail = String(email).trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ message: "An account with this email already exists." });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name: String(name).trim(), email: normalizedEmail, passwordHash });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "2h" });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch { res.status(500).json({ message: "Registration could not be completed." }); }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(String(req.body.password || ""), user.passwordHash))) return res.status(401).json({ message: "Email or password is incorrect." });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "2h" });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch { res.status(500).json({ message: "Sign in could not be completed." }); }
});

app.post("/api/orders", auth, async (req, res) => {
  try {
    const { items, deliveryDetails } = req.body;
    if (!Array.isArray(items) || items.length < 1 || items.length > 20 || !deliveryDetails) return res.status(400).json({ message: "Add items and delivery details." });
    const cleanItems = items.map(item => ({
      productId: String(item.productId || "").slice(0, 80),
      name: String(item.name || "CARDORA item").slice(0, 100),
      quantity: Math.min(20, Math.max(1, Number.parseInt(item.quantity, 10) || 1)),
      unitPrice: Math.max(0, Number(item.unitPrice) || 0)
    }));
    const total = cleanItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const order = await Order.create({ customer: req.user.userId, items: cleanItems, total, deliveryDetails: String(deliveryDetails).slice(0, 1000) });
    res.status(201).json({ orderId: order.id, status: order.status, total: order.total });
  } catch { res.status(500).json({ message: "Order could not be placed." }); }
});

app.get("/api/orders/mine", auth, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.userId }).select("-__v").sort({ createdAt: -1 });
    res.json(orders);
  } catch { res.status(500).json({ message: "Could not load your orders." }); }
});

const port = Number(process.env.PORT) || 5000;
if (!process.env.JWT_SECRET) console.error("WARNING: Set JWT_SECRET in your environment before using authentication.");
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => app.listen(port, () => console.log("CARDORA API listening on " + port)))
    .catch(error => { console.error("MongoDB connection failed:", error.message); process.exit(1); });
} else {
  app.listen(port, () => console.log("CARDORA API listening on " + port + " (database not connected)"));
}