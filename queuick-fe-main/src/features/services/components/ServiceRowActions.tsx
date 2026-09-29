import React from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

interface ServiceRowActionsProps {
  serviceId: number;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

const ServiceRowActions: React.FC<ServiceRowActionsProps> = ({
  serviceId,
  onEdit,
  onDelete,
  isDeleting,
}) => {
  return (
    <div className="inline-flex gap-1.5">
      <Link to={`/admin/services/${serviceId}/windows`}>
        <Button
          variant="outline"
          size="sm"
          className="border-border/80 bg-transparent hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
        >
          Windows
        </Button>
      </Link>

      <Button
        variant="ghost"
        size="sm"
        className="text-foreground/70 hover:bg-primary/10 hover:text-primary"
        onClick={onEdit}
      >
        Edit
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="text-foreground/60 hover:bg-muted hover:text-foreground"
        onClick={onDelete}
        disabled={isDeleting}
      >
        Delete
      </Button>
    </div>
  );
};

export default ServiceRowActions;
