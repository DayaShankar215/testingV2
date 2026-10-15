// pages/URLScanner.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  scanURL,
  submitFeedbackMessage,
  submitAccuracy,
  getScanByReference,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useGuest } from "../context/GuestContext";
import {
  FaShieldAlt,
  FaInfoCircle,
  FaLink,
  FaExclamationTriangle,
  FaCheckCircle,
  FaCopy,
  FaThumbsUp,
  FaThumbsDown,
  FaUserPlus,
  FaExclamationCircle,
  FaWifi,
  FaFilePdf,
  FaTag,
  FaClipboardList,
  FaCheck,
  FaTimesCircle,
  FaCommentDots,
} from "react-icons/fa";
import toast from "react-hot-toast";

const URLScanner = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [url, setUrl] = useState(() => location.state?.url || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  const { isAuthenticated } = useAuth();
  const { addScan } = useGuest();

  const [showFeedback, setShowFeedback] = useState(false);
  const [scanId, setScanId] = useState("");
  const [feedback, setFeedback] = useState({
    type: "url",
    isAccurate: null,
    comments: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackReply, setFeedbackReply] = useState("");
  const [accuracySubmitted, setAccuracySubmitted] = useState(false);
  const [accuracyError, setAccuracyError] = useState(null);

  const getRiskScoreFromPrediction = (prediction) => {
    if (!prediction) return 50;
    const upper = prediction.toUpperCase().trim();
    switch (upper) {
      case "PHISHING":
      case "DANGEROUS":
      case "MALICIOUS":
        return 85;
      case "SUSPICIOUS":
      case "WARNING":
        return 55;
      case "SAFE":
      case "LEGITIMATE":
        return 15;
      default:
        return 50;
    }
  };

  const processScanResponse = (response, scannedUrl) => {
    const rawPrediction =
      response.overallPrediction || response.prediction || "UNKNOWN";
    const prediction = rawPrediction;

    let riskScore = 50;
    let resultType = "unknown";

    const upperPrediction = prediction.toUpperCase().trim();

    switch (upperPrediction) {
      case "PHISHING":
      case "DANGEROUS":
      case "MALICIOUS":
        riskScore = 85;
        resultType = "phishing";
        break;
      case "SUSPICIOUS":
      case "WARNING":
        riskScore = 55;
        resultType = "suspicious";
        break;
      case "SAFE":
      case "LEGITIMATE":
        riskScore = 15;
        resultType = "safe";
        break;
      default:
        riskScore = 50;
        resultType = "unknown";
    }

    return {
      reference: response.reference,
      url: response.url || scannedUrl,
      prediction: prediction,
      classification: prediction || "UNKNOWN",
      riskScore: riskScore,
      explanation: response.conclusion || "Analysis completed",
      result: resultType,
      scannedAt: response.scannedAt || new Date().toISOString(),
      type: "url",
      content: scannedUrl,
      scanType: response.scanType || "URL",
      phishingReasons: response.phishingReasons || [],
      legitimateReasons: response.legitimateReasons || [],
      conclusion:
        response.conclusion || response.explanation || "Analysis completed",
      overallPrediction: response.overallPrediction || prediction,
      _raw: response,
    };
  };

  const handleScan = async (e) => {
    e.preventDefault();

    if (!url || url.trim() === "") {
      toast.error("Please enter a URL to scan");
      return;
    }

    setLoading(true);
    setError(null);
    setConnectionError(false);
    setShowFeedback(false);
    setFeedbackSubmitted(false);
    setFeedbackReply("");
    setAccuracySubmitted(false);
    setAccuracyError(null);
    setScanId("");
    setFeedback({
      type: "url",
      isAccurate: null,
      comments: "",
    });

    try {
      const response = await scanURL(url);
      console.log("API Response:", response);

      const scanResult = processScanResponse(response, url);
      console.log("Processed Result:", scanResult);
      setResult(scanResult);

      if (!isAuthenticated) {
        addScan({
          ...scanResult,
          type: "url",
          content: url,
        });
      }

      const reference = response.reference || "";
      setScanId(reference);

      setShowFeedback(true);
      setFeedback({
        type: "url",
        isAccurate: null,
        comments: "",
      });

      toast.success("Scan completed successfully!");
    } catch (err) {
      console.error("Scan Error:", err);

      if (
        err.isCorsError ||
        err.message?.includes("CORS") ||
        err.message?.includes("Network")
      ) {
        setConnectionError(true);
        setError("Cannot connect to the server. Please check your connection.");
        toast.error("Connection Error");
      } else {
        const errorMsg = err.message || "Failed to scan URL";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!result || downloading) return;

    if (!isAuthenticated) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    const reference = result.reference;
    if (!reference) {
      toast.error("Scan reference not found");
      return;
    }

    setDownloading(true);
    try {
      const scanDetails = await getScanByReference(reference);
      console.log("Scan Details for PDF:", scanDetails);

      const pdfData = {
        reference: scanDetails.reference,
        url: scanDetails.url || result.url,
        prediction:
          scanDetails.overallPrediction ||
          scanDetails.prediction ||
          result.prediction,
        riskScore:
          result.riskScore ||
          getRiskScoreFromPrediction(
            scanDetails.overallPrediction || scanDetails.prediction,
          ),
        conclusion:
          scanDetails.conclusion || result.conclusion || "Analysis completed",
        scannedAt: scanDetails.scannedAt || result.scannedAt,
        scanType: scanDetails.scanType || "URL",
        overallPrediction:
          scanDetails.overallPrediction ||
          scanDetails.prediction ||
          result.prediction,
        phishingReasons:
          scanDetails.phishingReasons || result.phishingReasons || [],
        legitimateReasons:
          scanDetails.legitimateReasons || result.legitimateReasons || [],
        _raw: scanDetails,
      };

      const { downloadPDF } = await import("../services/pdfGenerator");
      downloadPDF(pdfData, "url");

      toast.success("Report downloaded successfully!");
    } catch (error) {
      console.error("Download Error:", error);
      toast.error(error.message || "Failed to download report");
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("URL copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAccuracySelect = async (isAccurate) => {
    console.log("Scan ID:", scanId);

    if (!scanId || scanId.trim() === "") {
      toast.error("Scan ID not found. Please try scanning again.");
      console.error("Scan ID is null or empty:", scanId);
      return;
    }

    if (feedback.isAccurate === isAccurate) {
      setFeedback({ ...feedback, isAccurate: null });
      setAccuracySubmitted(false);
      setAccuracyError(null);
      return;
    }

    setFeedback({ ...feedback, isAccurate });
    setAccuracyError(null);

    try {
      console.log("Submitting accuracy with:", {
        reference: scanId,
        accurate: isAccurate,
      });

      const response = await submitAccuracy({
        reference: scanId,
        accurate: isAccurate,
      });

      console.log("Accuracy Response:", response);
      setAccuracySubmitted(true);

      if (response?.reply) {
        toast.success(response.reply);
      } else {
        toast.success("Thank you for your feedback!");
      }
    } catch (error) {
      console.error("Accuracy Submit Error:", error);
      setAccuracyError(error.message || "Failed to submit accuracy");
      toast.error(error.message || "Failed to submit accuracy");
      setFeedback({ ...feedback, isAccurate: null });
      setAccuracySubmitted(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();

    if (!feedback.comments || feedback.comments.trim() === "") {
      toast.error("Please write your feedback");
      return;
    }

    setSubmitting(true);

    try {
      const response = await submitFeedbackMessage(feedback.comments);
      console.log("Feedback Message Response:", response);

      if (response?.reply) {
        setFeedbackReply(response.reply);
      }

      setFeedbackSubmitted(true);
      toast.success("Thank you for your feedback!");

      setTimeout(() => {
        setShowFeedback(false);
        setFeedbackSubmitted(false);
        setFeedbackReply("");
      }, 5000);
    } catch (error) {
      console.error("Feedback Submit Error:", error);
      toast.error(error.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const getRiskLevel = (score) => {
    if (score > 70)
      return {
        label: "High Risk",
        color: "#ef4444",
        bg: "var(--danger-soft)",
        border: "#fca5a5",
        Icon: FaExclamationTriangle,
        badge: "Phishing",
      };
    if (score > 30)
      return {
        label: "Medium Risk",
        color: "#f59e0b",
        bg: "var(--warning-soft)",
        border: "#fcd34d",
        Icon: FaExclamationCircle,
        badge: "Suspicious",
      };
    return {
      label: "Low Risk",
      color: "#10b981",
      bg: "var(--success-soft)",
      border: "#6ee7b7",
      Icon: FaCheckCircle,
      badge: "Safe",
    };
  };

  const riskLevel = result ? getRiskLevel(result.riskScore) : null;

  return (
    <div className="page">
      <div className="container">
        {/* Hero */}
        <div className="text-center" style={{ marginBottom: 40 }}>
          <span className="eyebrow">
            <FaShieldAlt /> AI-Powered Security Scanner
          </span>
          <h1
            className="page-title gradient-text"
            style={{ marginTop: 18, fontSize: "clamp(2rem, 5vw, 3rem)" }}
          >
            URL Security Scanner
          </h1>
          <p
            className="text-secondary"
            style={{ maxWidth: 620, margin: "0 auto", fontSize: "1.05rem" }}
          >
            Instantly detect phishing URLs, malicious links, and suspicious
            websites using advanced machine learning.
          </p>
          {!isAuthenticated && (
            <span className="badge badge-neutral" style={{ marginTop: 14 }}>
              <FaUserPlus size={13} /> Guest mode • Sign up to save your scan
              history
            </span>
          )}
        </div>

        {/* Input Card */}
        <div className="card card-pad" style={{ marginBottom: 28 }}>
          <form onSubmit={handleScan}>
            <label className="label" htmlFor="url-input">
              Enter Website URL
            </label>
            <div className="field-with-button">
              <div className="input-wrap search-wrap">
                <FaLink className="input-icon" />
                <input
                  id="url-input"
                  className="input"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com or suspect-website.com"
                  disabled={loading}
                />
                {url && (
                  <button
                    type="button"
                    className="input-affix"
                    onClick={handleCopyUrl}
                    aria-label="Copy URL"
                  >
                    <FaCopy style={{ color: copied ? "#10b981" : undefined }} />
                  </button>
                )}
              </div>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner" aria-hidden="true" /> Scanning...
                  </>
                ) : (
                  <>
                    <FaShieldAlt /> Scan URL
                  </>
                )}
              </button>
            </div>
            <p className="field-hint">
              Supports HTTP, HTTPS, and all standard URL formats
            </p>
          </form>
        </div>

        {/* Connection Error */}
        {connectionError && (
          <div className="alert alert-danger">
            <FaExclamationCircle size={26} />
            <div style={{ flex: 1 }}>
              <div className="alert-title">Connection Error</div>
              <p>
                {error ||
                  "Cannot connect to the server. Please check your connection."}
              </p>
              <button
                className="btn btn-primary btn-sm"
                style={{ marginTop: 12 }}
                onClick={() => {
                  setConnectionError(false);
                  setError(null);
                }}
              >
                <FaWifi /> Try Again
              </button>
            </div>
          </div>
        )}

        {error && !connectionError && (
          <div className="alert alert-danger">
            <FaExclamationTriangle size={20} />
            <p style={{ color: "var(--danger-text)", margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div
            className="result-stack"
            style={{ "--risk-color": riskLevel.color }}
          >
            <div className="result-head">
              <div className="risk-gauge">
                <div className="risk-meta">
                  <span className="risk-label">
                    <riskLevel.Icon size={14} aria-hidden="true" />
                    {riskLevel.label}
                  </span>
                  <h3>{result.prediction || result.classification}</h3>
                </div>
              </div>

              <div className="result-grid">
                <div className="result-tile">
                  <div className="result-tile-head">
                    <div className="result-tile-icon">
                      <FaTag />
                    </div>
                    <div>
                      <h3>Classification</h3>
                      <p>AI-Powered Prediction</p>
                    </div>
                  </div>
                  <div className="result-box" style={{ marginBottom: 14 }}>
                    <span
                      className="result-value"
                      style={{ color: riskLevel.color }}
                    >
                      {result.prediction || result.classification}
                    </span>
                  </div>
                  {result.reference && (
                    <span className="badge badge-neutral">
                      <FaInfoCircle size={13} /> Ref: {result.reference}
                    </span>
                  )}
                </div>

                <div className="result-tile">
                  <div className="result-tile-head">
                    <div className="result-tile-icon">
                      <FaClipboardList />
                    </div>
                    <div>
                      <h3>Analysis Details</h3>
                      <p>Key Indicators</p>
                    </div>
                  </div>
                  <div className="result-box">{result.explanation}</div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  className="btn btn-lg"
                  onClick={handleDownloadReport}
                  disabled={downloading}
                  style={{
                    background: riskLevel.color,
                    color: "#fff",
                    boxShadow: `0 8px 24px ${riskLevel.color}40`,
                  }}
                >
                  {downloading ? (
                    <>
                      <span className="spinner" aria-hidden="true" /> Downloading...
                    </>
                  ) : !isAuthenticated ? (
                    <>
                      <FaUserPlus /> Sign in to Download
                    </>
                  ) : (
                    <>
                      <FaFilePdf /> Download Report
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Reasons */}
            {result.phishingReasons && result.phishingReasons.length > 0 && (
              <div className="reasons-card danger">
                <h4>
                  <FaExclamationTriangle /> Phishing Indicators
                </h4>
                <ul>
                  {result.phishingReasons.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.legitimateReasons &&
              result.legitimateReasons.length > 0 && (
                <div className="reasons-card success">
                  <h4>
                    <FaCheckCircle /> Legitimate Indicators
                  </h4>
                  <ul>
                    {result.legitimateReasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Recommendation */}
            <div className="recommendation">
              <div className="rec-head">
                <div className="rec-icon">
                  <FaShieldAlt />
                </div>
                <div>
                  <h3>Security Recommendation</h3>
                  <p>What you should do next</p>
                </div>
              </div>
              <p>
                {result.riskScore > 70
                  ? "DO NOT proceed to this website. Report this URL to security authorities immediately. This is a confirmed phishing attempt designed to steal your credentials."
                  : result.riskScore > 30
                    ? "Exercise extreme caution. Verify the website's authenticity through official channels before entering any personal information or credentials."
                    : "You can safely proceed. However, always verify the URL matches the official website before entering sensitive information."}
              </p>
            </div>

            {/* Feedback */}
            {showFeedback && !feedbackSubmitted && (
              <div className="feedback-card">
                <div className="feedback-head">
                  <span className="eyebrow">
                    <FaThumbsUp /> Help Us Improve
                  </span>
                  <h3>Was this detection accurate?</h3>
                  <p>Your feedback helps us train better AI models</p>
                  <span className="field-hint">
                    Scan ID: {scanId || "Not set"}
                  </span>
                </div>

                <div className="field">
                  <label className="label">Was the detection accurate?</label>
                  <div className="accuracy-btns">
                    <button
                      type="button"
                      className={`accuracy-btn yes${
                        feedback.isAccurate === true ? " active" : ""
                      }`}
                      onClick={() => handleAccuracySelect(true)}
                    >
                      <FaThumbsUp /> Yes, accurate
                      {feedback.isAccurate === true && (
                        <span className="acc-check">
                          <FaCheck size={11} />
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      className={`accuracy-btn no${
                        feedback.isAccurate === false ? " active" : ""
                      }`}
                      onClick={() => handleAccuracySelect(false)}
                    >
                      <FaThumbsDown /> No, inaccurate
                      {feedback.isAccurate === false && (
                        <span className="acc-check">
                          <FaCheck size={11} />
                        </span>
                      )}
                    </button>
                  </div>
                  {accuracyError && (
                    <p className="text-center" style={{ color: "var(--danger)", fontSize: 12, marginTop: 8 }}>
                      <FaTimesCircle /> {accuracyError}
                    </p>
                  )}
                  {accuracySubmitted && feedback.isAccurate !== null && (
                    <p className="text-center" style={{ color: "var(--success)", fontSize: 12, marginTop: 8 }}>
                      <FaCheck size={11} /> Accuracy feedback submitted
                      successfully
                    </p>
                  )}
                </div>

                <form onSubmit={handleFeedbackSubmit}>
                  <div className="field">
                    <label className="label" htmlFor="fb-comments">
                      Your Feedback *
                    </label>
                    <textarea
                      id="fb-comments"
                      className="textarea"
                      rows="4"
                      value={feedback.comments}
                      onChange={(e) =>
                        setFeedback({ ...feedback, comments: e.target.value })
                      }
                      placeholder="Tell us about your experience... What could we improve?"
                      required
                    />
                    <p className="field-hint text-right" style={{ textAlign: "right" }}>
                      {feedback.comments.length}/500 characters
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-block btn-lg"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner" aria-hidden="true" /> Submitting Feedback...
                      </>
                    ) : (
                      "Submit Feedback"
                    )}
                  </button>
                </form>
              </div>
            )}

            {feedbackSubmitted && (
              <div className="success-card">
                <div className="success-icon">
                  <FaCheckCircle />
                </div>
                <h3>Thank You for Your Feedback!</h3>
                {feedbackReply && (
                  <div
                    className="result-box"
                    style={{ maxWidth: 480, margin: "12px auto 0" }}
                  >
                    <p
                      style={{
                        fontStyle: "italic",
                        margin: 0,
                        display: "flex",
                        gap: 8,
                        alignItems: "flex-start",
                        justifyContent: "center",
                      }}
                    >
                      <FaCommentDots style={{ marginTop: 3 }} />{" "}
                      <span>&ldquo;{feedbackReply}&rdquo;</span>
                    </p>
                  </div>
                )}
                <p style={{ marginTop: 12 }}>
                  Your feedback helps us improve our AI models and make the
                  internet safer for everyone.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default URLScanner;
