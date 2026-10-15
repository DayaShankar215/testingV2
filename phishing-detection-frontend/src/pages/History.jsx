// pages/History.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getScanHistory,
  getScanByReference,
  deleteScanByReference,
} from "../services/api";
import Skeleton from "../components/common/Skeleton";
import { formatDate, truncateText } from "../utils/formatters";
import { getFeedbackState } from "../utils/feedback";
import { useAuth } from "../context/AuthContext";
import { useGuest } from "../context/GuestContext";
import {
  FaSearch,
  FaEye,
  FaChartLine,
  FaCalendar,
  FaShieldAlt,
  FaLink,
  FaEnvelope,
  FaTrashAlt,
  FaCalendarAlt,
  FaTimes,
  FaHashtag,
  FaFilePdf,
  FaComment,
  FaSortNumericDown,
  FaChevronDown,
  FaChevronUp,
  FaFileCsv,
  FaExclamationTriangle,
  FaCheckCircle,
  FaFlag,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { exportScansToCsv } from "../utils/exportCsv";

const History = () => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedScan, setSelectedScan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    phishing: true,
    legitimate: true,
    urls: true,
    urlPhishing: true,
    urlLegitimate: true,
  });
  const [stats, setStats] = useState({
    total: 0,
    url: 0,
    message: 0,
    feedbackGiven: 0,
  });

  const { isAuthenticated } = useAuth();
  const { scans: guestScans } = useGuest();
  const navigate = useNavigate();
  const location = useLocation();

  const [dateFilter, setDateFilter] = useState({
    preset: "all",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");

  const getPrediction = (scan) => {
    return scan.overallPrediction || scan.prediction || "UNKNOWN";
  };

  const getScanType = (scan) => {
    if (scan.type) return scan.type;
    if (scan.scanType) {
      const type = scan.scanType.toLowerCase();
      if (type === "url" || type === "message") return type;
    }
    if (scan.message) return "message";
    if (scan.url) return "url";
    if (scan.content) {
      const content = scan.content || "";
      if (content.match(/^https?:\/\/[^\s]+/)) return "url";
      return "message";
    }
    return "url";
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, isAuthenticated]);

  useEffect(() => {
    calculateStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scans]);

  const fetchHistory = async () => {
    try {
      setLoading(true);

      if (isAuthenticated) {
        const response = await getScanHistory();
        console.log("Scan History Response:", response);

        let scansData = [];
        if (response && response.scans && Array.isArray(response.scans)) {
          scansData = response.scans;
        } else if (Array.isArray(response)) {
          scansData = response;
        }

        const formattedScans = scansData.map((scan) => {
          const type = getScanType(scan);
          return {
            reference: scan.reference,
            url: scan.url || scan.content,
            prediction: getPrediction(scan),
            conclusion: scan.conclusion,
            scannedAt: scan.scannedAt,
            type: type,
            content: scan.url || scan.message || scan.content || scan.url,
            scanType: scan.scanType,
            message: scan.message,
            messagePrediction: scan.messagePrediction,
            messagePhishingReasons: scan.messagePhishingReasons || [],
            messageLegitimateReasons: scan.messageLegitimateReasons || [],
            urlsFound: scan.urlsFound || [],
            urlResults: scan.urlResults || [],
            phishingReasons: scan.phishingReasons || [],
            legitimateReasons: scan.legitimateReasons || [],
            _raw: scan,
          };
        });
        formattedScans.sort((a, b) => {
          const dateA = new Date(a.scannedAt || a.date || a.timestamp || 0);
          const dateB = new Date(b.scannedAt || b.date || b.timestamp || 0);
          return dateB - dateA;
        });
        setScans(formattedScans);
      } else {
        const guestFiltered =
          filter === "all"
            ? guestScans
            : guestScans.filter((s) => s.type === filter);
        setScans(guestFiltered);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      if (isAuthenticated) {
        toast.error("Failed to load scan history");
      }
      setScans([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const total = scans.length;
    const url = scans.filter((s) => s?.type === "url").length;
    const message = scans.filter((s) => s?.type === "message").length;
    const feedbackGiven = scans.filter(
      (s) => getFeedbackState(s) === true,
    ).length;
    setStats({ total, url, message, feedbackGiven });
  };

  const getDateFilteredScans = (scansList) => {
    if (!scansList || !Array.isArray(scansList)) return [];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    return scansList.filter((scan) => {
      const scanDate = new Date(
        scan?.scannedAt ||
          scan?.date ||
          scan?.timestamp ||
          scan?.createdAt ||
          Date.now(),
      );

      switch (dateFilter.preset) {
        case "today":
          return scanDate >= today;
        case "yesterday":
          return scanDate >= yesterday && scanDate < today;
        case "week":
          return scanDate >= weekAgo;
        case "month":
          return scanDate >= monthAgo;
        case "custom":
          if (tempStartDate && tempEndDate) {
            const start = new Date(tempStartDate);
            const end = new Date(tempEndDate);
            end.setHours(23, 59, 59, 999);
            return scanDate >= start && scanDate <= end;
          }
          return true;
        case "all":
        default:
          return true;
      }
    });
  };

  const handleDatePresetChange = (preset) => {
    setDateFilter({ preset });
    setShowDatePicker(false);
    if (preset !== "custom") {
      setTempStartDate("");
      setTempEndDate("");
    }
  };

  const handleCustomDateApply = () => {
    if (tempStartDate && tempEndDate) {
      setDateFilter({ preset: "custom" });
      setShowDatePicker(false);
      toast.success(`Date filter applied`);
    } else {
      toast.error("Please select both start and end dates");
    }
  };

  const clearDateFilter = () => {
    setDateFilter({ preset: "all" });
    setTempStartDate("");
    setTempEndDate("");
    setShowDatePicker(false);
  };

  const getDateFilterLabel = (preset = null) => {
    const currentPreset = preset || dateFilter.preset;
    switch (currentPreset) {
      case "today":
        return "Today";
      case "yesterday":
        return "Yesterday";
      case "week":
        return "Last 7 Days";
      case "month":
        return "Last 30 Days";
      case "custom":
        return "Custom Range";
      default:
        return "All Time";
    }
  };

  const handleViewDetails = async (reference) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    try {
      const response = await getScanByReference(reference);
      console.log("Scan Details Response:", response);

      const isMessageScan = response.scanType === "MESSAGE" || response.message;

      setSelectedScan({
        reference: response.reference,
        url: response.url || response.message || "",
        prediction: getPrediction(response),
        legitimateReasons:
          response.legitimateReasons || response.messageLegitimateReasons || [],
        phishingReasons:
          response.phishingReasons || response.messagePhishingReasons || [],
        conclusion: response.conclusion,
        scannedAt: response.scannedAt,
        isMessageScan: isMessageScan,
        message: response.message,
        scanType: response.scanType,
        messagePrediction: response.messagePrediction,
        messagePhishingReasons: response.messagePhishingReasons || [],
        messageLegitimateReasons: response.messageLegitimateReasons || [],
        urlsFound: response.urlsFound || [],
        urlResults: response.urlResults || [],
        overallPrediction: response.overallPrediction,
        explanation: response.explanation,
        _raw: response,
      });
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching scan details:", error);
      toast.error("Failed to load scan details");
    }
  };

  const handleDownloadReport = async (reference) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (downloadingId === reference) return;

    setDownloadingId(reference);
    const toastId = toast.loading("Generating PDF report...");

    try {
      const scanDetails = await getScanByReference(reference);
      console.log("Scan Details for PDF:", scanDetails);

      const isMessageScan =
        scanDetails.scanType === "MESSAGE" || scanDetails.message;

      const pdfData = {
        reference: scanDetails.reference,
        url: isMessageScan ? "" : scanDetails.url || "",
        message: scanDetails.message || "",
        prediction: getPrediction(scanDetails),
        conclusion: scanDetails.conclusion || "Analysis completed",
        scannedAt: scanDetails.scannedAt,
        scanType: scanDetails.scanType || (isMessageScan ? "MESSAGE" : "URL"),
        messagePrediction: scanDetails.messagePrediction,
        messagePhishingReasons: scanDetails.messagePhishingReasons || [],
        messageLegitimateReasons: scanDetails.messageLegitimateReasons || [],
        urlsFound: scanDetails.urlsFound || [],
        urlResults: scanDetails.urlResults || [],
        phishingReasons: scanDetails.phishingReasons || [],
        legitimateReasons: scanDetails.legitimateReasons || [],
        overallPrediction: scanDetails.overallPrediction,
        explanation: scanDetails.explanation,
        _raw: scanDetails,
      };

      const { downloadPDF } = await import("../services/pdfGenerator");
      downloadPDF(pdfData, isMessageScan ? "message" : "url");

      toast.success("PDF report downloaded successfully!", { id: toastId });
    } catch (error) {
      console.error("Download Error:", error);
      toast.error(error.message || "Failed to download report", {
        id: toastId,
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDeleteScan = async (reference) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (deletingId === reference) return;

    if (
      !window.confirm(
        "Are you sure you want to delete this scan? This action cannot be undone.",
      )
    ) {
      return;
    }

    setDeletingId(reference);
    const toastId = toast.loading("Deleting scan...");

    try {
      console.log(`[DELETE] Deleting scan: ${reference}`);

      const response = await deleteScanByReference(reference);
      console.log("[DELETE] Success:", response);

      toast.success("Scan deleted successfully!", { id: toastId });

      setScans((prev) => prev.filter((scan) => scan.reference !== reference));
      calculateStats();
    } catch (error) {
      console.error("[DELETE] Error:", error);

      if (error.status === 403) {
        toast.error(`${error.message || "Permission denied"}`, {
          id: toastId,
          duration: 5000,
        });
        return;
      }

      if (error.status === 404) {
        toast.success("Scan already deleted.", { id: toastId });
        setScans((prev) => prev.filter((scan) => scan.reference !== reference));
        calculateStats();
        return;
      }

      if (error.status === 401) {
        toast.error("Session expired. Please login again.", { id: toastId });
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        setTimeout(() => window.location.reload(), 1500);
        return;
      }

      if (error.isCorsError || error.status === 0) {
        toast.error("Cannot connect to server. Please check your connection.", {
          id: toastId,
        });
        return;
      }

      toast.error(error?.message || "Failed to delete scan", { id: toastId });
    } finally {
      setDeletingId(null);
    }
  };

  const smartSearch = (scan, term) => {
    if (!term || term.trim() === "") return true;

    const searchLower = term.toLowerCase().trim();
    const reference = (scan?.reference || "").toString().toLowerCase();
    const content = (scan?.content || scan?.url || scan?.message || "").toLowerCase();
    const type = (scan?.type || "").toLowerCase();

    return (
      reference.includes(searchLower) ||
      content.includes(searchLower) ||
      type.includes(searchLower)
    );
  };

  const filteredScans = (() => {
    if (!Array.isArray(scans)) return [];

    let filtered = getDateFilteredScans(scans);

    if (filter !== "all") {
      filtered = filtered.filter((s) => s.type === filter);
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter((scan) => smartSearch(scan, searchTerm));
    }

    return filtered;
  })();

  const predictionTone = (pred) => {
    const upperPred = pred?.toUpperCase() || "";
    switch (upperPred) {
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

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleExportCsv = () => {
    if (!filteredScans || filteredScans.length === 0) {
      toast.error("No scans to export");
      return;
    }
    const stamp = new Date().toISOString().slice(0, 10);
    const ok = exportScansToCsv(
      filteredScans,
      `secureshield-history-${stamp}.csv`,
    );
    if (ok) toast.success(`Exported ${filteredScans.length} scans to CSV`);
  };

  if (loading) {
    return (
      <div className="page" aria-busy="true" aria-live="polite">
        <div className="container container-wide">
          <div className="text-center" style={{ marginBottom: 32 }}>
            <Skeleton className="skeleton-title" style={{ margin: "0 auto" }} />
            <Skeleton
              className="skeleton-sub"
              style={{ margin: "16px auto 0" }}
            />
          </div>
          <div className="stat-grid" style={{ marginBottom: 32 }}>
            {[0, 1, 2, 3].map((i) => (
              <div className="stat-card" key={i}>
                <Skeleton className="skeleton-circle" width={48} height={48} />
                <Skeleton width="45%" height={30} style={{ marginTop: 18 }} />
                <Skeleton width="70%" height={14} style={{ marginTop: 10 }} />
              </div>
            ))}
          </div>
          <div className="panel">
            <div className="card-pad">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} height={46} style={{ marginBottom: 12 }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container container-wide">
        {/* Header */}
        <div className="text-center" style={{ marginBottom: 32 }}>
          <h1
            className="page-title gradient-text"
            style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}
          >
            Security History
          </h1>
          <p className="text-secondary" style={{ fontSize: "1.05rem" }}>
            Track and analyze all your security scans
          </p>
        </div>

        {/* Stats */}
        <div className="stat-grid" style={{ marginBottom: 32 }}>
          <div className="stat-card">
            <div
              className="stat-icon"
              style={{ background: "var(--brand-grad)" }}
            >
              <FaChartLine />
            </div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Scans</div>
          </div>
          <div className="stat-card">
            <div
              className="stat-icon"
              style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}
            >
              <FaLink />
            </div>
            <div className="stat-value">{stats.url}</div>
            <div className="stat-label">URL Scans</div>
          </div>
          <div className="stat-card">
            <div
              className="stat-icon"
              style={{ background: "linear-gradient(135deg, #f093fb, #f5576c)" }}
            >
              <FaEnvelope />
            </div>
            <div className="stat-value">{stats.message}</div>
            <div className="stat-label">Message Scans</div>
          </div>
          <div className="stat-card">
            <div
              className="stat-icon"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
            >
              <FaFlag />
            </div>
            <div className="stat-value">{stats.feedbackGiven}</div>
            <div className="stat-label">Feedback Given</div>
          </div>
        </div>

        {/* Filters */}
        <div className="table-toolbar">
          <div className="chips">
            {["all", "url", "message"].map((type) => (
              <button
                key={type}
                className={`chip${filter === type ? " active" : ""}`}
                onClick={() => setFilter(type)}
              >
                {type === "all"
                  ? "All Scans"
                  : type === "url"
                    ? "URL Scans"
                    : "Message Scans"}
              </button>
            ))}
          </div>

          <button
            className={`btn btn-secondary btn-sm${
              dateFilter.preset !== "all" ? " active" : ""
            }`}
            onClick={() => setShowDatePicker(!showDatePicker)}
          >
            <FaCalendarAlt />
            {dateFilter.preset === "all" ? "All Time" : getDateFilterLabel()}
            {dateFilter.preset !== "all" && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  clearDateFilter();
                }}
                style={{
                  background: "var(--brand-soft)",
                  borderRadius: "50%",
                  padding: "2px 5px",
                  fontSize: 11,
                  marginLeft: 4,
                }}
              >
                <FaTimes />
              </span>
            )}
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={handleExportCsv}
            disabled={filteredScans.length === 0}
            title="Export filtered scans to CSV"
          >
            <FaFileCsv />
            Export CSV
          </button>

          <div className="search-wrap">
            <FaSearch className="input-icon" />
            <input
              className="input"
              type="text"
              placeholder="Search by reference ID, content or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Date Picker */}
        {showDatePicker && (
          <div className="card card-pad" style={{ marginBottom: 24 }}>
            <div className="section-head" style={{ marginBottom: 16 }}>
              <h3 className="section-title flex items-center gap-1" style={{ fontSize: "1.05rem" }}>
                <FaCalendarAlt style={{ color: "var(--brand)" }} /> Filter by Date
              </h3>
              <button
                className="btn-icon"
                onClick={() => setShowDatePicker(false)}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <div className="flex flex-wrap gap-1" style={{ marginBottom: 16 }}>
              {[
                { value: "all", label: "All Time" },
                { value: "today", label: "Today" },
                { value: "yesterday", label: "Yesterday" },
                { value: "week", label: "Last 7 Days" },
                { value: "month", label: "Last 30 Days" },
                { value: "custom", label: "Custom Range" },
              ].map((preset) => (
                <button
                  key={preset.value}
                  className={`chip${
                    dateFilter.preset === preset.value ? " active" : ""
                  }`}
                  onClick={() => handleDatePresetChange(preset.value)}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {dateFilter.preset === "custom" && (
              <div
                className="flex flex-wrap gap-2 items-center"
                style={{
                  paddingTop: 16,
                  borderTop: "1px solid var(--divider)",
                }}
              >
                <div className="field" style={{ flex: 1, minWidth: 160, marginBottom: 0 }}>
                  <label className="label">Start Date</label>
                  <input
                    className="input"
                    type="date"
                    value={tempStartDate}
                    onChange={(e) => setTempStartDate(e.target.value)}
                  />
                </div>
                <div className="field" style={{ flex: 1, minWidth: 160, marginBottom: 0 }}>
                  <label className="label">End Date</label>
                  <input
                    className="input"
                    type="date"
                    value={tempEndDate}
                    onChange={(e) => setTempEndDate(e.target.value)}
                  />
                </div>
                <button className="btn btn-primary" onClick={handleCustomDateApply}>
                  Apply Range
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="results-count">
          <span>
            Showing {filteredScans.length} of {scans.length} scans
            {searchTerm && (
              <strong style={{ marginLeft: 8, color: "var(--brand)" }}>
                (filtered by "{searchTerm}")
              </strong>
            )}
          </span>
          {dateFilter.preset !== "all" && (
            <span className="flex items-center gap-1">
              <FaCalendarAlt size={12} /> {getDateFilterLabel()}
            </span>
          )}
        </div>

        {/* Scans Table */}
        <div className="panel">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>
                    <FaSortNumericDown style={{ marginRight: 4 }} /> S.No
                  </th>
                  <th>Reference</th>
                  <th>Type</th>
                  <th>Content</th>
                  <th>Prediction</th>
                  <th>Feedback</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredScans.length === 0 ? (
                  <tr>
                    <td colSpan="8">
                      <div className="empty-state">
                        <div className="empty-icon">
                          <FaShieldAlt />
                        </div>
                        <h3>No scans found</h3>
                        <p>Try adjusting your filters or search terms.</p>
                        {searchTerm && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => setSearchTerm("")}
                          >
                            Clear Search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredScans.map((scan, index) => {
                    const reference = scan?.reference;
                    const isDownloading = downloadingId === reference;
                    const isDeleting = deletingId === reference;
                    const isGuest = scan?.isGuest === true;
                    const prediction = scan?.prediction || "UNKNOWN";
                    const tone = predictionTone(prediction);
                    const showDelete = isAuthenticated && !isGuest;
                    const isMessage = scan?.type === "message";
                    const feedbackState = getFeedbackState(scan);

                    return (
                      <tr key={reference || `scan_${index}`}>
                        <td style={{ color: "var(--text-3)", fontWeight: 500 }}>
                          {index + 1}
                        </td>
                        <td>
                          <span className="cell-ref flex items-center gap-1">
                            <FaHashtag size={10} style={{ opacity: 0.5 }} />
                            {reference ? truncateText(reference, 20) : "N/A"}
                            {isGuest && (
                              <span className="badge badge-neutral">Guest</span>
                            )}
                          </span>
                        </td>
                        <td>
                          <span
                            className={
                              isMessage ? "badge badge-info" : "badge badge-brand"
                            }
                          >
                            {isMessage ? (
                              <>
                                <FaComment size={12} /> Message
                              </>
                            ) : (
                              <>
                                <FaLink size={12} /> URL
                              </>
                            )}
                          </span>
                        </td>
                        <td className="cell-truncate" title={scan?.content || scan?.url || "N/A"}>
                          {truncateText(scan?.content || scan?.url || "N/A", 50)}
                        </td>
                        <td>
                          <span className={`badge badge-${tone}`}>{prediction}</span>
                        </td>
                        <td>
                          {feedbackState === true ? (
                            <span
                              className="badge badge-success"
                              title="Feedback provided for this scan"
                            >
                              <FaFlag size={11} /> Provided
                            </span>
                          ) : (
                            <span
                              className="badge badge-neutral"
                              title="No feedback provided for this scan"
                            >
                              <FaTimes size={11} /> Not provided
                            </span>
                          )}
                        </td>
                        <td style={{ color: "var(--text-3)" }}>
                          <span className="flex items-center gap-1">
                            <FaCalendar size={12} />
                            {formatDate(
                              scan?.scannedAt || scan?.date || scan?.timestamp || Date.now(),
                            )}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              className="btn-icon"
                              onClick={() => handleViewDetails(reference)}
                              disabled={!isAuthenticated}
                              title={
                                isAuthenticated
                                  ? "View details"
                                  : "Sign in to view details"
                              }
                            >
                              <FaEye size={14} />
                            </button>
                            <button
                              className="btn-icon"
                              onClick={() => handleDownloadReport(reference)}
                              disabled={isDownloading || !isAuthenticated}
                              title={
                                isAuthenticated
                                  ? "Download report"
                                  : "Sign in to download report"
                              }
                            >
                              {isDownloading ? (
                                <span className="spinner spinner-sm" aria-hidden="true" />
                              ) : (
                                <FaFilePdf size={14} />
                              )}
                            </button>
                            {showDelete && (
                              <button
                                className="btn-icon danger"
                                onClick={() => handleDeleteScan(reference)}
                                disabled={isDeleting}
                                title="Delete scan"
                              >
                                {isDeleting ? (
                                  <span className="spinner spinner-sm" aria-hidden="true" />
                                ) : (
                                  <FaTrashAlt size={14} />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details Modal */}
        {showModal && selectedScan && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div
              className="modal-panel wide"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-head">
                <h2>Scan Details</h2>
                <button
                  className="modal-close"
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="modal-body">
                <div className="detail-block">
                  <div className="detail-label">Reference</div>
                  <div className="detail-value mono">
                    {selectedScan.reference}
                  </div>
                </div>

                <div className="detail-block">
                  <div className="detail-label">Scan Type</div>
                  <span
                    className={
                      selectedScan.scanType === "MESSAGE" || selectedScan.isMessageScan
                        ? "badge badge-info"
                        : "badge badge-brand"
                    }
                  >
                    {selectedScan.scanType ||
                      (selectedScan.isMessageScan ? "MESSAGE" : "URL")}
                  </span>
                </div>

                <div className="detail-block">
                  <div className="detail-label">
                    {selectedScan.isMessageScan ? "Message" : "URL"}
                  </div>
                  <div className="detail-value" style={{ maxHeight: 160, overflow: "auto" }}>
                    {selectedScan.isMessageScan
                      ? selectedScan.message || selectedScan.url
                      : selectedScan.url}
                  </div>
                </div>

                <div className="detail-block">
                  <div className="detail-label">Overall Prediction</div>
                  <span
                    className={`badge badge-${predictionTone(
                      selectedScan.overallPrediction || selectedScan.prediction,
                    )}`}
                  >
                    {selectedScan.overallPrediction || selectedScan.prediction}
                  </span>
                </div>

                {selectedScan.isMessageScan && selectedScan.messagePrediction && (
                  <div className="detail-block">
                    <div className="detail-label">Message Prediction</div>
                    <span
                      className={`badge badge-${predictionTone(
                        selectedScan.messagePrediction,
                      )}`}
                    >
                      {selectedScan.messagePrediction}
                    </span>
                  </div>
                )}

                {/* Message Phishing Reasons */}
                {selectedScan.isMessageScan &&
                  selectedScan.messagePhishingReasons &&
                  selectedScan.messagePhishingReasons.length > 0 && (
                    <div className="detail-block">
                      <div
                        className="collapsible-head"
                        onClick={() => toggleSection("phishing")}
                      >
                        <h3>
                          <FaExclamationTriangle /> Message Phishing Indicators
                        </h3>
                        {expandedSections.phishing ? (
                          <FaChevronUp size={14} />
                        ) : (
                          <FaChevronDown size={14} />
                        )}
                      </div>
                      {expandedSections.phishing && (
                        <div
                          className="collapsible-body reasons-card danger"
                          style={{ marginBottom: 0 }}
                        >
                          <ul>
                            {selectedScan.messagePhishingReasons.map((reason, i) => (
                              <li key={i}>{reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                {/* Message Legitimate Reasons */}
                {selectedScan.isMessageScan &&
                  selectedScan.messageLegitimateReasons &&
                  selectedScan.messageLegitimateReasons.length > 0 && (
                    <div className="detail-block">
                      <div
                        className="collapsible-head"
                        onClick={() => toggleSection("legitimate")}
                      >
                        <h3>
                          <FaCheckCircle /> Message Legitimate Indicators
                        </h3>
                        {expandedSections.legitimate ? (
                          <FaChevronUp size={14} />
                        ) : (
                          <FaChevronDown size={14} />
                        )}
                      </div>
                      {expandedSections.legitimate && (
                        <div
                          className="collapsible-body reasons-card success"
                          style={{ marginBottom: 0 }}
                        >
                          <ul>
                            {selectedScan.messageLegitimateReasons.map((reason, i) => (
                              <li key={i}>{reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                {/* URL Phishing Reasons */}
                {!selectedScan.isMessageScan &&
                  selectedScan.phishingReasons &&
                  selectedScan.phishingReasons.length > 0 && (
                    <div className="detail-block">
                      <div
                        className="collapsible-head"
                        onClick={() => toggleSection("urlPhishing")}
                      >
                        <h3>
                          <FaExclamationTriangle /> URL Phishing Indicators
                        </h3>
                        {expandedSections.urlPhishing ? (
                          <FaChevronUp size={14} />
                        ) : (
                          <FaChevronDown size={14} />
                        )}
                      </div>
                      {expandedSections.urlPhishing && (
                        <div
                          className="collapsible-body reasons-card danger"
                          style={{ marginBottom: 0 }}
                        >
                          <ul>
                            {selectedScan.phishingReasons.map((reason, i) => (
                              <li key={i}>{reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                {/* URL Legitimate Reasons */}
                {!selectedScan.isMessageScan &&
                  selectedScan.legitimateReasons &&
                  selectedScan.legitimateReasons.length > 0 && (
                    <div className="detail-block">
                      <div
                        className="collapsible-head"
                        onClick={() => toggleSection("urlLegitimate")}
                      >
                        <h3>
                          <FaCheckCircle /> URL Legitimate Indicators
                        </h3>
                        {expandedSections.urlLegitimate ? (
                          <FaChevronUp size={14} />
                        ) : (
                          <FaChevronDown size={14} />
                        )}
                      </div>
                      {expandedSections.urlLegitimate && (
                        <div
                          className="collapsible-body reasons-card success"
                          style={{ marginBottom: 0 }}
                        >
                          <ul>
                            {selectedScan.legitimateReasons.map((reason, i) => (
                              <li key={i}>{reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                {/* URLs Found in Message */}
                {selectedScan.isMessageScan &&
                  selectedScan.urlsFound &&
                  selectedScan.urlsFound.length > 0 && (
                    <div className="detail-block">
                      <div
                        className="collapsible-head"
                        onClick={() => toggleSection("urls")}
                      >
                        <h3>
                          <FaLink /> URLs Found in Message
                        </h3>
                        {expandedSections.urls ? (
                          <FaChevronUp size={14} />
                        ) : (
                          <FaChevronDown size={14} />
                        )}
                      </div>
                      {expandedSections.urls && (
                        <div
                          className="collapsible-body reasons-card warning"
                          style={{ marginBottom: 0 }}
                        >
                          {selectedScan.urlsFound.map((url, index) => {
                            const urlResult = selectedScan.urlResults?.[index];
                            return (
                              <div key={index} className="url-item">
                                <p>{url}</p>
                                {urlResult && (
                                  <div className="url-note">
                                    <span
                                      className={
                                        urlResult.prediction === "LEGITIMATE"
                                          ? "badge badge-success"
                                          : "badge badge-danger"
                                      }
                                    >
                                      Prediction: {urlResult.prediction || "UNKNOWN"}
                                    </span>
                                    {urlResult.legitimateReasons?.length > 0 && (
                                      <div
                                        style={{
                                          marginTop: 6,
                                          fontSize: 12,
                                          color: "var(--success-text)",
                                        }}
                                      >
                                        <FaCheckCircle size={12} /> Legitimate:{" "}
                                        {urlResult.legitimateReasons[0]}
                                        {urlResult.legitimateReasons.length > 1 && (
                                          <span className="text-muted" style={{ marginLeft: 4 }}>
                                            +{urlResult.legitimateReasons.length - 1} more
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    {urlResult.phishingReasons?.length > 0 && (
                                      <div
                                        style={{
                                          marginTop: 4,
                                          fontSize: 12,
                                          color: "var(--danger-text)",
                                        }}
                                      >
                                        <FaExclamationTriangle size={12} />{" "}
                                        Phishing: {urlResult.phishingReasons[0]}
                                        {urlResult.phishingReasons.length > 1 && (
                                          <span className="text-muted" style={{ marginLeft: 4 }}>
                                            +{urlResult.phishingReasons.length - 1} more
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    {urlResult.conclusion && (
                                      <div
                                        className="result-box"
                                        style={{ marginTop: 6, padding: "8px 10px", fontSize: 12 }}
                                      >
                                        <strong>Conclusion:</strong>{" "}
                                        {urlResult.conclusion}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                {/* Conclusion */}
                {selectedScan.conclusion && (
                  <div className="detail-block">
                    <div className="detail-label">Conclusion</div>
                    <div className="detail-value">{selectedScan.conclusion}</div>
                  </div>
                )}

                {/* Scanned At */}
                <div className="detail-block">
                  <div className="detail-label">Scanned At</div>
                  <div className="detail-value flex items-center gap-1">
                    <FaCalendar /> {formatDate(selectedScan.scannedAt)}
                  </div>
                </div>

                {/* Download */}
                <button
                  className="btn btn-primary btn-block btn-lg"
                  onClick={() => handleDownloadReport(selectedScan.reference)}
                  disabled={downloadingId === selectedScan.reference}
                >
                  {downloadingId === selectedScan.reference ? (
                    <>
                      <span className="spinner" aria-hidden="true" /> Downloading...
                    </>
                  ) : (
                    <>
                      <FaFilePdf /> Download Full Report
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
