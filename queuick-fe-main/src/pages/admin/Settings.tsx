import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { adminApi } from "@/features/admin/api";
import type { SmsServiceSettings } from "@/features/admin/types";
import { authApi } from "@/features/user/api";
import { getErrorMessage } from "@/lib/errorUtils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  MessageSquare,
  Clock3,
  BellRing,
  SlidersHorizontal,
  KeyRound,
} from "lucide-react";

type ServiceDraft = {
  sms_enabled: boolean;
  threshold: number;
};

const AdminSettingsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [globalSmsEnabledDraft, setGlobalSmsEnabledDraft] = useState<
    boolean | null
  >(null);
  const [globalThresholdDraft, setGlobalThresholdDraft] = useState<
    number | null
  >(null);
  const [serviceDrafts, setServiceDrafts] = useState<
    Record<number, ServiceDraft>
  >({});

  const [systemDraft, setSystemDraft] = useState<{
    auto_schedule_enabled: boolean;
    opening_time: string;
    shutdown_time: string;
  } | null>(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { data: systemData, isLoading: isLoadingSystem } = useQuery({
    queryKey: ["admin-system-settings"],
    queryFn: adminApi.getSystemSettings,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-sms-settings"],
    queryFn: adminApi.getSmsSettings,
  });

  const currentSystemSettings = systemData?.settings;
  const sysSettings = systemDraft ?? {
    auto_schedule_enabled:
      currentSystemSettings?.auto_schedule_enabled ?? false,
    opening_time: currentSystemSettings?.opening_time ?? "",
    shutdown_time: currentSystemSettings?.shutdown_time ?? "",
  };

  const globalSmsEnabled =
    globalSmsEnabledDraft ?? data?.global.sms_enabled ?? true;
  const globalThreshold = globalThresholdDraft ?? data?.global.threshold ?? 5;

  const services = useMemo(() => data?.per_service ?? [], [data]);

  const handleSystemSettingChange = (
    key: "auto_schedule_enabled" | "opening_time" | "shutdown_time",
    value: boolean | string,
  ) => {
    setSystemDraft((prev) => ({
      ...(prev ?? sysSettings),
      [key]: value,
    }));
  };

  const saveSystemMutation = useMutation({
    mutationFn: adminApi.updateSystemSettings,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-system-settings"],
      });
      setSystemDraft(null);
      toast.success("System settings updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update system settings"));
    },
  });

  const saveGlobalMutation = useMutation({
    mutationFn: adminApi.updateGlobalSmsSettings,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-sms-settings"] });
      setGlobalSmsEnabledDraft(null);
      setGlobalThresholdDraft(null);
      toast.success("Global SMS settings updated");
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, "Failed to update global SMS settings"),
      );
    },
  });

  const saveServiceMutation = useMutation({
    mutationFn: ({
      serviceId,
      payload,
    }: {
      serviceId: number;
      payload: ServiceDraft;
    }) => adminApi.updateServiceSmsSettings(serviceId, payload),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["admin-sms-settings"] });
      setServiceDrafts((current) => {
        const next = { ...current };
        delete next[variables.serviceId];
        return next;
      });
      toast.success("Service SMS settings updated");
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, "Failed to update service SMS settings"),
      );
    },
  });

  const resetServiceMutation = useMutation({
    mutationFn: adminApi.resetServiceSmsSettings,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-sms-settings"] });
      toast.success("Service settings reset to global defaults");
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, "Failed to reset service SMS settings"),
      );
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      toast.success("Password changed successfully. Please login again.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      localStorage.removeItem("ws_access_token");
      window.location.href = "/login";
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to change password"));
    },
  });

  const updateServiceDraft = (
    serviceId: number,
    updater: (current: ServiceDraft) => ServiceDraft,
  ) => {
    const source = services.find((service) => service.service_id === serviceId);
    if (!source) return;

    setServiceDrafts((current) => {
      const base: ServiceDraft = current[serviceId] ?? {
        sms_enabled: source.sms_enabled,
        threshold: source.threshold,
      };

      return {
        ...current,
        [serviceId]: updater(base),
      };
    });
  };

  const getServiceValue = (service: SmsServiceSettings): ServiceDraft =>
    serviceDrafts[service.service_id] ?? {
      sms_enabled: service.sms_enabled,
      threshold: service.threshold,
    };

  const canSaveGlobal = globalThreshold >= 0;
  const canChangePassword =
    oldPassword.trim() !== "" &&
    newPassword.trim() !== "" &&
    confirmPassword.trim() !== "";

  if (isLoading || isLoadingSystem) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#ecffd8_0%,#f7fdf1_26%,#fffef8_58%,#f8fafc_100%)]">
        <div className="container mx-auto flex min-h-[70vh] items-center justify-center p-8">
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-[#2c990f]/15 bg-white/85 px-10 py-8 shadow-[0_20px_50px_rgba(44,153,15,0.10)] backdrop-blur">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2c990f]/15 border-b-[#dcbc34]" />
            <div className="space-y-1 text-center">
              <p className="text-sm font-semibold text-brand-green">
                Loading settings...
              </p>
              <p className="text-xs text-muted-foreground">
                Preparing system and SMS configurations
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#ecffd8_0%,#f7fdf1_26%,#fffef8_58%,#f8fafc_100%)]">
      <div className="mx-auto max-w-6xl space-y-6 p-6 md:p-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(44,153,15,0.18)_0%,rgba(255,255,255,0.96)_42%,rgba(255,248,214,0.96)_76%,rgba(220,188,52,0.18)_100%)] px-6 py-7 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur md:px-8">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.30)_0%,rgba(255,255,255,0.06)_100%)]" />
          <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-[#dff6a8]/50 blur-3xl" />
          <div className="absolute -right-10 -top-8 h-44 w-44 rounded-full bg-brand-green/20 blur-3xl" />
          <div className="absolute -bottom-10 left-20 h-32 w-32 rounded-full bg-[#dcbc34]/25 blur-3xl" />

          <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-brand-green md:text-3xl">
                  Settings
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Configure global system behavior, including SMS notifications
                  and daily schedule.
                </p>
              </div>
            </div>

            <div className="inline-flex items-center rounded-full border border-[#dcbc34]/25 bg-white/80 px-3 py-1 text-xs text-slate-600 shadow-sm">
              System and notification controls
            </div>
          </div>
        </section>

        <Card className="overflow-hidden rounded-[1.75rem] border-0 bg-white/95 shadow-[0_16px_40px_rgba(0,0,0,0.06)] ring-1 ring-[#2c990f]/10">
          <div className="h-1.5 w-full bg-[linear-gradient(90deg,#2c990f_0%,#8fd336_45%,#dcbc34_100%)]" />
          <CardHeader className="bg-[linear-gradient(90deg,rgba(44,153,15,0.08)_0%,rgba(255,255,255,1)_60%,rgba(220,188,52,0.08)_100%)]">
            <CardTitle className="flex items-center gap-2 text-xl text-brand-green">
              <Clock3 className="h-5 w-5 text-[#2c990f]" />
              System Schedule Settings
            </CardTitle>
            <CardDescription>
              Configure daily opening and shutdown times. When enabled,
              ticketing will be paused outside these hours.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-6">
            <div className="rounded-2xl border border-[#2c990f]/10 bg-[linear-gradient(135deg,rgba(44,153,15,0.05)_0%,rgba(255,255,255,1)_70%,rgba(220,188,52,0.06)_100%)] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label
                    htmlFor="system-auto-schedule"
                    className="text-sm font-semibold text-foreground"
                  >
                    Enable Auto Scheduling
                  </Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Limit queuing system availability to a fixed daily window.
                  </p>
                </div>
                <Switch
                  id="system-auto-schedule"
                  checked={sysSettings.auto_schedule_enabled}
                  onCheckedChange={(val) =>
                    handleSystemSettingChange("auto_schedule_enabled", val)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2 rounded-2xl border border-[#2c990f]/10 bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(248,255,243,1)_100%)] p-4">
                <Label htmlFor="system-opening-time">Opening Time</Label>
                <Input
                  id="system-opening-time"
                  type="time"
                  step="1"
                  disabled={!sysSettings.auto_schedule_enabled}
                  value={sysSettings.opening_time}
                  onChange={(e) =>
                    handleSystemSettingChange("opening_time", e.target.value)
                  }
                  className="border-[#2c990f]/15"
                />
              </div>

              <div className="space-y-2 rounded-2xl border border-[#dcbc34]/12 bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(255,251,238,1)_100%)] p-4">
                <Label htmlFor="system-shutdown-time">Shutdown Time</Label>
                <Input
                  id="system-shutdown-time"
                  type="time"
                  step="1"
                  disabled={!sysSettings.auto_schedule_enabled}
                  value={sysSettings.shutdown_time}
                  onChange={(e) =>
                    handleSystemSettingChange("shutdown_time", e.target.value)
                  }
                  className="border-[#dcbc34]/20"
                />
              </div>
            </div>

            <Button
              onClick={() => {
                saveSystemMutation.mutate({
                  auto_schedule_enabled: sysSettings.auto_schedule_enabled,
                  opening_time: sysSettings.opening_time,
                  shutdown_time: sysSettings.shutdown_time,
                });
              }}
              disabled={saveSystemMutation.isPending}
              className="rounded-xl bg-brand-green"
            >
              {saveSystemMutation.isPending
                ? "Saving..."
                : "Save Schedule Settings"}
            </Button>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-[1.75rem] border-0 bg-white/95 shadow-[0_16px_40px_rgba(0,0,0,0.06)] ring-1 ring-[#dcbc34]/12">
          <div className="h-1.5 w-full bg-[linear-gradient(90deg,#2c990f_0%,#8fd336_45%,#dcbc34_100%)]" />
          <CardHeader className="bg-[linear-gradient(90deg,rgba(255,255,255,1)_0%,rgba(255,248,225,1)_100%)]">
            <CardTitle className="flex items-center gap-2 text-xl text-brand-green">
              <BellRing className="h-5 w-5" />
              Global SMS Notification Settings
            </CardTitle>
            <CardDescription>
              These values are used as defaults for all services unless a
              service has custom SMS settings.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-6">
            <div className="rounded-2xl border border-[#dcbc34]/15 bg-[linear-gradient(135deg,rgba(255,250,235,1)_0%,rgba(255,255,255,1)_100%)] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label
                    htmlFor="global-sms-enabled"
                    className="text-sm font-semibold text-foreground"
                  >
                    Enable SMS notifications globally
                  </Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Disable to stop all SMS notifications system-wide.
                  </p>
                </div>
                <Switch
                  id="global-sms-enabled"
                  checked={globalSmsEnabled}
                  onCheckedChange={setGlobalSmsEnabledDraft}
                />
              </div>
            </div>

            <div className="max-w-sm space-y-2 rounded-2xl border border-[#dcbc34]/15 bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(255,251,238,1)_100%)] p-4">
              <Label htmlFor="global-threshold">SMS Queue Threshold</Label>
              <Input
                id="global-threshold"
                type="number"
                min={0}
                value={globalThreshold}
                onChange={(event) =>
                  setGlobalThresholdDraft(Number(event.target.value))
                }
                className="border-[#dcbc34]/20"
              />
              <p className="text-xs text-muted-foreground">
                Send SMS notifications when queue position reaches this
                threshold.
              </p>
            </div>

            <Button
              onClick={() =>
                saveGlobalMutation.mutate({
                  sms_enabled: globalSmsEnabled,
                  threshold: globalThreshold,
                })
              }
              disabled={!canSaveGlobal || saveGlobalMutation.isPending}
              className="rounded-xl bg-brand-green"
            >
              {saveGlobalMutation.isPending
                ? "Saving..."
                : "Save Global Settings"}
            </Button>
          </CardContent>
        </Card>

        <section className="overflow-hidden rounded-[1.75rem] border border-[#2c990f]/10 bg-white/95 shadow-[0_16px_40px_rgba(0,0,0,0.06)]">
          <div className="h-1.5 w-full bg-[linear-gradient(90deg,#2c990f_0%,#8fd336_45%,#dcbc34_100%)]" />

          <div className="p-5 md:p-6">
            <div className="mb-5">
              <h2 className="flex items-center gap-2 text-base font-bold text-brand-green">
                <SlidersHorizontal className="h-4 w-4 text-[#2c990f]" />
                Per-Service SMS Settings
              </h2>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Override global SMS behavior for individual services.
              </p>
            </div>

            <div className="overflow-hidden rounded-4xl border border-[#dcbc34]/10 bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(252,255,247,1)_100%)]">
              <div className="grid grid-cols-[1.2fr_120px_140px_auto] items-center gap-4 bg-[linear-gradient(90deg,rgba(44,153,15,0.05)_0%,rgba(255,255,255,1)_55%,rgba(220,188,52,0.06)_100%)] px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                <span>Service</span>
                <span>SMS Enabled</span>
                <span>Threshold</span>
                <span className="text-right">Actions</span>
              </div>

              {services.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 border-t border-[#2c990f]/8 py-16 text-sm text-muted-foreground">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(44,153,15,0.10)_0%,rgba(220,188,52,0.14)_100%)]">
                    <MessageSquare className="size-8 text-[#2c990f]/55" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-brand-green">
                      No services found.
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      SMS settings will appear here when services are available.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-[#2c990f]/8">
                  {services.map((service) => {
                    const values = getServiceValue(service);

                    return (
                      <div
                        key={service.service_id}
                        className="group grid grid-cols-[1.2fr_120px_140px_auto] items-center gap-4 px-6 py-3.5 transition-all duration-150 hover:bg-[linear-gradient(90deg,rgba(44,153,15,0.04)_0%,rgba(255,255,255,1)_60%,rgba(220,188,52,0.05)_100%)]"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">
                            {service.service_name}
                          </span>
                          {service.using_global && (
                            <Badge
                              variant="secondary"
                              className="border border-[#dcbc34]/20 bg-[#fff7db] text-[10px] uppercase text-[#8c6f00]"
                            >
                              Using global
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Switch
                            checked={values.sms_enabled}
                            onCheckedChange={(checked) =>
                              updateServiceDraft(
                                service.service_id,
                                (current) => ({
                                  ...current,
                                  sms_enabled: checked,
                                }),
                              )
                            }
                          />
                          <span className="text-[11px] font-semibold">
                            <span
                              className={
                                values.sms_enabled
                                  ? "text-emerald-600"
                                  : "text-muted-foreground"
                              }
                            >
                              {values.sms_enabled ? "Enabled" : "Disabled"}
                            </span>
                          </span>
                        </div>

                        <div>
                          <Input
                            type="number"
                            min={0}
                            value={values.threshold}
                            className="h-8 border-[#dcbc34]/20"
                            onChange={(event) =>
                              updateServiceDraft(
                                service.service_id,
                                (current) => ({
                                  ...current,
                                  threshold: Number(event.target.value),
                                }),
                              )
                            }
                          />
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            className="h-8 rounded-lg bg-[linear-gradient(90deg,#2c990f_0%,#38a916_100%)] text-white hover:bg-[#24820c]"
                            onClick={() =>
                              saveServiceMutation.mutate({
                                serviceId: service.service_id,
                                payload: values,
                              })
                            }
                            disabled={
                              values.threshold < 0 ||
                              saveServiceMutation.isPending
                            }
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 rounded-lg border-[#dcbc34]/25 bg-white text-[#8c6f00] hover:bg-[#fff8e8]"
                            onClick={() =>
                              resetServiceMutation.mutate(service.service_id)
                            }
                            disabled={resetServiceMutation.isPending}
                          >
                            Reset
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        <Card className="overflow-hidden rounded-[1.75rem] border-0 bg-white/95 shadow-[0_16px_40px_rgba(0,0,0,0.06)] ring-1 ring-[#2c990f]/10">
          <div className="h-1.5 w-full bg-[linear-gradient(90deg,#2c990f_0%,#8fd336_45%,#dcbc34_100%)]" />
          <CardHeader className="bg-[linear-gradient(90deg,rgba(44,153,15,0.08)_0%,rgba(255,255,255,1)_60%,rgba(220,188,52,0.08)_100%)]">
            <CardTitle className="flex items-center gap-2 text-xl text-brand-green">
              <KeyRound className="h-5 w-5 text-[#2c990f]" />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your admin account password. You will be logged out after a
              successful password change.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2 rounded-2xl border border-[#2c990f]/10 bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(248,255,243,1)_100%)] p-4">
                <Label htmlFor="old-password">Current Password</Label>
                <Input
                  id="old-password"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="border-[#2c990f]/15"
                />
              </div>

              <div className="space-y-2 rounded-2xl border border-[#2c990f]/10 bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(248,255,243,1)_100%)] p-4">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="border-[#2c990f]/15"
                />
              </div>

              <div className="space-y-2 rounded-2xl border border-[#dcbc34]/12 bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(255,251,238,1)_100%)] p-4">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="border-[#dcbc34]/20"
                />
              </div>
            </div>

            <Button
              onClick={() =>
                changePasswordMutation.mutate({
                  old_password: oldPassword,
                  new_password: newPassword,
                  confirm_password: confirmPassword,
                })
              }
              disabled={!canChangePassword || changePasswordMutation.isPending}
              className="rounded-xl bg-[linear-gradient(90deg,#2c990f_0%,#38a916_100%)] text-white shadow-[0_10px_20px_rgba(44,153,15,0.22)] hover:bg-[#24820c]"
            >
              {changePasswordMutation.isPending
                ? "Changing..."
                : "Change Password"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
