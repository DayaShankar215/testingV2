// utils/feedback.js
// Tracks which scans have received feedback so the History page can flag them.
// Two kinds of feedback are tracked per scan reference:
//   - "accuracy": the accurate / inaccurate buttons
//   - "comment":  the free-text feedback form
// Feedback is recorded locally on submission, and we also defensively read
// common backend feedback fields if the API returns them.

const STORAGE_KEY = "scan_feedback";

const readStore = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

// Normalize legacy boolean entries into a { accuracy, comment } object.
const normalize = (entry) => {
  if (entry === true) return { accuracy: true };
  if (entry === false || entry === undefined || entry === null) return {};
  if (typeof entry === "object") return { ...entry };
  return {};
};

// kind: "accuracy" | "comment". For "accuracy", `accurate` is optional metadata.
// For "comment", `text` stores the submitted comment body.
export const recordFeedback = (
  reference,
  kind = "accuracy",
  accurate,
  text,
) => {
  if (!reference) return;
  try {
    const map = readStore();
    const entry = normalize(map[reference]);
    if (kind === "comment") {
      entry.comment = true;
      if (text) entry.commentText = text;
    } else {
      entry.accuracy = accurate === undefined ? true : accurate;
    }
    map[reference] = entry;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore storage failures (private mode, quota, etc.)
  }
};

// Returns the raw normalized feedback entry for a reference (local only).
export const getLocalFeedback = (reference) => {
  if (!reference) return undefined;
  const entry = readStore()[reference];
  return entry === undefined ? undefined : normalize(entry);
};

// Returns the list of feedback kinds recorded locally for a reference.
export const getLocalFeedbackKinds = (reference) => {
  const entry = getLocalFeedback(reference) || {};
  const kinds = [];
  if (entry.accuracy !== undefined) kinds.push("accuracy");
  if (entry.comment) kinds.push("comment");
  return kinds;
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
  return getLocalFeedbackKinds(scan?.reference).length > 0 ? true : undefined;
};

// Returns the kinds of feedback given: sub-array of ["accuracy", "comment"].
export const getFeedbackKinds = (scan) => {
  const local = getLocalFeedbackKinds(scan?.reference);
  if (local.length > 0) return local;

  const raw = scan?._raw || scan || {};
  for (const field of BACKEND_FIELDS) {
    const state = coerce(raw[field]);
    if (state !== undefined) return state ? ["accuracy"] : [];
  }
  return [];
};

export const feedbackKindLabel = (kind) =>
  kind === "comment" ? "Comment" : "Accuracy";

// Returns the free-text feedback comment for a scan, if available.
// Checks the local record first, then common backend fields.
export const getFeedbackComment = (scan) => {
  const raw = scan?._raw || scan || {};

  const candidates = [
    raw.feedbackComment,
    raw.comment,
    raw.userFeedback?.comment,
    raw.feedback?.comment,
    raw.feedback?.message,
    raw.message2,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim();
  }

  const local = getLocalFeedback(scan?.reference);
  if (local?.commentText) return local.commentText;
  return "";
};

// Returns the accuracy feedback for a scan: true (accurate), false
// (inaccurate), or null when none.
export const getFeedbackAccuracy = (scan) => {
  const raw = scan?._raw || scan || {};

  const candidates = [
    raw.isAccurate,
    raw.accurate,
    raw.feedback?.accurate,
    raw.userFeedback?.accurate,
  ];
  for (const c of candidates) {
    if (typeof c === "boolean") return c;
  }

  const local = getLocalFeedback(scan?.reference);
  if (local && typeof local.accuracy === "boolean") return local.accuracy;
  return null;
};

