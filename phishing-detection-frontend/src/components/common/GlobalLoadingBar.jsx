// components/common/GlobalLoadingBar.jsx
import React, { useEffect, useState } from "react";
import { getInFlight, subscribeToLoading } from "../../services/loadingTracker";

const GlobalLoadingBar = () => {
  const [count, setCount] = useState(getInFlight());
  const [slow, setSlow] = useState(false);

  useEffect(() => subscribeToLoading(setCount), []);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setSlow(true), 3000);
      return () => clearTimeout(timer);
    }
    setSlow(false);
    return undefined;
  }, [count]);

  const active = count > 0;

  return (
    <>
      <div
        className={`global-loading-bar${active ? " active" : ""}`}
        role="progressbar"
        aria-hidden={!active}
        aria-label="Loading"
      >
        <div className="global-loading-bar-inner" />
      </div>

      {active && slow && (
        <div className="global-loading-hint" role="status" aria-live="polite">
          <span className="spinner spinner-sm" aria-hidden="true" />
          <span>Waking up the secure server…</span>
        </div>
      )}
    </>
  );
};

export default GlobalLoadingBar;
