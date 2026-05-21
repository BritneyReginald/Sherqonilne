import { useMockAuth } from "@/app/contexts/mock-auth-context";

export function UserSwitcher() {
  const { user, setUser, users } = useMockAuth();

  return (
    <div className="p-3 border rounded-lg bg-white flex gap-3 items-center">
      <span className="text-sm font-medium">Acting as:</span>

      <select
        value={user.id}
        onChange={(e) => {
          const selected = users.find(u => u.id === e.target.value);
          if (selected) setUser(selected);
        }}
        className="border px-2 py-1 rounded"
      >
        {users.map(u => (
          <option key={u.id} value={u.id}>
            {u.name} ({u.role})
          </option>
        ))}
      </select>

      <span className="text-xs text-gray-500">
        {user.role}
      </span>
    </div>
  );
}