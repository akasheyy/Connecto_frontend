import React, { useEffect, useState } from "react";

export default function Navbar() {
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    async function loadUser() {
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/api/user/me`, {
          headers: { Authorization: "Bearer " + token }
        });

        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.log("Navbar load error:", err);
      }
    }

    loadUser();
  }, [token, API_BASE_URL]);

  return (
    <div
      style={{
        padding: "12px 25px",
        background: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 100
      }}
    >
      {/* LEFT SIDE LOGO */}
      <h2 style={{ margin: 0, fontFamily: "sans-serif" }}>Connecto</h2>

      {/* RIGHT SIDE LINKS */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        {!token ? (
          <>
            <a href="/login" style={linkStyle}>Login</a>
            <a href="/register" style={linkStyle}>Register</a>
          </>
        ) : (
          <>
            <a href="/" style={linkStyle}>Home</a>
            <a href="/dashboard" style={linkStyle}>Dashboard</a>
            <a href="/profile" style={linkStyle}>Profile</a>

            {/* Avatar */}
            {user && (
              <img
                src={user.avatar || "https://via.placeholder.com/40"}
                alt="profile"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  objectFit: "cover",
                  cursor: "pointer"
                }}
              />
            )}

            <button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/login";
              }}
              style={{
                padding: "6px 12px",
                background: "#ff4d4d",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer"
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const linkStyle = {
  textDecoration: "none",
  color: "#333",
  fontSize: "16px",
  fontWeight: "500"
};
