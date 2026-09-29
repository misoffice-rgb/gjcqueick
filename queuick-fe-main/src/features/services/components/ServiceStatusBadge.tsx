import React from "react";

interface ServiceStatusBadgeProps {
  isActive: boolean;
}

const ServiceStatusBadge: React.FC<ServiceStatusBadgeProps> = ({
  isActive,
}) => {
  const badgeClass = isActive
    ? "border border-primary/25 bg-primary/10 text-primary"
    : "border border-border bg-muted text-muted-foreground";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
};

export default ServiceStatusBadge;
