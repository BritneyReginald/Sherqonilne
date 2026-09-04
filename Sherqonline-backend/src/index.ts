import cors from "cors";
import dotenv from "dotenv";
dotenv.config({ quiet: true });
import express from "express";
import employeeRoutes from "./routes/employeeRoutes";
import { initializeDatabase } from "./config/initDatabase";
import companyRoutes from "./routes/companies";
import siteRoutes from "./routes/sites";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";
import medicalsRoutes from "./routes/medicalsRoutes";
import ppeRouter from "./routes/ppeRoutes";
import appointmentRouter from "./routes/appointmentRoutes";
import trainingRouter from "./routes/trainingRoutes";



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
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/", (_, res) => {
  res.send("Backend is running!");
});

// Register routes
app.use("/employees", employeeRoutes);

app.use("/companies", companyRoutes);
app.use("/sites", siteRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/medicals", medicalsRoutes);
app.use("/ppe", ppeRouter);
app.use("/appointments", appointmentRouter);
app.use("/training-records", trainingRouter);

async function startServer() {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log("=================================");
      console.log("🚀 NEW VERSION DEPLOYED");
      console.log(`Server running on port ${PORT}`);
      console.log("=================================");
    });
  } catch (error) {
    console.error("❌ Failed to initialize database");
    console.error(error);
    process.exit(1);
  }
}

startServer();

