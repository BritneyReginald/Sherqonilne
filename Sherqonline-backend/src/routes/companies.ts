import express from "express";

const router = express.Router();

// GET all companies
router.get("/", async (req, res) => {
  res.json({
    message: "Companies endpoint working",
  });
});

export default router;