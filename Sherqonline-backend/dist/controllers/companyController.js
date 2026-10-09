"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCompanyProfileController = exports.getCompanyProfileController = void 0;
const companyProfile_1 = require("../models/companyProfile");
// ~1.5M characters of base64 is roughly 1MB of image. The frontend shrinks
// logos to 400px before uploading, so real logos are far smaller than this.
const MAX_LOGO_LENGTH = 1500000;
const getCompanyProfileController = async (_req, res) => {
    try {
        res.json(await (0, companyProfile_1.getCompanyProfile)());
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
exports.getCompanyProfileController = getCompanyProfileController;
const updateCompanyProfileController = async (req, res) => {
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
        const saved = await (0, companyProfile_1.saveCompanyProfile)({
            name: name !== undefined ? name.trim() : undefined,
            logo,
        });
        res.json(saved);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
exports.updateCompanyProfileController = updateCompanyProfileController;
