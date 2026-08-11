import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";
import { useToast } from "../../hooks/useToast";
import { useSessionQuery } from "../../hooks/auth/useAuthApi";
import { useAuth } from "../../hooks/auth/useAuth";

export default function SignIn() {
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useAuth();
  const isLoginCallback = searchParams.get("login") === "success";
  const callbackError = searchParams.get("message");

  const sessionQuery = useSessionQuery({
    staleTime: 0,
    refetchOnMount: "always",
  });

  useEffect(() => {
    if (!callbackError) {
      return;
    }

    error("Sign in failed", {
      description: callbackError,
    });
  }, [callbackError, error]);

  useEffect(() => {
    if (!sessionQuery.data || !sessionQuery.error) {
      return;
    }

    error("Sign in failed", {
      description: sessionQuery.error.message,
    });
  }, [sessionQuery.data, sessionQuery.error, error]);

  useEffect(() => {
    if (!sessionQuery.data) {
      return;
    }

    setUser(sessionQuery.data.user);
    success("Sign in successful", {
      description: "You will be redirected to the dashboard shortly.",
    });

    const redirectTimer = window.setTimeout(() => {
      navigate("/dashboard", { replace: true });
    }, 1200);

    return () => window.clearTimeout(redirectTimer);
  }, [isLoginCallback, navigate, sessionQuery.data, setUser, success]);

  useEffect(() => {
    if (!isLoginCallback || !sessionQuery.error) {
      return;
    }

    error("Sign in failed", {
      description: sessionQuery.error.message,
    });
  }, [error, isLoginCallback, sessionQuery.error]);

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
