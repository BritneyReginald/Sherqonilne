// Registry rows come back from the API with DATE / TIME columns as
// ISO strings, and (depending on your api mapper) either camelCase or
// snake_case keys. These helpers normalise both so the forms can be
// prefilled safely. Once you've confirmed which key style your
// IncidentRecord type uses you can simplify `pick`.

export const pick = (r: any, camel: string, snake: string) =>
  r?.[camel] ?? r?.[snake];

// "2026-11-06" | "2026-11-06T00:00:00.000Z" | Date  ->  "2026-11-06"
export const toDateInput = (v: unknown): string => {
  if (!v) return "";
  const s = String(v);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// "14:30:00" -> "14:30"
export const toTimeInput = (v: unknown): string => {
  if (!v) return "";
  const s = String(v);
  return /^\d{2}:\d{2}/.test(s) ? s.slice(0, 5) : "";
};

const str = (v: unknown) => (v == null ? "" : String(v));

export const BODY_PARTS = [
  "Other",
  "Head or Neck",
  "Eye",
  "Trunk",
  "Finger",
  "Hand",
  "Torso",
  "Arm",
  "Foot",
  "Leg",
  "Internal",
  "Multiple",
];

export const NCR_CATEGORIES = ["Product", "Service", "System", "Other"];

export function toIncidentFormInitial(r: any) {
  return {
    division: str(r?.division),
    date: toDateInput(pick(r, "incidentDate", "incident_date")),
    employeeId: str(pick(r, "employeeId", "employee_id")),
    employeeName: str(pick(r, "employeeName", "employee_name")),
    supervisor: str(r?.supervisor),
    site: str(r?.site),
    time: toTimeInput(pick(r, "incidentTime", "incident_time")),
    employeeNumber: str(pick(r, "employeeNumber", "employee_number")),
    description: str(r?.description),
  };
}

export function toInjuryFormInitial(r: any) {
  const bodyPartRaw = str(pick(r, "bodyPart", "body_part"));
  const knownBodyPart = BODY_PARTS.includes(bodyPartRaw);

  return {
    ...toIncidentFormInitial(r),
    bodyPart: bodyPartRaw && !knownBodyPart ? "Other" : bodyPartRaw,
    otherBodyPart: bodyPartRaw && !knownBodyPart ? bodyPartRaw : "",
    effect: str(r?.effect),
    disablement: str(r?.disablement),
  };
}

export function toNcrFormInitial(r: any) {
  const categoryRaw = str(r?.category);
  const knownCategory = NCR_CATEGORIES.includes(categoryRaw);

  return {
    dateIdentified: toDateInput(pick(r, "incidentDate", "incident_date")),
    identifiedBy: str(pick(r, "identifiedBy", "identified_by")),
    department: str(r?.department),
    type: str(pick(r, "ncrType", "ncr_type")),
    description: str(r?.description),
    category: categoryRaw && !knownCategory ? "Other" : categoryRaw,
    customCategory: categoryRaw && !knownCategory ? categoryRaw : "",
  };
}
