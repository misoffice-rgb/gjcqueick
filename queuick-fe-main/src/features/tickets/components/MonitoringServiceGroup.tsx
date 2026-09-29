import type { DashboardServiceDetail } from "../types";
import MonitoringServiceRow from "./MonitoringServiceRow";

interface MonitoringServiceGroupProps {
  service: DashboardServiceDetail;
}

const MonitoringServiceGroup = ({ service }: MonitoringServiceGroupProps) => {
  const currentlyServingRows = (service.currently_serving || []).map(
    (window) => ({
      ticket_number: window.ticket_number,
      window_name: window.window_name,
      window_number: window.window_number,
    }),
  );

  const windowsFromStatus = (service.windows || [])
    .map((windowStatus) => {
      const serving = windowStatus.currently_serving;
      if (!serving) return null;

      const ticketNumber =
        typeof serving === "string"
          ? serving
          : serving.ticket_number || serving.display_number;

      if (!ticketNumber) return null;

      return {
        ticket_number: ticketNumber,
        window_name: windowStatus.name,
        window_number: windowStatus.number,
      };
    })
    .filter((row): row is NonNullable<typeof row> => !!row);

  const servingWindows =
    currentlyServingRows.length > 0 ? currentlyServingRows : windowsFromStatus;

  if (servingWindows.length === 0) {
    return null;
  }

  return (
    <>
      {servingWindows.map((windowData, index) => (
        <div
          key={`${service.id}-${windowData.window_number || index}`}
          className="w-full max-w-105 rounded-[2rem] bg-white px-6 py-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)] flex flex-col justify-between"
        >
          <div className="text-center">
            <p className="mb-4 text-[0.95rem] uppercase tracking-[0.22em] text-black/80">
              Now Serving
            </p>

            <h2 className="mb-1 font-mono text-[3rem] font-bold leading-none text-[#19670A]">
              {windowData.ticket_number}
            </h2>
          </div>

          <div className="mt-8 rounded-full bg-[#2faa10] px-6 py-5 text-white shadow-md">
            <MonitoringServiceRow
              windowData={{
                ...windowData,
                serviceId: service.id,
                serviceName: service.name,
              }}
            />
          </div>
        </div>
      ))}
    </>
  );
};

export default MonitoringServiceGroup;
