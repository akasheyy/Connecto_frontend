import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiUserPlus, FiCheck } from "react-icons/fi";

export default function Explore() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        if (!token || !API_BASE_URL) return;
        const res = await fetch(`${API_BASE_URL}/api/user/me`, {
          headers: { Authorization: "Bearer " + token }
        });
        const data = await res.json();
        setCurrentUser(data);
      } catch (err) { console.error(err); }
    }
    loadCurrentUser();
  }, [token, API_BASE_URL]);

  useEffect(() => {
    if (!currentUser || !API_BASE_URL) return;
    async function loadSuggestions() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/user/suggestions`, {
          headers: { Authorization: "Bearer " + token }
        });
        const data = await res.json();
        setSuggestions(Array.isArray(data) ? data.slice(0, 5) : []); // Limit to 5
      } catch (err) { console.error(err); }
    }
    loadSuggestions();
  }, [currentUser, token, API_BASE_URL]);

  useEffect(() => {
    loadUsers("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const loadUsers = async (query) => {
    try {
      setLoading(true);
      if (!token || !API_BASE_URL) return;

      const res = await fetch(`${API_BASE_URL}/api/user/search?query=${query}`, { 
        headers: { Authorization: "Bearer " + token } 
      });
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];

      // Filter out self
      let filtered = currentUser ? list.filter((u) => u._id !== currentUser._id) : list;
      
      // 🔥 LOGIC: If search is empty, only show "Featured" (first 4 users)
      if (query === "") {
        filtered = filtered.slice(0, 4);
      }

      setUsers(filtered);
    } catch (err) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    loadUsers(value);
  };

  async function handleFollow(targetId) {
    try {
      await fetch(`${API_BASE_URL}/api/user/${targetId}/follow`, {
        method: "PUT", headers: { Authorization: "Bearer " + token }
      });
      setSuggestions((prev) => prev.filter((u) => u._id !== targetId));
      // Refresh list to show follow status if needed
    } catch (err) { console.error(err); }
  }

  const styles = {
    pageWrapper: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)",
      backgroundAttachment: "fixed",
      paddingTop: "80px",
      paddingBottom: "40px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    },
    container: {
      width: "90%",
      maxWidth: "500px",
    },
    searchBox: {
      display: "flex",
      alignItems: "center",
      background: "rgba(255, 255, 255, 0.2)",
      backdropFilter: "blur(10px)",
      borderRadius: "16px",
      padding: "10px 15px",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      marginBottom: "30px"
    },
    searchInput: {
      background: "transparent",
      border: "none",
      color: "white",
      fontSize: "16px",
      marginLeft: "10px",
      width: "100%",
      outline: "none"
    },
    sectionTitle: {
      color: "white",
      fontSize: "14px",
      textTransform: "uppercase",
      letterSpacing: "1px",
      marginBottom: "15px",
      opacity: 0.9
    },
    userCard: {
      display: "flex",
      alignItems: "center",
      padding: "12px",
      background: "rgba(255, 255, 255, 0.95)",
      borderRadius: "18px",
      marginBottom: "12px",
      textDecoration: "none",
      color: "#1e293b",
      boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
      transition: "transform 0.2s"
    },
    followBtn: {
      padding: "8px 16px",
      background: "#6366f1",
      color: "white",
      border: "none",
      borderRadius: "12px",
      fontSize: "13px",
      fontWeight: "700",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "5px"
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        
        {/* MODERN SEARCH BAR */}
        <div style={styles.searchBox}>
          <FiSearch color="white" size={20} />
          <input
            value={search}
            onChange={handleSearch}
            placeholder="Search creators..."
            style={styles.searchInput}
          />
        </div>

        {/* SUGGESTIONS SECTION */}
        {search === "" && suggestions.length > 0 && (
          <div style={{ marginBottom: "30px" }}>
            <h3 style={styles.sectionTitle}>Suggestions</h3>
            {suggestions.map((u) => (
              <div key={u._id} style={styles.userCard}>
                <Link to={`/user/${u._id}`} style={{ display: "flex", alignItems: "center", flexGrow: 1, textDecoration: "none", color: 'inherit' }}>
                  <img src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.username}`} 
                       style={{ width: 48, height: 48, borderRadius: "50%", marginRight: 12, border: "2px solid #e2e8f0" }} alt="" />
                  <div>
                    <div style={{ fontWeight: "700" }}>{u.username}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{u.followers?.length || 0} followers</div>
                  </div>
                </Link>
                <button onClick={() => handleFollow(u._id)} style={styles.followBtn}>
                  <FiUserPlus /> Follow
                </button>
              </div>
            ))}
          </div>
        )}

        {/* SEARCH RESULTS / FEATURED USERS */}
        <h3 style={styles.sectionTitle}>
          {search === "" ? "Featured Creators" : "Search Results"}
        </h3>

        {loading ? (
           <p style={{ color: "white", textAlign: "center" }}>Searching...</p>
        ) : (
          users.map((u) => (
            <Link key={u._id} to={`/user/${u._id}`} style={styles.userCard}>
              <img src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.username}`} 
                   style={{ width: 48, height: 48, borderRadius: "50%", marginRight: 12, border: "2px solid #e2e8f0" }} alt="" />
              <div>
                <div style={{ fontWeight: "700" }}>{u.username}</div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>{u.followers?.length || 0} followers</div>
              </div>
            </Link>
          ))
        )}

        {users.length === 0 && !loading && (
          <p style={{ color: "white", textAlign: "center", opacity: 0.7 }}>No users found.</p>
        )}
      </div>
    </div>
  );
}