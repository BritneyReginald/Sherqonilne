"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCatalogueItemController = exports.editCatalogueItem = exports.getCatalogueItem = exports.getAllCatalogueItems = exports.addCatalogueItem = void 0;
const ppeCatalogue_1 = require("../models/ppeCatalogue");
function parseCatalogueBody(body) {
    return {
        itemName: body.itemName,
        category: body.category,
        supplier: body.supplier || null,
        requiresSize: body.requiresSize === true || body.requiresSize === "true",
        sizes: body.sizes
            ? Array.isArray(body.sizes)
                ? body.sizes
                : String(body.sizes)
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
            : null,
        replacementDays: Number(body.replacementDays) || 180,
        stockLevel: Number(body.stockLevel) || 0,
        minStockLevel: Number(body.minStockLevel) || 0,
    };
}
const addCatalogueItem = async (req, res) => {
    try {
        const data = parseCatalogueBody(req.body);
        if (!data.itemName || !data.category) {
            res.status(400).json({ error: "itemName and category are required" });
            return;
        }
        const item = await (0, ppeCatalogue_1.createCatalogueItem)(data);
        res.status(201).json(item);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message, detail: err.detail, code: err.code });
    }
};
exports.addCatalogueItem = addCatalogueItem;
const getAllCatalogueItems = async (req, res) => {
    try {
        const items = await (0, ppeCatalogue_1.getCatalogueItems)(req.query.category);
        res.json(items);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
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
        res.status(500).json({ error: err.message });
    }
};
exports.getCatalogueItem = getCatalogueItem;
const editCatalogueItem = async (req, res) => {
    try {
        const item = await (0, ppeCatalogue_1.updateCatalogueItem)(Number(req.params.id), parseCatalogueBody(req.body));
        if (!item) {
            res.status(404).json({ message: "Catalogue item not found" });
            return;
        }
        res.json(item);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.editCatalogueItem = editCatalogueItem;
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
        res.status(500).json({ error: err.message });
    }
};
exports.deleteCatalogueItemController = deleteCatalogueItemController;
