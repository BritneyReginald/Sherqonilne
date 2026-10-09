import { Request, Response } from "express";

import {
  createPPETransactions,
  getPPETransactions,
  getPPETransactionById,
  IssuePPEItem,
  softDeletePPETransaction,
  getArchivedPPETransactions,
  restorePPETransaction,
} from "../models/ppeTransaction";

export const issuePPE = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      employeeId,
      employeeName,
      jobTitle,
      siteLocation,
      items,
      signatureData,
    } = req.body;

    if (!employeeId || !employeeName) {
      res
        .status(400)
        .json({ error: "employeeId and employeeName are required" });
      return;
    }

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "At least one PPE item must be selected" });
      return;
    }

    if (!signatureData) {
      res.status(400).json({ error: "A signature is required to issue PPE" });
      return;
    }

    const parsedItems: IssuePPEItem[] = items.map((item: any) => ({
      itemId: Number(item.itemId),
      size: item.size || null,
      condition: item.condition || "new",
    }));

    const created = await createPPETransactions({
      employeeId: Number(employeeId),
      employeeName,
      jobTitle,
      siteLocation,
      items: parsedItems,
      signatureData,
    });

    res.status(201).json(created);
  } catch (err: any) {
    console.error(err);
    res
      .status(500)
      .json({ error: err.message, detail: err.detail, code: err.code });
  }
};

export const getAllPPETransactions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const transactions = await getPPETransactions({
      employeeId: req.query.employeeId
        ? Number(req.query.employeeId)
        : undefined,
      category: req.query.category as string | undefined,
      siteLocation: req.query.site as string | undefined,
    });

    res.json(transactions);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getPPETransaction = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const transaction = await getPPETransactionById(Number(req.params.id));
    if (!transaction) {
      res.status(404).json({ message: "PPE transaction not found" });
      return;
    }
    res.json(transaction);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Returns the logged-in user's id if an auth middleware attached one,
// otherwise null. Used only to record deleted_by; it is NOT a permission
// check.
const currentUserId = (req: Request): number | null =>
  ((req as any).user as { id?: number } | undefined)?.id ?? null;

export const deletePPETransactionController = async (
  req: Request,
  res: Response,
) => {
  try {
    const deleted = await softDeletePPETransaction(
      Number(req.params.id),
      currentUserId(req),
    );
    if (!deleted) {
      res.status(404).json({ error: "PPE record not found" });
      return;
    }
    res.json({
      message: "PPE record moved to the recycle bin",
      id: deleted.id,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const listArchivedPPETransactions = async (
  req: Request,
  res: Response,
) => {
  try {
    res.json(await getArchivedPPETransactions());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const restorePPETransactionController = async (
  req: Request,
  res: Response,
) => {
  try {
    const restored = await restorePPETransaction(Number(req.params.id));
    if (!restored) {
      res.status(404).json({ error: "Deleted PPE record not found" });
      return;
    }
    res.json({ message: "PPE record restored", id: restored.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
