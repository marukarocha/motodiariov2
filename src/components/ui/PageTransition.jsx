import React from 'react';
import { motion } from 'framer-motion';

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: '100vw' }} // Entra da direita
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '-100vw' }} // Sai para a esquerda
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
