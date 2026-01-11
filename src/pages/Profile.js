import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/* ---------------- SKELETON COMPONENT ---------------- */
function Skeleton({ width, height, radius = 8 }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background:
          "linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 37%,#e5e7eb 63%)",
        backgroundSize: "400% 100%",
        animation: "shimmer 1.4s ease infinite",
      }}
    />
  );
}

export default function Profile() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const token = localStorage.getItem("token");
        if (!token || !API_BASE_URL) return;

        const res1 = await fetch(`${API_BASE_URL}/api/user/me`, {
          headers: { Authorization: "Bearer " + token },
        });
        const userInfo = await res1.json();
        setUser(userInfo);

        const res2 = await fetch(`${API_BASE_URL}/api/posts/myposts`, {
          headers: { Authorization: "Bearer " + token },
        });
        const postsData = await res2.json();
        setPosts(Array.isArray(postsData) ? postsData : []);
      } catch (err) {
        console.error("Profile load error:", err);
        setPosts([]);
      }
    }
    loadUser();
  }, [API_BASE_URL]);

  /* ---------------- SKELETON LOADING UI ---------------- */
  if (!user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          padding: "20px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "100%", maxWidth: "900px", marginTop: "50px" }}>
          <div
            style={{
              background: "#fff",
              padding: "30px",
              borderRadius: "20px",
              marginBottom: "30px",
            }}
          >
            <div style={{ display: "flex", gap: "40px" }}>
              <Skeleton width={110} height={110} radius={999} />
              <div style={{ flex: 1 }}>
                <Skeleton width={220} height={28} />
                <div
                  style={{
                    display: "flex",
                    gap: "20px",
                    marginTop: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  <Skeleton width={70} height={40} />
                  <Skeleton width={90} height={40} />
                  <Skeleton width={90} height={40} />
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: "10px",
            }}
          >
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} width="100%" height={180} radius={14} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const joinedDate = new Date(user.createdAt);
  const followersCount = Array.isArray(user.followers) ? user.followers.length : 0;
  const followingCount = Array.isArray(user.following) ? user.following.length : 0;

  const deletePost = async (id) => {
    // 1. Auto-close menu immediately on click
    const menu = document.getElementById("menu-" + id);
    if (menu) menu.style.display = "none";

    try {
      setDeletingId(id);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      await res.json();
      setPosts((prev) => prev.filter((p) => p._id !== id));
      setDeletingId(null);
    } catch (err) {
      console.error("Delete post error:", err);
      setDeletingId(null);
    }
  };

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("avatar", file);

    fetch(`${API_BASE_URL}/api/user/avatar`, {
      method: "PUT",
      headers: { Authorization: "Bearer " + token },
      body: formData,
    })
      .then((res) => res.json())
      .then(() => {
        alert("Profile picture updated!");
        window.location.reload();
      })
      .catch((err) => console.error("Avatar update error:", err));
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "20px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: "900px", marginTop: "50px" }}>
        {/* ---------------- PROFILE HEADER ---------------- */}
        <div
          style={{
            background: "#fff",
            padding: "30px",
            borderRadius: "20px",
            boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
            marginBottom: "30px",
          }}
        >
          <div style={{ display: "flex", gap: "40px", alignItems: "flex-start" }}>
            {/* LEFT COLUMN */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "140px" }}>
              <div style={{ position: "relative", marginBottom: "15px" }}>
                <img
                  src={user.avatar || "https://via.placeholder.com/150"}
                  alt="avatar"
                  style={{
                    width: "110px",
                    height: "110px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "4px solid #764ba2",
                  }}
                />
                <label
                  style={{
                    position: "absolute",
                    bottom: 5,
                    right: 5,
                    background: "#6d28d9",
                    color: "#fff",
                    padding: "5px 10px",
                    borderRadius: "8px",
                    fontSize: "11px",
                    cursor: "pointer",
                  }}
                >
                  Edit
                  <input type="file" onChange={handleAvatarChange} style={{ display: "none" }} />
                </label>
              </div>
              <p style={{ color: "#333", fontWeight: "600", marginBottom: "4px", fontSize: "14px" }}>{user.email}</p>
              <p style={{ color: "#777", fontSize: "12px" }}>
                Joined {joinedDate.getDate().toString().padStart(2, "0")}/
                {(joinedDate.getMonth() + 1).toString().padStart(2, "0")}/
                {joinedDate.getFullYear()}
              </p>
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: "32px", fontWeight: "800", marginBottom: "20px", color: "#111" }}>
                {user.username}
              </h2>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", maxWidth: "360px" }}>
                <div style={{ textAlign: "center" }}>
                  <h3 style={{ fontSize: "20px", margin: 0 }}>{posts.length}</h3>
                  <p style={{ color: "#777", fontSize: "13px", margin: 0 }}>Posts</p>
                </div>

                <Link to={`/followers/${user._id}`} style={{ textDecoration: "none", textAlign: "center", color: "inherit", minWidth: 80 }}>
                  <h3 style={{ fontSize: "20px", margin: 0 }}>{followersCount}</h3>
                  <p style={{ color: "#777", fontSize: "14px", margin: 0 }}>Followers</p>
                </Link>

                <Link to={`/following/${user._id}`} style={{ textDecoration: "none", textAlign: "center", color: "inherit", minWidth: 80 }}>
                  <h3 style={{ fontSize: "20px", margin: 0 }}>{followingCount}</h3>
                  <p style={{ color: "#777", fontSize: "14px", margin: 0 }}>Following</p>
                </Link>
              </div>

              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/login";
                }}
                style={{
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  padding: "8px 20px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* ---------------- POSTS GRID ---------------- */}
        <h3 style={{ color: "white", marginBottom: "15px", fontSize: "22px" }}>Your Posts</h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "10px" }}>
          {posts.map((post) => (
            <div
              key={post._id}
              style={{
                position: "relative",
                borderRadius: "14px",
                overflow: "hidden",
                background: "#fff",
                boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                height: "180px"
              }}
            >
              {/* DELETING OVERLAY */}
              {deletingId === post._id && (
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(255, 255, 255, 0.8)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 10,
                  color: "#ed4956",
                  fontWeight: "bold",
                  fontSize: "14px"
                }}>
                  Deleting...
                </div>
              )}

              <Link to={`/post/${post._id}`}>
                {post.image ? (
                  <img src={post.image} alt="" style={{ width: "100%", height: "180px", objectFit: "cover" }} />
                ) : (
                  <div style={{ height: "180px", background: "#f3f4f6", display: "flex", justifyContent: "center", alignItems: "center", color: "#555" }}>
                    No Image
                  </div>
                )}
              </Link>

              {/* POST MENU BUTTON */}
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: "rgba(0, 0, 0, 0.4)",
                  backdropFilter: "blur(4px)",
                  color: "white",
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  cursor: "pointer",
                  fontSize: "18px",
                  zIndex: 5
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  const menu = document.getElementById("menu-" + post._id);
                  document.querySelectorAll('[id^="menu-"]').forEach(m => {
                    if (m.id !== "menu-" + post._id) m.style.display = "none";
                  });
                  menu.style.display = menu.style.display === "block" ? "none" : "block";
                }}
              >
                ⋮
              </div>

              {/* POPUP BOX */}
              <div
                id={"menu-" + post._id}
                style={{
                  display: "none",
                  position: "absolute",
                  top: "45px",
                  right: "10px",
                  background: "#ffffff",
                  borderRadius: "12px",
                  width: "140px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                  zIndex: 100,
                  overflow: "hidden",
                  border: "1px solid rgba(0,0,0,0.05)",
                }}
              >
                <Link
                  to={`/edit/${post._id}`}
                  onClick={() => document.getElementById("menu-" + post._id).style.display = "none"}
                  style={{
                    display: "block",
                    padding: "12px",
                    textDecoration: "none",
                    color: "#262626",
                    fontWeight: "500",
                    fontSize: "14px",
                    borderBottom: "1px solid #f0f0f0",
                    textAlign: "center",
                  }}
                >
                  Edit Post
                </Link>

                <button
                  onClick={() => deletePost(post._id)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "none",
                    border: "none",
                    color: "#ed4956",
                    fontWeight: "700",
                    fontSize: "14px",
                    cursor: "pointer",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  Delete
                </button>

                <button
                  onClick={() => document.getElementById("menu-" + post._id).style.display = "none"}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "none",
                    border: "none",
                    color: "#8e8e8e",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}