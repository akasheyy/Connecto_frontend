import React, { useEffect, useState, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import io from "socket.io-client";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddPost from "./pages/AddPost";
import SinglePost from "./pages/SinglePost";
import EditPost from "./pages/EditPost";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import Explore from "./pages/Explore";
import FollowersList from "./pages/FollowersList";
import FollowingList from "./pages/FollowingList";
import Notifications from "./pages/Notifications";
import Settings from "./pages/settings";

import Chat from "./pages/chat/Chat";

import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/TopBar";
import BottomNav from "./components/BottomNav";

import AuthProvider from "./context/AuthContext";
import { OnlineProvider } from "./context/OnlineContext";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/* ===== TOAST FUNCTION ===== */
function showToast(message) {
  const toast = document.createElement("div");

  toast.innerText = message;

  Object.assign(toast.style, {
    position: "fixed",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#111",
    color: "#fff",
    padding: "12px 18px",
    borderRadius: "12px",
    zIndex: 9999,
    fontSize: "14px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    opacity: 0,
    transition: "0.3s ease",
  });

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = 1;
  });

  setTimeout(() => {
    toast.style.opacity = 0;
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

/* ===== LAYOUT ===== */
function Layout({ children }) {
  const location = useLocation();

  const hideBottomNav =
    location.pathname.startsWith("/chat") ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  const hideTopBar =
    location.pathname.startsWith("/chat") ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <>
      {!hideTopBar && <Navbar />}
      {children}
      {!hideBottomNav && <BottomNav />}
    </>
  );
}

/* ===== APP ===== */
function App() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // ✅ Stable socket reference
  const socketRef = useRef(null);

  /* ✅ PWA INSTALL LOGIC */
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setDeferredPrompt(null);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(() => {
      setDeferredPrompt(null);
    });
  };

  /* ✅ GLOBAL SOCKET LISTENER (SAFE VERSION) */
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || !API_BASE_URL) return;

    // ✅ Prevent duplicate connections
    if (socketRef.current) return;

    socketRef.current = io(API_BASE_URL, {
      auth: { token },
    });

    console.log("✅ Global socket connected");

    socketRef.current.on("new_message_notification", (data) => {
      console.log("🔥 Live message:", data);

      const isInChat = window.location.pathname.startsWith("/chat");

      if (!isInChat) {
        showToast(`${data.senderName}: ${data.text}`);
      }
    });

    return () => {
      console.log("❌ Global socket disconnected");

      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  return (
    <AuthProvider>
      <OnlineProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />

              <Route
                path="/login"
                element={
                  <Login
                    deferredPrompt={deferredPrompt}
                    handleInstall={handleInstall}
                  />
                }
              />

              <Route path="/register" element={<Register />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/add-post"
                element={
                  <ProtectedRoute>
                    <AddPost />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/post/:id"
                element={
                  <ProtectedRoute>
                    <SinglePost />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/edit/:id"
                element={
                  <ProtectedRoute>
                    <EditPost />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/user/:id"
                element={
                  <ProtectedRoute>
                    <PublicProfile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/explore"
                element={
                  <ProtectedRoute>
                    <Explore />
                  </ProtectedRoute>
                }
              />

              <Route path="/followers/:id" element={<FollowersList />} />
              <Route path="/following/:id" element={<FollowingList />} />

              <Route
                path="/chat/:id"
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Layout>
        </Router>
      </OnlineProvider>
    </AuthProvider>
  );
}

export default App;
