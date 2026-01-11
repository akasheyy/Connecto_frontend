import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FiImage, FiX, FiRefreshCcw, FiSave } from "react-icons/fi"; // Install react-icons

export default function EditPost() {
  const { id } = useParams();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const [post, setPost] = useState({ title: "", description: "", content: "", image: null });
  const [preview, setPreview] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function loadPost() {
      try {
        const token = localStorage.getItem("token");
        if (!token || !API_BASE_URL) return;
        const res = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
          headers: { Authorization: "Bearer " + token }
        });
        const data = await res.json();
        setPost({
          title: data.title || "",
          description: data.description || "",
          content: data.content || "",
          image: data.image || null
        });
        setPreview(data.image || null);
      } catch (err) {
        console.error("Load post error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [id, API_BASE_URL]);

  const handleChange = (e) => setPost({ ...post, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", post.title);
      formData.append("description", post.description);
      formData.append("content", post.content);
      if (newImage) formData.append("image", newImage);

      const res = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
        method: "PUT",
        headers: { Authorization: "Bearer " + token },
        body: formData
      });

      if (res.ok) {
        alert("Post updated successfully!");
        window.location.href = "/dashboard";
      }
    } catch (err) {
      alert("Failed to update post");
    } finally {
      setUpdating(false);
    }
  };

  const styles = {
    pageWrapper: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)",
      backgroundAttachment: "fixed",
      paddingTop: "90px", // Clearance for TopBar
      paddingBottom: "40px",
      display: "flex",
      justifyContent: "center",
      fontFamily: "'Inter', sans-serif"
    },
    card: {
      width: "90%",
      maxWidth: "550px",
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(12px)",
      padding: "30px",
      borderRadius: "28px",
      boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
      height: "fit-content"
    },
    imageContainer: {
      width: "100%",
      height: "220px",
      borderRadius: "20px",
      overflow: "hidden",
      position: "relative",
      backgroundColor: "#f1f5f9",
      marginBottom: "25px",
      border: "1px solid #e2e8f0"
    },
    imageOverlay: {
      position: "absolute",
      bottom: "10px",
      right: "10px",
      background: "rgba(255, 255, 255, 0.9)",
      padding: "8px 12px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "13px",
      fontWeight: "600",
      cursor: "pointer",
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
    },
    input: {
      width: "100%",
      padding: "14px 16px",
      borderRadius: "14px",
      border: "1px solid #e2e8f0",
      marginBottom: "18px",
      fontSize: "15px",
      outline: "none",
      boxSizing: "border-box",
      transition: "border-color 0.2s ease"
    },
    updateBtn: {
      width: "100%",
      padding: "16px",
      borderRadius: "16px",
      border: "none",
      background: "linear-gradient(90deg, #6366f1, #ec4899)",
      color: "white",
      fontWeight: "700",
      fontSize: "16px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      marginTop: "10px",
      opacity: updating ? 0.7 : 1,
      boxShadow: "0 10px 20px rgba(99, 102, 241, 0.3)"
    }
  };

  if (loading) return (
    <div style={styles.pageWrapper}>
      <div style={{ color: "#fff", display: 'flex', alignItems: 'center', gap: '10px' }}>
        <FiRefreshCcw className="spin" /> Loading Editor...
      </div>
    </div>
  );

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h2 style={{ margin: 0, fontSize: "26px", fontWeight: "800", color: "#1e293b", letterSpacing: "-0.5px" }}>Edit Post</h2>
          <FiX size={24} color="#94a3b8" style={{ cursor: "pointer" }} onClick={() => window.history.back()} />
        </div>

        <form onSubmit={handleSubmit}>
          {/* IMAGE SECTION */}
          <div style={styles.imageContainer}>
            {preview ? (
              <img src={preview} alt="Post cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                <FiImage size={40} />
                <p>No image uploaded</p>
              </div>
            )}
            
            <label style={styles.imageOverlay}>
              <FiImage size={16} />
              {preview ? "Change Photo" : "Add Photo"}
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
            </label>
          </div>

          <div style={{ marginBottom: "5px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#64748b", marginLeft: "4px" }}>Title</label>
            <input
              name="title"
              value={post.title}
              onChange={handleChange}
              placeholder="Post title"
              style={styles.input}
              required
            />
          </div>

          <div style={{ marginBottom: "5px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#64748b", marginLeft: "4px" }}>Description</label>
            <input
              name="description"
              value={post.description}
              onChange={handleChange}
              placeholder="Quick summary"
              style={styles.input}
              required
            />
          </div>

          <div style={{ marginBottom: "5px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#64748b", marginLeft: "4px" }}>Detailed Content</label>
            <textarea
              name="content"
              value={post.content}
              onChange={handleChange}
              placeholder="What's on your mind?"
              style={{ ...styles.input, height: "160px", resize: "none" }}
              required
            />
          </div>

          <button type="submit" disabled={updating} style={styles.updateBtn}>
            {updating ? "Saving Changes..." : <><FiSave /> Save Changes</>}
          </button>
        </form>
      </div>
      
      {/* CSS for Spin Animation */}
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}