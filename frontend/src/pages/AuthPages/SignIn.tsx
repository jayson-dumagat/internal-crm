import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";
import AuthToast from "../../components/auth/AuthToast";
import { getCurrentSession } from "../../api/auth";
import { useAuthStore } from "../../stores/authStore";

export default function SignIn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);
  const isLoginCallback = searchParams.get("login") === "success";
  const callbackError = searchParams.get("message");

  const sessionQuery = useQuery({
    queryKey: ["auth", "session"],
    queryFn: getCurrentSession,
    staleTime: 0,
    refetchOnMount: "always",
  });

  useEffect(() => {
    if (!callbackError) {
      return;
    }

    toast.custom((toastId) => (
      <AuthToast
        toastId={toastId}
        variant="error"
        title="Sign in failed"
        description={callbackError}
      />
    ), {
      id: "sign-in-error",
      duration: 5000,
    });
  }, [callbackError]);

  useEffect(() => {
    if (!sessionQuery.data) {
      return;
    }

    setUser(sessionQuery.data.user);
    toast.custom((toastId) => (
      <AuthToast
        toastId={toastId}
        variant="success"
        title={
          isLoginCallback
            ? "Logged in successfully"
            : "You are already logged in, redirecting..."
        }
      />
    ), {
      id: "sign-in-success",
      duration: 4000,
    });

    const redirectTimer = window.setTimeout(() => {
      navigate("/dashboard", { replace: true });
    }, 1200);

    return () => window.clearTimeout(redirectTimer);
  }, [isLoginCallback, navigate, sessionQuery.data, setUser]);

  useEffect(() => {
    if (!isLoginCallback || !sessionQuery.error) {
      return;
    }

    toast.custom((toastId) => (
      <AuthToast
        toastId={toastId}
        variant="error"
        title="Sign in could not be completed"
        description={sessionQuery.error.message}
      />
    ), {
      id: "sign-in-session-error",
      duration: 5000,
    });
  }, [isLoginCallback, sessionQuery.error]);

  return (
    <>
      <PageMeta
        title="CDEX Sign in | Caballes-Go Securities, Inc."
        description="This is React.js SignIn Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <AuthLayout>
        <SignInForm isCompletingSignIn={isLoginCallback && sessionQuery.isPending} />
      </AuthLayout>
    </>
  );
}
