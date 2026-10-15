// services/loadingTracker.js
// Lightweight global request tracker used to drive the top loading bar.
let inFlight = 0;
const listeners = new Set();

export const getInFlight = () => inFlight;

export const subscribeToLoading = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

const emit = () => {
  const snapshot = inFlight;
  listeners.forEach((fn) => {
    try {
      fn(snapshot);
    } catch {
      // ignore listener errors
    }
  });
};

export const startLoading = () => {
  inFlight += 1;
  emit();
};

export const stopLoading = () => {
  inFlight = Math.max(0, inFlight - 1);
  emit();
};

export const resetLoading = () => {
  inFlight = 0;
  emit();
};
