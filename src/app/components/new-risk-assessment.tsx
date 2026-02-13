import { useState } from "react";
import {
  calculateRiskScore,
  calculateRiskRating,
  RiskRating,
} from "@/app/utils/risk-utils";

import { RiskMethodology } from "./risk-methodology";
import { RiskAssessmentBeforeControls } from "./risk-assessment-before-controls";
import { RiskAssessmentAfterControls } from "./risk-assessment-after-controls";
import { RiskAssessmentDetails } from "./risk-assessment-details";
import { RiskAssessmentTable } from "./risk-assessment-table";

/* ---------------- TYPES ---------------- */

export interface HazardItem {
  id: string;
  hazard: string;
  severity: number | null;
  probability: number | null;
  controls: string[];
}

export interface BeforeControlsData {
  hazards: HazardItem[];
}

export interface AfterControlsHazard {
  id: string;
  hazard: string;
  severity: number | null;
  probability: number | null;
}

export interface AfterControlsData {
  hazards: AfterControlsHazard[];
}

export interface DetailsData {
  taskDescription: string;
  assessors: string[];
  assessmentDate: string;
}

/* ---------------- NEW PROPS (SAFE & OPTIONAL) ---------------- */

interface NewRiskAssessmentProps {
  onCancel?: () => void;
  onSave?: (data: {
    hazard: string;
    assessmentDate: string;
    assignedEmployees: string[];
  }) => void;
}

/* ---------------- COMPONENT ---------------- */

export function NewRiskAssessment({
  onCancel,
  onSave,
}: NewRiskAssessmentProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [needsAfterControls, setNeedsAfterControls] = useState(false);

  /* ---------------- STATES (UNCHANGED) ---------------- */

  const [beforeControls, setBeforeControls] = useState<BeforeControlsData>({
    hazards: [
      {
        id: crypto.randomUUID(),
        hazard: "",
        severity: null,
        probability: null,
        controls: [""],
      },
    ],
  });

  const [afterControls, setAfterControls] =
    useState<AfterControlsData>({
      hazards: [],
    });

  const [details, setDetails] = useState<DetailsData>({
    taskDescription: "",
    assessors: [""],
    assessmentDate: new Date().toISOString().slice(0, 10),
  });

  /* ---------------- HANDLERS (UNCHANGED LOGIC) ---------------- */

  const handleBeforeControlsComplete = (data: BeforeControlsData) => {
    setBeforeControls(data);

    const anyHighRisk = data.hazards.some((h) => {
      const score = calculateRiskScore(h.severity, h.probability);
      const rating = score ? calculateRiskRating(score) : "";
      return rating === "Critical" || rating === "High Risk";
    });

    if (anyHighRisk) {
      setNeedsAfterControls(true);
      setStep(3);
    } else {
      setNeedsAfterControls(false);
      setStep(4);
    }
  };

  /* ---------------- RENDER ---------------- */

  return (
    <>
      {/* Step 1: Methodology */}
      {step === 1 && <RiskMethodology onNext={() => setStep(2)} />}

      {/* Step 2: Before Controls */}
      {step === 2 && (
        <RiskAssessmentBeforeControls
          data={beforeControls}
          setData={setBeforeControls}
          onComplete={(data) => {
            setBeforeControls(data);

            const highRiskHazards = data.hazards.filter((h) => {
              const score = calculateRiskScore(h.severity, h.probability);
              const rating = score ? calculateRiskRating(score) : "";
              return rating === "Critical" || rating === "High Risk";
            });

            if (highRiskHazards.length > 0) {
              setAfterControls({
                hazards: highRiskHazards.map((h) => ({
                  ...h,
                  severity: h.severity,
                  probability: h.probability,
                })),
              });

              setNeedsAfterControls(true);
              setStep(3);
            } else {
              setNeedsAfterControls(false);
              setStep(4);
            }
          }}
        />
      )}

      {/* Step 3: After Controls */}
      {step === 3 && (
        <RiskAssessmentAfterControls
          data={afterControls}
          setData={setAfterControls}
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
        />
      )}

      {/* Step 4: Details */}
      {step === 4 && (
        <RiskAssessmentDetails
          onBack={() => setStep(needsAfterControls ? 3 : 2)}
          onSubmit={(data) => {
            setDetails(data);
            setStep(5);
          }}
        />
      )}

      {/* Step 5: Summary Table */}
      {step === 5 && (
        <RiskAssessmentTable
          beforeControls={beforeControls}
          afterControls={needsAfterControls ? afterControls : null}
          details={details}
          onBack={() => setStep(4)}
          onGenerate={() => {
            if (!onSave) return;

            onSave({
              hazard:
                beforeControls.hazards[0]?.hazard ||
                details.taskDescription,
              assessmentDate: details.assessmentDate,
              assignedEmployees: details.assessors.filter(Boolean),
            });
          }}
        />
      )}
    </>
  );
}
