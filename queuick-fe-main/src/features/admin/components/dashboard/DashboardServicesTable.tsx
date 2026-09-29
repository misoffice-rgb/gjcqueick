import React, { useState } from "react";
import { Eye } from "lucide-react";

import type { AdminAnalyticsService } from "@/features/admin/types";
import type { AnalyticsQueryParams } from "@/features/admin/api";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import WindowAnalyticsModal from "./WindowAnalyticsModal";

interface DashboardServicesTableProps {
  services: AdminAnalyticsService[];
  queryParams?: AnalyticsQueryParams;
}

const DashboardServicesTable: React.FC<DashboardServicesTableProps> = ({
  services,
  queryParams,
}) => {
  const [selectedService, setSelectedService] = useState<{
    id: number;
    name: string;
  } | null>(null);

  if (services.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/70 p-5 text-sm text-muted-foreground">
        No service analytics available for this period.
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader className="bg-primary/5">
          <TableRow>
            <TableHead>Service</TableHead>
            <TableHead>Tickets</TableHead>
            <TableHead>Served</TableHead>
            <TableHead>Waiting</TableHead>
            <TableHead>Serving</TableHead>
            <TableHead>Avg Wait</TableHead>
            <TableHead>Est. Total Wait</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service.service_id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    {service.service_name}
                  </span>
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    {service.prefix}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>{service.tickets}</TableCell>
              <TableCell>{service.served}</TableCell>
              <TableCell>{service.waiting}</TableCell>
              <TableCell>{service.serving}</TableCell>
              <TableCell>
                {service.average_wait_minutes.toFixed(1)} min
              </TableCell>
              <TableCell>{service.estimated_total_wait} min</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setSelectedService({
                      id: service.service_id,
                      name: service.service_name,
                    })
                  }
                  className="text-brand-green hover:text-brand-green/80"
                >
                  <Eye className="mr-1 h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedService && (
        <WindowAnalyticsModal
          serviceId={selectedService.id}
          serviceName={selectedService.name}
          queryParams={queryParams}
          onClose={() => setSelectedService(null)}
        />
      )}
    </>
  );
};

export default DashboardServicesTable;
