// Import required dependencies
import express from "express";
import axios from "axios";
import cookieParser from "cookie-parser";
import cors from "cors"
import dotenv from "dotenv";
dotenv.config();
// Load environment variables from .env file

const app = express();
const PORT = 8080;

// 🔑 OAuth 2.0 client credentials (from Google Cloud Console)
const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:8080/auth/google/callback";
console.log(CLIENT_ID,CLIENT_SECRET)
// Middleware
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:3000", // frontend URL
  credentials: true,               // allow cookies to be sent
}));
/**
 * 1️⃣ Login route
 * - Redirects user to Google's OAuth 2.0 authorization endpoint
 */
app.get("/auth/google", (req, res) => {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
  });

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.redirect(url);
});

/**
 * 2️⃣ Callback route
 * - Google redirects back with `?code=...`
 * - Exchange code for access token
 * - Store access_token securely in an HTTP-only cookie
 */
app.get("/auth/google/callback", async (req, res) => {
  const code = req.query.code;

  try {
    // Exchange code for tokens
    const { data } = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      },
      { headers: { "Content-Type": "application/json" } }
    );

    // ⚡ Store access_token in a secure, HTTP-only cookie
    res.cookie("access_token", data.access_token, {
      httpOnly: true,   // cannot be accessed via JS
      secure: false,    // set true in production (requires HTTPS)
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    // You may also want to store refresh_token similarly if provided
    if (data.refresh_token) {
      res.cookie("refresh_token", data.refresh_token, {
        httpOnly: true,
        secure: false,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
    }

    res.redirect("/profile");
  } catch (err) {
    res.send("❌ Error exchanging code for tokens: " + err.message);
  }
});

/**
 * 3️⃣ Profile route
 * - Reads access_token from cookie
 * - Calls Google Userinfo API
 */
app.get("/profile", async (req, res) => {
  const access_token = req.cookies.access_token;

  if (!access_token) {
    return res.redirect("/auth/google");
  }

  try {
    const { data } = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    res.send(`
      <h1>Welcome ${data.name}</h1>
      <p>Email: ${data.email}</p>
      <img src="${data.picture}" alt="profile picture"/>
      <br/><a href="/logout">Logout</a>
    `);
  } catch (err) {
    res.send("❌ Error fetching profile: " + err.message);
  }
});

/**
 * 4️⃣ Logout route
 * - Clears cookies
 */
app.get("/logout", (req, res) => {
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  res.send("✅ Logged out. <a href='/auth/google'>Login again</a>");
});

// Start the server
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
