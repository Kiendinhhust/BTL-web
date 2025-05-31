import React, { useState, useEffect, useCallback, useRef } from "react";
import "./CustomToast.scss";

const CustomToast = ({
  message,
  type = "info",
  duration = 3000,
  onClose,
  position = "top-right",
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const timerRef = useRef(null);
  const animationTimeoutRef = useRef(null);

  // Memoize handleClose để tránh re-render không cần thiết
  const handleClose = useCallback(() => {
    if (isClosing) return; // Tránh gọi nhiều lần

    setIsClosing(true);

    // Clear timer nếu đang chạy
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Đợi animation hoàn thành rồi mới gọi onClose
    animationTimeoutRef.current = setTimeout(() => {
      if (onClose && typeof onClose === "function") {
        onClose();
      }
    }, 300); // Thời gian animation
  }, [isClosing, onClose]);

  // Effect để tự động đóng toast
  useEffect(() => {
    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        handleClose();
      }, duration);
    }

    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [duration, handleClose]);

  // Memoize icon để tránh tính toán lại
  const getIcon = useCallback(() => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      case "info":
        return "ℹ";
      default:
        return "ℹ";
    }
  }, [type]);

  const icon = getIcon();

  return (
    <div
      className={`custom-toast ${type} ${position} ${
        isClosing ? "closing" : ""
      }`}
      style={{ "--duration": `${duration}ms` }}
    >
      <div className="toast-icon">{icon}</div>
      <div className="toast-message">{message}</div>
      <button
        className="toast-close"
        onClick={handleClose}
        type="button"
        aria-label="Đóng thông báo"
      >
        ×
      </button>
    </div>
  );
};

export default CustomToast;
