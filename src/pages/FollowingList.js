import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

export default function FollowingList() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const [user, setUser] = useState(null);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("token");
        if (!token || !API_BASE_URL) return;

        const res = await fetch(`${API_BASE_URL}/api/user/profile/${id}`, {
          headers: { Authorization: "Bearer " + token },
        });

        const data = await res.json();
        setUser(data.user || null);
        setFollowing(Array.isArray(data?.user?.following) ? data.user.following : []);
      } catch (err) {
        console.error("Following load error:", err);
        setFollowing([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, API_BASE_URL]);

  if (loading) {
    return (
      <div style={styles.pageWrapper}>
        <div style={styles.loader}></div>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      {/* INJECT HOVER ANIMATION */}
      <style>{`
        .user-item:hover {
          transform: translateY(-3px);
          background-color: #f8fafc !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>

      <div style={styles.container}>
        {/* HEADER SECTION */}
        <div style={styles.header}>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>
            ←
          </button>
          <div style={styles.headerText}>
            <h2 style={styles.title}>Following</h2>
            <p style={styles.subtitle}>People {user?.username} follows</p>
          </div>
        </div>

        {/* LIST SECTION */}
        <div style={styles.listArea}>
          {following.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: "40px", marginBottom: "10px" }}>✨</div>
              <p style={{ color: "#64748b" }}>Not following anyone yet.</p>
            </div>
          ) : (
            following.map((f) => {
              const userId = typeof f === "string" ? f : f?._id;
              return (
                <Link
                  key={userId}
                  to={`/user/${userId}`}
                  className="user-item"
                  style={styles.userCard}
                >
                  <img
                    src={f?.avatar || "https://via.placeholder.com/150"}
                    alt=""
                    style={styles.avatar}
                  />
                  <div style={styles.userInfo}>
                    <span style={styles.username}>{f?.username || "User"}</span>
                    <span style={styles.viewProfile}>View Profile</span>
                  </div>
                  <div style={styles.arrow}>›</div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    padding: "40px 20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  container: {
    width: "100%",
    maxWidth: "500px",
    background: "#ffffff",
    borderRadius: "24px",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)",
    overflow: "hidden",
  },
  header: {
    padding: "25px",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  backBtn: {
    background: "#f1f5f9",
    border: "none",
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    fontSize: "20px",
    cursor: "pointer",
    color: "#475569",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    transition: "background 0.2s",
  },
  headerText: { display: "flex", flexDirection: "column" },
  title: { margin: 0, fontSize: "20px", fontWeight: "800", color: "#1e293b" },
  subtitle: { margin: 0, fontSize: "13px", color: "#64748b" },
  listArea: { 
    padding: "15px", 
    maxHeight: "70vh", 
    overflowY: "auto",
    scrollbarWidth: "none" // Hides scrollbar on Firefox
  },
  userCard: {
    display: "flex",
    alignItems: "center",
    padding: "12px 16px",
    background: "#fff",
    marginBottom: "12px",
    borderRadius: "16px",
    textDecoration: "none",
    color: "#111",
    transition: "all 0.2s ease",
    border: "1px solid #f1f5f9",
  },
  avatar: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #e2e8f0",
  },
  userInfo: {
    flex: 1,
    marginLeft: "15px",
    display: "flex",
    flexDirection: "column",
  },
  username: { fontSize: "16px", fontWeight: "700", color: "#1e293b" },
  viewProfile: { fontSize: "12px", color: "#764ba2", fontWeight: "500" },
  arrow: { fontSize: "24px", color: "#cbd5e1", fontWeight: "300" },
  emptyState: { textAlign: "center", padding: "40px 20px" },
  loader: {
    width: "40px",
    height: "40px",
    border: "4px solid rgba(255,255,255,0.3)",
    borderTop: "4px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    alignSelf: "center",
    marginTop: "20%"
  },
};