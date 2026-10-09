"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const companyController_1 = require("../controllers/companyController");
// TODO: import the same auth middleware your /sites routes use, e.g.
// import { authenticate } from "../middleware/auth";
const router = (0, express_1.Router)();
router.get("/", /* authenticate, */ companyController_1.getCompanyProfileController);
router.put("/", /* authenticate, */ companyController_1.updateCompanyProfileController);
exports.default = router;
