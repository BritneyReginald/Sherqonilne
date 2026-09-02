"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPPETransaction = exports.getAllPPETransactions = exports.issuePPE = void 0;
const ppeTransaction_1 = require("../models/ppeTransaction");
const issuePPE = async (req, res) => {
    try {
        const { employeeId, employeeName, jobTitle, siteLocation, items, signatureData } = req.body;
        if (!employeeId || !employeeName) {
            res.status(400).json({ error: "employeeId and employeeName are required" });
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
        const parsedItems = items.map((item) => ({
            itemId: Number(item.itemId),
            size: item.size || null,
            condition: item.condition || "new",
        }));
        const created = await (0, ppeTransaction_1.createPPETransactions)({
            employeeId: Number(employeeId),
            employeeName,
            jobTitle,
            siteLocation,
            items: parsedItems,
            signatureData,
        });
        res.status(201).json(created);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message, detail: err.detail, code: err.code });
    }
};
exports.issuePPE = issuePPE;
const getAllPPETransactions = async (req, res) => {
    try {
        const transactions = await (0, ppeTransaction_1.getPPETransactions)({
            employeeId: req.query.employeeId ? Number(req.query.employeeId) : undefined,
            category: req.query.category,
            siteLocation: req.query.site,
        });
        res.json(transactions);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
exports.getAllPPETransactions = getAllPPETransactions;
const getPPETransaction = async (req, res) => {
    try {
        const transaction = await (0, ppeTransaction_1.getPPETransactionById)(Number(req.params.id));
        if (!transaction) {
            res.status(404).json({ message: "PPE transaction not found" });
            return;
        }
        res.json(transaction);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getPPETransaction = getPPETransaction;
