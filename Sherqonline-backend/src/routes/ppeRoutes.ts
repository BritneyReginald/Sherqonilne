import { Router } from "express";

import {
  addCatalogueItem,
  getAllCatalogueItems,
  getCatalogueItem,
  editCatalogueItem,
  deleteCatalogueItemController,
} from "../controllers/ppeCatalogueController";

import {
  issuePPE,
  getAllPPETransactions,
  getPPETransaction,
} from "../controllers/ppeTransactionController";

const router = Router();

// ---- Catalogue ----
router.get("/catalogue", getAllCatalogueItems);
router.post("/catalogue", addCatalogueItem);
router.get("/catalogue/:id", getCatalogueItem);
router.patch("/catalogue/:id", editCatalogueItem);
router.delete("/catalogue/:id", deleteCatalogueItemController);

// ---- Transactions (issue log) ----
router.get("/transactions", getAllPPETransactions);
router.post("/transactions", issuePPE);
router.get("/transactions/:id", getPPETransaction);

export default router;