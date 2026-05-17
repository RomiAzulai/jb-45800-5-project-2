interface StatusPanelProps {
  message: string;
  className?: string;
}

function StatusPanel({ message, className }: StatusPanelProps) {
  return <div className={["status-panel", className].filter(Boolean).join(" ")}>{message}</div>;
}

export default StatusPanel;
