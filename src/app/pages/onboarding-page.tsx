import { useState } from "react";
import { OnboardingForm } from "./onboarding-form";



export function OnboardingPage() {
  const [role, setRole] = useState<"inspector" | "first_aider">("inspector");

  return (
    <div className="p-6 space-y-6 text-gray-900">
      <div>
        <h1 className="text-2xl font-bold">Onboarding</h1>
        <p className="text-gray-500">
          Create accounts and assign them to sites.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setRole("inspector")}
          className={
            role === "inspector"
              ? "bg-blue-600 text-white px-4 py-2 rounded-lg"
              : "bg-gray-100 px-4 py-2 rounded-lg"
          }
        >
          Create Inspector Credentials
        </button>
        <button
          onClick={() => setRole("first_aider")}
          className={
            role === "first_aider"
              ? "bg-blue-600 text-white px-4 py-2 rounded-lg"
              : "bg-gray-100 px-4 py-2 rounded-lg"
          }
        >
          Create First Aider Credentials
        </button>
      </div>

      <OnboardingForm role={role} />
    </div>
  );
}
