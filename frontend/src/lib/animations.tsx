import React from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, MotionValue } from "framer-motion";

// ── Easing presets ──────────────────────────────────────────────────
export const EASE = [0.16, 1, 0.3, 1] as const;
export const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as const;

// ── Shared variants ─────────────────────────────────────────────────

export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const staggerContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.04, delayChildren: 0.02 } },
  exit: {},
};

export const cardVariants = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: EASE },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2 },
  },
};

export const itemVariants = {
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: EASE } },
  exit: { opacity: 0, x: -4, transition: { duration: 0.15 } },
};

export const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const scaleVariants = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: EASE } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

// ── Animated wrappers ───────────────────────────────────────────────

interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedPage: React.FC<AnimatedPageProps> = ({ children, className }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.35, ease: EASE }}
    className={className}
  >
    {children}
  </motion.div>
);

interface StaggerGroupProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const StaggerGroup: React.FC<StaggerGroupProps> = ({ children, className, delay = 0 }) => (
  <motion.div
    variants={staggerContainer}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ delayChildren: delay }}
    className={className}
  >
    {children}
  </motion.div>
);

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  hoverScale?: number;
  hoverY?: number;
  onClick?: () => void;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className,
  hover = false,
  hoverScale = 1.01,
  hoverY = -2,
  onClick,
}) => (
  <motion.div
    variants={cardVariants}
    whileHover={
      hover
        ? { scale: hoverScale, y: hoverY, transition: { duration: 0.2, ease: EASE_OUT } }
        : undefined
    }
    onClick={onClick}
    className={className}
  >
    {children}
  </motion.div>
);

interface AnimatedItemProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedItem: React.FC<AnimatedItemProps> = ({ children, className }) => (
  <motion.div variants={itemVariants} className={className}>
    {children}
  </motion.div>
);

// ── Animated number (count-up) ──────────────────────────────────────

interface AnimatedNumberProps {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  suffix = "",
  prefix = "",
  decimals = 0,
  className,
}) => {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 1200, bounce: 0 });

  React.useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  const display = useTransform(spring, (latest) =>
    `${prefix}${latest.toFixed(decimals)}${suffix}`
  );

  return <motion.span className={className}>{display}</motion.span>;
};

// ── Animated overlay/modal ───────────────────────────────────────────

interface AnimatedOverlayProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  side?: "center" | "right" | "bottom";
}

export const AnimatedOverlay: React.FC<AnimatedOverlayProps> = ({
  children,
  isOpen,
  onClose,
  className,
  side = "center",
}) => {
  const panelVariants = {
    center: { initial: { opacity: 0, scale: 0.96, y: 10 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.96, y: 10 } },
    right: { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } },
    bottom: { initial: { y: "100%", opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: "100%", opacity: 0 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex"
          style={{ justifyContent: side === "right" ? "flex-end" : side === "bottom" ? "center" : "center", alignItems: side === "bottom" ? "flex-end" : side === "center" ? "center" : "stretch" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            variants={panelVariants[side]}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: EASE }}
            className={className}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ── Re-export for convenience ────────────────────────────────────────
export { motion, AnimatePresence };
export type { MotionValue };
