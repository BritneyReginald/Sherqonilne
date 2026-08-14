"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCompany = exports.updateCompany = exports.getCompanyById = exports.getCompanies = exports.createCompany = void 0;
const db_1 = __importDefault(require("../config/db"));
const createCompany = async (company) => {
    const result = await db_1.default.query(`
    INSERT INTO companies
    (
      name,
      registration_number,
      logo
    )
    VALUES
    ($1,$2,$3)
    RETURNING *;
    `, [
        company.name,
        company.registrationNumber,
        company.logo,
    ]);
    return result.rows[0];
};
exports.createCompany = createCompany;
const getCompanies = async () => {
    const result = await db_1.default.query(`
    SELECT *
    FROM companies
    ORDER BY name;
    `);
    return result.rows;
};
exports.getCompanies = getCompanies;
const getCompanyById = async (id) => {
    const result = await db_1.default.query(`
    SELECT *
    FROM companies
    WHERE id = $1;
    `, [id]);
    return result.rows[0];
};
exports.getCompanyById = getCompanyById;
const updateCompany = async (id, company) => {
    const fieldMap = {
        name: "name",
        registrationNumber: "registration_number",
        logo: "logo",
    };
    const updates = [];
    const values = [];
    let index = 1;
    for (const [key, value] of Object.entries(company)) {
        if (value !== undefined && fieldMap[key]) {
            updates.push(`${fieldMap[key]} = $${index}`);
            values.push(value);
            index++;
        }
    }
    if (updates.length === 0) {
        throw new Error("No fields supplied.");
    }
    values.push(id);
    const result = await db_1.default.query(`
    UPDATE companies
    SET ${updates.join(", ")}
    WHERE id = $${index}
    RETURNING *;
    `, values);
    return result.rows[0];
};
exports.updateCompany = updateCompany;
const deleteCompany = async (id) => {
    const result = await db_1.default.query(`
    DELETE FROM companies
    WHERE id = $1
    RETURNING id;
    `, [id]);
    return result.rows[0];
};
exports.deleteCompany = deleteCompany;
