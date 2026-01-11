import React, { useState } from "react";
import { FiImage, FiX, FiSend } from "react-icons/fi"; // Install react-icons

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function AddPost() {
  const [post, setPost] = useState({ title: "", description: "", content: "" });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setPost({ ...post, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("Please login first");

    const formData = new FormData();
    Object.keys(post).forEach(key => formData.append(key, post[key]));
    if (image) formData.append("image", image);

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (!response.ok) throw new Error("Post creation failed");
      window.location.href = "/dashboard";
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    pageWrapper: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)",
      paddingTop: "80px", // Clearance for TopBar
      display: "flex",
      justifyContent: "center",
      paddingBottom: "40px",
      fontFamily: "'Inter', sans-serif"
    },
    card: {
      width: "90%",
      maxWidth: "550px",
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(10px)",
      padding: "32px",
      borderRadius: "24px",
      boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
      height: "fit-content"
    },
    uploadZone: {
      width: "100%",
      height: "200px",
      border: "2px dashed #e2e8f0",
      borderRadius: "16px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      marginBottom: "20px",
      overflow: "hidden",
      position: "relative",
      backgroundColor: "#f8fafc",
      transition: "all 0.2s ease"
    },
    input: {
      width: "100%",
      padding: "14px 16px",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      marginBottom: "16px",
      fontSize: "15px",
      outline: "none",
      transition: "border-color 0.2s",
      boxSizing: "border-box"
    },
    submitBtn: {
      width: "100%",
      padding: "16px",
      borderRadius: "14px",
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
      boxShadow: "0 10px 20px rgba(99, 102, 241, 0.3)",
      transition: "transform 0.2s"
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: "#1e293b" }}>New Post</h2>
          <FiX size={24} style={{ cursor: 'pointer', color: '#94a3b8' }} onClick={() => window.history.back()} />
        </div>

        <form onSubmit={handleSubmit}>
          {/* CUSTOM IMAGE UPLOAD AREA */}
          <div 
            style={styles.uploadZone} 
            onClick={() => document.getElementById('fileInput').click()}
            onMouseOver={(e) => e.currentTarget.style.borderColor = "#6366f1"}
            onMouseOut={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
          >
            {image ? (
              <img 
                src={URL.createObjectURL(image)} 
                alt="Preview" 
                style={{ width: "100%", height: "100%", objectFit: "cover" }} 
              />
            ) : (
              <>
                <FiImage size={40} color="#94a3b8" />
                <p style={{ color: "#64748b", marginTop: "10px", fontSize: "14px" }}>Click to upload cover photo</p>
              </>
            )}
            <input 
              id="fileInput"
              type="file" 
              accept="image/*" 
              onChange={(e) => setImage(e.target.files[0])} 
              style={{ display: "none" }} 
            />
          </div>

          <input
            name="title"
            placeholder="Give your post a title..."
            style={styles.input}
            value={post.title}
            onChange={handleChange}
            required
            onFocus={(e) => e.target.style.borderColor = "#6366f1"}
            onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
          />

          <input
            name="description"
            placeholder="Short catchy summary"
            style={styles.input}
            value={post.description}
            onChange={handleChange}
            required
          />

          <textarea
            name="content"
            placeholder="Tell your story..."
            style={{ ...styles.input, height: "150px", resize: "none" }}
            value={post.content}
            onChange={handleChange}
            required
          />

          <button 
            type="submit" 
            disabled={loading} 
            style={styles.submitBtn}
            onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.98)"}
            onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            {loading ? "Publishing..." : <><FiSend /> Publish Post</>}
          </button>
        </form>
      </div>
    </div>
  );
}