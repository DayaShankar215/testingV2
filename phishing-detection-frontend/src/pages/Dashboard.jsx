// pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { getScanHistory } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useGuest } from "../context/GuestContext";
import {
  FaShieldAlt,
  FaEnvelope,
  FaExclamationTriangle,
  FaCheckCircle,
  FaChartLine,
  FaClock,
  FaLink,
  FaComment,
  FaEye,
  FaChevronRight,
  FaChartPie,
  FaCalendarAlt,
  FaInbox,
  FaUserPlus,
  FaSync,
  FaHashtag,
} from "react-icons/fa";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import toast from "react-hot-toast";
import AuthModal from "../components/common/AuthModal";
import AnimatedNumber from "../components/common/AnimatedNumber";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalScans: 0,
    phishingDetected: 0,
    scamMessages: 0,
    safeDetections: 0,
    recentScans: [],
    weeklyData: [],
  });
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { getStats: getGuestStats, scans: guestScans } = useGuest();

  useEffect(() => {
    fetchDashboardStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Helper function to get prediction from API response
  const getPrediction = (scan) => {
    return scan.overallPrediction || scan.prediction || "UNKNOWN";
  };

  // Helper function to detect scan type
  const getScanType = (scan) => {
    if (scan.type) {
      const type = scan.type.toLowerCase();
      if (type === "url" || type === "message") return type;
    }
    if (scan.scanType) {
      const type = scan.scanType.toLowerCase();
      if (type === "url" || type === "message") return type;
      if (type.includes("url")) return "url";
      if (type.includes("message")) return "message";
    }
    if (scan.message) return "message";
    if (scan.url) return "url";
    if (scan.content) {
      const content = String(scan.content);
      if (
        content.match(/^https?:\/\/[^\s]+/) ||
        content.match(/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/)
      ) {
        return "url";
      }
      if (content.length > 50) return "message";
      return content.length > 20 ? "message" : "url";
    }
    return "url";
  };

  // Helper function to classify a scan based on type and prediction
  const classifyScan = (scan) => {
    const type = getScanType(scan);
    const pred = getPrediction(scan).toUpperCase();

    if (type === "url") {
      if (pred === "PHISHING" || pred === "DANGEROUS" || pred === "MALICIOUS") {
        return "phishing";
      } else if (pred === "SUSPICIOUS" || pred === "WARNING") {
        return "suspicious_url";
      } else if (pred === "SAFE" || pred === "LEGITIMATE") {
        return "safe";
      }
      return "unknown";
    }

    if (type === "message") {
      if (
        pred === "PHISHING" ||
        pred === "DANGEROUS" ||
        pred === "MALICIOUS" ||
        pred === "SCAM"
      ) {
        return "scam";
      } else if (pred === "SUSPICIOUS" || pred === "WARNING") {
        return "suspicious_message";
      } else if (pred === "SAFE" || pred === "LEGITIMATE") {
        return "safe";
      }
      return "unknown";
    }

    return "unknown";
  };

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      if (isAuthenticated) {
        const historyResponse = await getScanHistory();

        let allScans = [];
        if (
          historyResponse &&
          historyResponse.scans &&
          Array.isArray(historyResponse.scans)
        ) {
          allScans = historyResponse.scans;
        } else if (Array.isArray(historyResponse)) {
          allScans = historyResponse;
        } else if (
          historyResponse &&
          historyResponse.response &&
          Array.isArray(historyResponse.response)
        ) {
          allScans = historyResponse.response;
        }

        const totalScans = allScans.length;

        let phishingDetected = 0;
        let scamMessages = 0;
        let safeDetections = 0;

        allScans.forEach((scan) => {
          const classification = classifyScan(scan);
          if (classification === "phishing") {
            phishingDetected++;
          } else if (classification === "scam") {
            scamMessages++;
          } else if (classification === "safe") {
            safeDetections++;
          }
        });

        const recentScans = allScans.slice(0, 5).map((scan) => {
          const type = getScanType(scan);
          const content = scan.url || scan.message || scan.content || "";
          return {
            reference: scan.reference,
            content: content,
            type: type,
            result: getResultFromPrediction(getPrediction(scan)),
            date: scan.scannedAt,
            prediction: getPrediction(scan),
          };
        });

        const weeklyData = generateWeeklyDataFromScans(allScans);

        setStats({
          totalScans,
          phishingDetected,
          scamMessages,
          safeDetections,
          recentScans,
          weeklyData,
        });
      } else {
        const guestStats = getGuestStats();
        const guestRecentScans = guestScans.slice(0, 5).map((scan) => ({
          reference: scan.id || scan.reference || `guest_${Date.now()}`,
          content: scan.content || scan.url || scan.message || "",
          type: scan.type || "url",
          result: scan.result || "unknown",
          date: scan.date || new Date().toISOString(),
          prediction: scan.prediction || "UNKNOWN",
        }));

        setStats({
          totalScans: guestStats.total,
          phishingDetected: guestStats.phishing,
          scamMessages: guestStats.scam,
          safeDetections: guestStats.safe,
          recentScans: guestRecentScans,
          weeklyData: generateWeeklyDataFromScans(guestScans),
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      if (isAuthenticated) {
        toast.error("Failed to load dashboard data");
      }
      setStats({
        totalScans: 0,
        phishingDetected: 0,
        scamMessages: 0,
        safeDetections: 0,
        recentScans: [],
        weeklyData: generateEmptyWeeklyData(),
      });
    } finally {
      setLoading(false);
    }
  };

  const getResultFromPrediction = (prediction) => {
    const pred = prediction?.toUpperCase() || "";
    switch (pred) {
      case "PHISHING":
      case "DANGEROUS":
      case "MALICIOUS":
        return "phishing";
      case "SCAM":
      case "SUSPICIOUS":
      case "WARNING":
        return "suspicious";
      case "SAFE":
      case "LEGITIMATE":
        return "safe";
      default:
        return "unknown";
    }
  };

  const generateWeeklyDataFromScans = (scans) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const today = new Date();
    const dayMap = {};

    days.forEach((day, index) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - index));
      const dateStr = d.toISOString().split("T")[0];
      dayMap[dateStr] = { day, phishing: 0, scam: 0, safe: 0, date: dateStr };
    });

    scans.forEach((scan) => {
      if (!scan.scannedAt) return;
      const scanDate = new Date(scan.scannedAt);
      const dateStr = scanDate.toISOString().split("T")[0];

      if (dayMap[dateStr]) {
        const classification = classifyScan(scan);
        if (classification === "phishing") {
          dayMap[dateStr].phishing += 1;
        } else if (classification === "scam") {
          dayMap[dateStr].scam += 1;
        } else if (classification === "safe") {
          dayMap[dateStr].safe += 1;
        }
      }
    });

    const result = Object.values(dayMap);
    result.sort((a, b) => a.date.localeCompare(b.date));
    return result;
  };

  const generateEmptyWeeklyData = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day) => ({
      day,
      phishing: 0,
      scam: 0,
      safe: 0,
    }));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardStats();
    setRefreshing(false);
    toast.success("Dashboard refreshed!");
  };

  const weeklyData =
    stats.weeklyData.length > 0 ? stats.weeklyData : generateEmptyWeeklyData();
  const hasData = stats.totalScans > 0;
  const hasWeeklyData = weeklyData.some(
    (d) => d.phishing > 0 || d.scam > 0 || d.safe > 0,
  );

  const totalThreats = stats.phishingDetected + stats.scamMessages;

  const pieData = [
    {
      name: "Phishing URLs",
      value: stats.phishingDetected,
      color: "#ef4444",
      percentage:
        totalThreats > 0
          ? ((stats.phishingDetected / totalThreats) * 100).toFixed(1)
          : 0,
    },
    {
      name: "Scam Messages",
      value: stats.scamMessages,
      color: "#f59e0b",
      percentage:
        totalThreats > 0
          ? ((stats.scamMessages / totalThreats) * 100).toFixed(1)
          : 0,
    },
    {
      name: "Safe",
      value: stats.safeDetections,
      color: "#10b981",
      percentage:
        stats.totalScans > 0
          ? ((stats.safeDetections / stats.totalScans) * 100).toFixed(1)
          : 0,
    },
  ];

  const predictionTone = (prediction) => {
    const pred = prediction?.toUpperCase() || "";
    switch (pred) {
      case "PHISHING":
      case "DANGEROUS":
      case "MALICIOUS":
        return "danger";
      case "SCAM":
      case "SUSPICIOUS":
      case "WARNING":
        return "warning";
      case "SAFE":
      case "LEGITIMATE":
        return "success";
      default:
        return "neutral";
    }
  };

  const StatCard = ({ title, value, icon: Icon, gradient, subtitle, locked }) => (
    <div className="stat-card">
      {locked && !isAuthenticated && (
        <span className="stat-badge">
          <FaUserPlus size={10} />
          <span>Sign in</span>
        </span>
      )}
      <div className="stat-icon" style={{ background: gradient }}>
        <Icon />
      </div>
      <div className="stat-value">
        <AnimatedNumber value={value} />
      </div>
      <div className="stat-label">{title}</div>
      {subtitle && <div className="stat-sub">{subtitle}</div>}
    </div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip-title">{label}</p>
          {payload.map((entry, index) => (
            <p
              key={index}
              className="chart-tooltip-row"
              style={{ color: entry.color }}
            >
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const EmptyChartState = ({
    icon: Icon,
    title,
    description,
    actionText,
    onAction,
  }) => (
    <div className="empty-state" style={{ height: 320 }}>
      <div className="empty-icon">
        <Icon />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {onAction && (
        <button className="btn btn-primary btn-sm" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="loading" role="status" aria-live="polite">
        <span className="spinner spinner-lg" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        {/* Welcome Section */}
        <div className="section-head">
          <div>
            <h1 className="page-title">
              {isAuthenticated
                ? `Welcome back, ${user?.firstName || "User"}!`
                : "Welcome to SecureShield"}
            </h1>
            <p className="text-secondary">
              {isAuthenticated
                ? "Your AI-powered security guardian • real-time protection against cyber threats"
                : "Start scanning URLs and messages instantly • no account required"}
            </p>
            {!isAuthenticated && (
              <span className="badge badge-neutral" style={{ marginTop: 12 }}>
                👋 Guest mode • Sign up to save your scan history
              </span>
            )}
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <FaSync className={refreshing ? "spinning" : ""} size={14} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Hero CTA */}
        <div className="hero">
          <div className="hero-body">
            <div className="hero-tags">
              <span className="hero-tag">
                🛡️ AI-POWERED THREAT DETECTION
              </span>
              <span className="hero-tag live">
                <span className="dot" />
                {isAuthenticated ? "PROTECTED" : "GUEST MODE"}
              </span>
            </div>
            <h2 className="hero-title">Check before you click or reply.</h2>
            <p className="hero-text">
              Scan suspicious URLs and messages in seconds with clear risk
              explanations.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn btn-on-hero" onClick={() => navigate("/url-scan")}>
              <FaLink /> Scan URL
            </button>
            <button
              className="btn btn-on-hero-ghost"
              onClick={() => navigate("/message-scan")}
            >
              <FaComment /> Scan Message
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stat-grid" style={{ marginBottom: 40 }}>
          <StatCard
            title="Total Scans"
            value={stats.totalScans}
            icon={FaShieldAlt}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            subtitle={isAuthenticated ? "All time scans" : "Session scans"}
            locked={!isAuthenticated}
          />
          <StatCard
            title="Phishing URLs"
            value={stats.phishingDetected}
            icon={FaExclamationTriangle}
            gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            subtitle={`${
              totalThreats > 0
                ? ((stats.phishingDetected / totalThreats) * 100).toFixed(1)
                : 0
            }% of threats`}
            locked={!isAuthenticated}
          />
          <StatCard
            title="Scam Messages"
            value={stats.scamMessages}
            icon={FaEnvelope}
            gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
            subtitle={`${
              totalThreats > 0
                ? ((stats.scamMessages / totalThreats) * 100).toFixed(1)
                : 0
            }% of threats`}
            locked={!isAuthenticated}
          />
          <StatCard
            title="Safe Detections"
            value={stats.safeDetections}
            icon={FaCheckCircle}
            gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
            subtitle={`${
              stats.totalScans > 0
                ? ((stats.safeDetections / stats.totalScans) * 100).toFixed(1)
                : 0
            }% of total`}
            locked={!isAuthenticated}
          />
        </div>

        {/* Charts Row */}
        <div className="charts-row">
          {/* Area Chart */}
          <div className="chart-card">
            <div className="chart-head">
              <h3>
                <FaChartLine style={{ color: "var(--brand)" }} /> Detection
                Trends
              </h3>
              <span className="muted-note">(Last 7 days)</span>
            </div>
            {hasWeeklyData ? (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorPhishing" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorScam" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="phishing"
                    stroke="#ef4444"
                    fill="url(#colorPhishing)"
                    name="Phishing URLs"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="scam"
                    stroke="#f59e0b"
                    fill="url(#colorScam)"
                    name="Scam Messages"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="safe"
                    stroke="#10b981"
                    fill="url(#colorSafe)"
                    name="Safe"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState
                icon={FaInbox}
                title="No Scan Data Available"
                description="Start scanning URLs and messages to see detection trends over time."
                actionText="Start Scanning"
                onAction={() => navigate("/url-scan")}
              />
            )}
          </div>

          {/* Pie Chart */}
          <div className="chart-card">
            <div className="chart-head">
              <h3>
                <FaChartPie style={{ color: "var(--brand)" }} /> Threat
                Distribution
              </h3>
              <span className="muted-note">({totalThreats} threats)</span>
            </div>
            {totalThreats > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent, value }) =>
                      value > 0 ? `${name}: ${(percent * 100).toFixed(1)}%` : ""
                    }
                    outerRadius={100}
                    innerRadius={50}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="white"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      boxShadow: "var(--shadow-lg)",
                      padding: "12px",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => {
                      const item = pieData.find((d) => d.name === value);
                      return `${value}: ${item?.percentage || 0}%`;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState
                icon={FaChartPie}
                title="No Data to Display"
                description="No scans have been performed yet. Start scanning to see threat distribution."
                actionText="Start Scanning"
                onAction={() => navigate("/message-scan")}
              />
            )}
          </div>
        </div>

        {/* Guest Mode Call to Action */}
        {!isAuthenticated && hasData && (
          <div className="card card-pad text-center" style={{ marginBottom: 40 }}>
            <div className="empty-icon" style={{ marginBottom: 16 }}>
              <FaUserPlus />
            </div>
            <h3 className="section-title" style={{ marginBottom: 8 }}>
              Want to save your scan history?
            </h3>
            <p
              className="text-secondary"
              style={{ maxWidth: 480, margin: "0 auto 20px" }}
            >
              Create a free account to permanently save your scans, access them
              from any device, and unlock premium features.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => setShowAuthModal(true)}
            >
              Sign Up Free
            </button>
          </div>
        )}

        {/* Recent Scans Table */}
        <div className="panel">
          <div className="card-pad" style={{ paddingBottom: 0 }}>
            <div className="section-head" style={{ marginBottom: 0 }}>
              <h2 className="section-title flex items-center gap-1">
                <FaClock style={{ color: "var(--brand)" }} /> Recent Security
                Scans
                <span className="text-muted" style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                  ({stats.recentScans?.length || 0} total)
                </span>
              </h2>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate("/history")}
              >
                <FaEye /> View All <FaChevronRight size={12} />
              </button>
            </div>
          </div>

          {stats.recentScans?.length > 0 ? (
            <div className="table-wrap" style={{ marginTop: 20 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Type</th>
                    <th>Content</th>
                    <th>Prediction</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentScans?.slice(0, 5).map((scan, index) => (
                    <tr key={index}>
                      <td>
                        <span className="cell-ref flex items-center gap-1">
                          <FaHashtag size={10} style={{ opacity: 0.5 }} />
                          {scan.reference
                            ? truncateText(scan.reference, 20)
                            : "N/A"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={
                            scan.type === "message"
                              ? "badge badge-info"
                              : scan.type === "url"
                                ? "badge badge-brand"
                                : "badge badge-neutral"
                          }
                        >
                          {scan.type === "message" ? (
                            <>
                              <FaComment size={12} /> Message
                            </>
                          ) : scan.type === "url" ? (
                            <>
                              <FaLink size={12} /> URL
                            </>
                          ) : (
                            "Unknown"
                          )}
                        </span>
                      </td>
                      <td className="cell-truncate">
                        {truncateText(scan.content || "N/A", 50)}
                      </td>
                      <td>
                        <span
                          className={`badge badge-${predictionTone(
                            scan.prediction,
                          )}`}
                        >
                          {scan.prediction || "UNKNOWN"}
                        </span>
                      </td>
                      <td>
                        <span className="flex items-center gap-1 text-muted">
                          <FaCalendarAlt size={12} />
                          {formatDate(scan.date || scan.scannedAt || Date.now())}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <FaShieldAlt />
              </div>
              <h3>No Scans Yet</h3>
              <p>Start scanning URLs or messages to see results here.</p>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate("/url-scan")}
              >
                Start Scanning
              </button>
            </div>
          )}
        </div>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode="register"
          onSuccess={() => {
            setShowAuthModal(false);
            fetchDashboardStats();
          }}
        />
      </div>
    </div>
  );
};

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const truncateText = (text, maxLength = 100) => {
  if (!text) return "N/A";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

export default Dashboard;
