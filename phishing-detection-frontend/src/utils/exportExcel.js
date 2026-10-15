// utils/exportExcel.js
// Builds a styled, professional .xlsx scan history report.
import * as XLSX from "xlsx-js-style";
import { getFeedbackState, getFeedbackKinds } from "./feedback";
import { formatDate } from "./formatters";

const C = {
  brand: "6366F1",
  brandDark: "4F46E5",
  brandSoft: "EEF2FF",
  info: "DBEAFE",
  infoText: "1D4ED8",
  text: "1E293B",
  muted: "64748B",
  border: "E2E8F0",
  zebra: "F8FAFC",
  white: "FFFFFF",
};

const thin = { style: "thin", color: { rgb: C.border } };
const BORDER = { top: thin, bottom: thin, left: thin, right: thin };
const FONT = { name: "Calibri" };

const HEADERS = [
  "S.No",
  "Reference",
  "Type",
  "Content",
  "Prediction",
  "Feedback",
  "Date",
  "Conclusion",
];

const COL_WIDTHS = [
  { wch: 6 },
  { wch: 22 },
  { wch: 11 },
  { wch: 52 },
  { wch: 14 },
  { wch: 15 },
  { wch: 20 },
  { wch: 46 },
];

const COLS = HEADERS.length;
const HEADER_ROW = 3; // 0-based (after title, subtitle, spacer)

const predictionTone = (p) => {
  const v = (p || "").toUpperCase();
  if (["PHISHING", "DANGEROUS", "MALICIOUS"].includes(v))
    return { bg: "FEE2E2", fg: "B91C1C" };
  if (["SCAM", "SUSPICIOUS", "WARNING"].includes(v))
    return { bg: "FEF3C7", fg: "B45309" };
  if (["SAFE", "LEGITIMATE"].includes(v)) return { bg: "DCFCE7", fg: "15803D" };
  return { bg: "F1F5F9", fg: "475569" };
};

const cellRef = (r, c) => XLSX.utils.encode_cell({ r, c });

const setCell = (ws, r, c, style) => {
  const addr = cellRef(r, c);
  if (!ws[addr]) ws[addr] = { t: "s", v: "" };
  ws[addr].s = style;
};

export const exportScansToExcel = (
  scans = [],
  filename = "secureshield-history.xlsx",
) => {
  const generatedAt = formatDate(new Date());
  const count = scans.length;

  const aoa = [
    ["SecureShield — Scan History"],
    [
      `Generated ${generatedAt}   •   ${count} scan${
        count === 1 ? "" : "s"
      }   •   AI-powered threat intelligence report`,
    ],
    [],
    [...HEADERS],
    ...scans.map((scan, i) => {
      const type =
        scan?.type === "message"
          ? "Message"
          : scan?.type === "url"
            ? "URL"
            : scan?.type || "-";
      const feedback =
        getFeedbackState(scan) === true
          ? `Provided (${
              (getFeedbackKinds(scan) || [])
                .map((k) => (k === "comment" ? "Comment" : "Accuracy"))
                .join(" + ") || "Yes"
            })`
          : "Not provided";
      return [
        i + 1,
        scan?.reference || "-",
        type,
        scan?.content || scan?.url || scan?.message || "-",
        scan?.prediction || scan?.overallPrediction || "UNKNOWN",
        feedback,
        formatDate(
          scan?.scannedAt || scan?.date || scan?.timestamp || Date.now(),
        ),
        scan?.conclusion || scan?._raw?.conclusion || scan?.explanation || "-",
      ];
    }),
  ];

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  ws["!cols"] = COL_WIDTHS;
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: COLS - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: COLS - 1 } },
  ];
  ws["!rows"] = [];
  ws["!rows"][0] = { hpt: 34 };
  ws["!rows"][1] = { hpt: 20 };
  ws["!rows"][2] = { hpt: 8 };
  ws["!rows"][HEADER_ROW] = { hpt: 26 };

  const lastRow = HEADER_ROW + count; // 0-based last data row
  ws["!autofilter"] = {
    ref: `A${HEADER_ROW + 1}:${XLSX.utils.encode_col(COLS - 1)}${lastRow + 1}`,
  };

  const range = XLSX.utils.decode_range(ws["!ref"] || "A1:H1");

  for (let r = range.s.r; r <= range.e.r; r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      // Title banner
      if (r === 0) {
        setCell(ws, r, c, {
          font: { ...FONT, sz: 16, bold: true, color: { rgb: C.white } },
          fill: { patternType: "solid", fgColor: { rgb: C.brand } },
          alignment: { horizontal: "left", vertical: "center", indent: 1 },
        });
        continue;
      }
      // Subtitle bar
      if (r === 1) {
        setCell(ws, r, c, {
          font: { ...FONT, sz: 10, italic: true, color: { rgb: C.muted } },
          fill: { patternType: "solid", fgColor: { rgb: C.brandSoft } },
          alignment: { horizontal: "left", vertical: "center", indent: 1 },
        });
        continue;
      }
      // Spacer
      if (r === 2) {
        setCell(ws, r, c, {
          fill: { patternType: "solid", fgColor: { rgb: C.white } },
        });
        continue;
      }
      // Header row
      if (r === HEADER_ROW) {
        setCell(ws, r, c, {
          font: { ...FONT, sz: 11, bold: true, color: { rgb: C.white } },
          fill: { patternType: "solid", fgColor: { rgb: C.brandDark } },
          alignment: {
            horizontal: "center",
            vertical: "center",
            wrapText: true,
          },
          border: BORDER,
        });
        continue;
      }

      // Data rows
      const zebra = (r - HEADER_ROW) % 2 === 0;
      const value = ws[cellRef(r, c)]?.v ?? "";

      const style = {
        font: { ...FONT, sz: 10, color: { rgb: C.text } },
        fill: {
          patternType: "solid",
          fgColor: { rgb: zebra ? C.zebra : C.white },
        },
        alignment: { horizontal: "left", vertical: "center", wrapText: false },
        border: BORDER,
      };

      if ([0, 2, 4, 5, 6].includes(c)) {
        style.alignment = { ...style.alignment, horizontal: "center" };
      }
      if (c === 3 || c === 7) {
        style.alignment = {
          ...style.alignment,
          wrapText: true,
          vertical: "top",
        };
      }
      if (c === 1) {
        style.font = { ...style.font, bold: true };
      }
      if (c === 2) {
        const isMsg = String(value).toLowerCase() === "message";
        style.fill = {
          patternType: "solid",
          fgColor: { rgb: isMsg ? C.info : C.brandSoft },
        };
        style.font = {
          ...style.font,
          bold: true,
          color: { rgb: isMsg ? C.infoText : C.brandDark },
        };
      }
      if (c === 4) {
        const tone = predictionTone(value);
        style.fill = { patternType: "solid", fgColor: { rgb: tone.bg } };
        style.font = { ...style.font, bold: true, color: { rgb: tone.fg } };
      }
      if (c === 5) {
        const provided = String(value).toLowerCase().startsWith("provided");
        style.fill = {
          patternType: "solid",
          fgColor: { rgb: provided ? "DCFCE7" : "F1F5F9" },
        };
        style.font = {
          ...style.font,
          bold: provided,
          color: { rgb: provided ? "15803D" : "64748B" },
        };
      }

      setCell(ws, r, c, style);
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Scan History");
  XLSX.writeFile(wb, filename, { compression: true });
  return true;
};
