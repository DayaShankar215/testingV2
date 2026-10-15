import React from "react";
import {
  FaExclamationTriangle,
  FaExclamationCircle,
  FaCheckCircle,
} from "react-icons/fa";
import { getRiskLevel } from "../../utils/formatters";

const toneFor = (score) => {
  const value = Number(score) || 0;
  if (value > 70) return "danger";
  if (value > 30) return "warning";
  return "success";
};

const iconFor = (tone) => {
  if (tone === "danger") return <FaExclamationTriangle />;
  if (tone === "warning") return <FaExclamationCircle />;
  return <FaCheckCircle />;
};

const RiskBadge = ({ score, size = "medium", showScore = true }) => {
  const { label } = getRiskLevel(score);
  const tone = toneFor(score);

  return (
    <span className={`badge badge-${tone} badge-${size}`}>
      <span aria-hidden="true">{iconFor(tone)}</span>
      <span>{label}</span>
      {showScore && <strong>{Math.round(Number(score) || 0)}%</strong>}
    </span>
  );
};

export default RiskBadge;
