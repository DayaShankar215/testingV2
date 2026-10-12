import React, { useState } from "react";
import {
  FaExclamationTriangle,
  FaHome,
  FaSync,
  FaChevronLeft,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      );
    }
    return this.props.children;
  }
}

const ErrorFallback = ({ error, errorInfo, onReset }) => {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  const goHome = () => {
    onReset();
    navigate("/");
  };

  const getErrorMessage = () => {
    if (error?.message) return error.message;
    if (error?.status)
      return `HTTP ${error.status}: ${error.statusText || "Error"}`;
    if (errorInfo?.componentStack?.length) {
      const componentName = errorInfo.componentStack.match(/in (\w+)/)?.[1];
      return componentName
        ? `Error in ${componentName} component`
        : "Unknown error";
    }
    return "Something went wrong. Please try again.";
  };

  return (
    <div className="container">
      <div className="error-fallback">
        <div className="empty-icon danger">
          <FaExclamationTriangle />
        </div>
        <h1 className="page-title" style={{ fontSize: "2rem" }}>
          Something went wrong
        </h1>
        <p className="text-muted" style={{ maxWidth: 480 }}>
          {getErrorMessage()}
        </p>
        <p className="text-muted" style={{ maxWidth: 480, fontSize: "0.9rem" }}>
          You can try again or return to the dashboard to continue using the
          application.
        </p>

        {errorInfo?.componentStack && (
          <div style={{ width: "100%", maxWidth: 620, marginTop: 20 }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              <FaChevronLeft
                style={{
                  transform: showDetails ? "rotate(90deg)" : "rotate(-90deg)",
                  transition: "transform 0.3s",
                }}
              />
              {showDetails ? "Hide Error Details" : "Show Error Details"}
            </button>

            {showDetails && (
              <pre className="code-block">
                <div className="code-label">Component Stack:</div>
                {errorInfo.componentStack}
                <div className="code-label" style={{ marginTop: 12 }}>
                  Error:
                </div>
                {error?.stack}
              </pre>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 justify-center" style={{ marginTop: 24 }}>
          <button className="btn btn-primary" onClick={onReset}>
            <FaSync /> Try Again
          </button>
          <button className="btn btn-secondary" onClick={goHome}>
            <FaHome /> Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;
