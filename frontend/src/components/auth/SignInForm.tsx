import { useState } from "react";
import { Link } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { EyeCloseIcon, EyeIcon, MicrosoftIcon } from "../../icons";
import {
  microsoftSignInSchema,
  signInSchema,
  type MicrosoftSignInValues,
  type SignInValues,
} from "../../validations/auth";
import { useMicrosoftSignIn } from "../../hooks/auth/useAuthApi";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { useToast } from "../../hooks/useToast";

interface SignInFormProps {
  isCompletingSignIn?: boolean;
}

export default function SignInForm({
  isCompletingSignIn = false,
}: SignInFormProps) {
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const microsoftSignInForm = useForm<MicrosoftSignInValues>({
    resolver: zodResolver(microsoftSignInSchema),
    defaultValues: {},
  });
  const passwordSignInForm = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "", keepLoggedIn: false },
  });
  const microsoftSignIn = useMicrosoftSignIn();

  const handleMicrosoftSignIn = microsoftSignInForm.handleSubmit(() => {
    microsoftSignIn.mutate();
  });

  const handlePasswordSignIn = passwordSignInForm.handleSubmit(() => {
    toast.error("Password sign-in is unavailable. Use your CGSI Microsoft Account.");
  });

  return (
    <div className="w-full max-w-md">
      {isCompletingSignIn && (
        <div
          role="status"
          className="mb-5 flex items-center gap-3 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-400"
        >
          <span
            aria-hidden="true"
            className="size-4 animate-spin rounded-full border-2 border-brand-200 border-t-brand-500"
          />
          Signing in...
        </div>
      )}
      <div className="mb-8 text-center lg:text-left">
        <h1 className="mb-3 text-title-sm font-semibold text-gray-800 sm:text-title-md dark:text-white/90">
          Sign In
        </h1>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Sign in using your CGSI Microsoft Account to access CDEX.
        </p>
      </div>
      <div>
        <form
          onSubmit={handleMicrosoftSignIn}
          className="grid grid-cols-1 gap-3 sm:grid-cols-1 sm:gap-5"
        >
          <button
            type="submit"
            disabled={microsoftSignIn.isPending}
            className="inline-flex items-center justify-center gap-3 rounded-lg bg-gray-100 px-7 py-3 text-sm font-normal text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
          >
            {microsoftSignIn.isPending ? (
              <span
                aria-hidden="true"
                className="size-5 animate-spin rounded-full border-2 border-gray-300 border-t-brand-500 dark:border-gray-600 dark:border-t-brand-400"
              />
            ) : (
              <MicrosoftIcon />
            )}

            {microsoftSignIn.isPending
              ? "Redirecting to Microsoft..."
              : "Sign in with Microsoft"}
          </button>
        </form>
        <div className="space-y-5">
          {microsoftSignIn.error && (
            <div
              role="alert"
              className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400"
            >
              {microsoftSignIn.error.message}
            </div>
          )}
          <div className="relative py-3 sm:py-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white p-2 text-gray-400 sm:px-5 sm:py-2 dark:bg-gray-900">
                Or
              </span>
            </div>
          </div>
          <form onSubmit={handlePasswordSignIn} noValidate>
            <div className="space-y-5 sm:space-y-6">
              <div>
                <Label>
                  Email <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="email"
                  placeholder="john.doe@caballes-go.com"
                  {...passwordSignInForm.register("email")}
                  error={Boolean(passwordSignInForm.formState.errors.email)}
                  hint={passwordSignInForm.formState.errors.email?.message}
                  maxLength={320}
                />
              </div>

              <div>
                <Label>
                  Password <span className="text-error-500">*</span>
                </Label>

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...passwordSignInForm.register("password")}
                    error={Boolean(passwordSignInForm.formState.errors.password)}
                    hint={passwordSignInForm.formState.errors.password?.message}
                    maxLength={128}
                  />

                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-4 z-30 -translate-y-1/2 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                    ) : (
                      <EyeCloseIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                    )}
                  </span>
                </div>
              </div>

              <div className="flex flex-row justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={isChecked}
                    onChange={(checked) => {
                      setIsChecked(checked);
                      passwordSignInForm.setValue("keepLoggedIn", checked, {
                        shouldValidate: true,
                      });
                    }}
                  />
                  <span className="block text-theme-sm font-normal text-gray-700 dark:text-gray-400">
                    Keep me logged in
                  </span>
                </div>

                <Link
                  to="/reset-password"
                  className="text-theme-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Forgot password?
                </Link>
              </div>

              <Button className="w-full" size="sm">
                Sign in
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
