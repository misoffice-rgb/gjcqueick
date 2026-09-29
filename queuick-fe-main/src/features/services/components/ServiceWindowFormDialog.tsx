import { Controller } from "react-hook-form";
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

interface ServiceWindowFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  register: any;
  handleSubmit: any;
  onSubmit: (data: any) => void;
  control: any;
  errors: any;
}

const ServiceWindowFormDialog = ({
  open,
  onOpenChange,
  isEditing,
  register,
  handleSubmit,
  onSubmit,
  control,
  errors,
}: ServiceWindowFormDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Window" : "Add New Window"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Window Name</Label>
            <Input
              id="name"
              placeholder="e.g. Counter 1"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <span className="text-sm text-destructive">
                {errors.name.message as string}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="window_number">Window Number</Label>
              <Input
                id="window_number"
                type="number"
                {...register("window_number", {
                  required: "Number is required",
                  min: 1,
                })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="Location or spec"
              {...register("description")}
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <Controller
              name="status"
              control={control}
              render={({ field: { value, onChange } }) => {
                const isActive = value === "active";

                return (
                  <div className="flex items-center">
                    <Label htmlFor="status" className="mr-2 cursor-pointer">
                      Window Status
                    </Label>
                    <Switch
                      id="status"
                      className="h-6 w-11"
                      checked={isActive}
                      onCheckedChange={(checked) =>
                        onChange(checked ? "active" : "inactive")
                      }
                    />
                    <span
                      className={`ml-2 text-xs font-semibold ${
                        isActive ? "text-emerald-600" : "text-muted-foreground"
                      }`}
                    >
                      {isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                );
              }}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">{isEditing ? "Update" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceWindowFormDialog;
