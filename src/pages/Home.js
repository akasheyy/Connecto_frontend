import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { FaRegComment, FaShare, FaLink } from "react-icons/fa";
import { FiMoreHorizontal } from "react-icons/fi";

// --- NEW LOADING STYLES ---
const uiStyles = {
  loaderContainer: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: '100vh', 
    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)' 
  },
  dotWrapper: { display: 'flex', gap: '8px', marginBottom: '20px' },
  dot: { width: '14px', height: '14px', backgroundColor: '#ffffff', borderRadius: '50%' },
  loadingText: { fontSize: '18px', color: '#ffffff', fontWeight: '600', letterSpacing: '0.5px' },
};

export default function Home() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userId] = useState(localStorage.getItem("userId"));
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [activeMenu, setActiveMenu] = useState(null);
  const [loading, setLoading] = useState(true); // Added loading state
  const menuRef = useRef(null);

  const shuffleArray = (array) => {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setActiveMenu(null);
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousedown", handleClickOutside);
    loadData();
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function loadData() {
    const token = localStorage.getItem("token");
    if (!token || !API_BASE_URL) {
      setLoading(false);
      return;
    }
    try {
      const meRes = await fetch(`${API_BASE_URL}/api/user/me`, { 
        headers: { Authorization: "Bearer " + token } 
      });
      const meData = await meRes.json();
      setCurrentUser(meData);

      const res = await fetch(`${API_BASE_URL}/api/posts`, { 
        headers: { Authorization: "Bearer " + token } 
      });
      const data = await res.json();
      const rawPosts = Array.isArray(data) ? data : data.posts || [];
      setPosts(shuffleArray(rawPosts));
    } catch (err) { 
      console.error("Home load error:", err); 
    } finally {
      setLoading(false); // End loading regardless of success/fail
    }
  }

  // --- ACTIONS ---
  const handleShare = async (post) => {
    const shareData = {
      title: `Check out ${post.userId?.username}'s post`,
      text: post.description,
      url: `${window.location.origin}/post/${post._id}`,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { console.log("Share failed", err); }
    } else {
      navigator.clipboard.writeText(shareData.url);
      alert("Link copied to clipboard!");
    }
  };

  const handleLike = async (postId) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setPosts(prevPosts => prevPosts.map(p => {
      if (p._id === postId) {
        const hasLiked = p.likes?.includes(currentUser?._id);
        return {
          ...p,
          likes: hasLiked ? p.likes.filter(id => id !== currentUser?._id) : [...(p.likes || []), currentUser?._id]
        };
      }
      return p;
    }));
    try {
      await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, {
        method: "PUT", headers: { Authorization: "Bearer " + token }
      });
    } catch (err) { console.error("Like sync error:", err); }
  };

  const toggleFollow = async (targetUserId, isCurrentlyFollowing) => {
    const token = localStorage.getItem("token");
    setCurrentUser(prev => ({
      ...prev,
      following: isCurrentlyFollowing 
        ? prev.following.filter(id => (typeof id === 'string' ? id : id._id) !== targetUserId)
        : [...prev.following, targetUserId]
    }));
    try {
      await fetch(`${API_BASE_URL}/api/user/${targetUserId}/${isCurrentlyFollowing ? 'unfollow' : 'follow'}`, {
        method: "PUT", headers: { Authorization: "Bearer " + token }
      });
    } catch (err) { console.error(err); }
  };

  const styles = {
    pageWrapper: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)",
      backgroundAttachment: "fixed",
    },
    feedContainer: {
      width: "100%", maxWidth: "500px", margin: "0 auto", backgroundColor: "#ffffff",
      minHeight: "100vh", boxShadow: isMobile ? "none" : "0 0 40px rgba(0,0,0,0.3)",
    },
    imageContainer: {
      width: "100%", backgroundColor: "#000", display: "flex", justifyContent: "center",
      alignItems: "center", maxHeight: isMobile ? "70vh" : "600px", overflow: "hidden",
      cursor: "pointer"
    },
    postImage: { width: "100%", maxHeight: isMobile ? "70vh" : "600px", objectFit: "contain", display: "block" },
    dropdown: {
      position: "absolute", top: "35px", right: "0px", backgroundColor: "#fff",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)", borderRadius: "8px", zIndex: 100,
      width: "160px", border: "1px solid #efefef", overflow: "hidden"
    },
    dropdownItem: { padding: "12px 15px", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", color: "#262626" }
  };

  // --- LOADING RENDER ---
  if (loading) return (
    <div style={uiStyles.loaderContainer}>
      <style>{`
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0); opacity: 0.3; } 40% { transform: scale(1); opacity: 1; } }
        @keyframes pulseText { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
      `}</style>
      <div style={uiStyles.dotWrapper}>
        <div style={{...uiStyles.dot, animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '-0.32s'}}></div>
        <div style={{...uiStyles.dot, animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '-0.16s'}}></div>
        <div style={{...uiStyles.dot, animation: 'bounce 1.4s infinite ease-in-out both'}}></div>
      </div>
      <h2 style={{...uiStyles.loadingText, animation: 'pulseText 2s infinite'}}>Loading...</h2>
    </div>
  );

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.feedContainer}>
        <div style={{ height: "50px", display: "flex", alignItems: "center", padding: "0 16px", borderBottom: "1px solid #efefef", position: "sticky", top: 0, zIndex: 10, background: "#fff" }}>
          <span style={{ fontWeight: "900", fontSize: "20px", letterSpacing: "-1px" }}>SocialApp</span>
        </div>

        {posts.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
            <h3>No posts yet.</h3>
            <p>Follow some users to see their content here!</p>
          </div>
        ) : (
          posts.map((p) => {
            const followingIds = currentUser?.following?.map(f => typeof f === "string" ? f : f._id) || [];
            const isFollowing = followingIds.includes(p.userId?._id);
            const isMe = p.userId?._id === userId;
            const isLiked = p.likes?.includes(currentUser?._id);

            return (
              <article key={p._id} style={{ background: "#fff", borderBottom: "1px solid #efefef" }}>
                {/* HEADER */}
                <div style={{ display: "flex", alignItems: "center", padding: "10px 14px", justifyContent: "space-between" }}>
                  <Link to={`/user/${p.userId?._id}`} style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "#000" }}>
                    <img src={p.userId?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${p.userId?.username}`} style={{ width: "34px", height: "34px", borderRadius: "50%", objectFit: "cover" }} alt="" />
                    <span style={{ fontWeight: "700", fontSize: "14px" }}>{p.userId?.username}</span>
                  </Link>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px", position: "relative" }}>
                    {!isMe && (
                      <button onClick={() => toggleFollow(p.userId?._id, isFollowing)} style={{ background: isFollowing ? "#efefef" : "#0095f6", color: isFollowing ? "#000" : "#fff", border: "none", borderRadius: "8px", padding: "6px 12px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
                        {isFollowing ? "Following" : "Follow"}
                      </button>
                    )}
                    <div onClick={() => setActiveMenu(activeMenu === p._id ? null : p._id)} style={{ cursor: "pointer" }}>
                      <FiMoreHorizontal size={20} />
                    </div>
                    {activeMenu === p._id && (
                      <div ref={menuRef} style={styles.dropdown}>
                        <div style={styles.dropdownItem} onClick={() => { handleShare(p); setActiveMenu(null); }}>
                          <FaLink size={14} /> Share
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* POST CONTENT */}
                <div style={styles.imageContainer} onDoubleClick={() => handleLike(p._id)}>
                  <img src={p.image} style={styles.postImage} alt="post" />
                </div>

                {/* ACTION BAR */}
                <div style={{ display: "flex", gap: "18px", padding: "12px 14px 8px", alignItems: "center" }}>
                  <div onClick={() => handleLike(p._id)} style={{ cursor: "pointer", display: "flex" }}>
                    {isLiked ? <AiFillHeart size={28} color="#ff3040" /> : <AiOutlineHeart size={28} />}
                  </div>
                  <FaRegComment size={25} onClick={() => navigate(`/post/${p._id}`)} style={{ cursor: "pointer" }} />
                  <FaShare size={23} onClick={() => handleShare(p)} style={{ cursor: "pointer" }} />
                </div>

                {/* DETAILS */}
                <div style={{ padding: "0 14px 18px", fontSize: "14px" }}>
                  <div style={{ fontWeight: "700", marginBottom: "4px" }}>{p.likes?.length || 0} likes</div>
                  <div style={{ wordBreak: "break-word", lineHeight: "1.4" }}>
                    <span style={{ fontWeight: "700", marginRight: "6px" }}>{p.userId?.username}</span>
                    {p.description}
                  </div>
                  {p.comments?.length > 0 && (
                    <div style={{ color: "#8e8e8e", marginTop: "6px", cursor: "pointer" }} onClick={() => navigate(`/post/${p._id}`)}>
                      View all {p.comments.length} comments
                    </div>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}