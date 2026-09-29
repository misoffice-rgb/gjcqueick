import { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { useStaffWindowStore } from "@/store/staffWindowStore";
import { authApi } from "@/features/user/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { SplitLayout } from "@/components/layout/SplitLayout";

interface LoginFormInputs {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>();
  const { checkAuth, isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      const response = await authApi.login(data);

      if (response.success) {
        if (response.access) {
          localStorage.setItem("ws_access_token", response.access);
        }

        toast.success(response.message || "Login successful!");
        await checkAuth(); // Refresh global auth state

        // Store service data from login response for staff users
        if (response.service) {
          useStaffWindowStore.getState().setServiceInfo(response.service);
        }

        // Redirect back to previous page or default
        const nextPath =
          from || (response.service ? "/staff/onboarding" : "/dashboard");
        navigate(nextPath, { replace: true });
      } else {
        toast.error(response?.message || "Login failed");
      }
    } catch (error: any) {
      console.log(error.response?.data?.message);
      const data = error.response?.data;
      if (data?.errors) {
        Object.keys(data.errors).forEach((key) => {
          const errorMessage = Array.isArray(data.errors[key])
            ? data.errors[key][0]
            : data.errors[key];

          if (key === "username" || key === "password") {
            setError(key as keyof LoginFormInputs, {
              type: "manual",
              message: errorMessage,
            });
          } else {
            // Map other schema errors (e.g. non_field_errors) to root
            setError("root", {
              type: "manual",
              message: errorMessage,
            });
          }
        });
      }

      const fallbackError =
        data?.message || data?.detail || "An error occurred during login";
      if (!data?.errors || Object.keys(data.errors).length === 0) {
        setError("root", {
          type: "manual",
          message: fallbackError,
        });
      }

      toast.error(fallbackError);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      // If staff window store has service info, user is staff
      const hasService = useStaffWindowStore.getState().serviceInfo;
      const nextPath =
        from || (hasService ? "/staff/onboarding" : "/dashboard");
      navigate(nextPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate, from]);

  return (
    <SplitLayout
      leftTitle={
        <>
          WELCOME,
          <br />
          STAFF!
        </>
      }
      leftSubtitle="Let's get you queued up."
    >
      <div className="w-full">
        <div className="space-y-1 mb-8 text-center">
          <h2 className="text-3xl font-black uppercase text-gray-900 tracking-wide">
            Welcome back
          </h2>
          <p className="text-sm text-gray-500">
            Enter your credentials to log into your account.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="username"
              className="text-sm font-medium text-gray-700"
            >
              Username
            </Label>
            <Input
              id="username"
              placeholder="Enter your username"
              className="h-12 border-gray-300 rounded-xl px-4 py-2"
              {...register("username", {
                required: "Username is required",
              })}
            />
            {errors.username && (
              <p className="text-sm text-red-500 font-medium">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </Label>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="h-12 border-gray-300 rounded-xl px-4 py-2"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && (
              <p className="text-sm text-red-500 font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          {errors.root && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600 font-medium text-center">
                {errors.root.message}
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold bg-brand-green hover:bg-brand-green/90 text-white rounded-xl shadow-md"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging In..." : "Log In"}
          </Button>
        </form>
      </div>
    </SplitLayout>
  );
};

export default Login;
