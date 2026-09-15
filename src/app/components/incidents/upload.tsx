import { useState } from "react";
import { IncidentRecord } from "./types";
import { getEvidenceFileUrl } from "../../../api/incidents";

type Props = {
  record: IncidentRecord;
  onBack: () => void;
  onUpload: (files: File[]) => void | Promise<void>;
};

export const UploadPage = ({ record, onBack, onUpload }: Props) => {
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [viewingId, setViewingId] = useState<number | null>(null);

  const handleSelectFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setPendingFiles((prev) => [...prev, ...Array.from(fileList)]);
  };

  const removePending = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveUploads = async () => {
    if (pendingFiles.length === 0) return;

    setUploading(true);

    try {
      await onUpload(pendingFiles);
      setPendingFiles([]);
    } catch (err) {
      console.error("Failed to upload evidence", err);
      alert("Couldn't upload those files. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Saves any pending uploads, then returns to the Incident Registry.
  const handleSaveAndReturn = async () => {
    if (pendingFiles.length > 0) {
      setUploading(true);

      try {
        await onUpload(pendingFiles);
        setPendingFiles([]);
        onBack();
      } catch (err) {
        console.error("Failed to upload evidence", err);
        alert("Couldn't save the evidence. Please try again.");
      } finally {
        setUploading(false);
      }
    } else {
      // Nothing left to upload, so just return to the registry.
      onBack();
    }
  };

  // Fetches a fresh signed URL and opens the file for viewing.
  const handleView = async (fileId: number) => {
    setViewingId(fileId);

    try {
      const { url } = await getEvidenceFileUrl(record.id, fileId);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Failed to view file", err);
      alert("Couldn't open that file. Please try again.");
    } finally {
      setViewingId(null);
    }
  };

  return (
    <div className="p-6">
      <button onClick={onBack} className="mb-4 text-blue-600">
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-4">Upload Evidence</h1>

      <div className="bg-white p-6 rounded-xl shadow text-gray-900">
        <p className="mb-4">
          <strong>Case:</strong>{" "}
          {record.type === "incident" ? record.category : record.title}
        </p>

        {/* Choose files */}
        <label
          htmlFor="evidence-file-input"
          className={`inline-block cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition ${
            uploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Choose Files
        </label>

        <input
          id="evidence-file-input"
          type="file"
          multiple
          onChange={(e) => {
            handleSelectFiles(e.target.files);
            e.target.value = "";
          }}
          className="hidden"
          disabled={uploading}
        />

        {/* Pending files */}
        {pendingFiles.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">
              {pendingFiles.length} file
              {pendingFiles.length > 1 ? "s" : ""} ready to upload
            </p>

            <ul className="space-y-1 mb-4">
              {pendingFiles.map((file, i) => (
                <li
                  key={`${file.name}-${i}`}
                  className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded"
                >
                  <span className="text-sm">📎 {file.name}</span>

                  <button
                    onClick={() => removePending(i)}
                    disabled={uploading}
                    className="text-red-600 text-xs hover:underline disabled:text-gray-400"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>

            {/* Upload button */}
            <button
              onClick={handleSaveUploads}
              disabled={uploading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading…" : "Save Uploads"}
            </button>
          </div>
        )}
      </div>

      {/* Uploaded evidence */}
      <div className="bg-white p-6 rounded-xl shadow mt-6 text-gray-900">
        <h2 className="font-semibold mb-3">Uploaded Evidence</h2>

        {record.investigation?.evidence?.length ? (
          <ul className="space-y-2">
            {record.investigation.evidence.map((file) => (
              <li key={file.id} className="flex justify-between items-center">
                <span>📄 {file.name}</span>

                <button
                  onClick={() => handleView(file.id)}
                  disabled={viewingId === file.id}
                  className="text-blue-600 text-sm hover:underline disabled:text-gray-400"
                >
                  {viewingId === file.id ? "Opening…" : "View"}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No files uploaded</p>
        )}
      </div>

      {/* Save and return to registry */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleSaveAndReturn}
          disabled={uploading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
};
