"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addStockByNameController = exports.getPPETypes = exports.deleteCatalogueItemController = exports.editCatalogueItem = exports.getCatalogueItem = exports.getAllCatalogueItems = exports.addCatalogueItem = void 0;
const ppeCatalogue_1 = require("../models/ppeCatalogue");
const ppeSizes_1 = require("../config/ppeSizes");
const ppeTypes_1 = require("../config/ppeTypes");
const fail = (res, err) => {
    if (!err.status)
        console.error(err);
    res.status(err.status || 500).json({ error: err.message });
};
function parseCatalogueBody(body) {
    return {
        itemName: String(body.itemName || "").trim(),
        category: String(body.category || "").trim(),
        sizeType: (0, ppeSizes_1.isSizeType)(body.sizeType) ? body.sizeType : "none",
        replacementDays: Number(body.replacementDays) || 180,
        minStockLevel: Number(body.minStockLevel) || 0,
    };
}
function parseCatalogueUpdate(body) {
    const out = {};
    if (body.itemName !== undefined)
        out.itemName = String(body.itemName).trim();
    if (body.category !== undefined)
        out.category = String(body.category).trim();
    if (body.sizeType !== undefined && (0, ppeSizes_1.isSizeType)(body.sizeType))
        out.sizeType = body.sizeType;
    if (body.replacementDays !== undefined)
        out.replacementDays = Number(body.replacementDays) || 180;
    if (body.minStockLevel !== undefined)
        out.minStockLevel = Number(body.minStockLevel) || 0;
    return out;
}
const addCatalogueItem = async (req, res) => {
    try {
        const data = parseCatalogueBody(req.body);
        if (!data.itemName || !data.category) {
            res.status(400).json({ error: "itemName and category are required" });
            return;
        }
        res.status(201).json(await (0, ppeCatalogue_1.createCatalogueItem)(data));
    }
    catch (err) {
        fail(res, err);
    }
};
exports.addCatalogueItem = addCatalogueItem;
const getAllCatalogueItems = async (req, res) => {
    try {
        res.json(await (0, ppeCatalogue_1.getCatalogueItems)(req.query.category));
    }
    catch (err) {
        fail(res, err);
    }
};
exports.getAllCatalogueItems = getAllCatalogueItems;
const getCatalogueItem = async (req, res) => {
    try {
        const item = await (0, ppeCatalogue_1.getCatalogueItemById)(Number(req.params.id));
        if (!item) {
            res.status(404).json({ message: "Catalogue item not found" });
            return;
        }
        res.json(item);
    }
    catch (err) {
        fail(res, err);
    }
};
exports.getCatalogueItem = getCatalogueItem;
const editCatalogueItem = async (req, res) => {
    try {
        const item = await (0, ppeCatalogue_1.updateCatalogueItem)(Number(req.params.id), parseCatalogueUpdate(req.body));
        if (!item) {
            res.status(404).json({ message: "Catalogue item not found" });
            return;
        }
        res.json(item);
    }
    catch (err) {
        fail(res, err);
    }
};
exports.editCatalogueItem = editCatalogueItem;
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
const deleteCatalogueItemController = async (req, res) => {
    try {
        const deleted = await (0, ppeCatalogue_1.deleteCatalogueItem)(Number(req.params.id));
        if (!deleted) {
            res.status(404).json({ message: "Catalogue item not found" });
            return;
        }
        res.json({ message: "Catalogue item permanently deleted", id: deleted.id });
    }
    catch (err) {
        fail(res, err);
    }
};
exports.deleteCatalogueItemController = deleteCatalogueItemController;
// GET /ppe/catalogue/types: the dropdown list
const getPPETypes = async (_req, res) => {
    res.json(ppeTypes_1.PPE_TYPES);
};
exports.getPPETypes = getPPETypes;
// POST /ppe/catalogue/stock
// body: { itemName: "Safety Boots", mode: "add" | "set", entries: [{ size?: "9", quantity: 4 }] }
const addStockByNameController = async (req, res) => {
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
        res.json(await (0, ppeCatalogue_1.stockByName)(String(req.body.itemName), mode, entries));
    }
    catch (err) {
        fail(res, err);
    }
};
exports.addStockByNameController = addStockByNameController;
