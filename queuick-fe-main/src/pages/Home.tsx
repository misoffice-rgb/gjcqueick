import { Link } from "react-router-dom";
import { Ticket, Monitor, LogIn, LogOut } from "lucide-react";
import { SplitLayout } from "@/components/layout/SplitLayout";
import { useAuthStore } from "@/store/authStore";

const Home = () => {
  const { isAuthenticated, logout } = useAuthStore();

  return (
    <SplitLayout>
      <Link to="/kiosk" className="block focus:outline-none">
        <button className="w-full flex items-center p-6 md:p-8 bg-white border border-gray-200 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-200 active:scale-[0.98] text-left group">
          <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[linear-gradient(135deg,rgba(44,153,15,0.14)_0%,rgba(255,255,255,1)_100%)] shadow-sm ring-1 ring-[#2c990f]/10 flex items-center justify-center mr-6  transition-colors">
            <Ticket
              className="w-8 h-8 md:w-10 md:h-10 text-brand-green"
              strokeWidth={2.5}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-1 uppercase tracking-wide group-hover:text-brand-green transition-colors">
              GET A TICKET
            </h3>
            <p className="text-sm md:text-base text-gray-500">
              Tap here to generate your queue ticket.
            </p>
          </div>
        </button>
      </Link>

      <Link to="/monitoring" className="block focus:outline-none">
        <button className="w-full flex items-center p-6 md:p-8 bg-white border border-gray-200 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-200 active:scale-[0.98] text-left group">
          <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[linear-gradient(135deg,rgba(44,153,15,0.14)_0%,rgba(255,255,255,1)_100%)] shadow-sm ring-1 ring-[#2c990f]/10 flex items-center justify-center mr-6  transition-colors">
            <Monitor
              className="w-8 h-8 md:w-10 md:h-10 text-brand-green"
              strokeWidth={2.5}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-1 uppercase tracking-wide group-hover:text-brand-green transition-colors">
              VIEW MONITOR
            </h3>
            <p className="text-sm md:text-base text-gray-500">
              Check current queue status and updates.
            </p>
          </div>
        </button>
      </Link>

      {isAuthenticated && (
        <Link to="/dashboard" className="block focus:outline-none">
          <button className="w-full flex items-center p-6 md:p-8 bg-white border border-gray-200 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-200 active:scale-[0.98] text-left group">
            <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-brand-green/20 flex items-center justify-center mr-6  transition-colors">
              <Monitor
                className="w-8 h-8 md:w-10 md:h-10 text-brand-green"
                strokeWidth={2.5}
              />
            </div>
            <div className="flex-1">
              <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-1 uppercase tracking-wide group-hover:text-brand-green transition-colors">
                VIEW DASHBOARD
              </h3>
              <p className="text-sm md:text-base text-gray-500">
                View Dashboard
              </p>
            </div>
          </button>
        </Link>
      )}

      <div className="absolute bottom-4 right-4 z-50">
        {isAuthenticated ? (
          <button
            onClick={logout}
            className=" p-2 hover:p-3 bg-brand-green text-white rounded-full hover:bg-brand-green/95 shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition-all duration-200"
            title="Logout"
          >
            <LogOut className="size-4" />
          </button>
        ) : (
          <Link
            to="/login"
            className=" p-2 hover:p-3 block bg-brand-green text-white rounded-full hover:bg-brand-green/95 shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition-all duration-200"
            title="Staff Login"
          >
            <LogIn className="size-4" />
          </Link>
        )}
      </div>
    </SplitLayout>
  );
};

export default Home;
