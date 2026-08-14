"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEmployeeController = exports.deactivateEmployeeController = exports.editEmployee = exports.getEmployee = exports.getAllEmployees = exports.addEmployee = void 0;
const employee_1 = require("../models/employee");
const addEmployee = async (req, res) => {
    try {
        const employee = req.body;
        const newEmployee = await (0, employee_1.createEmployee)(employee);
        res.status(201).json(newEmployee);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message,
            detail: err.detail,
            code: err.code,
        });
    }
};
exports.addEmployee = addEmployee;
const getAllEmployees = async (req, res) => {
    try {
        const employees = await (0, employee_1.getEmployees)();
        res.json(employees);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message,
        });
    }
};
exports.getAllEmployees = getAllEmployees;
const getEmployee = async (req, res) => {
    try {
        const employee = await (0, employee_1.getEmployeeById)(Number(req.params.id));
        if (!employee) {
            res.status(404).json({
                message: "Employee not found",
            });
            return;
        }
        res.json(employee);
    }
    catch (err) {
        res.status(500).json({
            error: err.message,
        });
    }
};
exports.getEmployee = getEmployee;
const editEmployee = async (req, res) => {
    try {
        const employee = await (0, employee_1.updateEmployee)(Number(req.params.id), req.body);
        if (!employee) {
            res.status(404).json({
                message: "Employee not found",
            });
            return;
        }
        res.json(employee);
    }
    catch (err) {
        res.status(500).json({
            error: err.message,
        });
    }
};
exports.editEmployee = editEmployee;
const deactivateEmployeeController = async (req, res) => {
    try {
        const employee = await (0, employee_1.deactivateEmployee)(Number(req.params.id));
        if (!employee) {
            res.status(404).json({
                message: "Employee not found",
            });
            return;
        }
        res.json(employee);
    }
    catch (err) {
        res.status(500).json({
            error: err.message,
        });
    }
};
exports.deactivateEmployeeController = deactivateEmployeeController;
const deleteEmployeeController = async (req, res) => {
    try {
        const employee = await (0, employee_1.deleteEmployee)(Number(req.params.id));
        if (!employee) {
            res.status(404).json({
                message: "Employee not found",
            });
            return;
        }
        res.json({
            message: "Employee permanently deleted",
            id: employee.id,
        });
    }
    catch (err) {
        res.status(500).json({
            error: err.message,
        });
    }
};
exports.deleteEmployeeController = deleteEmployeeController;
