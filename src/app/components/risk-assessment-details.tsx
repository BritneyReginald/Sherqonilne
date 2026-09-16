import { useState } from "react";
import { PageLayout } from "../components/page-layout";

interface Props {
  onBack: () => void;
  onSubmit: (data: {
    taskDescription: string;
    assessors: string[];
    assessmentDate: string;
    companyName: string;
    companyLogo: string;
  }) => void;
}

export function RiskAssessmentDetails({ onBack, onSubmit }: Props) {
  const [taskDescription, setTaskDescription] = useState("");
  const [assessors, setAssessors] = useState<string[]>([""]);
  const [assessmentDate, setAssessmentDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [companyName, setCompanyName] = useState("");
  const [companyLogo, setCompanyLogo] = useState<string>("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateAssessor = (index: number, value: string) => {
    const updated = [...assessors];
    updated[index] = value;
    setAssessors(updated);
  };

  const addAssessor = () => setAssessors((prev) => [...prev, ""]);

  const handleLogoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => setCompanyLogo(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!companyName.trim()) nextErrors.companyName = "Company name is required.";
    if (!companyLogo) nextErrors.companyLogo = "Company logo is required.";
    if (!taskDescription.trim())
      nextErrors.taskDescription = "Task description is required.";
    if (assessors.some((a) => !a.trim()))
      nextErrors.assessors = "Please complete all assessor names.";
    if (!assessmentDate) nextErrors.assessmentDate = "Assessment date is required.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onSubmit({
      taskDescription,
      assessors,
      assessmentDate,
      companyName,
      companyLogo,
    });
  };

  return (
    <PageLayout
      title="Risk Assessment Details"
      description="Provide company details, task information, assessors, and date."
    >
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-6 space-y-6 text-gray-900">

        {/* Company Name */}
        <div>
          <label className="block font-semibold mb-2">Company Name *</label>
          <input
            className={`w-full border rounded p-2 ${
              errors.companyName ? "border-red-500" : ""
            }`}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Enter company name"
          />
          {errors.companyName && (
            <p className="text-red-600 text-sm mt-1">{errors.companyName}</p>
          )}
        </div>

        {/* Company Logo */}
        <div>
          <label className="block font-semibold mb-2">Company Logo *</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && handleLogoUpload(e.target.files[0])}
          />
          {companyLogo && (
            <img
              src={companyLogo}
              alt="Company Logo Preview"
              className="mt-3 h-20 object-contain border rounded"
            />
          )}
          {errors.companyLogo && (
            <p className="text-red-600 text-sm mt-1">{errors.companyLogo}</p>
          )}
        </div>

        {/* Task Description */}
        <div>
          <label className="block font-semibold mb-2">Task / Activity Description *</label>
          <textarea
            className={`w-full border rounded p-2 ${
              errors.taskDescription ? "border-red-500" : ""
            }`}
            rows={3}
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
          />
          {errors.taskDescription && (
            <p className="text-red-600 text-sm mt-1">{errors.taskDescription}</p>
          )}
        </div>

        {/* Assessors */}
        <div>
          <label className="block font-semibold mb-2">
            Persons Conducting Risk Assessment *
          </label>
          {assessors.map((name, i) => (
            <input
              key={i}
              className={`w-full border rounded p-2 mb-2 ${
                errors.assessors ? "border-red-500" : ""
              }`}
              placeholder={`Assessor ${i + 1}`}
              value={name}
              onChange={(e) => updateAssessor(i, e.target.value)}
            />
          ))}
          <button onClick={addAssessor} className="text-sm text-blue-600">
            + Add another person
          </button>
          {errors.assessors && (
            <p className="text-red-600 text-sm mt-1">{errors.assessors}</p>
          )}
        </div>

        {/* Assessment Date */}
        <div>
          <label className="block font-semibold mb-2">Assessment Date *</label>
          <input
            type="date"
            className={`w-full border rounded p-2 ${
              errors.assessmentDate ? "border-red-500" : ""
            }`}
            value={assessmentDate}
            onChange={(e) => setAssessmentDate(e.target.value)}
          />
          {errors.assessmentDate && (
            <p className="text-red-600 text-sm mt-1">{errors.assessmentDate}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4">
          <button onClick={onBack} className="px-4 py-2 bg-gray-500 text-white rounded">
            Back
          </button>
          <button onClick={handleSubmit} className="px-6 py-2 bg-green-600 text-white rounded">
            Generate Risk Assessment
          </button>
        </div>
      </div>
    </PageLayout>
  );
}