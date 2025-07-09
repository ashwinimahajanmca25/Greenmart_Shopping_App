import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.role) { 
          console.log(`✅ Setting ${parsedUser.role} from localStorage:`, parsedUser);
          setUser(parsedUser);
        } else {
          console.warn("⚠️ Invalid user data found:", parsedUser);
          localStorage.removeItem("userData"); // ✅ Auto-remove incorrect user data
        }
      } catch (error) {
        console.error("❌ Error parsing userData:", error);
      }
    }
  }, []);

  const login = (userData) => {
    console.log(`🟢 Logging in as ${userData.role}:`, userData);
    setUser(userData);
    localStorage.setItem("userData", JSON.stringify(userData));
  };

  const logout = () => {
    console.log("🔴 Logging out user");
    setUser(null);
    localStorage.removeItem("userData");
    localStorage.removeItem("accessToken");
  };

  return (
    <UserContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
