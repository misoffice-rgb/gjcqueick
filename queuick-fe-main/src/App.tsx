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

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />

            <Route
              path="/tickets/:ticketId/status"
              element={<TicketStatus />}
            />
            <Route path="/monitoring" element={<Monitoring />} />

            {/* Unprotected Kiosk Demo */}
            <Route path="/kiosk" element={<TicketGeneration />} />

            {/* OPEN ROUTES WITH SIDEBAR LAYOUT (Bypassed Protection for Demo) */}
            <Route element={<AuthLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin/services" element={<AdminServicesPage />} />
              <Route
                path="/admin/services/:serviceId/windows"
                element={<AdminServiceWindowsPage />}
              />
              <Route path="/admin/staff" element={<AdminStaffPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
            </Route>

            {/* OPEN ROUTES WITHOUT SIDEBAR LAYOUT (Bypassed Protection for Demo) */}
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
