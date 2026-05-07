import { IncidentRecord } from "./types";

type Props = {
  record: IncidentRecord;
  onBack: () => void;
  onUpload: (files: { name: string; data: string }[]) => void;
};

export const UploadPage = ({ record, onBack, onUpload }: Props) => {
  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList) return;

    const filesArray = Array.from(fileList);

    const converted = await Promise.all(
      filesArray.map((file) => {
        return new Promise<{ name: string; data: string }>((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () =>
            resolve({ name: file.name, data: reader.result as string });
        });
      })
    );

    onUpload(converted);
  };

  return (
    <div className="p-6">
      <button onClick={onBack} className="mb-4 text-blue-600">
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-4">Upload Evidence</h1>

      <div className="bg-white p-6 rounded-xl shadow text-gray-900">
        <p className="mb-2">
          <strong>Case:</strong>{" "}
          {record.type === "incident" ? record.category : record.title}
        </p>

        <input
          type="file"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="mb-4"
        />
      </div>

      {/* Existing files */}
      <div className="bg-white p-6 rounded-xl shadow mt-6 text-gray-900">
        <h2 className="font-semibold mb-3">Uploaded Evidence</h2>

        {record.investigation?.evidence?.length ? (
          <ul className="space-y-2">
            {record.investigation.evidence.map((file, i) => (
              <li key={i} className="flex justify-between">
                <span>📄 {file.name}</span>
                <a
                  href={file.data}
                  download={file.name}
                  className="text-blue-600 text-sm"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No files uploaded</p>
        )}
      </div>
    </div>
  );
};