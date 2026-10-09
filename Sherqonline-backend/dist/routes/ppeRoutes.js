"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ppeCatalogueController_1 = require("../controllers/ppeCatalogueController");
const ppeTransactionController_1 = require("../controllers/ppeTransactionController");
// OPTIONAL: if you want deleted_by recorded in the recycle bin, import your
// auth middleware and add it to the delete/restore routes below. It only
// identifies the user — there is no role restriction.
// import { authenticate } from "../middleware/auth";
const router = (0, express_1.Router)();
// ---- Catalogue ----
router.get("/catalogue", ppeCatalogueController_1.getAllCatalogueItems);
router.post("/catalogue", ppeCatalogueController_1.addCatalogueItem);
router.get("/catalogue/:id", ppeCatalogueController_1.getCatalogueItem);
router.patch("/catalogue/:id", ppeCatalogueController_1.editCatalogueItem);
router.delete("/catalogue/:id", ppeCatalogueController_1.deleteCatalogueItemController);
// ---- Transactions (issue log) ----
router.get("/transactions", ppeTransactionController_1.getAllPPETransactions);
router.post("/transactions", ppeTransactionController_1.issuePPE);
// Recycle bin. "/transactions/archived" MUST be registered before
// "/transactions/:id", otherwise "archived" is matched as an id.
router.get("/transactions/archived" /*, authenticate */, ppeTransactionController_1.listArchivedPPETransactions);
router.get("/transactions/:id", ppeTransactionController_1.getPPETransaction);
// Soft delete + restore (any user; no role check)
router.post("/transactions/:id/restore" /*, authenticate */, ppeTransactionController_1.restorePPETransactionController);
router.delete("/transactions/:id" /*, authenticate */, ppeTransactionController_1.deletePPETransactionController);
exports.default = router;
