import { useEffect } from "react";
import type { UserError } from "../utils/errorMessages";
import "./ErrorNotification.css";

interface ErrorNotificationProps {
  error: UserError | null;
  onDismiss: () => void;
  autoHideDuration?: number; // milliseconds
}

export function ErrorNotification({
  error,
  onDismiss,
  autoHideDuration = 5000,
}: ErrorNotificationProps) {
  useEffect(() => {
    if (error && autoHideDuration > 0) {
      const timer = setTimeout(onDismiss, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [error, autoHideDuration, onDismiss]);

  if (!error) return null;

  return (
    <div className="error-notification" role="alert" aria-live="assertive">
      <div className="error-notification-content">
        <div className="error-notification-header">
          <span className="error-notification-icon">⚠️</span>
          <strong className="error-notification-title">{error.title}</strong>
          <button
            className="error-notification-close"
            onClick={onDismiss}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
        <p className="error-notification-message">{error.message}</p>
      </div>
    </div>
  );
}
