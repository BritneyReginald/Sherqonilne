"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pool = new pg_1.Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false,
    },
});
pool.on("connect", () => {
    console.log("Connected to PostgreSQL");
});
pool.on("error", (err) => {
    console.error("Unexpected PostgreSQL error", err);
});
pool.query("SELECT NOW()")
    .then((result) => {
    console.log("✅ PostgreSQL connection successful");
    console.log("Database time:", result.rows[0].now);
})
    .catch((err) => {
    console.error("❌ PostgreSQL connection failed");
    console.error(err);
});
exports.default = pool;
