import pool from "../config/db";

export interface Company {
  id?: number;
  name: string;
  registrationNumber?: string;
  logo?: string;
}

export const createCompany = async (company: Company) => {
  const result = await pool.query(
    `
    INSERT INTO companies
    (
      name,
      registration_number,
      logo
    )
    VALUES
    ($1,$2,$3)
    RETURNING *;
    `,
    [
      company.name,
      company.registrationNumber,
      company.logo,
    ]
  );

  return result.rows[0];
};

export const getCompanies = async () => {
  const result = await pool.query(
    `
    SELECT *
    FROM companies
    ORDER BY name;
    `
  );

  return result.rows;
};

export const getCompanyById = async (id: number) => {
  const result = await pool.query(
    `
    SELECT *
    FROM companies
    WHERE id = $1;
    `,
    [id]
  );

  return result.rows[0];
};

export const updateCompany = async (
  id: number,
  company: Partial<Company>
) => {

  const fieldMap: Record<string,string> = {
    name: "name",
    registrationNumber: "registration_number",
    logo: "logo",
  };

  const updates:string[] = [];
  const values:any[] = [];

  let index = 1;

  for (const [key,value] of Object.entries(company)) {
    if(value !== undefined && fieldMap[key]) {
      updates.push(`${fieldMap[key]} = $${index}`);
      values.push(value);
      index++;
    }
  }

  if(updates.length === 0){
    throw new Error("No fields supplied.");
  }

  values.push(id);

  const result = await pool.query(
    `
    UPDATE companies
    SET ${updates.join(", ")}
    WHERE id = $${index}
    RETURNING *;
    `,
    values
  );

  return result.rows[0];
};

export const deleteCompany = async (id:number) => {
  const result = await pool.query(
    `
    DELETE FROM companies
    WHERE id = $1
    RETURNING id;
    `,
    [id]
  );

  return result.rows[0];
};