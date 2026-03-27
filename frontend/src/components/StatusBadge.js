const STATUS_MAP = {
  pending:   "badge-warning",
  confirmed: "badge-success",
  cancelled: "badge-danger",
  paid:      "badge-success",
  failed:    "badge-danger",
};

const StatusBadge = ({ status }) => (
  <span className={`badge ${STATUS_MAP[status?.toLowerCase()] || "badge-gray"}`}>
    {status || "—"}
  </span>
);

export default StatusBadge;