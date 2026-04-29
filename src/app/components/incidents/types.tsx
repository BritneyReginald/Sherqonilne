export type InvestigationData = {
  investigator?: string;
  investigationDate?: string;
  location?: string;
  department?: string;

  immediateCause?: string;
  rootCause?: string;
  contributingFactors?: string;

  correctiveActions?: string;
  responsiblePerson?: string;
  dueDate?: string;

  preventiveActions?: string;

  evidence?: File[];
};

export type IncidentRecord = {
  id: number;
  type: "incident" | "ncr" | "injury";
  category?: string;
  title: string;
  description: string;
  status: "Open" | "Under Investigation" | "Closed";
  investigation?: InvestigationData;
};