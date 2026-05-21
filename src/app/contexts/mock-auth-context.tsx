import { createContext, useContext, useState } from "react";
import { mockUsers, User } from "../mock/users";

type AuthContextType = {
  user: User;
  setUser: (user: User) => void;
  switchUser: (role: string) => void;
  users: User[];
};

const AuthContext = createContext<AuthContextType | null>(null);

export function MockAuthProvider({ children }: { children: any }) {
  const [user, setUser] = useState<User>(mockUsers[0]);

  const switchUser = (role: string) => {
    setUser((prev) => ({
      ...prev,
      role,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        switchUser, 
        users: mockUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useMockAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useMockAuth must be used inside provider");
  return ctx;
}