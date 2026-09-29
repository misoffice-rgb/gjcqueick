import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
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

            <Route
              path="/kiosk"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <TicketGeneration />
                </ProtectedRoute>
              }
            />

            {/* Authenticated routes WITH sidebar layout (Admin only) */}
            <Route
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AuthLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin/services" element={<AdminServicesPage />} />
              <Route
                path="/admin/services/:serviceId/windows"
                element={<AdminServiceWindowsPage />}
              />
              <Route path="/admin/staff" element={<AdminStaffPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
            </Route>

            {/* Authenticated routes WITHOUT sidebar layout (Staff only) */}
            <Route
              path="/staff/onboarding"
              element={
                <ProtectedRoute allowedRoles={["admin", "staff"]}>
                  <StaffOnboarding />
                </ProtectedRoute>
              }
            />
            <Route
              path="/queue-management"
              element={
                <ProtectedRoute allowedRoles={["admin", "staff"]}>
                  <QueueManagement />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster duration={3000} />
        </Router>
      </AuthProvider>

      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
};

export default App;
