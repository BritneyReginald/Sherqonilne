export function InjuryForm() {
  return (
    <div>
      <h2 className="font-semibold mb-2">Injury Details</h2>
      <input placeholder="Injured Person" className="input" />
      <textarea placeholder="Injury Description" className="input mt-2" />
    </div>
  );
}