import cors from "cors";
import express from "express";

const app = express();
const PORT = 9000;

app.use(cors());
app.use(express.json());

const users = {};

app.get("/", (req, res) => {
  res.send("API server is running!");
});

app.post("/api/register", (req, res) => {
  const { username, password, dob } = req.body;
  if (!username || !password || !dob) {
    return res.status(400).json({ message: "Username, password, and date of birth required" });
  }
  if (users[username]) {
    return res.status(409).json({ message: "User already exists" });
  }
  users[username] = { username, password, dob };
  res.json({ message: "Registration successful", user: { username, dob } });
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  res.json({ message: "Login successful", token: "fake-jwt", user: { username, dob: user.dob } });
});

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ server running on http://0.0.0.0:${PORT}`);
});