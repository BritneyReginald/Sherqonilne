"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ppeCatalogueController_1 = require("../controllers/ppeCatalogueController");
const ppeTransactionController_1 = require("../controllers/ppeTransactionController");
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
router.get("/transactions/:id", ppeTransactionController_1.getPPETransaction);
exports.default = router;
