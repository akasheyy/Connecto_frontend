import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./Profile.css"; // Ensure this file contains the styles provided below

/* ================= SKELETON ================= */
function Skeleton({ className }) {
  return (
    <div className={`skeleton ${className}`}>
      <div className="skeleton-shimmer" />
    </div>
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
        if (!token) return;

        const [meRes, profRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/user/me`, {
            headers: { Authorization: "Bearer " + token },
          }),
          fetch(`${API_BASE_URL}/api/user/profile/${id}`, {
            headers: { Authorization: "Bearer " + token },
          })
        ]);

        const meData = await meRes.json();
        const profData = await profRes.json();

        setCurrentUser(meData);
        setUserData({
          user: profData.user || null,
          posts: Array.isArray(profData.posts) ? profData.posts : [],
        });
      } catch (err) {
        console.error("Public profile load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, API_BASE_URL]);

  if (loading) {
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
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="skeleton-post" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!userData || !userData.user) {
    return <div className="profile-page"><h2 className="error-msg">User not found</h2></div>;
  }

  const { user, posts } = userData;
  const followingIds = currentUser?.following?.map(f => (typeof f === "string" ? f : f._id)) || [];
  const isFollowing = followingIds.includes(user._id);

  /* ================= FOLLOW LOGIC ================= */
  async function toggleFollow() {
    const token = localStorage.getItem("token");
    const endpoint = isFollowing ? "unfollow" : "follow";
    
    // Optimistic UI Update
    setUserData(prev => ({
      ...prev,
      user: {
        ...prev.user,
        followers: isFollowing 
          ? prev.user.followers.filter(f => (f._id || f) !== currentUser._id)
          : [...prev.user.followers, currentUser._id]
      }
    }));

    setCurrentUser(prev => ({
      ...prev,
      following: isFollowing
        ? prev.following.filter(f => (f._id || f) !== user._id)
        : [...prev.following, user._id]
    }));

    await fetch(`${API_BASE_URL}/api/user/${user._id}/${endpoint}`, {
      method: "PUT",
      headers: { Authorization: "Bearer " + token },
    });
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        
        <header className="profile-header">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar-border">
              <img
                src={user.avatar || "https://via.placeholder.com/150"}
                alt="profile"
                className="profile-avatar"
              />
            </div>
          </div>

          <section className="profile-info">
            <div className="profile-top-row">
              <h2 className="profile-username">{user.username}</h2>
              {currentUser?._id !== user._id && (
                <div className="profile-actions">
                  <button 
                    className={`action-btn ${isFollowing ? "unfollow-btn" : "follow-btn"}`}
                    onClick={toggleFollow}
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </button>
                  <Link to={`/chat/${user._id}`} className="action-btn message-btn">
                    Message
                  </Link>
                </div>
              )}
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
              <p className="bio-joined">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </section>
        </header>

        <div className="profile-tabs">
          <div className="profile-tab">POSTS</div>
        </div>

        <div className="profile-grid">
          {posts.map((post) => (
            <div key={post._id} className="profile-post">
              <Link to={`/post/${post._id}`}>
                <img src={post.image} alt="post" />
                <div className="profile-post-overlay">
                  <span>❤️</span>
                </div>
              </Link>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}