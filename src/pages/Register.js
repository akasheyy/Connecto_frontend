import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  // Modal state for the custom popup (consistent with your Login page)
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
    if (modal.isSuccess) {
      // Redirect to Home/Dashboard after closing success modal
      window.location.href = "/"; 
    }
  };

  async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      }
    );

    const data = await response.json();

    if (response.ok) {

      // ✅ AUTO LOGIN (always works)
      const loginResponse = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        }
      );

      const loginData = await loginResponse.json();

      if (loginResponse.ok) {
        localStorage.setItem("token", loginData.token);

        if (loginData.user?._id) {
          localStorage.setItem("userId", loginData.user._id);
        }
      }

      setModal({
        show: true,
        message: "Account created successfully! Redirecting...",
        isSuccess: true
      });

    } else {
      setModal({
        show: true,
        message: data.message || "Registration failed",
        isSuccess: false
      });
    }

  } catch (error) {
    console.error("Register error:", error);

    setModal({
      show: true,
      message: "Something went wrong. Please try again.",
      isSuccess: false
    });

  } finally {
    setLoading(false);
  }
}


  const inputStyle = {
    width: "100%", // Using 100% with border-box for alignment
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #dbdbdb",
    background: "#fafafa",
    color: "#262626",
    marginBottom: "18px",
    fontSize: "15px",
    boxSizing: "border-box",
    transition: "all 0.2s ease"
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        overflow: "hidden",
        margin: 0,
        padding: 0
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
              {modal.isSuccess ? "🎉" : "❌"}
            </div>
            <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>
              {modal.isSuccess ? "Welcome!" : "Error"}
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
              OK
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          width: "90%",
          maxWidth: "380px",
          padding: "35px",
          borderRadius: "20px",
          background: "#ffffff",
          boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
          fontFamily: "-apple-system, sans-serif"
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "25px", fontSize: "26px", fontWeight: "700", color: "#262626" }}>
          Create Account
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Enter username"
            value={formData.username}
            onChange={handleChange}
            style={inputStyle}
            required
          />

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
              background: loading ? "#9ca3af" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              borderRadius: "12px",
              color: "#fff",
              fontSize: "16px",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              transition: "all 0.3s ease"
            }}
          >
            {loading && (
              <span style={{ width: "18px", height: "18px", border: "3px solid #fff", borderTop: "3px solid transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            )}
            {loading ? "Setting things up..." : "Register"}
          </button>
        </form>

        <p style={{ marginTop: "18px", textAlign: "center", fontSize: "14px", color: "#4b5563" }}>
          Already have an account?{" "}
          <a href="/login" style={{ color: "#6d28d9", fontWeight: "600", textDecoration: "none" }}>
            Login
          </a>
        </p>
      </div>
    </div>
  );
}