import { Request, Response } from "express";

import {
  createCatalogueItem,
  getCatalogueItems,
  getCatalogueItemById,
  updateCatalogueItem,
  deleteCatalogueItem,
  CatalogueItemInput,
} from "../models/ppeCatalogue";

function parseSizes(sizes: any): string[] | null {
  if (!sizes) return null;
  if (Array.isArray(sizes)) return sizes;
  return String(sizes)
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);
}

// Used for POST: missing fields get sensible defaults.
function parseCatalogueBody(body: any): CatalogueItemInput {
  return {
    itemName: body.itemName,
    category: body.category,
    supplier: body.supplier || null,
    requiresSize: body.requiresSize === true || body.requiresSize === "true",
    sizes: parseSizes(body.sizes),
    replacementDays: Number(body.replacementDays) || 180,
    stockLevel: Number(body.stockLevel) || 0,
    minStockLevel: Number(body.minStockLevel) || 0,
  };
}

// Used for PATCH: only fields actually present in the body are returned, so a
// partial update can never overwrite untouched columns with defaults.
function parseCatalogueUpdate(body: any): Partial<CatalogueItemInput> {
  const out: Partial<CatalogueItemInput> = {};

  if (body.itemName !== undefined) out.itemName = body.itemName;
  if (body.category !== undefined) out.category = body.category;
  if (body.supplier !== undefined) out.supplier = body.supplier || null;
  if (body.requiresSize !== undefined) {
    out.requiresSize = body.requiresSize === true || body.requiresSize === "true";
  }
  if (body.sizes !== undefined) out.sizes = parseSizes(body.sizes);
  if (body.replacementDays !== undefined) {
    out.replacementDays = Number(body.replacementDays) || 180;
  }
  if (body.stockLevel !== undefined) out.stockLevel = Number(body.stockLevel) || 0;
  if (body.minStockLevel !== undefined) {
    out.minStockLevel = Number(body.minStockLevel) || 0;
  }

  return out;
}

export const addCatalogueItem = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const data = parseCatalogueBody(req.body);

    if (!data.itemName || !data.category) {
      res.status(400).json({ error: "itemName and category are required" });
      return;
    }

    const item = await createCatalogueItem(data);
    res.status(201).json(item);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message, detail: err.detail, code: err.code });
  }
};

export const getAllCatalogueItems = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const items = await getCatalogueItems(req.query.category as string | undefined);
    res.json(items);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getCatalogueItem = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const item = await getCatalogueItemById(Number(req.params.id));
    if (!item) {
      res.status(404).json({ message: "Catalogue item not found" });
      return;
    }
    res.json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const editCatalogueItem = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const item = await updateCatalogueItem(
      Number(req.params.id),
      parseCatalogueUpdate(req.body),
    );
    if (!item) {
      res.status(404).json({ message: "Catalogue item not found" });
      return;
    }
    res.json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteCatalogueItemController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const deleted = await deleteCatalogueItem(Number(req.params.id));
    if (!deleted) {
      res.status(404).json({ message: "Catalogue item not found" });
      return;
    }
    res.json({ message: "Catalogue item permanently deleted", id: deleted.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};