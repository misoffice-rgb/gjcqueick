import { ticketApi } from "@/features/tickets/api";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errorUtils";
import type { QueueService } from "@/features/services/types";
import type { TicketGenerationResponse } from "@/features/tickets/types";
import { useQueueWebSocket } from "@/features/shared/hooks/useQueueWebSocket";
import KioskServiceCard from "@/features/tickets/components/KioskServiceCard";
import ConfirmServiceDialog from "@/features/tickets/components/ConfirmServiceDialog";
import TicketReceiptView from "@/features/tickets/components/TicketReceiptView";
import { SplitLayout } from "@/components/layout/SplitLayout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Leaf } from "lucide-react";

const COUNTDOWN_SECONDS = 45;

const TicketGeneration = () => {
  const [ticketData, setTicketData] = useState<TicketGenerationResponse | null>(
    null,
  );
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedService, setSelectedService] = useState<QueueService | null>(
    null,
  );
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [shouldPrint, setShouldPrint] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const queryClient = useQueryClient();

  const handleRealtimeUpdate = useCallback(
    (event: MessageEvent) => {
      if (!event.data) {
        queryClient.invalidateQueries({ queryKey: ["public-services"] });
        return;
      }

      try {
        const payload = JSON.parse(String(event.data));
        if (payload?.type === "dashboard_update") {
          queryClient.invalidateQueries({ queryKey: ["public-services"] });
        }
      } catch {
        queryClient.invalidateQueries({ queryKey: ["public-services"] });
      }
    },
    [queryClient],
  );

  useQueueWebSocket({
    path: "/ws/dashboard/",
    onMessage: handleRealtimeUpdate,
  });

  const { data: servicesData, isLoading } = useQuery({
    queryKey: ["public-services"],
    queryFn: ticketApi.getPublicServices,
  });

  const mutation = useMutation({
    mutationFn: (serviceId: string) => ticketApi.generateTicket(serviceId),
    onSuccess: (data) => {
      setTicketData(data);
      setIsSuccess(true);
      setIsConfirmModalOpen(false);
      toast.success("Ticket generated successfully!");
    },
    onError: (error: any) => {
      toast.error(
        getErrorMessage(error, "Failed to generate ticket. Please try again."),
      );
      setIsConfirmModalOpen(false);
    },
  });

  const handleServiceClick = (service: QueueService) => {
    setSelectedService(service);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmGeneration = () => {
    setIsConfirmModalOpen(false);
    setIsPrintModalOpen(true);
  };

  const handlePrintChoice = (print: boolean) => {
    setShouldPrint(print);
    setIsPrintModalOpen(false);
    if (selectedService && !mutation.isPending) {
      mutation.mutate(String(selectedService.id));
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setTicketData(null);
    setSelectedService(null);
    setShouldPrint(false);
  };

  useEffect(() => {
    if (!isSuccess) {
      return;
    }

    setCountdown(COUNTDOWN_SECONDS);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleReset();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isSuccess]);

  useEffect(() => {
    if (isSuccess && shouldPrint && ticketData) {
      const printTimer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(printTimer);
    }
  }, [isSuccess, shouldPrint, ticketData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isSuccess && ticketData) {
    return (
      <SplitLayout
        leftTitle="QUEUICKLY DONE!"
        leftSubtitle={
          <>
            Your spot is reserved, watch the monitor for updates.
            <br />
            Returning to home in {countdown}{" "}
            {countdown === 1 ? "second" : "seconds"}.
          </>
        }
      >
        <TicketReceiptView
          ticketData={ticketData}
          selectedService={selectedService}
          onReset={handleReset}
        />
      </SplitLayout>
    );
  }

  return (
    <SplitLayout>
      <h2 className="text-center text-2xl font-bold mb-8 uppercase tracking-wide">
        What's your purpose for today?
      </h2>

      <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
        {servicesData?.services?.map((service: QueueService) => (
          <KioskServiceCard
            key={service.id}
            service={service}
            onSelect={handleServiceClick}
          />
        ))}
        {servicesData?.services?.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
            <p className="text-lg text-gray-500 font-medium">
              No services currently available.
            </p>
          </div>
        )}
      </div>

      <ConfirmServiceDialog
        open={isConfirmModalOpen}
        onOpenChange={setIsConfirmModalOpen}
        serviceName={selectedService?.name}
        pending={mutation.isPending}
        onConfirm={handleConfirmGeneration}
      />

      <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
        <DialogContent className="max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl sm:rounded-3xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-semibold text-center text-gray-900">
              How would you like your ticket?
            </DialogTitle>
            <DialogDescription className="text-center text-gray-500 mt-2">
              Choose to print your ticket or save mother nature by taking a
              picture of it.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Button
              className="w-full text-lg h-14 bg-brand-green hover:bg-brand-green/90 text-white rounded-xl flex items-center justify-center gap-2"
              onClick={() => handlePrintChoice(true)}
              disabled={mutation.isPending}
            >
              <Printer className="w-5 h-5" />
              Print Ticket
            </Button>
            <Button
              variant="outline"
              className="w-full text-lg h-14 border-2 border-brand-green text-brand-green hover:bg-green-50 rounded-xl flex items-center justify-center gap-2"
              onClick={() => handlePrintChoice(false)}
              disabled={mutation.isPending}
            >
              <Leaf className="w-5 h-5 flex-shrink-0" />
              Take a Picture (Save Mother Nature)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SplitLayout>
  );
};

export default TicketGeneration;
