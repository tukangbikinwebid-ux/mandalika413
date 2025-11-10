"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const getToastConfig = (type: ToastType) => {
  switch (type) {
    case "success":
      return {
        icon: CheckCircle,
        iconColor: "text-[#C02628]",
        bgColor: "bg-[#C02628]/10",
        borderColor: "border-[#C02628]/30",
        titleColor: "text-[#C02628]",
        descriptionColor: "text-[#C02628]/80",
        iconBg: "bg-[#C02628]/15",
      };
    case "error":
      return {
        icon: XCircle,
        iconColor: "text-red-500",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        titleColor: "text-red-900",
        descriptionColor: "text-red-700",
        iconBg: "bg-red-100",
      };
    case "warning":
      return {
        icon: AlertTriangle,
        iconColor: "text-yellow-500",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        titleColor: "text-yellow-900",
        descriptionColor: "text-yellow-700",
        iconBg: "bg-yellow-100",
      };
    case "info":
      return {
        icon: Info,
        iconColor: "text-blue-500",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        titleColor: "text-blue-900",
        descriptionColor: "text-blue-700",
        iconBg: "bg-blue-100",
      };
    default:
      return {
        icon: Info,
        iconColor: "text-gray-500",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200",
        titleColor: "text-gray-900",
        descriptionColor: "text-gray-700",
        iconBg: "bg-gray-100",
      };
  }
};

export const ToastComponent: React.FC<ToastProps> = ({ toast, onClose }) => {
  const config = getToastConfig(toast.type);
  const IconComponent = config.icon;
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());

  // Auto close after duration with pause on hover
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const duration = toast.duration;

      const updateProgress = () => {
        if (!isPaused) {
          const now = Date.now();
          const deltaTime = now - lastUpdateTime;
          setLastUpdateTime(now);

          setProgress((prev) => {
            const progressDecrement = (deltaTime / duration) * 100;
            const newProgress = Math.max(0, prev - progressDecrement);

            if (newProgress <= 0) {
              // Defer the onClose call to avoid updating state during render
              setTimeout(() => onClose(toast.id), 0);
            }

            return newProgress;
          });
        }
      };

      const interval = setInterval(updateProgress, 16); // 60fps
      return () => clearInterval(interval);
    }
  }, [toast.duration, toast.id, onClose, isPaused, lastUpdateTime]);

  // Handle hover events
  const handleMouseEnter = (e: React.MouseEvent) => {
    // Don't trigger hover if clicking on close button
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    setIsHovered(true);
    setIsPaused(true);
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    // Don't trigger leave if moving to close button
    if ((e.relatedTarget as HTMLElement)?.closest("button")) {
      return;
    }
    setIsHovered(false);
    setIsPaused(false);
    setLastUpdateTime(Date.now());
  };

  // Handle close button click
  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Close button clicked for toast:", toast.id);
    onClose(toast.id);
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: 400,
        scale: 0.8,
        rotateY: 15,
      }}
      animate={{
        opacity: 1,
        x: 0,
        scale: 1,
        rotateY: 0,
        transition: {
          type: "spring",
          stiffness: 260,
          damping: 20,
          mass: 0.6,
          duration: 0.6,
        },
      }}
      exit={{
        opacity: 0,
        x: 400,
        scale: 0.8,
        rotateY: -15,
        transition: {
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        },
      }}
      whileHover={{
        scale: 1.02,
        y: -3,
        rotateY: 2,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 25,
          duration: 0.2,
        },
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        relative w-full p-4 rounded-xl shadow-lg border
        ${config.bgColor} ${config.borderColor}
        backdrop-blur-sm transition-all duration-300 ease-out
        ${isHovered ? "shadow-2xl" : "shadow-lg"}
        toast-item
      `}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <motion.div
          className={`
          flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
          ${config.iconBg}
        `}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.2 }}
        >
          <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-semibold ${config.titleColor} mb-1`}>
            {toast.title}
          </h4>
          {toast.description && (
            <p className={`text-sm ${config.descriptionColor}`}>
              {toast.description}
            </p>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          onMouseDown={handleClose}
          className={`
            flex-shrink-0 p-1 rounded-full hover:bg-black/5 transition-all duration-200
            ${config.titleColor} hover:opacity-70 hover:scale-110 hover:rotate-90
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300
            cursor-pointer
          `}
          type="button"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar for auto-close */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 rounded-b-xl overflow-hidden">
          <motion.div
            className={`
              h-full rounded-b-xl toast-progress
              ${
                toast.type === "success"
                  ? "bg-[#C02628]"
                  : toast.type === "error"
                  ? "bg-red-500"
                  : toast.type === "warning"
                  ? "bg-yellow-500"
                  : "bg-blue-500"
              }
            `}
            style={{
              width: `${progress}%`,
              transformOrigin: "left center",
            }}
            animate={{
              width: `${progress}%`,
            }}
            transition={{
              duration: 0.016, // 60fps
              ease: "linear",
            }}
          />
        </div>
      )}
    </motion.div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onClose,
}) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] w-full max-w-sm space-y-3 toast-container">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast, index) => (
          <motion.div
            key={toast.id}
            layout
            initial={{
              opacity: 0,
              y: -100,
              scale: 0.8,
              rotateX: -15,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              rotateX: 0,
            }}
            exit={{
              opacity: 0,
              y: -100,
              scale: 0.8,
              rotateX: 15,
            }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 25,
              mass: 0.7,
              delay: index * 0.08,
              duration: 0.5,
            }}
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
          >
            <ToastComponent toast={toast} onClose={onClose} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};