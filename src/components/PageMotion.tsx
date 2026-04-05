import { motion } from 'motion/react';
import { type ReactNode } from 'react';

/**
 * Wraps a page with a consistent entrance animation.
 * Use this instead of copy-pasting motion.div in every page.
 */
export function PageMotion({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default PageMotion;
