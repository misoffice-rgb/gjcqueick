interface QueueManagementHeaderProps {
  serviceLabel: string;
  userName?: string;
  onLogout: () => void;
}

const QueueManagementHeader = ({
  serviceLabel,
  userName,
  onLogout,
}: QueueManagementHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 md:text-3xl">
          Queue Management
        </h1>
        <p className="mt-1 text-sm text-gray-500">{serviceLabel}</p>
      </div>
      <div className="flex items-center gap-4 border-t border-gray-200 pt-4 md:border-none md:pt-0">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-gray-900">{userName}</p>
          <p className="text-xs text-gray-500">Staff Mode</p>
        </div>
        <button
          onClick={onLogout}
          className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-red-50 hover:text-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default QueueManagementHeader;
