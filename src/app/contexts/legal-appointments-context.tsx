import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface LegalAppointment {
  id: string;
  employeeId: string | null;
  employeeName: string;
  employeeNumber: string;
  jobTitle: string;
  appointmentType: string;
  legalSection: string;
  department: string;
  siteId: string | null;
  siteName: string;
  appointerName: string;
  startDate: string;
  endDate: string;
  status: "Active" | "Expired" | "Pending";
  signatureStatus: "Signed" | "Pending" | "Not Required";
  reportsTo?: string;
  reportsToId?: string;
  delegatedAuthorityScope: string;
  hierarchyLevel: number;
  documentFileName?: string;
  documentUrl?: string;
  documentUploaded: boolean;
  /** Base64 PNG data URL captured from the on-screen signature pad */
  signatureData?: string | null;
  signedAt?: string | null;
}

export interface NewLegalAppointmentInput {
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  jobTitle: string;
  appointmentType: string;
  legalSection: string;
  department: string;
  siteId: string;
  siteName: string;
  appointerName: string;
  startDate: string;
  endDate: string;
  reportsTo?: string;
  reportsToId?: string;
  delegatedAuthorityScope: string;
  hierarchyLevel: number;
}

function mapApiAppointment(row: any): LegalAppointment {
  return {
    id: row.id?.toString() ?? "",
    employeeId: row.employee_id != null ? row.employee_id.toString() : null,
    employeeName: row.employee_name ?? "",
    employeeNumber: row.employee_number ?? "",
    jobTitle: row.job_title ?? "",
    appointmentType: row.appointment_type ?? "",
    legalSection: row.legal_section ?? "",
    department: row.department ?? "",
    siteId: row.site_id != null ? row.site_id.toString() : null,
    siteName: row.site_name ?? "",
    appointerName: row.appointer_name ?? "",
    startDate: row.start_date ?? "",
    endDate: row.end_date ?? "",
    status: row.status ?? "Pending",
    signatureStatus: row.signature_status ?? "Pending",
    reportsTo: row.reports_to ?? "",
    reportsToId: row.reports_to_id ?? "",
    delegatedAuthorityScope: row.delegated_authority_scope ?? "",
    hierarchyLevel: row.hierarchy_level ?? 4,
    documentFileName: row.document_file_name ?? undefined,
    documentUrl: row.document_url ?? undefined,
    documentUploaded: !!row.document_blob_name,
    signatureData: row.signature_data ?? null,
    signedAt: row.signed_at ?? null,
  };
}

interface LegalAppointmentsContextType {
  appointments: LegalAppointment[];
  loading: boolean;
  refresh: () => Promise<void>;
  addAppointment: (
    input: NewLegalAppointmentInput,
  ) => Promise<LegalAppointment>;
  updateAppointment: (
    id: string,
    updates: Record<string, any>,
  ) => Promise<LegalAppointment>;
  deleteAppointment: (id: string) => Promise<void>;
  uploadDocument: (id: string, file: File) => Promise<LegalAppointment>;
}

const LegalAppointmentsContext = createContext<
  LegalAppointmentsContextType | undefined
>(undefined);

export function LegalAppointmentsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [appointments, setAppointments] = useState<LegalAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/legal-appointments`);
      if (!res.ok) throw new Error("Failed to fetch legal appointments");
      const data = await res.json();
      setAppointments(data.map(mapApiAppointment));
    } catch (error) {
      console.error("Error fetching legal appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const addAppointment = async (
    input: NewLegalAppointmentInput,
  ): Promise<LegalAppointment> => {
    const res = await fetch(`${API_URL}/legal-appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to create appointment (${res.status}): ${text}`);
    }
    const saved = await res.json();
    const mapped = mapApiAppointment(saved);
    setAppointments((prev) => [mapped, ...prev]);
    return mapped;
  };

  const updateAppointment = async (
    id: string,
    updates: Record<string, any>,
  ): Promise<LegalAppointment> => {
    const res = await fetch(`${API_URL}/legal-appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok)
      throw new Error(`Failed to update appointment (${res.status})`);
    const saved = await res.json();
    const mapped = mapApiAppointment(saved);
    setAppointments((prev) => prev.map((a) => (a.id === id ? mapped : a)));
    return mapped;
  };

  const deleteAppointment = async (id: string) => {
    const res = await fetch(`${API_URL}/legal-appointments/${id}`, {
      method: "DELETE",
    });
    if (!res.ok)
      throw new Error(`Failed to delete appointment (${res.status})`);
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  const uploadDocument = async (
    id: string,
    file: File,
  ): Promise<LegalAppointment> => {
    const formData = new FormData();
    formData.append("document", file);
    const res = await fetch(`${API_URL}/legal-appointments/${id}/document`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error(`Failed to upload document (${res.status})`);
    const saved = await res.json();
    const mapped = mapApiAppointment(saved);
    setAppointments((prev) => prev.map((a) => (a.id === id ? mapped : a)));
    return mapped;
  };

  return (
    <LegalAppointmentsContext.Provider
      value={{
        appointments,
        loading,
        refresh,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        uploadDocument,
      }}
    >
      {children}
    </LegalAppointmentsContext.Provider>
  );
}

export function useLegalAppointments() {
  const context = useContext(LegalAppointmentsContext);
  if (!context) {
    throw new Error(
      "useLegalAppointments must be used within LegalAppointmentsProvider",
    );
  }
  return context;
}
