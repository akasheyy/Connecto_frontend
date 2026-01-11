import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

export default function SinglePost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const [post, setPost] = useState(null);
  const [comment, setComment] = useState("");
  // Track window width for responsiveness
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadPost = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
        headers: { Authorization: "Bearer " + token }
      });
      const data = await res.json();
      setPost(data);
    } catch (err) {
      console.error("Load post error:", err);
    }
  }, [id, API_BASE_URL]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  async function addComment() {
    if (!comment.trim()) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE_URL}/api/posts/${id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ text: comment })
      });
      setComment("");
      loadPost();
    } catch (err) {
      console.error("Add comment error:", err);
    }
  }

  if (!post) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.pageWrapper}>
      <div style={{
        ...styles.container,
        maxWidth: isMobile ? "100%" : "740px",
        borderRadius: isMobile ? "0px" : "24px",
      }}>
        
        {/* HEADER */}
        <div style={{ ...styles.header, padding: isMobile ? "15px" : "20px 30px" }}>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>
            ✕
          </button>
          <div style={styles.authorInfo}>
            <div style={styles.avatarSmall}>
              {post.userId.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <Link to={`/user/${post.userId._id}`} style={styles.authorName}>
                {post.userId.username}
              </Link>
              <p style={styles.postDate}>Published in Gallery</p>
            </div>
          </div>
        </div>

        {/* IMAGE */}
        {post.image && (
          <div style={styles.imageWrapper}>
            <img src={post.image} alt={post.title} style={styles.mainImage} />
          </div>
        )}

        {/* POST CONTENT */}
        <div style={{ ...styles.contentSection, padding: isMobile ? "20px" : "40px" }}>
          <h1 style={{ ...styles.title, fontSize: isMobile ? "26px" : "36px" }}>
            {post.title}
          </h1>
          <p style={{ ...styles.bodyText, fontSize: isMobile ? "17px" : "19px" }}>
            {post.content}
          </p>
        </div>

        <div style={styles.divider} />

        {/* COMMENTS SECTION */}
        <div style={{ ...styles.commentSection, padding: isMobile ? "20px" : "30px 40px" }}>
          <h3 style={styles.sectionTitle}>
            Responses <span style={styles.commentCount}>{post.comments.length}</span>
          </h3>

          {/* ADD COMMENT INPUT */}
          <div style={styles.inputWrapper}>
            <textarea
              placeholder="What are your thoughts?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={styles.textarea}
            />
            <div style={styles.buttonRow}>
              <button 
                onClick={addComment} 
                style={{
                  ...styles.submitBtn, 
                  background: comment.length > 0 ? "#059669" : "#d1d5db",
                  cursor: comment.length > 0 ? "pointer" : "not-allowed"
                }}
                disabled={!comment.trim()}
              >
                Respond
              </button>
            </div>
          </div>

          {/* LIST OF COMMENTS */}
          <div style={styles.commentList}>
            {post.comments.map((c) => (
              <div key={c._id} style={styles.commentCard}>
                <div style={styles.commentHeader}>
                  <span style={styles.commentUser}>{c.username}</span>
                </div>
                <p style={styles.commentText}>{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
    display: "flex",
    justifyContent: "center",
    // Remove vertical padding on mobile so it looks like a native app
    padding: "0 0 40px 0", 
  },
  container: {
    width: "100%",
    background: "#ffffff",
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
    display: "flex",
    flexDirection: "column",
  },
  loading: {
    textAlign: "center",
    color: "white",
    paddingTop: "100px",
    fontSize: "18px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    borderBottom: "1px solid #f0f0f0",
    position: "sticky",
    top: 0,
    background: "white",
    zIndex: 10,
  },
  backBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    border: "none",
    background: "#f3f4f6",
    color: "#4b5563",
    fontSize: "16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  authorInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  avatarSmall: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "#6366f1",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "14px",
  },
  authorName: {
    fontWeight: "700",
    color: "#111827",
    textDecoration: "none",
    fontSize: "14px",
  },
  postDate: {
    fontSize: "11px",
    color: "#6b7280",
    margin: 0,
  },
  imageWrapper: {
    width: "100%",
    background: "#000",
  },
  mainImage: {
    width: "100%",
    display: "block",
    height: "auto",
    maxHeight: "70vh", // prevent image from taking too much screen space
    objectFit: "contain",
  },
  contentSection: {
    // padding is controlled by isMobile hook in JSX
  },
  title: {
    fontWeight: "800",
    color: "#111827",
    marginBottom: "15px",
    lineHeight: "1.3",
  },
  bodyText: {
    lineHeight: "1.7",
    color: "#374151",
    whiteSpace: "pre-line",
  },
  divider: {
    height: "1px",
    background: "#f0f0f0",
    margin: "0 20px",
  },
  commentSection: {
    // padding is controlled by isMobile hook in JSX
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "20px",
  },
  commentCount: {
    fontSize: "14px",
    color: "#6b7280",
    fontWeight: "400",
  },
  inputWrapper: {
    background: "#f9fafb",
    padding: "15px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    marginBottom: "20px",
  },
  textarea: {
    width: "100%",
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: "15px",
    minHeight: "60px",
    resize: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "5px",
  },
  submitBtn: {
    padding: "6px 16px",
    color: "white",
    border: "none",
    borderRadius: "18px",
    fontWeight: "600",
    fontSize: "13px",
  },
  commentList: {
    display: "flex",
    flexDirection: "column",
  },
  commentCard: {
    padding: "12px 0",
    borderBottom: "1px solid #f3f4f6",
  },
  commentUser: {
    fontWeight: "700",
    fontSize: "13px",
    color: "#111827",
  },
  commentText: {
    fontSize: "14px",
    color: "#4b5563",
    margin: "4px 0 0 0",
    lineHeight: "1.4",
  },
  // ... inside your styles object ...


  pageWrapper: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
    display: "flex",
    justifyContent: "center",
    /* Added Top Space here */
    paddingTop: "40px", 
    paddingBottom: "60px",
    paddingLeft: "10px",
    paddingRight: "10px",
  },
  container: {
    width: "100%",
    background: "#ffffff",
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
    display: "flex",
    flexDirection: "column",
    /* Ensures space inside the container start doesn't feel cramped */
    overflow: "hidden", 
  },
  // ... rest of your styles

};