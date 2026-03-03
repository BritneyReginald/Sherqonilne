import { createContext, useContext, useEffect, useState } from "react";

export interface TrainingRecord {
  id: string;
  employeeId: string;
  certificateName: string;
  provider: string;
  completionDate: string;
  expiryDate: string;
  certificateNumber?: string;
  accreditationBody?: string;
  trainingCategory: "Safety" | "Health" | "Environmental" | "Quality";
  isLegallyRequired: boolean;
}

interface TrainingContextType {
  records: TrainingRecord[];
  addRecord: (record: TrainingRecord) => void;
  deleteRecord: (id: string) => void;
}

const TrainingContext = createContext<TrainingContextType | undefined>(
  undefined,
);

export function TrainingProvider({ children }: { children: React.ReactNode }) {
  const mockTrainingData: TrainingRecord[] = [
    {
      id: "1",
      employeeId: "EMP001",
      certificateName: "First Aid Level 1",
      provider: "SafetyFirst Training",
      completionDate: "2023-01-15",
      expiryDate: "2026-01-15",
      certificateNumber: "FA-2023-8891",
      accreditationBody: "HWSETA",
      trainingCategory: "Safety",
      isLegallyRequired: true,
    },
    {
      id: "2",
      employeeId: "EMP002",
      certificateName: "Fire Safety Awareness",
      provider: "Fire Solutions SA",
      completionDate: "2022-06-10",
      expiryDate: "2025-06-10",
      trainingCategory: "Safety",
      isLegallyRequired: true,
    },
    {
      id: "3",
      employeeId: "EMP001",
      certificateName: "Hazard Identification & Risk Assessment",
      provider: "ProSafety Academy",
      completionDate: "2022-02-01",
      expiryDate: "2024-03-01",
      trainingCategory: "Safety",
      isLegallyRequired: true,
    },
  ];

  const [records, setRecords] = useState<TrainingRecord[]>(() => {
    const stored = localStorage.getItem("trainingRecords");

    if (!stored) {
      return mockTrainingData;
    }

    const parsed = JSON.parse(stored);

    return parsed.length > 0 ? parsed : mockTrainingData;
  });
  useEffect(() => {
    localStorage.setItem("trainingRecords", JSON.stringify(records));
  }, [records]);

  const addRecord = (record: TrainingRecord) => {
    setRecords((prev) => [...prev, record]);
  };

  const deleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <TrainingContext.Provider value={{ records, addRecord, deleteRecord }}>
      {children}
    </TrainingContext.Provider>
  );
}

export function useTraining() {
  const context = useContext(TrainingContext);
  if (!context) {
    throw new Error("useTraining must be used within TrainingProvider");
  }
  return context;
}
