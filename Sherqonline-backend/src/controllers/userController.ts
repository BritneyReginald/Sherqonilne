import { Request, Response } from "express";
import { replaceInspectorSites } from "../models/user";

export async function updateInspectorSites(req: Request, res: Response) {
  try {
    const userId = Number(req.params.id);
    const { siteIds } = req.body;

    if (!Array.isArray(siteIds)) {
      return res.status(400).json({
        error: "siteIds must be an array",
      });
    }

    await replaceInspectorSites(userId, siteIds);

    return res.json({
      message: "Inspector sites updated successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to update inspector sites",
    });
  }
}
