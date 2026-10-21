import { Router } from "express";

import {
  getCompanyProfileController,
  updateCompanyProfileController,
} from "../controllers/companyController";
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = Router();

// Before: both routes were open to anyone, so the company name and logo
// could be changed without logging in. Now RSS staff only.
router.use(authenticate, authorize("rss_staff"));

router.get("/", getCompanyProfileController);
router.put("/", updateCompanyProfileController);

export default router;