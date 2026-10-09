import { Request, Response } from "express";

import {
  getCompanyProfile,
  saveCompanyProfile,
} from "../models/companyProfile";

// ~1.5M characters of base64 is roughly 1MB of image. The frontend shrinks
// logos to 400px before uploading, so real logos are far smaller than this.
const MAX_LOGO_LENGTH = 1_500_000;

export const getCompanyProfileController = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    res.json(await getCompanyProfile());
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const updateCompanyProfileController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, logo } = req.body || {};

    if (name === undefined && logo === undefined) {
      res.status(400).json({ error: "Provide a name and/or a logo" });
      return;
    }

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        res.status(400).json({ error: "Company name can't be empty" });
        return;
      }
      if (name.trim().length > 255) {
        res.status(400).json({ error: "Company name is too long" });
        return;
      }
    }

    if (logo !== undefined) {
      if (typeof logo !== "string" || !logo.startsWith("data:image/")) {
        res.status(400).json({ error: "Logo must be an image" });
        return;
      }
      if (logo.length > MAX_LOGO_LENGTH) {
        res.status(400).json({ error: "Logo image is too large" });
        return;
      }
    }

    const saved = await saveCompanyProfile({
      name: name !== undefined ? name.trim() : undefined,
      logo,
    });

    res.json(saved);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
