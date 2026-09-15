import { useState } from "react";

interface NCRFormProps {
  onSubmit: (data: any) => void;
  ncrNumber: string;
}

export function NCRForm({ onSubmit, ncrNumber }: NCRFormProps) {
  const [formData, setFormData] = useState({
    dateIdentified: "",
    identifiedBy: "",
    department: "",
    type: "",
    description: "",
    category: "",
    customCategory: "",
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit({
      ...formData,
      ncrNo: ncrNumber,
      category:
        formData.category === "Other" ? formData.customCategory : formData.category,
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">
        NON CONFORMANCE REPORT
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-600">Date identified: </label>
          <input
            type="date"
            name="dateIdentified"
            value={formData.dateIdentified}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">NCR No.: </label>
          <input
            type="text"
            value={ncrNumber}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-200 text-gray-700"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Identified By: </label>
          <input
            type="text"
            name="identifiedBy"
            value={formData.identifiedBy}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Department: </label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">
            Non-Conformance Type:{" "}
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
          >
            <option value="">Select Type</option>
            <option value="Internal">Internal</option>
            <option value="External">External</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-600">
            Non-Conformance Category:{" "}
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
          >
            <option value="">Select Category</option>
            <option value="Product">Product</option>
            <option value="Service">Service</option>
            <option value="System">System</option>
            <option value="Other">Other</option>
          </select>
          {formData.category === "Other" && (
            <div className="mt-2">
              <input
                type="text"
                name="customCategory"
                value={formData.customCategory}
                onChange={handleChange}
                placeholder="Specify category"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
              />
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <label className="text-sm text-gray-600">
          Description Of Non-Conformance:{" "}
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Detailed Description"
          className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
        />
      </div>

      <button
        onClick={handleSubmit}
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition"
      >
        Save NCR
      </button>
    </div>
  );
}