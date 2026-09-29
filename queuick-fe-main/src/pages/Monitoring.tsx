import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Volume2, VolumeX, PlayCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react"; // ✅ ADDED
import { ticketApi } from "@/features/tickets/api";
import { useCurrentTime } from "@/features/shared/hooks/useCurrentTime";
import { useQueueWebSocket } from "@/features/shared/hooks/useQueueWebSocket";
import MonitoringServiceGroup from "@/features/tickets/components/MonitoringServiceGroup";
import { useTicketAnnouncer } from "@/features/tickets/hooks/useTicketAnnouncer";
import { Button } from "@/components/ui/button";

const Monitoring = () => {
  const currentTime = useCurrentTime();
  const [audioEnabled, setAudioEnabled] = useState(false);
  const queryClient = useQueryClient();

  const handleRealtimeUpdate = useCallback(
    (event: MessageEvent) => {
      if (!event.data) {
        queryClient.invalidateQueries({ queryKey: ["dashboard-status"] });
        return;
      }

      try {
        const payload = JSON.parse(String(event.data));

        if (payload?.type === "dashboard_update" && payload?.data) {
          queryClient.setQueryData(["dashboard-status"], payload.data);
          return;
        }
      } catch {
        // fallback
      }

      queryClient.invalidateQueries({ queryKey: ["dashboard-status"] });
    },
    [queryClient],
  );

  useQueueWebSocket({
    path: "/ws/dashboard/",
    onMessage: handleRealtimeUpdate,
  });

  const enableAudio = () => {
    setAudioEnabled(true);
    const utterance = new SpeechSynthesisUtterance("");
    window.speechSynthesis.speak(utterance);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-status"],
    queryFn: ticketApi.getDashboardStatus,
  });

  useTicketAnnouncer(audioEnabled ? data?.services : undefined);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#f6f8f5]">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-[#19670A]" />
      </div>
    );
  }

  const allServices = data?.services || [];

  const activeServices = allServices.filter((service) => {
    const hasCurrentlyServing = (service.currently_serving || []).length > 0;

    const hasWindowServing = (service.windows || []).some((windowStatus) => {
      const serving = windowStatus.currently_serving;
      if (!serving) return false;

      if (typeof serving === "string") {
        return Boolean(serving);
      }

      return Boolean(serving.ticket_number || serving.display_number);
    });

    return hasCurrentlyServing || hasWindowServing;
  });

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f3f6f2]">
      <section className="hidden h-full sm:w-[40%] lg:block">
        <div className="relative h-full w-full bg-black">
          <video
            className="h-full w-full object-cover"
            src={
              "https://res.cloudinary.com/dar5mfo5u/video/upload/v1774602951/queuick-video-bg_cbew9y.mp4"
            }
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent" />
        </div>
      </section>

      <section className="relative flex h-full w-full flex-col overflow-hidden sm:w-[60%]">
        <header className="shrink-0 border-b border-[#19670A]/15 bg-white/95 shadow-sm">
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex w-full items-center justify-between gap-3">
              <div className="flex flex-row items-center gap-4 text-right">
                <p className="hidden text-xs font-medium text-[#19670A]/80 md:block">
                  {currentTime.toLocaleDateString([], {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p className="font-mono text-xl font-bold leading-none text-[#19670A]">
                  {currentTime.toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {!audioEnabled ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={enableAudio}
                  className="h-7 border-[#19670A]/25 px-2 text-xs text-[#19670A] hover:bg-[#19670A]/5"
                >
                  <VolumeX className="mr-1 h-3 w-3" />
                  Enable Audio
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAudioEnabled(false)}
                  className="h-7 border-[#19670A]/25 px-2 text-xs text-[#19670A] hover:bg-[#19670A]/5"
                >
                  <Volume2 className="mr-1 h-3 w-3" />
                  Audio On
                </Button>
              )}
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col overflow-y-auto p-4 pb-14">
          {activeServices.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-2xl border border-[#19670A]/10 bg-white shadow-sm">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#19670A]/8">
                  <PlayCircle className="h-8 w-8 text-[#19670A]/40" />
                </div>
                <p className="text-lg font-semibold text-[#19670A]/70">
                  No active queues
                </p>
              </div>
            </div>
          ) : (
            <div className="grid content-start grid-cols-1 gap-4 md:grid-cols-2">
              {activeServices.map((service) => (
                <MonitoringServiceGroup key={service.id} service={service} />
              ))}
            </div>
          )}
        </main>

        {/* ✅ QR CODE (ADDED ONLY, NOTHING REMOVED) */}
        <div className="absolute bottom-16 right-4 z-30 rounded-xl bg-white p-2 shadow-lg">
          <QRCodeSVG
            value="https://queuick-demo.vercel.app/monitoring"
            size={100}
            bgColor="#ffffff"
            fgColor="#19670A"
            level="M"
          />
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden border-t border-[#19670A]/15 bg-[#19670A] py-2 shadow-lg">
          <div className="ticker-track">
            <div className="ticker-group">
              <span>Lets go na sa GJC •</span>
              <span>School na may puso •</span>
              <span>Lets go na sa GJC •</span>
              <span>School na may puso •</span>
              <span>Lets go na sa GJC •</span>
              <span>School na may puso •</span>
            </div>

            <div className="ticker-group" aria-hidden="true">
              <span>Lets go na sa GJC •</span>
              <span>School na may puso •</span>
              <span>Lets go na sa GJC •</span>
              <span>School na may puso •</span>
              <span>Lets go na sa GJC •</span>
              <span>School na may pusa •</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Monitoring;
