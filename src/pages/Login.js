import React, { useState } from "react";

export default function Login({ deferredPrompt, handleInstall }) {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  
  // State for the custom popup
  const [modal, setModal] = useState({
    show: false,
    message: "",
    isSuccess: false
  });

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  const closeModal = () => {
    setModal({ ...modal, show: false });
    // If it was a success, redirect after closing the modal
    if (modal.isSuccess) {
      window.location.href = "/dashboard";
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        if (data.user?._id) {
          localStorage.setItem("userId", data.user._id);
        }
        // Show success popup
        setModal({ show: true, message: data.message || "Login Successful!", isSuccess: true });
      } else {
        // Show error popup
        setModal({ show: true, message: data.message || "Invalid credentials", isSuccess: false });
      }
    } catch (error) {
      setModal({ show: true, message: "Connection error. Please try again.", isSuccess: false });
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%", // Adjusted to 100% with box-sizing
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #dbdbdb",
    background: "#fafafa",
    color: "#262626",
    marginBottom: "18px",
    fontSize: "15px",
    transition: "all 0.2s ease",
    boxSizing: "border-box"
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        overflow: "hidden", 
        margin: 0,
        padding: 0,
        position: "relative"
      }}
    >
      <style>
        {`
          body, html { margin: 0; padding: 0; overflow: hidden; }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        `}
      </style>

      {/* --- Custom Popup Modal --- */}
      {modal.show && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center",
          alignItems: "center", zIndex: 1000, backdropFilter: "blur(4px)"
        }}>
          <div style={{
            background: "#fff", padding: "30px", borderRadius: "20px", width: "80%", maxWidth: "320px",
            textAlign: "center", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", animation: "fadeIn 0.3s ease-out"
          }}>
            <div style={{ fontSize: "50px", marginBottom: "15px" }}>
              {modal.isSuccess ? "✅" : "❌"}
            </div>
            <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>
              {modal.isSuccess ? "Success" : "Oops!"}
            </h3>
            <p style={{ color: "#666", marginBottom: "20px" }}>{modal.message}</p>
            <button 
              onClick={closeModal}
              style={{
                width: "100%", padding: "12px", border: "none", borderRadius: "10px",
                background: modal.isSuccess ? "#10b981" : "#ef4444", color: "#fff",
                fontWeight: "bold", cursor: "pointer"
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* --- Login Card --- */}
      <div
        style={{
          width: "90%",
          maxWidth: "250px",
          padding: "35px",
          borderRadius: "20px",
          background: "#ffffff",
          boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
          fontFamily: "-apple-system, sans-serif"
        }}
      >
        <h2 style={{ textAlign: "center", fontSize: "26px", marginBottom: "25px", fontWeight: "700", color: "#262626" }}>
          Login
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            style={inputStyle}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            style={inputStyle}
            required
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading
                ? "#9ca3af"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              borderRadius: "12px",
              color: "#fff",
              fontSize: "16px",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px"
            }}
          >
            {loading && (
              <span style={{ width: "18px", height: "18px", border: "3px solid #fff", borderTop: "3px solid transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            )}
            {loading ? "Verifying..." : "Login"}
          </button>
        </form>

        <p style={{ marginTop: "18px", textAlign: "center", fontSize: "14px", color: "#4b5563" }}>
          Don't have an account?{" "}
          <a href="/register" style={{ color: "#6d28d9", fontWeight: "600", textDecoration: "none" }}>
            Register
          </a>
        </p>

        {deferredPrompt && (
          <button
            onClick={handleInstall}
            style={{
              marginTop: "15px", width: "100%", padding: "12px", borderRadius: "10px",
              border: "none", background: "#000", color: "#fff", fontWeight: "600", cursor: "pointer"
            }}
          >
            Install App
          </button>
        )}
      </div>
    </div>
  );
}