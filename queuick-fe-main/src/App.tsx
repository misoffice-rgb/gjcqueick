import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AuthLayout from "./components/layout/AuthLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminServicesPage from "./pages/admin/Services";
import AdminServiceWindowsPage from "./pages/admin/ServiceWindows";
import AdminStaffPage from "./pages/admin/Staff";
import AdminSettingsPage from "./pages/admin/Settings";
import { Toaster } from "sonner";
import TicketGeneration from "./pages/TicketGeneration";
import TicketStatus from "./pages/TicketStatus";
import Monitoring from "./pages/Monitoring";
import QueueManagement from "./pages/QueueManagement";
import StaffOnboarding from "./pages/StaffOnboarding";
import NotFound from "./pages/NotFound";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ✅ Updated configuration to handle missing backend API data gracefully
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Stop trying to fetch when server is absent
      refetchOnWindowFocus: false,
      throwOnError: false, // Prevent fatal dashboard crashes
    },
    mutations: {
      throwOnError: false,
    }
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public and Open Demo Routes (Isolated from layouts) */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/tickets/:ticketId/status" element={<TicketStatus />} />
            <Route path="/monitoring" element={<Monitoring />} />
            <Route path="/kiosk" element={<TicketGeneration />} />

            {/* OPEN ROUTES WITH SIDEBAR LAYOUT (Dashboard removed from here to prevent crash) */}
            <Route element={<AuthLayout />}>
              <Route path="/admin/services" element={<AdminServicesPage />} />
              <Route
                path="/admin/services/:serviceId/windows"
                element={<AdminServiceWindowsPage />}
              />
              <Route path="/admin/staff" element={<AdminStaffPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
            </Route>

            {/* OPEN ROUTES WITHOUT SIDEBAR LAYOUT */}
            <Route path="/staff/onboarding" element={<StaffOnboarding />} />
            <Route path="/queue-management" element={<QueueManagement />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster duration={3000} />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
