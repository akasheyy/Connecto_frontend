import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Profile.css";

/* ================= SKELETON ================= */
function Skeleton({ className }) {
  return (
    <div className={`skeleton ${className}`}>
      <div className="skeleton-shimmer" />
    </div>
  );
}

/* ================= PROFILE ================= */
export default function Profile() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const [u, p] = await Promise.all([
          fetch(`${API_BASE_URL}/api/user/me`, {
            headers: { Authorization: "Bearer " + token },
          }).then((r) => r.json()),
          fetch(`${API_BASE_URL}/api/posts/myposts`, {
            headers: { Authorization: "Bearer " + token },
          }).then((r) => r.json()),
        ]);

        setUser(u);
        setPosts(Array.isArray(p) ? p : []);
      } catch (err) {
        console.error(err);
      }
    }

    loadProfile();
  }, [API_BASE_URL]);

  /* ================= LOADING ================= */
  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-header">
            <Skeleton className="skeleton-avatar" />
            <div className="skeleton-info">
              <Skeleton className="skeleton-line" />
              <Skeleton className="skeleton-line small" />
            </div>
          </div>

          <div className="profile-grid">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="skeleton-post" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ================= ACTIONS ================= */
  const deletePost = async (id) => {
    try {
      setDeletingId(id);
      const token = localStorage.getItem("token");

      await fetch(`${API_BASE_URL}/api/posts/${id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });

      setPosts((p) => p.filter((x) => x._id !== id));
      setOpenMenu(null);
    } finally {
      setDeletingId(null);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem("token");
    const fd = new FormData();
    fd.append("avatar", file);

    await fetch(`${API_BASE_URL}/api/user/avatar`, {
      method: "PUT",
      headers: { Authorization: "Bearer " + token },
      body: fd,
    });

    window.location.reload();
  };

  /* ================= UI ================= */
  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* ===== HEADER ===== */}
        <header className="profile-header">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar-border">
              <img
                src={user.avatar || "https://via.placeholder.com/150"}
                alt="profile"
                className="profile-avatar"
              />
            </div>

            <label className="profile-avatar-change">
              Change
              <input type="file" hidden onChange={handleAvatarChange} />
            </label>
          </div>

          <section className="profile-info">
            <div className="profile-top-row">
              <h2 className="profile-username">{user.username}</h2>
              <Link to="/settings" className="profile-settings">⚙️</Link>
            </div>

            <div className="profile-stats">
              <div><b>{posts.length}</b> posts</div>
              <Link to={`/followers/${user._id}`}>
                <b>{user.followers?.length || 0}</b> followers
              </Link>
              <Link to={`/following/${user._id}`}>
                <b>{user.following?.length || 0}</b> following
              </Link>
            </div>

            <div className="profile-bio">
              <span>{user.username}</span>
              <p>Digital Creator</p>
            </div>
          </section>
        </header>

        {/* ===== TABS ===== */}
        <div className="profile-tabs">
          <div className="profile-tab">POSTS</div>
        </div>

        {/* ===== POSTS ===== */}
        <div className="profile-grid">
          {posts.map((post) => (
            <div key={post._id} className="profile-post">
              {deletingId === post._id && (
                <div className="profile-post-overlay">Deleting…</div>
              )}

              <Link to={`/post/${post._id}`}>
                <img src={post.image} alt="" />
              </Link>

              <div
                className="profile-post-overlay"
                onClick={() => setOpenMenu(post._id)}
              >
                <span>⋮</span>
              </div>

              {openMenu === post._id && (
                <div
                  className="profile-modal-backdrop"
                  onClick={() => setOpenMenu(null)}
                >
                  <div
                    className="profile-modal"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link to={`/edit/${post._id}`}>Edit</Link>
                    <button
                      className="danger"
                      onClick={() => deletePost(post._id)}
                    >
                      Delete
                    </button>
                    <button onClick={() => setOpenMenu(null)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
