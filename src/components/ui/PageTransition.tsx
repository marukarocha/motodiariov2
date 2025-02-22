'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface PageTransitionProps {
    children: React.ReactNode;
  }
  
  const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
    const router = useRouter();
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : router.pathname || '/';
  
    const container = {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: 0.05, // Stagger delay between children's animations
          delayChildren: 0.15,   // Delay before children's animations start
        },
      },
    };
  
    const item = {
      hidden: { opacity: 0, y: 20 }, // Start children slightly faded and moved down
      show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeInOut' } }, // Animate children to fade in and slide up
    };
  
    return (
      <motion.main
        key={currentPath}
        variants={container} // Apply container variants
        initial="hidden"
        animate="show"
        exit="hidden" // Optional exit animation - can be customized
        transition={{ duration: 0.25, ease: "easeInOut" }} // Transition for the container itself (can be adjusted)
        className="transition-all duration-300"
      >
        {/* Animate children with item variants */}
        {React.Children.map(children, (child, index) => (
          <motion.div key={index} variants={item}>
            {child}
          </motion.div>
        ))}
      </motion.main>
    );
  };
  
  export default PageTransition;
  