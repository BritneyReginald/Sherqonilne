import { Request, Response } from "express";
import { Employee } from "../types";

import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deactivateEmployee,
  deleteEmployee,
} from "../models/employee";

export const addEmployee = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const employee = req.body as Employee;

    const newEmployee = await createEmployee(employee);

    res.status(201).json(newEmployee);
  } catch (err: any) {
    console.error(err);

    res.status(500).json({
      error: err.message,
      detail: err.detail,
      code: err.code,
    });
  }
};

export const getAllEmployees = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const employees = await getEmployees();

    res.json(employees);
  } catch (err: any) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
};


export const getEmployee = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const employee = await getEmployeeById(Number(req.params.id));

    if (!employee) {
      res.status(404).json({
        message: "Employee not found",
      });
      return;
    }

    res.json(employee);
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
    });
  }
};


export const editEmployee = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const employee = await updateEmployee(
      Number(req.params.id),
      req.body
    );

    if (!employee) {
      res.status(404).json({
        message: "Employee not found",
      });
      return;
    }

    res.json(employee);
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
    });
  }
};

export const deactivateEmployeeController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const employee = await deactivateEmployee(Number(req.params.id));

    if (!employee) {
      res.status(404).json({
        message: "Employee not found",
      });
      return;
    }

    res.json(employee);
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
    });
  }
};

export const deleteEmployeeController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const employee = await deleteEmployee(Number(req.params.id));

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
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
    });
  }
};