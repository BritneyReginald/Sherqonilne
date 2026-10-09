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
  listArchivedPPETransactions,
  restorePPETransactionController,
  deletePPETransactionController,
} from "../controllers/ppeTransactionController";
// OPTIONAL: if you want deleted_by recorded in the recycle bin, import your
// auth middleware and add it to the delete/restore routes below. It only
// identifies the user — there is no role restriction.
// import { authenticate } from "../middleware/auth";

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

// Recycle bin. "/transactions/archived" MUST be registered before
// "/transactions/:id", otherwise "archived" is matched as an id.
router.get("/transactions/archived" /*, authenticate */, listArchivedPPETransactions);

router.get("/transactions/:id", getPPETransaction);

// Soft delete + restore (any user; no role check)
router.post("/transactions/:id/restore" /*, authenticate */, restorePPETransactionController);
router.delete("/transactions/:id" /*, authenticate */, deletePPETransactionController);

export default router;