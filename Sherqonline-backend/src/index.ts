import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./config/db";
import employeeRoutes from "./routes/employeeRoutes";
import { initializeDatabase } from "./config/initDatabase";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://ohs-online-web.azurewebsites.net",
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (_, res) => {
  res.send("Backend is running!");
});

// Register routes
app.use("/employees", employeeRoutes);

app.listen(PORT, () => {
  console.log("=================================");
  console.log("🚀 NEW VERSION DEPLOYED");
  console.log(`Server running on port ${PORT}`);
  console.log("=================================");
});

initializeDatabase().catch(console.error);
