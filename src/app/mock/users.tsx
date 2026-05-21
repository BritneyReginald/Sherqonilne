export type Role = "employee" | "first_aider" | "safety_officer";

export type User = {
  id: string;
  name: string;
  role: Role;
};

export const mockUsers: User[] = [
  { id: "EMP001", name: "John Doe", role: "employee" },
  { id: "EMP002", name: "Jane Smith", role: "employee" },

  { id: "FA001", name: "Mike Ross", role: "first_aider" },
  { id: "FA002", name: "Rachel Zane", role: "first_aider" },

  { id: "SO001", name: "Safety Officer", role: "safety_officer" },
];