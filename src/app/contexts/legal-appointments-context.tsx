import { createContext, useContext, useState, useEffect } from "react";

export interface LegalAppointment {
  id: string;
  employeeId: string;
  employeeName: string;
  jobTitle: string;
  appointmentType: string;
  legalSection: string;
  startDate: string;
  endDate: string;
  status: "Active" | "Expired" | "Pending";
  documentUploaded: boolean;
  department: string;
  signatureStatus: "Signed" | "Pending" | "Not Required";
  reportsTo?: string;
  reportsToId?: string;
  delegatedAuthorityScope: string;
  hierarchyLevel: number;
}

interface LegalAppointmentsContextType {
  appointments: LegalAppointment[];
  addAppointment: (appointment: LegalAppointment) => void;
  deleteAppointment: (id: string) => void;
  updateAppointment: (appointment: LegalAppointment) => void;
}

const LegalAppointmentsContext =
  createContext<LegalAppointmentsContextType | undefined>(undefined);

const mockAppointments: LegalAppointment[] = [
  {
    id: "1",
    employeeId: "EMP001",
    employeeName: "Sarah Johnson",
    jobTitle: "Safety Officer",
    appointmentType: "Section 16.2 - Safety Officer",
    legalSection: "OHS Act Section 16.2",
    startDate: "2024-01-15",
    endDate: "2027-01-14",
    status: "Active",
    documentUploaded: true,
    department: "Health & Safety",
    signatureStatus: "Signed",
    delegatedAuthorityScope: "Health & Safety",
    hierarchyLevel: 2,
  },
];

export function LegalAppointmentsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [appointments, setAppointments] = useState<LegalAppointment[]>(() => {
    const stored = localStorage.getItem("legalAppointments");
    if (!stored) return mockAppointments;

    const parsed = JSON.parse(stored);
    return parsed.length > 0 ? parsed : mockAppointments;
  });

  useEffect(() => {
    localStorage.setItem(
      "legalAppointments",
      JSON.stringify(appointments)
    );
  }, [appointments]);

  const addAppointment = (appointment: LegalAppointment) => {
    setAppointments((prev) => [...prev, appointment]);
  };

  const deleteAppointment = (id: string) => {
    setAppointments((prev) =>
      prev.filter((a) => a.id !== id)
    );
  };
  const updateAppointment = (updatedAppointment: LegalAppointment) => {
  setAppointments(prev =>
  prev.map(appt =>
    appt.id === updatedAppointment.id
      ? { ...appt, ...updatedAppointment }
      : appt
  )
);
};

  return (
    <LegalAppointmentsContext.Provider
      value={{ appointments, addAppointment, deleteAppointment, updateAppointment }}
    >
      {children}
    </LegalAppointmentsContext.Provider>
  );
}

export function useLegalAppointments() {
  const context = useContext(LegalAppointmentsContext);
  if (!context) {
    throw new Error(
      "useLegalAppointments must be used within LegalAppointmentsProvider"
    );
  }
  return context;
}