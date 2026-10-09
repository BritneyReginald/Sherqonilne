import { Router } from "express";

import {
  getCompanyProfileController,
  updateCompanyProfileController,
} from "../controllers/companyController";
// TODO: import the same auth middleware your /sites routes use, e.g.
// import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", /* authenticate, */ getCompanyProfileController);
router.put("/", /* authenticate, */ updateCompanyProfileController);

export default router;
