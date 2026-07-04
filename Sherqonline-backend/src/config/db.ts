import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
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

export default pool;
