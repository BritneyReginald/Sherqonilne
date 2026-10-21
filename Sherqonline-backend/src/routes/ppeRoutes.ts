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

import {
  authenticate,
  authorize,
  scopeSites,
} from "../middleware/authMiddleware";
import { scopeByIdParam, lookupSite } from "../middleware/siteScope";

const router = Router();

router.use(authenticate, authorize("rss_staff", "client"), scopeSites);

// ---- Catalogue: RSS's own stock list, staff only ----
const catalogue = Router();
catalogue.use(authorize("rss_staff"));

catalogue.get("/", getAllCatalogueItems);
catalogue.post("/", addCatalogueItem);
catalogue.get("/:id", getCatalogueItem);
catalogue.patch("/:id", editCatalogueItem);
catalogue.delete("/:id", deleteCatalogueItemController);

// ---- Transactions (issue log): staff full access, clients read own site ----
const transactions = Router();

transactions.param(
  "id",
  scopeByIdParam(
    lookupSite(
      "SELECT site_id FROM ppe_transactions WHERE id = $1 AND deleted_at IS NULL",
    ),
  ),
);

transactions.get("/", getAllPPETransactions);
transactions.post("/", authorize("rss_staff"), issuePPE);

// Recycle bin. "/archived" MUST be registered before "/:id", otherwise
// "archived" is matched as an id.
transactions.get(
  "/archived",
  authorize("rss_staff"),
  listArchivedPPETransactions,
);

transactions.get("/:id", getPPETransaction);

transactions.post(
  "/:id/restore",
  authorize("rss_staff"),
  restorePPETransactionController,
);
transactions.delete(
  "/:id",
  authorize("rss_staff"),
  deletePPETransactionController,
);

router.use("/catalogue", catalogue);
router.use("/transactions", transactions);

export default router;