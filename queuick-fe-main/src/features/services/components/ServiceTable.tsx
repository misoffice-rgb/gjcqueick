import React from "react";
import { Briefcase } from "lucide-react";

import type { QueueService } from "@/features/services/types";
import ServiceStatusBadge from "./ServiceStatusBadge";
import ServiceRowActions from "./ServiceRowActions";

interface ServiceTableProps {
  services: QueueService[];
  onEdit: (service: QueueService) => void;
  onDelete: (service: QueueService) => void;
  isDeleting: boolean;
}

const GRID_COLS =
  "grid grid-cols-[1.2fr_80px_100px_100px_auto] min-w-[800px] items-center gap-4 px-6";

const ColumnHeaders = () => (
  <div
    className={`${GRID_COLS} py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60`}
  >
    <span>Service</span>
    <span>Prefix</span>
    <span>Avg Time</span>
    <span>Status</span>
    <span className="text-right">Actions</span>
  </div>
);

const ServiceTable: React.FC<ServiceTableProps> = ({
  services,
  onEdit,
  onDelete,
  isDeleting,
}) => {
  if (services.length === 0) {
    return (
      <div className="w-full overflow-x-auto rounded-2xl border border-border/50 bg-card">
        <div className="min-w-[800px]">
          <ColumnHeaders />
          <div className="flex flex-col items-center justify-center gap-2 border-t border-border/30 py-16 text-sm text-muted-foreground">
            <Briefcase className="size-10 text-muted-foreground/30" />
            No services found. Create one to get started.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-border/50 bg-card">
      <div className="min-w-[800px]">
        <ColumnHeaders />
        <div className="divide-y divide-border/30">
          {services.map((service) => (
            <div
              key={service.id}
              className={`group ${GRID_COLS} py-3.5 transition-colors duration-150 hover:bg-muted/40`}
            >
              <span className="text-sm font-medium text-foreground">
                {service.name}
              </span>

              <span className="text-sm font-mono text-muted-foreground">
                {service.prefix}
              </span>

              <span className="text-sm text-muted-foreground">
                {service.average_service_time} min
              </span>

              <div>
                <ServiceStatusBadge isActive={service.is_active} />
              </div>

              <div className="flex justify-end">
                <ServiceRowActions
                  serviceId={service.id}
                  onEdit={() => onEdit(service)}
                  onDelete={() => onDelete(service)}
                  isDeleting={isDeleting}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceTable;
