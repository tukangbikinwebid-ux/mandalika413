import { motion } from "framer-motion";
import { AlertCircle, X } from "lucide-react";
import { useState } from "react";

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export const ErrorMessage = ({ message, onDismiss, className = "" }: ErrorMessageProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm flex items-center gap-2 ${className}`}
    >
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button
          onClick={handleDismiss}
          className="text-red-300 hover:text-red-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
};
