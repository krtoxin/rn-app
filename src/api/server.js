import express from "express";
import cors from "cors";

const app = express();
const PORT = 9000;

// --- важливо: cors на всі ---
app.use(cors());
app.use(express.json());

// тестовий роут
app.get("/api/test", (req, res) => {
  res.json({ ok: true });
});

// твій login
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  if (email === "test@example.com" && password === "1234") {
    res.json({ message: "Login successful", token: "fake-jwt" });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ server running on http://0.0.0.0:${PORT}`);
});
