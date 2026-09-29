import { formatWindowLabel } from "@/lib/windowLabel";

interface MonitoringServiceRowProps {
  windowData: {
    ticket_number: string;
    window_name?: string;
    window_number?: number;
    serviceId: number;
    serviceName: string;
  };
}

const MonitoringServiceRow = ({ windowData }: MonitoringServiceRowProps) => {
  const servingWindow = formatWindowLabel(windowData);

  return (
    <div className="flex items-center justify-center">
      <span className="text-xl font-extrabold text-white">{servingWindow}</span>
    </div>
  );
};

export default MonitoringServiceRow;
