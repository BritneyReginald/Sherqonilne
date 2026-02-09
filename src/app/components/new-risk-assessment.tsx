import { useState } from "react";
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

  /* ---------------- STATES ---------------- */
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

  /* ---------------- NAVIGATION ---------------- */
  const nextStep = () =>
    setStep((prev) => (prev < 5 ? ((prev + 1) as any) : prev));
  const prevStep = () =>
    setStep((prev) => (prev > 1 ? ((prev - 1) as any) : prev));

  /* ---------------- RENDER ---------------- */
  return (
    <div className="h-screen overflow-y-auto px-6 py-4 bg-gray-50">
      {/* Progress Indicator */}
      <div className="mb-6 flex gap-4 text-sm font-medium">
        <span className={step === 1 ? "text-blue-600" : "text-gray-400"}>
          1. Methodology
        </span>
        <span className={step === 2 ? "text-blue-600" : "text-gray-400"}>
          2. Risk Assessment Before Controls
        </span>
        <span className={step === 3 ? "text-blue-600" : "text-gray-400"}>
          3. Risk Assessment After Controls
        </span>
        <span className={step === 4 ? "text-blue-600" : "text-gray-400"}>
          4. Details
        </span>
        <span className={step === 5 ? "text-blue-600" : "text-gray-400"}>
          5. Summary
        </span>
      </div>

      {/* ---------------- PAGE 1 ---------------- */}
      {step === 1 && (
        <div className="max-w-6xl mx-auto">
          <RiskMethodology onNext={nextStep} />
          <div className="mt-6 flex justify-end">
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Start Risk Assessment
            </button>
          </div>
        </div>
      )}

      {/* ---------------- PAGE 2: BEFORE CONTROLS ---------------- */}
      {step === 2 && (
        <RiskAssessmentBeforeControls
          data={beforeControls}
          setData={setBeforeControls}
          onNext={nextStep}
        />
      )}

      {/* ---------------- PAGE 3: AFTER CONTROLS ---------------- */}
      {step === 3 && (
        <RiskAssessmentAfterControls
          severity={afterControls.severity}
          probability={afterControls.probability}
          onChange={(data) => setAfterControls(data)}
          onBack={prevStep}
          onNext={nextStep}
        />
      )}

      {/* ---------------- PAGE 4: DETAILS ---------------- */}
      {step === 4 && (
        <RiskAssessmentDetails
          onBack={prevStep}
          onSubmit={(data) => {
            setDetails(data);
            nextStep();
          }}
        />
      )}

      {/* ---------------- PAGE 5: SUMMARY ---------------- */}
      {step === 5 && (
        <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4 text-gray-400">Risk Assessment Summary</h1>

          <RiskAssessmentTable
            beforeControls={beforeControls}
            afterControls={afterControls}
            details={details}
          />

          <div className="flex justify-end mt-6">
            <button
              onClick={prevStep}
              className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300 "
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
