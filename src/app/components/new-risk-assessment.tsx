import { useState } from "react";
import {
  calculateRiskRating,
  requiresAfterControls,
} from "@/app/utils/risk-utils";

import { RiskMethodology } from "./risk-methodology";
import { RiskAssessmentBeforeControls } from "./risk-assessment-before-controls";
import { RiskAssessmentAfterControls } from "./risk-assessment-after-controls";
import { RiskAssessmentDetails } from "./risk-assessment-details";
import { RiskAssessmentTable } from "./risk-assessment-table";

/* ---------------- TYPES ---------------- */
interface BeforeControlsData {
  hazard: string;
  consequence: string;
  severity: number | null;
  probability: number | null;
  controls: string;
  score: number;
  rating: string;
}

interface AfterControlsData {
  severity: number | null;
  probability: number | null;
  score: number;
  rating: string;
}

interface DetailsData {
  taskDescription: string;
  assessors: string[];
  assessmentDate: string;
}

/* ---------------- COMPONENT ---------------- */
export function NewRiskAssessment() {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [needsAfterControls, setNeedsAfterControls] = useState(false);

  const [beforeControls, setBeforeControls] = useState<BeforeControlsData>({
    hazard: "",
    consequence: "",
    severity: null,
    probability: null,
    controls: "",
    score: 0,
    rating: "",
  });

  const [afterControls, setAfterControls] = useState<AfterControlsData>({
    severity: null,
    probability: null,
    score: 0,
    rating: "",
  });

  const [details, setDetails] = useState<DetailsData>({
    taskDescription: "",
    assessors: [""],
    assessmentDate: new Date().toISOString().slice(0, 10),
  });

  /* ---------------- FLOW CONTROL ---------------- */
  const handleBeforeControlsNext = () => {
    const rating = calculateRiskRating(beforeControls.score);
    const reassess = requiresAfterControls(rating);

    setNeedsAfterControls(reassess);
    setBeforeControls((prev) => ({ ...prev, rating }));

    setStep(reassess ? 3 : 4);
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div className="h-screen overflow-y-auto px-6 py-4 bg-gray-50">
      {/* ---------------- PAGE 1 ---------------- */}
      {step === 1 && (
        <div className="max-w-6xl mx-auto">
          <RiskMethodology onNext={() => setStep(2)} />
        </div>
      )}

      {/* ---------------- PAGE 2 ---------------- */}
      {/* ---------------- PAGE 2: BEFORE CONTROLS ---------------- */}
{step === 2 && (
  <RiskAssessmentBeforeControls
    data={beforeControls}
    setData={setBeforeControls}
    onComplete={(data) => {
      // data contains current severity, probability, score, rating
      setBeforeControls(data);

      if (data.rating === "Critical" || data.rating === "High Risk") {
        setNeedsAfterControls(true);
        setStep(3); // go to After Controls
      } else {
        setNeedsAfterControls(false);
        setStep(4); // skip After Controls
      }
    }}
  />
)}


      {/* ---------------- PAGE 3 ---------------- */}
      {step === 3 && (
        <RiskAssessmentAfterControls
          data={afterControls}
          setData={setAfterControls}
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
        />
      )}

      {/* ---------------- PAGE 4 ---------------- */}
      {step === 4 && (
        <RiskAssessmentDetails
          onBack={() => setStep(needsAfterControls ? 3 : 2)}
          onSubmit={(data) => {
            setDetails(data);
            setStep(5);
          }}
        />
      )}

      {/* ---------------- PAGE 5 ---------------- */}
      {step === 5 && (
        <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md">
          <RiskAssessmentTable
            beforeControls={beforeControls}
            afterControls={needsAfterControls ? afterControls : null}
            details={details}
          />
        </div>
      )}
    </div>
  );
}
