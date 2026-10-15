// utils/feedback.js
// Tracks which scans have received accuracy feedback so the History page can
// flag them. Feedback is recorded locally whenever the user submits it, and we
// also defensively read common backend feedback fields if the API returns them.

const STORAGE_KEY = "scan_feedback";

const readStore = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

// Record feedback for a scan reference. `accurate` is optional metadata.
export const recordFeedback = (reference, accurate) => {
  if (!reference) return;
  try {
    const map = readStore();
    map[reference] = accurate === undefined ? true : accurate;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore storage failures (private mode, quota, etc.)
  }
};

export const getLocalFeedback = (reference) => {
  if (!reference) return undefined;
  const map = readStore();
  return map[reference];
};

// Backend field names that may indicate feedback was provided.
const BACKEND_FIELDS = [
  "hasFeedback",
  "feedbackProvided",
  "feedbackReceived",
  "userFeedback",
  "feedback",
  "isAccurate",
  "accuracy",
];

const coerce = (value) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "boolean") return value;
  if (typeof value === "object") {
    if (typeof value.accurate === "boolean") return value.accurate;
    if (typeof value.hasFeedback === "boolean") return value.hasFeedback;
    // Any non-empty feedback object means feedback was provided.
    return Object.keys(value).length > 0;
  }
  if (typeof value === "string") {
    const s = value.toLowerCase().trim();
    if (["true", "yes", "accurate", "provided", "given"].includes(s))
      return true;
    if (["false", "no", "inaccurate", "none", "not provided"].includes(s))
      return false;
  }
  return undefined;
};

// Returns true/false when known, or undefined when no feedback info exists.
export const getFeedbackState = (scan) => {
  const raw = scan?._raw || scan || {};
  for (const field of BACKEND_FIELDS) {
    const state = coerce(raw[field]);
    if (state !== undefined) return state;
  }
  return getLocalFeedback(scan?.reference);
};
