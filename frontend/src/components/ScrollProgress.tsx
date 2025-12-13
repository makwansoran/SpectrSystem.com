/**
 * Scroll Progress Indicator
 * Shows a progress bar at the top indicating scroll position
 */

import { motion, useScroll } from 'framer-motion';

const ScrollProgress: React.FC = () => {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      style={{
        scaleX: scrollYProgress,
        position: 'fixed',
        top: '80px', // Below navbar (h-20 = 80px)
        left: 0,
        right: 0,
        height: '5px',
        originX: 0,
        backgroundColor: '#ffffff',
        zIndex: 40, // Below navbar (z-50)
      }}
    />
  );
};

export default ScrollProgress;

