// controllers/ppeCatalogueController.ts
import { Request, Response } from "express";
import {
  createCatalogueItem,
  getCatalogueItems,
  getCatalogueItemById,
  updateCatalogueItem,
  deleteCatalogueItem,
  stockByName,
  CatalogueItemInput,
} from "../models/ppeCatalogue";
import { isSizeType } from "../config/ppeSizes"; 
import { PPE_TYPES } from "../config/ppeTypes"; 

const fail = (res: Response, err: any) => {
  if (!err.status) console.error(err);
  res.status(err.status || 500).json({ error: err.message });
};

function parseCatalogueBody(body: any): CatalogueItemInput {
  return {
    itemName: String(body.itemName || "").trim(),
    category: String(body.category || "").trim(),
    sizeType: isSizeType(body.sizeType) ? body.sizeType : "none",
    replacementDays: Number(body.replacementDays) || 180,
    minStockLevel: Number(body.minStockLevel) || 0,
  };
}

function parseCatalogueUpdate(body: any): Partial<CatalogueItemInput> {
  const out: Partial<CatalogueItemInput> = {};
  if (body.itemName !== undefined) out.itemName = String(body.itemName).trim();
  if (body.category !== undefined) out.category = String(body.category).trim();
  if (body.sizeType !== undefined && isSizeType(body.sizeType)) out.sizeType = body.sizeType;
  if (body.replacementDays !== undefined) out.replacementDays = Number(body.replacementDays) || 180;
  if (body.minStockLevel !== undefined) out.minStockLevel = Number(body.minStockLevel) || 0;
  return out;
}

export const addCatalogueItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = parseCatalogueBody(req.body);
    if (!data.itemName || !data.category) {
      res.status(400).json({ error: "itemName and category are required" });
      return;
    }
    res.status(201).json(await createCatalogueItem(data));
  } catch (err) {
    fail(res, err);
  }
};

export const getAllCatalogueItems = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(await getCatalogueItems(req.query.category as string | undefined));
  } catch (err) {
    fail(res, err);
  }
};

export const getCatalogueItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await getCatalogueItemById(Number(req.params.id));
    if (!item) {
      res.status(404).json({ message: "Catalogue item not found" });
      return;
    }
    res.json(item);
  } catch (err) {
    fail(res, err);
  }
};

export const editCatalogueItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await updateCatalogueItem(Number(req.params.id), parseCatalogueUpdate(req.body));
    if (!item) {
      res.status(404).json({ message: "Catalogue item not found" });
      return;
    }
    res.json(item);
  } catch (err) {
    fail(res, err);
  }
};

// POST /ppe/catalogue/:id/stock
// body: { mode: "add" | "set", entries: [{ size?: "9", quantity: 4 }, ...] }
// export const updateStockController = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const mode = req.body.mode === "set" ? "set" : "add";
//     const entries = Array.isArray(req.body.entries) ? req.body.entries : [];
//     if (entries.length === 0) {
//       res.status(400).json({ error: "Enter at least one quantity." });
//       return;
//     }
//     res.json(await applyStock(Number(req.params.id), mode, entries));
//   } catch (err) {
//     fail(res, err);
//   }
// };

export const deleteCatalogueItemController = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await deleteCatalogueItem(Number(req.params.id));
    if (!deleted) {
      res.status(404).json({ message: "Catalogue item not found" });
      return;
    }
    res.json({ message: "Catalogue item permanently deleted", id: deleted.id });
  } catch (err) {
    fail(res, err);
  }
};

// GET /ppe/catalogue/types: the dropdown list
export const getPPETypes = async (_req: Request, res: Response): Promise<void> => {
  res.json(PPE_TYPES);
};

// POST /ppe/catalogue/stock
// body: { itemName: "Safety Boots", mode: "add" | "set", entries: [{ size?: "9", quantity: 4 }] }
export const addStockByNameController = async (req: Request, res: Response): Promise<void> => {
  try {
    const mode = req.body.mode === "set" ? "set" : "add";
    const entries = Array.isArray(req.body.entries) ? req.body.entries : [];
    if (!req.body.itemName) {
      res.status(400).json({ error: "Choose a PPE item." });
      return;
    }
    if (entries.length === 0) {
      res.status(400).json({ error: "Enter at least one quantity." });
      return;
    }
    res.json(await stockByName(String(req.body.itemName), mode, entries));
  } catch (err) {
    fail(res, err);
  }
};