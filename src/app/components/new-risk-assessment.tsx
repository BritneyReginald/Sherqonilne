import { useState } from "react";
import {
  calculateRiskScore,
  calculateRiskRating,
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

/* ---------------- PROPS ---------------- */

interface NewRiskAssessmentProps {
  existingData?: {
    beforeControls: BeforeControlsData;
    afterControls: AfterControlsData | null;
    details: DetailsData;
  };
  onCancel?: () => void;
  onSave?: (data: {
    beforeControls: BeforeControlsData;
    afterControls: AfterControlsData | null;
    details: DetailsData;
    pdfBlob: string;
  }) => void;
}

export function NewRiskAssessment({
  existingData,
  onCancel,
  onSave,
}: NewRiskAssessmentProps) {

  // ✅ Start at step 5 if editing
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(
    existingData ? 5 : 1
  );

  const [needsAfterControls, setNeedsAfterControls] = useState(
    existingData?.afterControls ? true : false
  );

  const [beforeControls, setBeforeControls] =
    useState<BeforeControlsData>(
      existingData?.beforeControls || {
        hazards: [
          {
            id: crypto.randomUUID(),
            hazard: "",
            severity: null,
            probability: null,
            controls: [""],
          },
        ],
      }
    );

  const [afterControls, setAfterControls] =
    useState<AfterControlsData>(
      existingData?.afterControls || { hazards: [] }
    );

  const [details, setDetails] =
    useState<DetailsData>(
      existingData?.details || {
        taskDescription: "",
        assessors: [""],
        assessmentDate: new Date().toISOString().slice(0, 10),
      }
    );

  return (
    <>
      {step === 1 && <RiskMethodology onNext={() => setStep(2)} />}

      {step === 2 && (
        <RiskAssessmentBeforeControls
          data={beforeControls}
          setData={setBeforeControls}
          onComplete={(data) => {
            setBeforeControls(data);

            const highRiskHazards = data.hazards.filter((h) => {
              const score = calculateRiskScore(h.severity, h.probability);
              const rating = score
                ? calculateRiskRating(score)
                : "";
              return (
                rating === "Critical" ||
                rating === "High Risk"
              );
            });

            if (highRiskHazards.length > 0) {
              setAfterControls({ hazards: highRiskHazards });
              setNeedsAfterControls(true);
              setStep(3);
            } else {
              setNeedsAfterControls(false);
              setStep(4);
            }
          }}
        />
      )}

      {step === 3 && (
        <RiskAssessmentAfterControls
          data={afterControls}
          setData={setAfterControls}
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
        />
      )}

      {step === 4 && (
        <RiskAssessmentDetails
          onBack={() =>
            setStep(needsAfterControls ? 3 : 2)
          }
          onSubmit={(data) => {
            setDetails(data);
            setStep(5);
          }}
        />
      )}

      {step === 5 && (
        <RiskAssessmentTable
          beforeControls={beforeControls}
          afterControls={
            needsAfterControls ? afterControls : null
          }
          details={details}
          onBack={() => setStep(4)}
          onGenerate={(pdfBlob) => {
            if (!onSave) return;

            const reader = new FileReader();

            reader.onloadend = () => {
              const base64data =
                reader.result as string;

              onSave({
                beforeControls,
                afterControls: needsAfterControls
                  ? afterControls
                  : null,
                details,
                pdfBlob: base64data,
              });
            };

            reader.readAsDataURL(pdfBlob);
          }}
        />
      )}
    </>
  );
}
