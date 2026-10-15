// utils/exportCsv.js
import { getFeedbackState } from "./feedback";

const escapeCell = (value) => {
  if (value === null || value === undefined) return "";
  const str = String(value).replace(/\r?\n|\r/g, " ").replace(/"/g, '""');
  return /[",\t]/.test(str) ? `"${str}"` : str;
};

export const scansToCsv = (scans = []) => {
  const headers = [
    "Reference",
    "Type",
    "Content",
    "Prediction",
    "Feedback",
    "Date",
  ];

  const rows = scans.map((scan) => [
    scan.reference || "",
    scan.type || "",
    scan.content || scan.url || scan.message || "",
    scan.prediction || scan.overallPrediction || "",
    getFeedbackState(scan) === true ? "Provided" : "Not provided",
    scan.scannedAt || scan.date || scan.timestamp || "",
  ]);

  return [headers, ...rows]
    .map((row) => row.map(escapeCell).join(","))
    .join("\r\n");
};

export const downloadCsv = (csv, filename = "secureshield-history.csv") => {
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportScansToCsv = (scans, filename) => {
  if (!scans || scans.length === 0) return false;
  downloadCsv(scansToCsv(scans), filename);
  return true;
};
