export function NCRForm() {
  return (
    <div>
      <h2 className="font-semibold mb-2">NCR Details</h2>
      <input placeholder="Non-Conformance Type" className="input" />
      <textarea placeholder="Corrective Action" className="input mt-2" />
    </div>
  );
}