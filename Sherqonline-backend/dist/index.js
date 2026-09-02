"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ quiet: true });
const express_1 = __importDefault(require("express"));
const employeeRoutes_1 = __importDefault(require("./routes/employeeRoutes"));
const initDatabase_1 = require("./config/initDatabase");
const companies_1 = __importDefault(require("./routes/companies"));
const sites_1 = __importDefault(require("./routes/sites"));
const auth_1 = __importDefault(require("./routes/auth"));
const admin_1 = __importDefault(require("./routes/admin"));
const medicalsRoutes_1 = __importDefault(require("./routes/medicalsRoutes"));
const ppeRoutes_1 = __importDefault(require("./routes/ppeRoutes"));
const app = (0, express_1.default)();
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
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
app.get("/", (_, res) => {
    res.send("Backend is running!");
});
// Register routes
app.use("/employees", employeeRoutes_1.default);
app.use("/companies", companies_1.default);
app.use("/sites", sites_1.default);
app.use("/auth", auth_1.default);
app.use("/admin", admin_1.default);
app.use("/medicals", medicalsRoutes_1.default);
app.use("/ppe", ppeRoutes_1.default);
async function startServer() {
    try {
        await (0, initDatabase_1.initializeDatabase)();
        app.listen(PORT, () => {
            console.log("=================================");
            console.log("🚀 NEW VERSION DEPLOYED");
            console.log(`Server running on port ${PORT}`);
            console.log("=================================");
        });
    }
    catch (error) {
        console.error("❌ Failed to initialize database");
        console.error(error);
        process.exit(1);
    }
}
startServer();
