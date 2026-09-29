import React from "react";
import type {
  Control,
  FieldErrors,
  SubmitHandler,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";

import { serviceApi } from "@/features/services/api";
import type { StaffFormValues } from "@/features/admin/types";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface StaffFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  register: UseFormRegister<StaffFormValues>;
  handleSubmit: UseFormHandleSubmit<StaffFormValues>;
  onSubmit: SubmitHandler<StaffFormValues>;
  errors: FieldErrors<StaffFormValues>;
  watch: UseFormWatch<StaffFormValues>;
  setValue: UseFormSetValue<StaffFormValues>;
  control: Control<StaffFormValues>;
  isSubmitting?: boolean;
}

const StaffFormDialog: React.FC<StaffFormDialogProps> = ({
  open,
  onOpenChange,
  isEditing,
  register,
  handleSubmit,
  onSubmit,
  errors,
  watch,
  setValue,
  control,
  isSubmitting = false,
}) => {
  const [wantsPasswordChange, setWantsPasswordChange] =
    React.useState(!isEditing);

  React.useEffect(() => {
    if (open) {
      setWantsPasswordChange(!isEditing);

      if (!isEditing) {
        setValue("password", "");
        setValue("password2", "");
      }
    }
  }, [open, isEditing, setValue]);

  const showPasswordFields = !isEditing || wantsPasswordChange;

  const { data: servicesData, isLoading: isServicesLoading } = useQuery({
    queryKey: ["services"],
    queryFn: serviceApi.getAllServices,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Staff Member" : "Add New Staff Member"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              {...register("username", { required: "Username is required" })}
            />
            {errors.username && (
              <p className="text-sm text-destructive">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="service_id">Assigned Service</Label>
            <Controller
              control={control}
              name="service_id"
              rules={{ required: "Assigned service is required" }}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value || undefined}
                >
                  <SelectTrigger
                    disabled={isServicesLoading}
                    className="w-full"
                  >
                    <SelectValue
                      placeholder={
                        isServicesLoading ? "Loading..." : "Select a service"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {servicesData?.services?.map((service) => (
                      <SelectItem
                        key={service.id}
                        value={service.id.toString()}
                      >
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.service_id && (
              <p className="text-sm text-destructive">
                {errors.service_id.message}
              </p>
            )}
          </div>

          {showPasswordFields && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">
                  {isEditing ? "New Password" : "Password"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password", {
                    required: showPasswordFields
                      ? "Password is required"
                      : false,
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                    validate: showPasswordFields
                      ? {
                          notEntirelyNumeric: (value?: string) =>
                            !value ||
                            !/^\d+$/.test(value) ||
                            "Password can't be entirely numeric",
                          notTooCommon: (value?: string) => {
                            if (!value) return true;
                            const common = [
                              "password",
                              "12345678",
                              "123456789",
                              "1234567890",
                              "qwerty123",
                              "password1",
                              "abc12345",
                              "iloveyou",
                              "admin123",
                              "letmein12",
                            ];
                            return (
                              !common.includes(value.toLowerCase()) ||
                              "This password is too common"
                            );
                          },
                        }
                      : undefined,
                  })}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password2">
                  {isEditing ? "Confirm New Password" : "Confirm Password"}
                </Label>
                <Input
                  id="password2"
                  type="password"
                  {...register("password2", {
                    required: showPasswordFields
                      ? "Please confirm your password"
                      : false,
                    validate: (value?: string) => {
                      if (!showPasswordFields) return true;
                      const password = watch("password");
                      return value === password || "Passwords do not match";
                    },
                  })}
                />
                {errors.password2 && (
                  <p className="text-sm text-destructive">
                    {errors.password2.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {isEditing && (
            <div className="flex items-center gap-2 py-1">
              <Checkbox
                id="change_password"
                checked={wantsPasswordChange}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  const checked = event.target.checked;
                  setWantsPasswordChange(checked);

                  if (!checked) {
                    setValue("password", "");
                    setValue("password2", "");
                  }
                }}
              />
              <Label htmlFor="change_password" className="cursor-pointer">
                Change password
              </Label>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEditing
                  ? wantsPasswordChange
                    ? "Save Changes & Reset Password"
                    : "Save Changes"
                  : "Create Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StaffFormDialog;