import React from "react";
import type {
  Control,
  FieldErrors,
  SubmitHandler,
  UseFormHandleSubmit,
  UseFormRegister,
} from "react-hook-form";
import { Controller } from "react-hook-form";

import type { ServiceFormValues } from "@/features/services/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ServiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  register: UseFormRegister<ServiceFormValues>;
  handleSubmit: UseFormHandleSubmit<ServiceFormValues>;
  onSubmit: SubmitHandler<ServiceFormValues>;
  control: Control<ServiceFormValues>;
  errors: FieldErrors<ServiceFormValues>;
  isSubmitting: boolean;
}

const ServiceFormDialog: React.FC<ServiceFormDialogProps> = ({
  open,
  onOpenChange,
  isEditing,
  register,
  handleSubmit,
  onSubmit,
  control,
  errors,
  isSubmitting,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Service" : "Create New Service"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Service Name</Label>
            <Input
              id="name"
              {...register("name", { required: "Name is required" })}
              placeholder="e.g., General Inquiry"
            />
            {errors.name && (
              <span className="text-xs text-destructive">
                {errors.name.message}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              {...register("description")}
              placeholder="Short service description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prefix">Prefix</Label>
              <Input
                id="prefix"
                {...register("prefix", { required: "Prefix is required" })}
                className="uppercase"
                placeholder="e.g., A, CS"
                maxLength={5}
              />
              {errors.prefix && (
                <span className="text-xs text-destructive">
                  {errors.prefix.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="average_service_time">Avg Time (min)</Label>
              <Input
                id="average_service_time"
                type="number"
                min="1"
                {...register("average_service_time", {
                  valueAsNumber: true,
                })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between py-1">
            <Controller
              name="is_active"
              control={control}
              render={({ field: { value, onChange, ...field } }) => {
                const statusText = value ? "Active" : "Inactive";

                return (
                  <div className="flex items-center">
                    <Label htmlFor="is_active" className="mr-2 cursor-pointer">
                      Service Status
                    </Label>
                    <Switch
                      id="is_active"
                      className="h-6 w-11"
                      checked={value}
                      onCheckedChange={onChange}
                      {...field}
                    />
                    <span
                      className={`ml-2 text-xs font-semibold ${
                        value ? "text-emerald-600" : "text-muted-foreground"
                      }`}
                    >
                      {statusText}
                    </span>
                  </div>
                );
              }}
            />
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Service"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceFormDialog;
