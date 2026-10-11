import React from 'react';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaSpinner } from 'react-icons/fa';

const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-premium" style={{ minHeight: '100vh', flexDirection: 'column', gap: '20px' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        style={{ fontSize: '60px', color: '#667eea' }}
      >
        <FaShieldAlt />
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}
      >
        {message}
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
