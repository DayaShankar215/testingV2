import React from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground = () => {
  return (
    <div className="animated-bg">
      <motion.div
        className="circle"
        style={{
          width: '300px',
          height: '300px',
          top: '-150px',
          left: '-150px',
          background: 'rgba(102, 126, 234, 0.08)',
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      <motion.div
        className="circle"
        style={{
          width: '200px',
          height: '200px',
          bottom: '-100px',
          right: '-100px',
          background: 'rgba(118, 75, 162, 0.08)',
        }}
        animate={{
          x: [0, -80, 0],
          y: [0, -30, 0],
          scale: [1, 1.3, 1],
          rotate: [0, -180, -360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
