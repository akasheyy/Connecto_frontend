import React, { useEffect, useState } from "react";

export default function Settings() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/api/user/me`, {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      setUser(data);
    }

    loadUser();
  }, [API_BASE_URL]);

  if (!user) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>Loading settings…</div>
      </div>
    );
  }

  const joined = new Date(user.createdAt).toLocaleDateString();

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Settings</h2>

          <div style={styles.section}>
            <p style={styles.label}>EMAIL</p>
            <p style={styles.value}>{user.email}</p>
          </div>

          <div style={styles.section}>
            <p style={styles.label}>JOINED ON</p>
            <p style={styles.value}>{joined}</p>
          </div>

          <button
            style={styles.logout}
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  page: {
    minHeight: "100dvh",
    background:
      "linear-gradient(135deg,#667eea 0%,#764ba2 50%,#f093fb 100%)",
    paddingTop: "clamp(80px, 12vh, 110px)",
    paddingBottom: "clamp(80px, 12vh, 120px)",
    paddingInline: "clamp(12px, 4vw, 20px)",
    display: "flex",
    justifyContent: "center",
  },

  container: {
    width: "100%",
    maxWidth: "40rem",
  },

  card: {
    background: "#fff",
    borderRadius: "clamp(18px, 4vw, 26px)",
    padding: "clamp(18px, 4vw, 26px)",
  },

  title: {
    fontSize: "clamp(18px, 4vw, 22px)",
    fontWeight: 800,
    marginBottom: "clamp(16px, 4vh, 24px)",
  },

  section: {
    background: "#f9fafb",
    borderRadius: "clamp(12px, 3vw, 16px)",
    padding: "clamp(12px, 3vw, 16px)",
    marginBottom: "clamp(12px, 3vh, 16px)",
  },

  label: {
    fontSize: "clamp(10px, 2.5vw, 11px)",
    color: "#9ca3af",
    marginBottom: 4,
  },

  value: {
    fontSize: "clamp(14px, 3vw, 16px)",
    fontWeight: 600,
    wordBreak: "break-word",
  },

  logout: {
    width: "100%",
    marginTop: "clamp(16px, 4vh, 24px)",
    padding: "clamp(12px, 3vw, 14px)",
    borderRadius: "clamp(12px, 3vw, 16px)",
    border: "none",
    background: "#ef4444",
    color: "#fff",
    fontWeight: 700,
    fontSize: "clamp(14px, 3vw, 16px)",
    cursor: "pointer",
  },
};
