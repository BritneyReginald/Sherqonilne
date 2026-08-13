import cors from "cors";
import dotenv from "dotenv";
dotenv.config({ quiet: true });
import pool from "./config/db";
import express from "express";
import employeeRoutes from "./routes/employeeRoutes";
import { initializeDatabase } from "./config/initDatabase";
import companyRoutes from "./routes/companies";
import siteRoutes from "./routes/sites";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://ohs-online-web-hsc0c5a6f2d2ghg8.southafricanorth-01.azurewebsites.net",
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

app.use("/companies", companyRoutes);
app.use("/sites", siteRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);

async function inspectCompaniesTable() {
  const result = await pool.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'companies'
    ORDER BY ordinal_position
  `);

  console.log("COMPANIES TABLE COLUMNS:", result.rows);
}

inspectCompaniesTable().catch(console.error);

app.listen(PORT, () => {
  console.log("=================================");
  console.log("🚀 NEW VERSION DEPLOYED");
  console.log(`Server running on port ${PORT}`);
  console.log("=================================");
});
inspectCompaniesTable().catch(console.error);
initializeDatabase().catch(console.error);
