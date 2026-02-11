import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

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

// ✅ ONLINE CONTEXT
import { OnlineProvider } from "./context/OnlineContext";

/* ===== LAYOUT ===== */
function Layout({ children }) {
  const location = useLocation();

  const hideBottomNav =
    location.pathname.startsWith("/chat") ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  const hideTopBar = location.pathname.startsWith("/chat");

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

  // ✅ State added
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // ✅ Hook moved inside component
useEffect(() => {
  const handler = (e) => {
    e.preventDefault();
    setDeferredPrompt(e);
  };

  window.addEventListener("beforeinstallprompt", handler);

  // 👇 Detect installed mode
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

    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("App Installed ✅");
      }

      setDeferredPrompt(null);
    });
  };

  return (
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

            {/* ✅ CHAT */}
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
  );
}

export default App;
