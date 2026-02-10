import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";

const OnlineContext = createContext([]);

const API_BASE = process.env.REACT_APP_API_BASE_URL;

export function OnlineProvider({ children }) {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !API_BASE) return;

    const socket = io(API_BASE, {
      auth: { token }
    });

    socket.on("user_online", ({ userId }) => {
      setOnlineUsers((prev) =>
        prev.includes(userId) ? prev : [...prev, userId]
      );
    });

    socket.on("user_offline", ({ userId }) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });

    return () => socket.disconnect();
  }, []);

  return (
    <OnlineContext.Provider value={onlineUsers}>
      {children}
    </OnlineContext.Provider>
  );
}

// ✅ THIS IS THE HOOK NAME
export function useOnlineUsers() {
  return useContext(OnlineContext);
}
