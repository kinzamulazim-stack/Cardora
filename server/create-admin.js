import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
dotenv.config();

const { MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) {
  console.error("Set MONGODB_URI, ADMIN_EMAIL, and ADMIN_PASSWORD (at least 12 characters) in .env.");
  process.exit(1);
}
const schema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["customer", "admin"], default: "customer" }
}, { timestamps: true });
const User = mongoose.model("User", schema);
try {
  await mongoose.connect(MONGODB_URI);
  const email = ADMIN_EMAIL.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await User.findOneAndUpdate({ email }, { $set: { name: ADMIN_NAME || "Store Administrator", passwordHash, role: "admin" } }, { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true });
  console.log("Administrator account created/updated for:", email);
} catch (error) { console.error("Could not configure administrator:", error.message); process.exitCode = 1; }
finally { await mongoose.disconnect(); }