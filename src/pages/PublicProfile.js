import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

/* ---------------- SKELETON ---------------- */
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

export default function PublicProfile() {
  const { id } = useParams();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const [userData, setUserData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token || !API_BASE_URL) return;

        const meRes = await fetch(`${API_BASE_URL}/api/user/me`, {
          headers: { Authorization: "Bearer " + token },
        });
        const meData = await meRes.json();
        setCurrentUser(meData);

        const res = await fetch(
          `${API_BASE_URL}/api/user/profile/${id}`,
          { headers: { Authorization: "Bearer " + token } }
        );
        const data = await res.json();

        setUserData({
          user: data.user || null,
          posts: Array.isArray(data.posts) ? data.posts : [],
        });

        setLoading(false);
      } catch (err) {
        console.error("Public profile load error:", err);
        setLoading(false);
      }
    }
    load();
  }, [id, API_BASE_URL]);

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          padding: "20px",
          background: "linear-gradient(135deg,#667eea,#764ba2)",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "100%", maxWidth: "900px", marginTop: "50px" }}>
          <div style={{ background: "#fff", padding: "30px", borderRadius: "20px" }}>
            <div style={{ display: "flex", gap: "40px" }}>
              <Skeleton width={110} height={110} radius={999} />
              <div style={{ flex: 1 }}>
                <Skeleton width={220} height={28} />
                <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
                  <Skeleton width={70} height={40} />
                  <Skeleton width={90} height={40} />
                  <Skeleton width={90} height={40} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData || !userData.user) {
    return <h2 style={{ textAlign: "center", color: "white" }}>User not found</h2>;
  }

  const { user, posts } = userData;
  const joinedDate = new Date(user.createdAt);

  const followerList = user.followers || [];
  const followingList = user.following || [];

  const followingIds =
    currentUser?.following?.map(f => (typeof f === "string" ? f : f._id)) || [];

  const isFollowing = followingIds.includes(user._id);

  /* ---------------- FOLLOW LOGIC (INSTANT UI) ---------------- */
  async function handleFollow() {
    const token = localStorage.getItem("token");

    setUserData(prev => ({
      ...prev,
      user: { ...prev.user, followers: [...prev.user.followers, currentUser._id] }
    }));

    setCurrentUser(prev => ({
      ...prev,
      following: [...prev.following, user._id]
    }));

    await fetch(`${API_BASE_URL}/api/user/${user._id}/follow`, {
      method: "PUT",
      headers: { Authorization: "Bearer " + token },
    });
  }

  async function handleUnfollow() {
    const token = localStorage.getItem("token");

    setUserData(prev => ({
      ...prev,
      user: {
        ...prev.user,
        followers: prev.user.followers.filter(
          f => (typeof f === "string" ? f : f._id) !== currentUser._id
        ),
      },
    }));

    setCurrentUser(prev => ({
      ...prev,
      following: prev.following.filter(
        f => (typeof f === "string" ? f : f._id) !== user._id
      ),
    }));

    await fetch(`${API_BASE_URL}/api/user/${user._id}/unfollow`, {
      method: "PUT",
      headers: { Authorization: "Bearer " + token },
    });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "20px",
        background: "linear-gradient(135deg,#667eea,#764ba2)",
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
            {/* LEFT COLUMN (Avatar + Email + Joined) */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: "140px",
              }}
            >
              <img
                src={user.avatar || "https://via.placeholder.com/150"}
                alt="avatar"
                style={{
                  width: "110px",
                  height: "110px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "4px solid #764ba2",
                  marginBottom: "12px",
                }}
              />

              <p style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>
                {user.email}
              </p>

              <p style={{ fontSize: "12px", color: "#777" }}>
                Joined{" "}
                {joinedDate.getDate().toString().padStart(2, "0")}/
                {(joinedDate.getMonth() + 1).toString().padStart(2, "0")}/
                {joinedDate.getFullYear()}
              </p>
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: "32px", fontWeight: "800", marginBottom: "20px" }}>
                {user.username}
              </h2>

              {/* STATS */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  maxWidth: "360px",
                  marginBottom: "25px",
                }}
              >
                <Stat label="Posts" value={posts.length} />
                <Link to={`/followers/${user._id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <Stat label="Followers" value={followerList.length} />
                </Link>
                <Link to={`/following/${user._id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <Stat label="Following" value={followingList.length} />
                </Link>
              </div>

              {/* FOLLOW BUTTON (LOGOUT POSITION) */}
              {currentUser?._id !== user._id && (
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={isFollowing ? handleUnfollow : handleFollow}
                    style={{
                      background: isFollowing ? "#ef4444" : "#2563eb",
                      color: "white",
                      border: "none",
                      padding: "8px 20px",
                      borderRadius: "8px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </button>

                  <Link
                    to={`/chat/${user._id}`}
                    style={{
                      background: "#16a34a",
                      color: "white",
                      padding: "8px 20px",
                      borderRadius: "8px",
                      fontWeight: "600",
                      textDecoration: "none",
                    }}
                  >
                    Message
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ---------------- POSTS GRID ---------------- */}
        <h3 style={{ color: "white", marginBottom: "15px", fontSize: "22px" }}>
          Posts
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "10px",
          }}
        >
          {posts.map((p) => (
            <Link
              key={p._id}
              to={`/post/${p._id}`}
              style={{
                display: "block",
                borderRadius: "14px",
                overflow: "hidden",
                background: "#fff",
                boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              }}
            >
              {p.image ? (
                <img
                  src={p.image}
                  alt=""
                  style={{ width: "100%", height: "160px", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    height: "160px",
                    background: "#f3f4f6",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#555",
                  }}
                >
                  No Image
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- STAT ---------------- */
function Stat({ label, value }) {
  return (
    <div style={{ textAlign: "center" }}>
      <h3 style={{ margin: 0 }}>{value}</h3>
      <p style={{ margin: 0, fontSize: "13px", color: "#777" }}>{label}</p>
    </div>
  );
}
