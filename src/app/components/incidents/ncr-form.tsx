import { useState } from "react";

export function NCRForm({ onSubmit }: any) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="mb-6">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Non-Conformance Type"
        className="input mb-2"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Corrective Action"
        className="input mb-2"
      />
      <button
        onClick={() => onSubmit({ title, description })}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Save
      </button>
    </div>
  );
}