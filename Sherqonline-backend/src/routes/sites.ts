import express from "express";

const router = express.Router();

// GET all sites
router.get("/", async (req, res) => {
  res.json({
    message: "Sites endpoint working",
  });
});

export default router;