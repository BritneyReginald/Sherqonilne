"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const companyController_1 = require("../controllers/companyController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Before: both routes were open to anyone, so the company name and logo
// could be changed without logging in. Now RSS staff only.
router.use(authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("rss_staff"));
router.get("/", companyController_1.getCompanyProfileController);
router.put("/", companyController_1.updateCompanyProfileController);
exports.default = router;
