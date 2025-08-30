import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors"
const app = express();
const PORT = 8080;

const JWT_SECRET = "Your Custom 64 bit secret";
const users = [];

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000", // frontend URL
    credentials: true,               // allow cookies to be sent
  })
);


/**
 * Register
 */
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ status: false, message: "Email and password required" });
  }
  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    return res.status(400).json({ status: false, message: "User already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ id: Date.now(), email, password: hashedPassword });
  res.status(201).json({ status: true, message: "User created" });
});

/**
 * Login (1) → JWT returned in JSON (store in localStorage)
 */
app.post("/login-local", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email);
  if (!user) return res.status(400).json({ status: false, message: "Invalid email" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ status: false, message: "Invalid password" });

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "15m" });

  // Frontend will store this in localStorage
  res.json({ status: true, token });
});

/**
 * Login (2) → JWT stored in httpOnly cookie
 */
app.post("/login-cookie", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email);
  if (!user) return res.status(400).json({ status: false, message: "Invalid email" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ status: false, message: "Invalid password" });

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "15m" });

  // Set JWT in cookie
  res.cookie("token", token, {
    httpOnly: true,   // cannot be accessed by JS
    secure: false,    // set true in production (HTTPS)
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  });

  res.json({ status: true, message: "Logged in (cookie)" });
});

/**
 * Middleware (works for both methods)
 */
function auth(req, res, next) {
  let token;

  // 1️⃣ Try from header (localStorage method)
  const authHeader = req.headers["authorization"];
  if (authHeader) {
    token = authHeader.split(" ")[1];
  }

  // 2️⃣ If not, try from cookies
  if (!token && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

/**
 * Protected routes
 */
app.get("/profile", auth, (req, res) => {
  res.json({ message: "Welcome!", user: req.user });
});

app.get("/validate", auth, (req, res) => {
  res.json({ valid: true, user: req.user });
});

app.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ status: true, message: "Logged out" });
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
