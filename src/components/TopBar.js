import NotificationBell from "../components/NotificationBell";

export default function TopBar() {
  const styles = {
    nav: {
      height: "60px",
      width: "100%",
      // Modern Glassmorphism
      background: "rgba(255, 255, 255, 0.85)",
      backdropFilter: "blur(15px)",
      WebkitBackdropFilter: "blur(15px)",
      borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      display: "flex",
      justifyContent: "center", // Centers the content for desktop
    },
    container: {
      width: "100%",
      maxWidth: "500px", // Aligns with your feed card width
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 16px",
    },
    logo: {
      margin: 0,
      fontSize: "22px",
      fontWeight: "800",
      background: "linear-gradient(45deg, #6366f1, #ec4899)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      letterSpacing: "-0.5px",
      cursor: "pointer",
      userSelect: "none",
    },
    bellWrapper: {
      padding: "8px",
      borderRadius: "50%",
      transition: "background 0.2s ease",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* LEFT SIDE: LOGO */}
        <h1 
          style={styles.logo} 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Connecto
        </h1>

        {/* RIGHT SIDE: NORMAL BELL */}
        <div 
          style={styles.bellWrapper}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.05)"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
        >
          <NotificationBell />
        </div>
      </div>
    </nav>
  );
}