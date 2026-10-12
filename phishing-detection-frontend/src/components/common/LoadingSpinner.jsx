import React from "react";
import { ThreeDots } from "react-loader-spinner";

const LoadingSpinner = ({ text = "Loading..." }) => {
  return (
    <div className="loading" role="status" aria-live="polite">
      <ThreeDots
        height="64"
        width="64"
        color="#6366f1"
        ariaLabel="loading"
        visible={true}
      />
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
