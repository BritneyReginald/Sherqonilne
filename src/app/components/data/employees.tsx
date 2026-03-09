export interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  jobTitle: string;
  siteLocation: string;
  complianceStatus: "compliant" | "review" | "action";
}

export const employees: Employee[] = [
  {
    id: "1",
    employeeId: "EMP001",
    fullName: "Sarah Johnson",
    jobTitle: "Site Safety Officer",
    siteLocation: "Johannesburg Main",
    complianceStatus: "compliant",
  },
  {
    id: "2",
    employeeId: "EMP002",
    fullName: "Michael Chen",
    jobTitle: "Construction Supervisor",
    siteLocation: "Cape Town Depot",
    complianceStatus: "action",
  },
  {
    id: "3",
    employeeId: "EMP003",
    fullName: "Thandiwe Mthembu",
    jobTitle: "Health & Safety Manager",
    siteLocation: "Durban Operations",
    complianceStatus: "compliant",
  },
  {
    id: "4",
    employeeId: "EMP004",
    fullName: "David van der Merwe",
    jobTitle: "Equipment Operator",
    siteLocation: "Johannesburg Main",
    complianceStatus: "review",
  },
  {
    id: "5",
    employeeId: "EMP005",
    fullName: "Precious Ndlovu",
    jobTitle: "Environmental Officer",
    siteLocation: "Pretoria Branch",
    complianceStatus: "compliant",
  },
  {
    id: "6",
    employeeId: "EMP006",
    fullName: "James Anderson",
    jobTitle: "Foreman",
    siteLocation: "Cape Town Depot",
    complianceStatus: "action",
  },
  {
    id: "7",
    employeeId: "EMP007",
    fullName: "Nomvula Dlamini",
    jobTitle: "Quality Inspector",
    siteLocation: "Durban Operations",
    complianceStatus: "review",
  },
  {
    id: "8",
    employeeId: "EMP008",
    fullName: "Peter Williams",
    jobTitle: "Site Manager",
    siteLocation: "Johannesburg Main",
    complianceStatus: "compliant",
  },
  {
    id: "9",
    employeeId: "EMP009",
    fullName: "Lindiwe Khumalo",
    jobTitle: "Safety Coordinator",
    siteLocation: "Pretoria Branch",
    complianceStatus: "action",
  },
  {
    id: "10",
    employeeId: "EMP010",
    fullName: "Robert Smith",
    jobTitle: "Maintenance Technician",
    siteLocation: "Cape Town Depot",
    complianceStatus: "compliant",
  },
  {
    id: "11",
    employeeId: "EMP011",
    fullName: "Zanele Nkosi",
    jobTitle: "Compliance Officer",
    siteLocation: "Johannesburg Main",
    complianceStatus: "review",
  },
  {
    id: "12",
    employeeId: "EMP012",
    fullName: "Andrew Brown",
    jobTitle: "Project Engineer",
    siteLocation: "Durban Operations",
    complianceStatus: "compliant",
  },
  {
    id: "13",
    employeeId: "EMP013",
    fullName: "Thabo Mokoena",
    jobTitle: "Safety Supervisor",
    siteLocation: "Pretoria Branch",
    complianceStatus: "action",
  },
  {
    id: "14",
    employeeId: "EMP014",
    fullName: "Emma Davis",
    jobTitle: "Training Coordinator",
    siteLocation: "Cape Town Depot",
    complianceStatus: "compliant",
  },
  {
    id: "15",
    employeeId: "EMP015",
    fullName: "Sipho Zulu",
    jobTitle: "Equipment Operator",
    siteLocation: "Johannesburg Main",
    complianceStatus: "review",
  },
];