"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInspectorSites = updateInspectorSites;
exports.updateFirstAiderSites = updateFirstAiderSites;
const user_1 = require("../models/user");
async function updateInspectorSites(req, res) {
    try {
        const userId = Number(req.params.id);
        const { siteIds } = req.body;
        if (!Array.isArray(siteIds)) {
            return res.status(400).json({
                error: "siteIds must be an array",
            });
        }
        await (0, user_1.replaceInspectorSites)(userId, siteIds);
        return res.json({
            message: "Inspector sites updated successfully",
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to update inspector sites",
        });
    }
}
async function updateFirstAiderSites(req, res) {
    try {
        const userId = Number(req.params.id);
        const { siteIds } = req.body;
        if (!Array.isArray(siteIds)) {
            return res.status(400).json({
                error: "siteIds must be an array",
            });
        }
        await (0, user_1.replaceFirstAiderSites)(userId, siteIds);
        return res.json({
            message: "First aider sites updated successfully",
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to update first aider sites",
        });
    }
}
