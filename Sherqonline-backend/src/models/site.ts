import pool from "../config/db";

export interface Site {
  id?: number;
  companyId: number;
  name: string;
  location?: string;
  workersActive?: number;
  incidentsThisMonth?: number;
  complianceStatus?: string;
  hasManager?: boolean;
  mapImage?: string;
}

export const createSite = async (site: Site) => {
  const result = await pool.query(
    `
    INSERT INTO sites
    (
      company_id,
      name,
      location,
      workers_active,
      incidents_this_month,
      compliance_status,
      has_manager,
      map_image
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *;
    `,
    [
      site.companyId,
      site.name,
      site.location,
      site.workersActive ?? 0,
      site.incidentsThisMonth ?? 0,
      site.complianceStatus ?? "compliant",
      site.hasManager ?? false,
      site.mapImage,
    ]
  );

  return result.rows[0];
};

export const getSites = async () => {
  const result = await pool.query(`
    SELECT
      s.*,
      c.name AS company_name
    FROM sites s
    JOIN companies c
      ON s.company_id = c.id
    ORDER BY c.name, s.name;
  `);

  return result.rows;
};


export const getSiteById = async (id: number) => {
  const result = await pool.query(
    `
    SELECT *
    FROM sites
    WHERE id = $1;
    `,
    [id]
  );

  return result.rows[0];
};

export const updateSite = async (
  id: number,
  site: Partial<Site>
) => {

  const fieldMap: Record<string,string> = {
    companyId: "company_id",
    name: "name",
    location: "location",
    workersActive: "workers_active",
    incidentsThisMonth: "incidents_this_month",
    complianceStatus: "compliance_status",
    hasManager: "has_manager",
    mapImage: "map_image",
  };

  const updates: string[] = [];
  const values: any[] = [];

  let index = 1;

  for (const [key, value] of Object.entries(site)) {
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

  const result = await pool.query(
    `
    UPDATE sites
    SET ${updates.join(", ")}
    WHERE id = $${index}
    RETURNING *;
    `,
    values
  );

  return result.rows[0];
};

export const deleteSite = async (id: number) => {
  const result = await pool.query(
    `
    DELETE FROM sites
    WHERE id = $1
    RETURNING id;
    `,
    [id]
  );

  return result.rows[0];
};