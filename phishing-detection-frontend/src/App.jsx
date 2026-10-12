// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { GuestProvider } from "./context/GuestContext";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import ErrorBoundary from "./components/common/ErrorBoundary";
import ProtectedRoute from "./components/common/ProtectedRoute";
import ScrollToTop from "./components/common/ScrollToTop";
import BackToTop from "./components/common/BackToTop";
import CommandPalette from "./components/common/CommandPalette";
import Dashboard from "./pages/Dashboard";
import URLScanner from "./pages/URLScanner";
import MessageScanner from "./pages/MessageScanner";
import History from "./pages/History";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const AppContent = () => {
  const { currentTheme } = useTheme();

  return (
    <Router>
      <ScrollToTop />
      <div className="app-shell">
        <Navbar />
        <main className="app-main">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/url-scan" element={<URLScanner />} />
              <Route path="/message-scan" element={<MessageScanner />} />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </main>
        <Footer />
        <BackToTop />
        <CommandPalette />
        <Toaster
          key={currentTheme}
          position="top-right"
          gutter={10}
          toastOptions={{
            duration: 4000,
            style: {
              background: "var(--surface)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: "14px",
              boxShadow: "var(--shadow-lg)",
              fontSize: "14px",
              fontWeight: 500,
              padding: "12px 16px",
            },
            success: {
              iconTheme: { primary: "#10b981", secondary: "#ffffff" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#ffffff" },
            },
          }}
        />
      </div>
    </Router>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GuestProvider>
          <AppContent />
        </GuestProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
