import { useState } from "react";
import { IncidentForm } from "./incidents-form";
import { NCRForm } from "./ncr-form";
import { InjuryForm } from "./injury-form";

type IncidentType = "incident" | "ncr" | "injury";

interface IncidentsProps {
  type: IncidentType;
}

type IncidentRecord = {
  id: number;
  type: "incident" | "ncr" | "injury";
  title: string;
  description: string;
  status: "Open" | "Under Investigation" | "Closed";
  evidence?: string[];
};

export default function Incidents({ type }: IncidentsProps) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        {type === "incident" && "Incident Reporting"}
        {type === "ncr" && "Non-Conformance Report (NCR)"}
        {type === "injury" && "Injury Reporting"}
      </h1>

      {/* Dynamic Form */}
      {type === "incident" && <IncidentForm />}
      {type === "ncr" && <NCRForm />}
      {type === "injury" && <InjuryForm />}
    </div>
  );
}