// components/common/Skeleton.jsx
import React from "react";

const Skeleton = ({ className = "", style, width, height }) => (
  <div
    className={`skeleton ${className}`.trim()}
    style={{
      width: width || undefined,
      height: height || undefined,
      ...style,
    }}
    aria-hidden="true"
  />
);

export default Skeleton;
