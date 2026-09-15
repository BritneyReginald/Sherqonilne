export type RecordType = "incident" | "ncr" | "injury";
export type RecordStatus = "Created" | "Under Investigation" | "Complete";

export type EvidenceFile = {
  id: number;
  name: string;
  // Not included when the record is loaded — fetched on demand via
  // GET /api/incidents/:id/evidence/:fileId/url (short-lived SAS URL).
};

export type InvestigationData = {
  investigator?: string;
  investigationDate?: string;
  location?: string;
  department?: string;

  immediateCause?: string;
  rootCause?: string;
  contributingFactors?: string;

  correctiveActions?: string[]; // repeatable list
  responsiblePerson?: string;
  dueDate?: string;

  preventiveActions?: string;
  evidence?: EvidenceFile[];
};

// One row from first_aid_entries, as returned nested under a
// type: 'injury', injuryType: 'firstAid' record's `firstAidEntries`.
export type FirstAidEntryRecord = {
  id: string;
  employeeId?: string;
  employeeName: string;
  employeeNumber: string;
  date: string;
  time: string;
  injury: string;
  treatment: string;
  comments: string;
  firstAider: string;
  furtherMedicalAttention: boolean;
  status: string;
};

export type IncidentRecord = {
  id: number;
  type: RecordType;

  employeeId?: number | null;
  employeeNumber?: string;
  employeeName?: string;
  employeeSiteLocation?: string;

  division?: string;
  site?: string;
  incidentDate?: string;
  incidentTime?: string;

  category?: string;
  title: string;
  description: string;
  status: RecordStatus;

  // Injury-specific: which of the two injury report shapes this is.
  // Only present when type === "injury".
  injuryType?: "firstAid" | "hospital";

  // Registry-list summary count for First Aid logs — populated by
  // getAllIncidentRecords, not present on incident/ncr rows.
  firstAidEntryCount?: number;

  // Full per-entry detail — only populated when fetching a single
  // First Aid record via buildFullRecord (GET /:id), not on the
  // registry list.
  firstAidEntries?: FirstAidEntryRecord[];

  // NCR-specific
  ncrType?: "Internal" | "External";
  identifiedBy?: string;
  department?: string;

  // Injury (hospital-case) specific
  bodyPart?: string;
  effect?: string;
  disablement?: string;

  createdAt: string;
  updatedAt?: string;

  investigation?: InvestigationData;
};