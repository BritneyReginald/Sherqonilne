"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ppeCatalogueController_1 = require("../controllers/ppeCatalogueController");
const ppeTransactionController_1 = require("../controllers/ppeTransactionController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const siteScope_1 = require("../middleware/siteScope");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("rss_staff", "client"), authMiddleware_1.scopeSites);
// ---- Catalogue: RSS's own stock list, staff only ----
const catalogue = (0, express_1.Router)();
catalogue.use((0, authMiddleware_1.authorize)("rss_staff"));
catalogue.get("/", ppeCatalogueController_1.getAllCatalogueItems);
catalogue.post("/", ppeCatalogueController_1.addCatalogueItem);
catalogue.get("/:id", ppeCatalogueController_1.getCatalogueItem);
catalogue.patch("/:id", ppeCatalogueController_1.editCatalogueItem);
catalogue.delete("/:id", ppeCatalogueController_1.deleteCatalogueItemController);
// ---- Transactions (issue log): staff full access, clients read own site ----
const transactions = (0, express_1.Router)();
transactions.param("id", (0, siteScope_1.scopeByIdParam)((0, siteScope_1.lookupSite)("SELECT site_id FROM ppe_transactions WHERE id = $1 AND deleted_at IS NULL")));
transactions.get("/", ppeTransactionController_1.getAllPPETransactions);
transactions.post("/", (0, authMiddleware_1.authorize)("rss_staff"), ppeTransactionController_1.issuePPE);
// Recycle bin. "/archived" MUST be registered before "/:id", otherwise
// "archived" is matched as an id.
transactions.get("/archived", (0, authMiddleware_1.authorize)("rss_staff"), ppeTransactionController_1.listArchivedPPETransactions);
transactions.get("/:id", ppeTransactionController_1.getPPETransaction);
transactions.post("/:id/restore", (0, authMiddleware_1.authorize)("rss_staff"), ppeTransactionController_1.restorePPETransactionController);
transactions.delete("/:id", (0, authMiddleware_1.authorize)("rss_staff"), ppeTransactionController_1.deletePPETransactionController);
router.use("/catalogue", catalogue);
router.use("/transactions", transactions);
exports.default = router;
