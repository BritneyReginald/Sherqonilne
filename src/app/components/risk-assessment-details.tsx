import { useState } from "react";

interface Props {
  onBack: () => void;
  onSubmit: (data: {
    taskDescription: string;
    assessors: string[];
    assessmentDate: string;
  }) => void;
}

export function RiskAssessmentDetails({ onBack, onSubmit }: Props) {
  const [taskDescription, setTaskDescription] = useState("");
  const [assessors, setAssessors] = useState<string[]>([""]);
  const [assessmentDate, setAssessmentDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const updateAssessor = (index: number, value: string) => {
    const updated = [...assessors];
    updated[index] = value;
    setAssessors(updated);
  };

  const addAssessor = () => setAssessors((prev) => [...prev, ""]);

  const handleSubmit = () => {
    if (!taskDescription.trim()) return alert("Task description is required");
    if (assessors.some((a) => !a.trim()))
      return alert("Complete all assessor names");
    onSubmit({ taskDescription, assessors, assessmentDate });
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md space-y-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900">
        Risk Assessment Details
      </h2>

      {/* Task Description */}
      <div>
        <label className="block font-medium mb-1 text-gray-900">
          Task / Activity Description
        </label>
        <textarea
          className="w-full border p-2 rounded text-gray-900"
          rows={3}
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
        />
      </div>

      {/* Assessors */}
      <div>
        <label className="block font-medium mb-2 text-gray-900">
          Persons Conducting Risk Assessment
        </label>
        {assessors.map((name, i) => (
          <input
            key={i}
            className="w-full border p-2 rounded mb-2 text-gray-900"
            placeholder={`Assessor ${i + 1}`}
            value={name}
            onChange={(e) => updateAssessor(i, e.target.value)}
          />
        ))}
        <button
          onClick={addAssessor}
          className="text-sm text-blue-600 hover:underline"
        >
          + Add another person
        </button>
      </div>

      {/* Date */}
      <div>
        <label className="block font-medium mb-1 text-gray-900">
          Assessment Date
        </label>
        <input
          type="date"
          className="w-full border p-2 rounded text-gray-900"
          value={assessmentDate}
          onChange={(e) => setAssessmentDate(e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Generate Risk Assessment
        </button>
      </div>
    </div>
  );
}
